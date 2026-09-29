# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import asyncio
import json
import os
import sqlite3
import subprocess
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.database import SqliteDatabase

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
# sqlite journals via file locking; the delivery tree lives on an overlay
# filesystem where that intermittently throws 'disk I/O error'. Data still
# commits to the db file; only the location moves — to real local tmp.
import tempfile
TMP = os.path.join(tempfile.mkdtemp(prefix='vow_dbtest_'), 'test.db')


def teardown_function(_):
    if os.path.exists(TMP):
        os.remove(TMP)


def test_scar_round_trip_sync():
    db = SqliteDatabase(TMP)
    db.record_scar_sync({'quest_name': 'Q', 'message': 'prove failed', 'context': {'x': 1}})
    scars = db.recall_scars_sync('Q')
    assert len(scars) == 1 and scars[0]['message'] == 'prove failed'
    assert scars[0]['context'] == {'x': 1}
    db.close()


def test_async_interface_matches_mock():
    db = SqliteDatabase(TMP)
    asyncio.run(db.save_scar({'quest_name': 'Q', 'message': 'm', 'context': None}))
    scars = asyncio.run(db.get_scars('Q'))
    assert len(scars) == 1
    asyncio.run(db.save_trace('r1', {'status': 'success'}))
    assert asyncio.run(db.get_trace('r1'))['status'] == 'success'
    assert asyncio.run(db.get_trace('nope')) is None
    db.close()


def test_survives_reconnect():
    db = SqliteDatabase(TMP)
    db.record_scar_sync({'quest_name': 'Q', 'message': 'durable', 'context': None})
    db.close()
    db2 = SqliteDatabase(TMP)  # new connection, same file
    assert db2.recall_scars_sync('Q')[0]['message'] == 'durable'
    db2.close()


def test_cli_db_persists_across_processes():
    if os.path.exists(TMP):
        os.remove(TMP)
    r = subprocess.run([sys.executable, 'vow_cli.py', 'run',
                        'examples/learning_loop.vow', '--db', TMP],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-800:]
    # read from a fresh connection, simulating a later process
    rows = sqlite3.connect(TMP).execute(
        "SELECT quest_name, message FROM scars").fetchall()
    assert any('prove failed' in m for _, m in rows), rows
    trace = json.loads(r.stdout[r.stdout.index('{'):])
    assert trace['db_scars'], 'db_scars not surfaced in trace'


def test_packaging_metadata():
    import tomllib
    meta = tomllib.load(open(os.path.join(PROJ, 'pyproject.toml'), 'rb'))
    assert meta['project']['name'] == 'vow-lang'
    assert meta['project']['scripts']['vow'] == 'vow_cli:main'
    assert 'vow' in meta['tool']['setuptools']['packages']
