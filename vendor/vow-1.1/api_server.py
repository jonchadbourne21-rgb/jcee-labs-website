#!/usr/bin/env python3
# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW REST API server (Reconciled Architecture §2, Entry Points:
vow_unified.py + api_server.py + vow_repl.py).

Stdlib-only (http.server) — no Flask/FastAPI dependency, so the entry
point runs anywhere the language runs.

Endpoints (all JSON):
  GET  /health                     -> {"status": "ok", ...}
  POST /run        {"source", "quest"?, "live"?}  -> engine trace
  POST /transpile  {"source"}      -> {"shadow_python": ...}
  GET  /scars?quest=Q              -> durable scars (all, or one quest)
  GET  /successes?quest=Q&strategy=S -> success snapshots
  GET  /traces/<run_id>            -> persisted trace (404 if unknown)

Dry-run is the default execution mode (safety-first); live mode only when
the caller explicitly passes "live": true. Bind address defaults to
localhost — there is no auth layer; expose it only behind one.

  python3 api_server.py --port 8080 --db vow_memory.db
"""
import argparse
import asyncio
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

try:
    from main import VowEngineManager, MockDatabase
    from vow.database import SqliteDatabase
    from vow.database_backends import PostgresDatabase, MongoDatabase
    from vow.vow_parser import VowAdvancedParser
    from vow.vow_transpiler import VowTranspiler
except ImportError:  # package layout fallback
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from main import VowEngineManager, MockDatabase
    from vow.database import SqliteDatabase
    from vow.database_backends import PostgresDatabase, MongoDatabase
    from vow.vow_parser import VowAdvancedParser
    from vow.vow_transpiler import VowTranspiler

MAX_BODY = 1024 * 1024  # 1MB request cap


class VowApiServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, addr, database=None, scar_ttl=None, llm=None,
                 rate_limits=None):
        super().__init__(addr, VowApiHandler)
        self.database = database or MockDatabase()
        self.scar_ttl = scar_ttl
        self.llm = llm
        self.rate_limits = rate_limits


class VowApiHandler(BaseHTTPRequestHandler):
    server_version = 'VowAPI/1.0'
    protocol_version = 'HTTP/1.1'

    # -- helpers --
    def _send(self, obj, status=200):
        body = json.dumps(obj, default=str).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, msg, status=400, phase='request'):
        self._send({'error': str(msg), 'phase': phase}, status)

    def _read_json(self):
        length = int(self.headers.get('Content-Length') or 0)
        if length <= 0:
            raise ValueError('missing request body')
        if length > MAX_BODY:
            self._error(f'body too large (>{MAX_BODY} bytes)', 413)
            return None
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode('utf-8'))
        except (ValueError, UnicodeDecodeError) as e:
            self._error(f'invalid JSON body: {e}', 400)
            return None

    def log_message(self, fmt, *args):  # keep stderr tidy; errors go in-body
        pass

    # -- routes --
    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        db = self.server.database
        try:
            if parsed.path == '/health':
                self._send({'status': 'ok', 'server': self.server_version,
                            'dry_run_default': True})
            elif parsed.path == '/scars':
                quest = qs.get('quest', [None])[0]
                if quest:
                    scars = (db.recall_scars_sync(quest)
                             if hasattr(db, 'recall_scars_sync')
                             else [s for s in db.scars
                                   if s.get('quest_name') == quest])
                else:
                    scars = (db.recall_all_scars_sync()
                             if hasattr(db, 'recall_all_scars_sync')
                             else list(db.scars))
                self._send({'scars': scars, 'count': len(scars)})
            elif parsed.path == '/successes':
                quest = qs.get('quest', [''])[0]
                strategy = qs.get('strategy', [None])[0]
                if not strategy:
                    self._error('successes requires ?strategy=', 400)
                    return
                entries = (db.recall_success_sync(quest, strategy)
                           if hasattr(db, 'recall_success_sync')
                           else [e for e in getattr(db, 'successes', [])
                                 if e.get('strategy') == strategy])
                self._send({'successes': entries, 'count': len(entries)})
            elif parsed.path.startswith('/traces/'):
                run_id = parsed.path[len('/traces/'):]
                trace = asyncio.run(db.get_trace(run_id))
                if trace is None:
                    self._error(f'unknown run_id: {run_id}', 404)
                else:
                    self._send(trace)
            else:
                self._error(f'unknown endpoint: {parsed.path}', 404)
        except Exception as e:
            self._error(f'{type(e).__name__}: {e}', 500, phase='serve')

    def do_POST(self):
        parsed = urlparse(self.path)
        try:
            body = self._read_json()
            if body is None:
                return
            if parsed.path == '/run':
                self._handle_run(body)
            elif parsed.path == '/transpile':
                self._handle_transpile(body)
            else:
                self._error(f'unknown endpoint: {parsed.path}', 404)
        except ValueError as e:
            self._error(str(e), 400)
        except Exception as e:
            self._error(f'{type(e).__name__}: {e}', 500, phase='serve')

    # -- handlers --
    def _handle_run(self, body):
        source = body.get('source')
        if not isinstance(source, str) or not source.strip():
            self._error('body requires a non-empty "source" string', 400)
            return
        quest = body.get('quest')
        if quest is None:
            quests = getattr(VowAdvancedParser(source).parse_program(),
                             'quests', [])
            if not quests:
                self._error('no quest found in the VOW source', 400,
                            phase='parse')
                return
            quest = quests[0].name
        live = bool(body.get('live', False))
        mgr = VowEngineManager(self.server.database,
                               scar_ttl=self.server.scar_ttl,
                               llm=self.server.llm,
                               rate_limits=self.server.rate_limits)
        trace = asyncio.run(mgr.execute_vow_quest(
            source, quest, dry_run=not live))
        self._send(trace, 200 if trace.get('status') == 'success' else 422)

    def _handle_transpile(self, body):
        source = body.get('source')
        if not isinstance(source, str) or not source.strip():
            self._error('body requires a non-empty "source" string', 400)
            return
        try:
            code = VowTranspiler().transpile(
                VowAdvancedParser(source).parse_program())
        except Exception as e:
            self._error(f'{type(e).__name__}: {e}', 422, phase='transpile')
            return
        self._send({'shadow_python': code})


def _open_backend(args):
    if getattr(args, 'postgres', None):
        return PostgresDatabase(args.postgres)
    if getattr(args, 'mongo', None):
        from pymongo import MongoClient
        client = MongoClient(args.mongo)
        name = args.mongo.rstrip('/').rsplit('/', 1)[-1] or 'vow_memory'
        return MongoDatabase(client[name])
    if getattr(args, 'db', None):
        return SqliteDatabase(args.db)
    return MockDatabase()


def main(argv=None):
    parser = argparse.ArgumentParser(
        prog='vow-api', description=__doc__.splitlines()[0])
    parser.add_argument('--host', default='127.0.0.1',
                        help='bind address (default: 127.0.0.1 — localhost '
                             'only; there is no auth layer)')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--db', metavar='PATH', default=None,
                        help='persist to SQLite at PATH (default: in-memory)')
    parser.add_argument('--postgres', metavar='DSN', default=None)
    parser.add_argument('--mongo', metavar='URI', default=None)
    parser.add_argument('--scar-ttl', type=float, default=None)
    args = parser.parse_args(argv)

    try:
        database = _open_backend(args)
    except Exception as e:
        print(json.dumps({'error': f'could not open data layer: {e}',
                          'phase': 'connect'}))
        return 1
    server = VowApiServer((args.host, args.port), database,
                          scar_ttl=args.scar_ttl)
    print(f'VOW API listening on http://{args.host}:{args.port} '
          f'(dry-run default; Ctrl-C to stop)', file=sys.stderr)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
