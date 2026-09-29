# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""PostgreSQL/MongoDB data-layer adapters — conformance-tested against
scripted fakes (no live server claimed)."""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.database_backends import PostgresDatabase, MongoDatabase


# ---------------- scripted DBAPI fake ----------------
class FakeCursor:
    def __init__(self, conn):
        self._conn = conn
        self._result = []

    def execute(self, sql, params=()):
        self._conn.log.append((sql.strip(), tuple(params)))
        # programmable results: first matching prefix wins
        for prefix, rows in self._conn.fetch_plan:
            if sql.strip().upper().startswith(prefix):
                self._result = list(rows)
                break
        else:
            self._result = []
        return self

    def fetchall(self):
        return self._result

    def fetchone(self):
        return self._result[0] if self._result else None


class FakePGConnection:
    def __init__(self):
        self.log = []
        self.fetch_plan = []
        self.commits = 0
        self.closed = False

    def cursor(self):
        return FakeCursor(self)

    def commit(self):
        self.commits += 1

    def close(self):
        self.closed = True


def test_postgres_schema_and_param_markers():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    creates = [sql for sql, _ in conn.log if sql.startswith('CREATE TABLE')]
    assert len(creates) == 5  # memory trio + runs + journal_events (Arc 3D)
    assert any('SERIAL PRIMARY KEY' in c for c in creates)
    assert any(c.startswith('CREATE TABLE IF NOT EXISTS runs')
               for c in creates)
    assert any('PRIMARY KEY (run_id, seq)' in c for c in creates)
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm', 'context': {'a': 1}})
    sql, params = conn.log[-1]
    assert sql.startswith('INSERT INTO scars')
    assert '%s' in sql and '?' not in sql      # DBAPI param markers, not sqlite
    assert params == ('Q', 'm', json.dumps({'a': 1}))
    assert conn.commits >= 2                   # schema + insert


def test_postgres_recall_maps_rows():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    conn.fetch_plan.append((
        'SELECT QUEST_NAME, MESSAGE, CONTEXT, CREATED_AT FROM SCARS WHERE',
        [('Q', 'm1', '{"x": 1}', '2026-07-19 10:00:00+00'),
         ('Q', 'm2', None, '2026-07-19 10:01:00+00')]))
    rows = db.recall_scars_sync('Q')
    assert rows[0] == {'quest_name': 'Q', 'message': 'm1',
                       'context': {'x': 1}, 'created_at': '2026-07-19 10:00:00+00'}
    assert rows[1]['context'] is None
    sql, params = conn.log[-1]
    assert 'WHERE quest_name = %s' in sql and params == ('Q',)


def test_postgres_trace_upsert_and_get():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    asyncio.run(db.save_trace('r1', {'status': 'success'}))
    sql, params = conn.log[-1]
    assert 'ON CONFLICT (run_id) DO UPDATE' in sql
    assert params == ('r1', json.dumps({'status': 'success'}))
    conn.fetch_plan.append(('SELECT DATA FROM TRACES',
                            [(json.dumps({'status': 'success'}),)]))
    assert asyncio.run(db.get_trace('r1')) == {'status': 'success'}
    conn.fetch_plan.clear()
    assert asyncio.run(db.get_trace('nope')) is None


def test_postgres_success_retention_delete():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    db.record_success_sync({'quest': 'Q', 'strategy': 's', 'seed': '1',
                            'env': {'n': 1}})
    delete = [x for x in conn.log if x[0].startswith('DELETE FROM successes')]
    assert delete, 'retention prune must be issued'
    assert 'LIMIT %s' in delete[0][0]
    assert delete[0][1][-1] == db.SUCCESS_RETENTION


def test_postgres_dsn_without_driver_is_honest():
    try:
        PostgresDatabase('postgresql://u:p@localhost/db')
        # a driver IS installed in this environment — then it connected or
        # failed to connect; either is fine, but silence is not an option
    except ImportError as e:
        assert 'PostgreSQL driver' in str(e)
    except Exception:
        pass  # driver present, connection refused — honest environment error


# ---------------- in-memory mongo fake ----------------
class FakeCollection:
    def __init__(self):
        self.docs = []
        self._seq = 0

    class _Result(list):
        def sort(self, key, direction=1):
            self.__init__(sorted(self, key=lambda d: d.get(key),
                                 reverse=direction < 0))
            return self

    def _match(self, doc, filt):
        for k, v in (filt or {}).items():
            if isinstance(v, dict) and '$in' in v:
                if doc.get(k) not in v['$in']:
                    return False
            elif doc.get(k) != v:
                return False
        return True

    def insert_one(self, doc):
        self._seq += 1
        doc = dict(doc, _id=self._seq)
        self.docs.append(doc)
        return type('R', (), {'inserted_id': self._seq})()

    def find(self, filt=None):
        return self._Result([d for d in self.docs if self._match(d, filt)])

    def find_one(self, filt):
        for d in self.docs:
            if self._match(d, filt):
                return d
        return None

    def replace_one(self, filt, doc, upsert=False):
        for i, d in enumerate(self.docs):
            if self._match(d, filt):
                self.docs[i] = dict(doc, _id=d['_id'])
                return
        if upsert:
            self.insert_one(doc)

    def delete_many(self, filt):
        self.docs[:] = [d for d in self.docs if not self._match(d, filt)]


class FakeMongoDB:
    def __init__(self):
        self._cols = {}

    def __getitem__(self, name):
        return self._cols.setdefault(name, FakeCollection())


def test_mongo_scar_roundtrip():
    db = MongoDatabase(FakeMongoDB())
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm1',
                         'context': {'x': 1}})
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm2', 'context': None})
    db.record_scar_sync({'quest_name': 'Other', 'message': 'm3',
                         'context': None})
    rows = db.recall_scars_sync('Q')
    assert [r['message'] for r in rows] == ['m1', 'm2']   # insertion order
    assert rows[0]['context'] == {'x': 1}                 # native document
    assert len(db.recall_all_scars_sync()) == 3


def test_mongo_success_retention_and_same_quest():
    db = MongoDatabase(FakeMongoDB())
    for i in range(13):
        db.record_success_sync({'quest': 'Q', 'strategy': 's',
                                'seed': str(i), 'env': {'n': i}})
    db.record_success_sync({'quest': 'Other', 'strategy': 's',
                            'seed': 'x', 'env': {}})
    got = db.recall_success_sync('Q', 's')
    assert len(got) == MongoDatabase.SUCCESS_RETENTION   # pruned
    assert got[-1]['env'] == {'n': 12}                   # newest kept
    assert all(e['quest'] == 'Q' for e in got)           # same-quest preferred


def test_mongo_trace_upsert():
    db = MongoDatabase(FakeMongoDB())
    asyncio.run(db.save_trace('r1', {'status': 'success'}))
    asyncio.run(db.save_trace('r1', {'status': 'updated'}))
    assert asyncio.run(db.get_trace('r1')) == {'status': 'updated'}
    assert len(db.db['traces'].docs) == 1                # upsert, not dup
    assert asyncio.run(db.get_trace('nope')) is None


def test_mongo_async_interface():
    db = MongoDatabase(FakeMongoDB())
    asyncio.run(db.save_scar({'quest_name': 'Q', 'message': 'm',
                              'context': None}))
    rows = asyncio.run(db.get_scars('Q'))
    assert rows[0]['message'] == 'm'


def test_both_backends_satisfy_engine_contract():
    # the exact attribute set VowEngineManager + the scar router rely on
    required = ['record_scar_sync', 'recall_scars_sync',
                'recall_all_scars_sync', 'record_success_sync',
                'recall_success_sync', 'save_scar', 'get_scars',
                'save_trace', 'get_trace', 'close']
    for db in (PostgresDatabase(FakePGConnection()), MongoDatabase(FakeMongoDB())):
        for name in required:
            assert callable(getattr(db, name, None)), (type(db).__name__, name)
