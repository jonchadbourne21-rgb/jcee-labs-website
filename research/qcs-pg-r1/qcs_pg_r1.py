import os, json, time, threading, socket, hashlib, hmac, http.server, urllib.parse
import requests
import psycopg
from psycopg.errors import SerializationFailure

DSN=os.environ.get('PG_DSN','postgresql://postgres:postgres@127.0.0.1:5432/postgres')
SECRET=b'qcs-dcc-pg-r1-auth-secret'
DELTA=5
PLANNED={'relevant':10,'hidden':'ok','target_limit':10}

def conn(autocommit=False):
    return psycopg.connect(DSN, autocommit=autocommit)

def init_db():
    with conn(True) as c:
        c.execute('DROP SCHEMA IF EXISTS control CASCADE'); c.execute('DROP SCHEMA IF EXISTS external CASCADE')
        c.execute('CREATE SCHEMA control'); c.execute('CREATE SCHEMA external')
        c.execute('CREATE TABLE control.deps(id int primary key,relevant int not null,relevant_v bigint not null,hidden text not null,hidden_v bigint not null,irrelevant int not null,irrelevant_v bigint not null)')
        c.execute('CREATE TABLE control.intents(op_id text primary key,arm text not null,action_hash text not null,created_at timestamptz default clock_timestamp())')
        c.execute('CREATE TABLE control.dep_caps(op_id text primary key,relevant_v bigint not null,hidden_v bigint not null,consumed boolean not null default false)')
        c.execute('CREATE TABLE external.target_state(id int primary key,balance int not null,limit_value int not null,version bigint not null)')
        c.execute('CREATE TABLE external.ops(op_id text primary key,delta int not null,result_balance int not null,created_at timestamptz default clock_timestamp())')
        c.execute('CREATE TABLE control.doctors(id int primary key,on_call boolean not null)')
        c.execute('CREATE TABLE control.occ_state(id int primary key,value int not null,version bigint not null)')
    reset_db()

def reset_db():
    with conn(True) as c:
        c.execute('TRUNCATE control.deps,control.intents,control.dep_caps,external.target_state,external.ops,control.doctors,control.occ_state')
        c.execute("INSERT INTO control.deps VALUES(1,10,1,'ok',1,0,1)"); c.execute('INSERT INTO external.target_state VALUES(1,0,10,1)')
        c.execute('INSERT INTO control.doctors VALUES(1,true),(2,true)'); c.execute('INSERT INTO control.occ_state VALUES(1,0,1)')

class AuthState:
    def __init__(self): self.lock=threading.RLock(); self.reset()
    def reset(self):
        with self.lock: self.authorized=True; self.version=1; self.partition=False; self.lease_enabled=True
    def lease(self,op,ah):
        with self.lock:
            if self.partition: raise ConnectionError('partition')
            if not self.lease_enabled or not self.authorized: return None
            msg=f'{op}|{ah}|{self.version}'.encode(); sig=hmac.new(SECRET,msg,hashlib.sha256).hexdigest(); return f'{self.version}:{sig}'
    def verify(self,tok,op,ah):
        try:
            iv,sig=tok.split(':',1); msg=f'{op}|{ah}|{iv}'.encode(); return hmac.compare_digest(sig,hmac.new(SECRET,msg,hashlib.sha256).hexdigest())
        except Exception: return False
AUTH=AuthState()

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version='HTTP/1.1'
    def log_message(self,*a): pass
    def body(self):
        n=int(self.headers.get('Content-Length','0') or 0); return json.loads(self.rfile.read(n) or b'{}')
    def out(self,code,obj,headers=None,drop=False):
        if drop:
            try:self.connection.shutdown(socket.SHUT_RDWR)
            except:pass
            self.connection.close(); return
        raw=json.dumps(obj,separators=(',',':')).encode(); self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw)))
        for k,v in (headers or {}).items(): self.send_header(k,str(v))
        self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        p=urllib.parse.urlparse(self.path).path
        if p=='/auth/status':
            with AUTH.lock:
                if AUTH.partition:
                    try:self.connection.shutdown(socket.SHUT_RDWR)
                    except:pass
                    self.connection.close(); return
                self.out(200,{'authorized':AUTH.authorized,'version':AUTH.version},{'ETag':f'"auth-{AUTH.version}"'}); return
        if p=='/dep/state':
            with conn(True) as c:
                r=c.execute('SELECT relevant,relevant_v,hidden,hidden_v,irrelevant,irrelevant_v FROM control.deps WHERE id=1').fetchone(); d={'relevant':r[0],'relevant_v':r[1],'hidden':r[2],'hidden_v':r[3],'irrelevant':r[4],'irrelevant_v':r[5]}
                self.out(200,d,{'ETag':f'"dep-{r[1]}-{r[3]}-{r[5]}"'}); return
        if p=='/dep/registry': self.out(200,{'material_dependencies':['relevant','hidden']}); return
        if p=='/target/state':
            with conn(True) as c:
                r=c.execute('SELECT balance,limit_value,version FROM external.target_state WHERE id=1').fetchone(); self.out(200,{'balance':r[0],'limit_value':r[1],'version':r[2]},{'ETag':f'"target-{r[2]}"'}); return
        if p.startswith('/target/operation/'):
            op=p.rsplit('/',1)[-1]
            with conn(True) as c:
                r=c.execute('SELECT delta,result_balance FROM external.ops WHERE op_id=%s',(op,)).fetchone(); self.out(200,{'found':bool(r),'operation':({'delta':r[0],'result_balance':r[1]} if r else None)}); return
        self.out(404,{'error':'not_found'})
    def do_POST(self):
        p=urllib.parse.urlparse(self.path).path; b=self.body()
        if p=='/reset': AUTH.reset(); reset_db(); self.out(200,{'ok':True}); return
        if p=='/auth/revoke':
            with AUTH.lock: AUTH.authorized=False; AUTH.version+=1
            self.out(200,{'ok':True}); return
        if p=='/auth/aba':
            with AUTH.lock: AUTH.authorized=False; AUTH.version+=1; AUTH.authorized=True; AUTH.version+=1
            self.out(200,{'ok':True}); return
        if p=='/auth/partition':
            with AUTH.lock: AUTH.partition=True
            self.out(200,{'ok':True}); return
        if p=='/auth/lease_mode':
            with AUTH.lock: AUTH.lease_enabled=bool(b.get('enabled'))
            self.out(200,{'ok':True}); return
        if p=='/auth/lease':
            try: tok=AUTH.lease(b['op_id'],b['action_hash'])
            except ConnectionError:
                try:self.connection.shutdown(socket.SHUT_RDWR)
                except:pass
                self.connection.close(); return
            if not tok: self.out(503,{'error':'lease_unavailable'}); return
            self.out(200,{'token':tok}); return
        if p=='/dep/mutate_relevant':
            with conn(True) as c: c.execute('UPDATE control.deps SET relevant=%s,relevant_v=relevant_v+1 WHERE id=1',(int(b.get('value',0)),))
            self.out(200,{'ok':True}); return
        if p=='/dep/mutate_hidden':
            with conn(True) as c: c.execute('UPDATE control.deps SET hidden=%s,hidden_v=hidden_v+1 WHERE id=1',(b.get('value','bad'),))
            self.out(200,{'ok':True}); return
        if p=='/dep/mutate_irrelevant':
            with conn(True) as c: c.execute('UPDATE control.deps SET irrelevant=irrelevant+1,irrelevant_v=irrelevant_v+1 WHERE id=1')
            self.out(200,{'ok':True}); return
        if p=='/dep/aba_relevant':
            with conn(True) as c: c.execute('UPDATE control.deps SET relevant=0,relevant_v=relevant_v+1 WHERE id=1'); c.execute('UPDATE control.deps SET relevant=10,relevant_v=relevant_v+1 WHERE id=1')
            self.out(200,{'ok':True}); return
        if p=='/target/mutate_limit':
            with conn(True) as c: c.execute('UPDATE external.target_state SET limit_value=%s,version=version+1 WHERE id=1',(int(b.get('value',0)),))
            self.out(200,{'ok':True}); return
        if p=='/target/effect':
            op=b['op_id']; delta=int(b.get('delta',DELTA)); ah=b['action_hash']
            with conn(False) as c:
                c.execute('BEGIN'); ex=c.execute('SELECT result_balance FROM external.ops WHERE op_id=%s',(op,)).fetchone()
                if ex: c.commit(); self.out(200,{'deduplicated':True,'balance':ex[0]}); return
                t=c.execute('SELECT balance,limit_value,version FROM external.target_state WHERE id=1 FOR UPDATE').fetchone(); ifm=self.headers.get('If-Match')
                if ifm and ifm!=f'"target-{t[2]}"': c.rollback(); self.out(412,{'error':'etag_mismatch'}); return
                lease=b.get('auth_lease')
                if lease and not AUTH.verify(lease,op,ah): c.rollback(); self.out(403,{'error':'bad_auth_lease'}); return
                if b.get('dep_cap'):
                    cap=c.execute('SELECT relevant_v,hidden_v,consumed FROM control.dep_caps WHERE op_id=%s FOR UPDATE',(op,)).fetchone(); dep=c.execute('SELECT relevant_v,hidden_v FROM control.deps WHERE id=1').fetchone()
                    if (not cap) or cap[2] or (cap[0],cap[1])!=(dep[0],dep[1]): c.rollback(); self.out(409,{'error':'dep_cap_stale'}); return
                    c.execute('UPDATE control.dep_caps SET consumed=true WHERE op_id=%s',(op,))
                newbal=t[0]+delta; c.execute('UPDATE external.target_state SET balance=%s WHERE id=1',(newbal,)); c.execute('INSERT INTO external.ops(op_id,delta,result_balance) VALUES(%s,%s,%s)',(op,delta,newbal)); c.commit()
            self.out(200,{'executed':True,'balance':newbal},drop=bool(b.get('drop_response'))); return
        self.out(404,{'error':'not_found'})

class Server:
    def __init__(self): self.s=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler); self.port=self.s.server_address[1]; self.t=threading.Thread(target=self.s.serve_forever,daemon=True); self.t.start()
    def close(self): self.s.shutdown(); self.s.server_close()
class Env:
    def __init__(self,port): self.base=f'http://127.0.0.1:{port}'; self.s=requests.Session()
    def get(self,p,timeout=.8): return self.s.get(self.base+p,timeout=timeout)
    def post(self,p,obj=None,timeout=.8,headers=None): return self.s.post(self.base+p,json=obj or {},timeout=timeout,headers=headers or {})
    def reset(self): self.post('/reset')

def snapshot(e):
    a=e.get('/auth/status'); d=e.get('/dep/state'); t=e.get('/target/state'); return {'auth':a.json(),'auth_etag':a.headers['ETag'],'dep':d.json(),'target':t.json(),'target_etag':t.headers['ETag']}
def action_hash(s):
    x={'delta':DELTA,'relevant':s['dep']['relevant'],'hidden':s['dep']['hidden'],'target_limit':s['target']['limit_value']}; return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def mutate(e,sc,phase):
    if sc=='irrelevant_pre' and phase=='pre': return e.post('/dep/mutate_irrelevant').status_code
    if sc=='relevant_pre' and phase=='pre': return e.post('/dep/mutate_relevant',{'value':0}).status_code
    if sc=='hidden_omission' and phase=='pre': return e.post('/dep/mutate_hidden',{'value':'bad'}).status_code
    if sc=='auth_revoke_pre' and phase=='pre': return e.post('/auth/revoke').status_code
    if sc=='auth_aba_pre' and phase=='pre': return e.post('/auth/aba').status_code
    if sc=='dep_aba_pre' and phase=='pre': return e.post('/dep/aba_relevant').status_code
    if sc=='auth_partition_pre' and phase=='pre': return e.post('/auth/partition').status_code
    if sc=='auth_revoke_gap' and phase=='gap': return e.post('/auth/revoke').status_code
    if sc=='auth_aba_gap' and phase=='gap': return e.post('/auth/aba').status_code
    if sc=='dep_mutate_gap' and phase=='gap': return e.post('/dep/mutate_relevant',{'value':0}).status_code
    if sc=='dep_aba_gap' and phase=='gap': return e.post('/dep/aba_relevant').status_code
    if sc=='target_mutate_gap' and phase=='gap': return e.post('/target/mutate_limit',{'value':0}).status_code
    return None
SCENARIOS=['clean','irrelevant_pre','relevant_pre','hidden_omission','auth_revoke_pre','auth_aba_pre','dep_aba_pre','auth_partition_pre','auth_revoke_gap','auth_aba_gap','dep_mutate_gap','dep_aba_gap','target_mutate_gap','lost_response','auth_lease_unavailable']
ARMS=['OCC','CTA','AEB','COMPOSITE','QCS_DCC']
COVERAGE={'OCC':{'clean','irrelevant_pre','relevant_pre','auth_revoke_pre','auth_aba_pre','dep_aba_pre','auth_partition_pre','target_mutate_gap'},'CTA':{'clean','auth_revoke_pre','auth_aba_pre','auth_partition_pre'},'AEB':{'clean','irrelevant_pre','relevant_pre','auth_revoke_pre','auth_aba_pre','auth_partition_pre','lost_response'},'COMPOSITE':set(SCENARIOS)-{'hidden_omission','auth_lease_unavailable','dep_mutate_gap','dep_aba_gap','auth_revoke_gap','auth_aba_gap'},'QCS_DCC':set(SCENARIOS)}

def truth(actual,lease_used):
    with conn(True) as c: d=c.execute('SELECT relevant,hidden FROM control.deps WHERE id=1').fetchone(); t=c.execute('SELECT limit_value FROM external.target_state WHERE id=1').fetchone()[0]
    with AUTH.lock: auth=AUTH.authorized
    return (not actual) or ((auth or lease_used) and d[0]==PLANNED['relevant'] and d[1]==PLANNED['hidden'] and t>=DELTA)
def create_intent(arm,op,ah,cap=False):
    with conn(False) as c:
        c.execute('BEGIN'); d=c.execute('SELECT relevant_v,hidden_v FROM control.deps WHERE id=1').fetchone(); c.execute('INSERT INTO control.intents(op_id,arm,action_hash) VALUES(%s,%s,%s)',(op,arm,ah))
        if cap:c.execute('INSERT INTO control.dep_caps(op_id,relevant_v,hidden_v) VALUES(%s,%s,%s)',(op,d[0],d[1]))
        c.commit()
def run_arm(e,arm,sc,i):
    e.reset();
    if sc=='auth_lease_unavailable': e.post('/auth/lease_mode',{'enabled':False})
    init=snapshot(e); ah=action_hash(init); op=f'{arm}-{sc}-{i}'; mutate(e,sc,'pre'); refused=indeterminate=recovered=lease_used=False; status=None
    try:
        if arm=='OCC':
            a=e.get('/auth/status'); d=e.get('/dep/state'); t=e.get('/target/state'); good=a.json()['authorized'] and a.headers['ETag']==init['auth_etag'] and d.json()['relevant_v']==init['dep']['relevant_v']
            if not good: refused=True
            else:
                create_intent(arm,op,ah); mutate(e,sc,'gap')
                try:r=e.post('/target/effect',{'op_id':op,'delta':DELTA,'action_hash':ah,'drop_response':sc=='lost_response'},headers={'If-Match':t.headers['ETag']}); status=r.status_code; refused=status==412
                except requests.RequestException: indeterminate=True
        elif arm=='CTA':
            a=e.get('/auth/status')
            if not a.json()['authorized'] or a.headers['ETag']!=init['auth_etag']: refused=True
            else:
                create_intent(arm,op,ah); mutate(e,sc,'gap')
                try:r=e.post('/target/effect',{'op_id':op,'delta':DELTA,'action_hash':ah,'drop_response':sc=='lost_response'}); status=r.status_code
                except requests.RequestException: indeterminate=True
        elif arm=='AEB':
            a=e.get('/auth/status'); d=e.get('/dep/state'); t=e.get('/target/state'); good=a.json()['authorized'] and a.headers['ETag']==init['auth_etag'] and d.json()['relevant']==PLANNED['relevant'] and t.json()['limit_value']==PLANNED['target_limit']
            if not good: refused=True
            else:
                create_intent(arm,op,ah); mutate(e,sc,'gap')
                try:r=e.post('/target/effect',{'op_id':op,'delta':DELTA,'action_hash':ah,'drop_response':sc=='lost_response'}); status=r.status_code
                except requests.RequestException: indeterminate=True; q=e.get('/target/operation/'+op).json(); recovered=bool(q['found'])
        elif arm=='COMPOSITE':
            a=e.get('/auth/status'); d=e.get('/dep/state'); t=e.get('/target/state'); good=a.json()['authorized'] and a.headers['ETag']==init['auth_etag'] and d.json()['relevant_v']==init['dep']['relevant_v'] and d.json()['relevant']==PLANNED['relevant']
            if not good: refused=True
            else:
                create_intent(arm,op,ah); mutate(e,sc,'gap')
                try:r=e.post('/target/effect',{'op_id':op,'delta':DELTA,'action_hash':ah,'drop_response':sc=='lost_response'},headers={'If-Match':t.headers['ETag']}); status=r.status_code; refused=status==412
                except requests.RequestException: indeterminate=True; q=e.get('/target/operation/'+op).json(); recovered=bool(q['found'])
        else:
            reg=e.get('/dep/registry').json()['material_dependencies']; a=e.get('/auth/status'); d=e.get('/dep/state'); t=e.get('/target/state'); dj=d.json(); good=set(reg)=={'relevant','hidden'} and a.json()['authorized'] and a.headers['ETag']==init['auth_etag'] and dj['relevant_v']==init['dep']['relevant_v'] and dj['hidden_v']==init['dep']['hidden_v'] and dj['relevant']==PLANNED['relevant'] and dj['hidden']==PLANNED['hidden']
            if not good: refused=True
            else:
                lr=e.post('/auth/lease',{'op_id':op,'action_hash':ah})
                if lr.status_code!=200: refused=True
                else:
                    lease_used=True; create_intent(arm,op,ah,True); mutate(e,sc,'gap')
                    try:r=e.post('/target/effect',{'op_id':op,'delta':DELTA,'action_hash':ah,'auth_lease':lr.json()['token'],'dep_cap':True,'drop_response':sc=='lost_response'},headers={'If-Match':t.headers['ETag']}); status=r.status_code; refused=status in (409,412)
                    except requests.RequestException: indeterminate=True; q=e.get('/target/operation/'+op).json(); recovered=bool(q['found'])
    except requests.RequestException: refused=True
    try: actual=bool(e.get('/target/operation/'+op).json()['found'])
    except: actual=False
    safe=truth(actual,lease_used); return {'arm':arm,'scenario':sc,'iteration':i,'covered':sc in COVERAGE[arm],'executed':actual,'refused':refused,'indeterminate':indeterminate,'recovered':recovered,'unsafe':actual and not safe,'status':status}

def write_skew_once(level):
    reset_db(); barrier=threading.Barrier(2); out=[]; lock=threading.Lock()
    def worker(doc):
        try:
            with conn(False) as c:
                c.execute(f'BEGIN ISOLATION LEVEL {level}'); n=c.execute('SELECT count(*) FROM control.doctors WHERE on_call').fetchone()[0]; barrier.wait(timeout=5)
                if n>=2:c.execute('UPDATE control.doctors SET on_call=false WHERE id=%s',(doc,))
                c.commit(); result='committed'
        except SerializationFailure: result='serialization_failure'
        except Exception as ex: result=type(ex).__name__
        with lock: out.append(result)
    a=threading.Thread(target=worker,args=(1,)); b=threading.Thread(target=worker,args=(2,)); a.start(); b.start(); a.join(); b.join()
    with conn(True) as c: rem=c.execute('SELECT count(*) FROM control.doctors WHERE on_call').fetchone()[0]
    return {'level':level,'results':sorted(out),'remaining_on_call':rem,'invariant_broken':rem==0}
def occ_litmus():
    reset_db()
    with conn(True) as c:v=c.execute('SELECT version FROM control.occ_state WHERE id=1').fetchone()[0]
    with conn(True) as c:c.execute('UPDATE control.occ_state SET value=1,version=version+1 WHERE id=1')
    with conn(True) as c:cur=c.execute('UPDATE control.occ_state SET value=2,version=version+1 WHERE id=1 AND version=%s',(v,)); final=c.execute('SELECT value,version FROM control.occ_state WHERE id=1').fetchone()
    return {'stale_update_rows':cur.rowcount,'final_value':final[0],'final_version':final[1],'stale_rejected':cur.rowcount==0}
def main():
    init_db()
    with conn(True) as c: pgver=c.execute('SELECT version()').fetchone()[0]; default_iso=c.execute('SHOW default_transaction_isolation').fetchone()[0]
    if 'PostgreSQL' not in pgver: raise SystemExit('NOT_REAL_POSTGRESQL')
    isolation=[]
    for lvl in ['READ COMMITTED','REPEATABLE READ','SERIALIZABLE']:
        for i in range(8): r=write_skew_once(lvl); r['iteration']=i; isolation.append(r)
    occ=occ_litmus(); srv=Server(); e=Env(srv.port); rows=[]
    try:
        for sc in SCENARIOS:
            for arm in ARMS:
                for i in range(3): rows.append(run_arm(e,arm,sc,i))
    finally:srv.close()
    summary={}
    for arm in ARMS:
        rr=[x for x in rows if x['arm']==arm]; cov=[x for x in rr if x['covered']]; summary[arm]={'cases':len(rr),'covered_cases':len(cov),'unsafe_all':sum(x['unsafe'] for x in rr),'unsafe_covered':sum(x['unsafe'] for x in cov),'executed':sum(x['executed'] for x in rr),'refused':sum(x['refused'] for x in rr),'indeterminate':sum(x['indeterminate'] for x in rr),'recovered':sum(x['recovered'] for x in rr)}
    iso_summary={lvl:{'runs':sum(r['level']==lvl for r in isolation),'invariant_breaks':sum(r['level']==lvl and r['invariant_broken'] for r in isolation),'serialization_failures':sum(r['level']==lvl and 'serialization_failure' in r['results'] for r in isolation)} for lvl in ['READ COMMITTED','REPEATABLE READ','SERIALIZABLE']}
    result={'postgres_version':pgver,'default_isolation':default_iso,'isolation_litmus':iso_summary,'occ_litmus':occ,'scenario_count':len(SCENARIOS),'iterations_per_scenario':3,'total_architecture_cases':len(rows),'summary':summary}
    open('QCS_PG_R1_RESULTS.json','w').write(json.dumps(result,indent=2,sort_keys=True)+'\n'); open('QCS_PG_R1_ROWS.jsonl','w').write(''.join(json.dumps(r,sort_keys=True)+'\n' for r in rows)); open('QCS_PG_R1_ISOLATION.json','w').write(json.dumps(isolation,indent=2,sort_keys=True)+'\n')
    report=['# QCS+DCC PostgreSQL Cross-Transaction Closure R1','',f'Engine: `{pgver}`',f'Default isolation: `{default_iso}`','','## PostgreSQL isolation litmus','']+[f'- {k}: {v}' for k,v in iso_summary.items()]+['',f'- Row/version OCC stale update rejected: **{occ["stale_rejected"]}**','','## Architecture tournament','']+[f'- **{a}**: {v}' for a,v in summary.items()]+['','## Gate assertions','','- Real PostgreSQL engine required.','- SERIALIZABLE must preserve the write-skew invariant.','- Row/version OCC must reject the stale writer.','- QCS_DCC must have zero unsafe materializations across the full hostile corpus.','- Every architecture must have zero unsafe materializations inside its documented coverage boundary.','']
    open('QCS_PG_R1_REPORT.md','w').write('\n'.join(report))
    assert iso_summary['SERIALIZABLE']['invariant_breaks']==0; assert occ['stale_rejected']; assert summary['QCS_DCC']['unsafe_all']==0
    for arm in ARMS: assert summary[arm]['unsafe_covered']==0,(arm,summary[arm])
    print(json.dumps(result,indent=2,sort_keys=True)); print('QCS_PG_R1: PASS')
if __name__=='__main__': main()
