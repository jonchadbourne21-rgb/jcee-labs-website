#!/usr/bin/env python3
"""Bounded, read-only public origin observations. No credentials are written."""
import datetime, hashlib, json, os, re, socket, ssl, subprocess, urllib.error, urllib.request, urllib.parse
from pathlib import Path
OUT=Path("verification-evidence");OUT.mkdir(exist_ok=True)
result={"schema":"jcee.website-origin-observation/1.0","observed_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"intended_release":"a7260237836ebb27c00c58396020639358d01b39","probe_commit":os.environ.get("GITHUB_SHA"),"probe_run":os.environ.get("GITHUB_RUN_ID"),"vantage":"GitHub Actions Ubuntu 24.04 diagnostic runner; not a production application process"}
def error(e): return {"error_type":type(e).__name__,"error":str(e)}
def api(path):
    req=urllib.request.Request("https://api.github.com/repos/jonchadbourne21-rgb/jcee-labs-website"+path,headers={"Authorization":"Bearer "+os.environ["GITHUB_TOKEN"],"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"})
    with urllib.request.urlopen(req,timeout=20) as r: return json.load(r)
try:
    pages=api("/pages")
    result["pages_configuration"]={k:pages.get(k) for k in ["html_url","cname","status","build_type","https_enforced","public"]}
except Exception as e: result["pages_configuration"]=error(e)
try:
    result["pages_deployments"]=[]
    for d in api("/deployments?environment=github-pages&per_page=5"):
        statuses=api("/deployments/"+str(d["id"])+"/statuses?per_page=3")
        result["pages_deployments"].append({"id":d["id"],"sha":d["sha"],"ref":d["ref"],"created_at":d["created_at"],"environment":d["environment"],"statuses":[{k:s.get(k) for k in ["state","environment_url","log_url","created_at","description"]} for s in statuses]})
except Exception as e: result["pages_deployments_error"]=error(e)
result["dns"]=[]
for host in ["jceelabs.com","www.jceelabs.com","jonchadbourne21-rgb.github.io"]:
    entry={"host":host,"records":{}}
    try: entry["addresses"]=sorted({x[4][0] for x in socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)})
    except Exception as e: entry["addresses_error"]=error(e)
    for kind in ["A","AAAA","CNAME","NS","CAA"]:
        p=subprocess.run(["dig","+time=3","+tries=1","+noall","+answer","+comments",host,kind],text=True,capture_output=True,timeout=8)
        entry["records"][kind]={"returncode":p.returncode,"stdout":p.stdout,"stderr":p.stderr}
    result["dns"].append(entry)
result["tls"]=[]
for host in ["jceelabs.com","www.jceelabs.com","jonchadbourne21-rgb.github.io"]:
    entry={"host":host}
    try:
        with socket.create_connection((host,443),timeout=12) as s:
            with ssl.create_default_context().wrap_socket(s,server_hostname=host) as t:
                cert=t.getpeercert()
                entry.update({"verified":True,"remote_address":t.getpeername(),"protocol":t.version(),"cipher":t.cipher(),"subject":cert.get("subject"),"issuer":cert.get("issuer"),"subject_alt_names":cert.get("subjectAltName"),"not_before":cert.get("notBefore"),"not_after":cert.get("notAfter"),"sha256":hashlib.sha256(t.getpeercert(binary_form=True)).hexdigest()})
    except Exception as e: entry.update(error(e))
    result["tls"].append(entry)
class RedirectRecorder(urllib.request.HTTPRedirectHandler):
    def __init__(self): self.chain=[]
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        self.chain.append({"from":req.full_url,"status":code,"to":newurl})
        return super().redirect_request(req,fp,code,msg,headers,newurl)
result["http"]=[]
urls=["https://jceelabs.com/","https://www.jceelabs.com/","https://jceelabs.com/deployment.json","https://www.jceelabs.com/deployment.json","https://jonchadbourne21-rgb.github.io/jcee-labs-website/","https://jonchadbourne21-rgb.github.io/jcee-labs-website/deployment.json"]
safe_headers={"server","via","x-powered-by","x-github-request-id","x-served-by","x-cache","cf-ray","cf-cache-status","content-type","etag","last-modified","location","age","x-manus-server"}
for i,url in enumerate(urls):
    entry={"requested_url":url};recorder=RedirectRecorder()
    try:
        opener=urllib.request.build_opener(recorder)
        req=urllib.request.Request(url,headers={"User-Agent":"JCEE-Authorized-ReadOnly-Verification/1.0","Cache-Control":"no-cache"})
        try: response=opener.open(req,timeout=25)
        except urllib.error.HTTPError as e: response=e
        with response as r:
            raw=r.read(3_000_001)
            entry.update({"status":r.code,"final_url":r.geturl(),"redirects":recorder.chain,"headers":{k.lower():v for k,v in r.headers.items() if k.lower() in safe_headers},"body_bytes_read":len(raw),"body_truncated":len(raw)>3_000_000,"body_sha256":hashlib.sha256(raw).hexdigest()})
            body=raw.decode("utf-8",errors="replace")
            try: entry["json_body"]=json.loads(body)
            except json.JSONDecodeError:
                entry["html_title"]=re.findall(r"<title[^>]*>(.*?)</title>",body,re.I|re.S)[:1]
                entry["script_sources"]=re.findall(r'<script[^>]+src=["\x27]([^"\x27]+)',body,re.I)[:25]
                entry["manus_marker_present"]="manus" in body.lower()
            name=f"response-{i:02d}.txt";(OUT/name).write_bytes(raw);entry["body_file"]=name
    except Exception as e: entry.update(error(e));entry["redirects"]=recorder.chain
    result["http"].append(entry)

# Compare a bounded set of served public asset bytes with the served receipt.
result["asset_receipt_checks"]=[]
live=next((x.get("json_body") for x in result["http"] if x.get("requested_url")=="https://jceelabs.com/deployment.json"),None)
if isinstance(live,dict):
    candidates=[x for x in live.get("publicFiles",[]) if x.get("path")=="index.html"]
    candidates += [x for x in live.get("publicFiles",[]) if x.get("path","").startswith("assets/index-") and x.get("path","").endswith((".js",".css"))][:4]
    for artifact in candidates:
        name=artifact["path"]
        if ".." in Path(name).parts or name.startswith("/"): continue
        entry={"path":name,"expected_sha256":artifact["sha256"],"expected_bytes":artifact["bytes"]}
        try:
            req=urllib.request.Request("https://jceelabs.com/"+urllib.parse.quote(name,safe="/"),headers={"User-Agent":"JCEE-Authorized-ReadOnly-Verification/1.0","Cache-Control":"no-cache"})
            with urllib.request.urlopen(req,timeout=25) as response:
                raw=response.read(5_000_001)
                actual=hashlib.sha256(raw).hexdigest()
                entry.update({"status":response.status,"actual_bytes":len(raw),"actual_sha256":actual,"matches":actual==artifact["sha256"] and len(raw)==artifact["bytes"]})
        except Exception as e: entry.update(error(e))
        result["asset_receipt_checks"].append(entry)

result["system_store_observation"]={"ssl_defaults":ssl.get_default_verify_paths()._asdict()}
p=subprocess.run(["dpkg-query","-W","ca-certificates","openssl"],text=True,capture_output=True)
result["system_store_observation"]["packages"]=p.stdout
store=Path("/etc/ssl/certs/ca-certificates.crt")
if store.is_file():
    raw=store.read_bytes()
    result["system_store_observation"].update({"path":str(store),"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"pem_count":raw.count(b"BEGIN CERTIFICATE")})
(OUT/"origin-observations.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps(result,indent=2))
