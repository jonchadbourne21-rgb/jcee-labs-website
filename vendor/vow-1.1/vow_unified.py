#!/usr/bin/env python3
# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""vow_unified.py -- the unified VOW entry point (per VOW Architecture
Reconciled: Entry Points = vow_unified.py + api_server.py + vow_repl.py).

One file, three uses:

1. HUMAN CLI (pass-through to the full toolchain):
     python vow_unified.py run examples/discrimination.vow --db vow.db
     python vow_unified.py reverse out.shadow.py
     python vow_unified.py report evidence/
     python vow_unified.py repl --db vow.db

2. BACKEND EXEC (built for a Node.js/other-language backend calling it as
   a subprocess): executes a quest and prints exactly ONE JSON object to
   stdout -- nothing else, so the caller can JSON.parse the whole output.
     python vow_unified.py exec --file quest.vow [--quest NAME]
                                 [--db vow.db] [--scar-ttl 86400] [--live]
   or pipe source instead of a file:
     cat quest.vow | python vow_unified.py exec --quest NAME
   Exit codes: 0 = executed (check trace.status), 2 = usage error,
   3 = execution error (JSON carries {"error": ...}).

3. PYTHON API (import it):
     from vow_unified import execute_quest
     trace = execute_quest(source, quest='BatchA', db='vow.db')

This is a facade: every path above delegates to VowEngineManager /
vow_cli / vow_repl. No logic is reimplemented here.
"""
import argparse
import asyncio
import contextlib
import io
import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from main import MockDatabase, VowEngineManager  # noqa: E402

try:
    from vow.database import SqliteDatabase
except ImportError:  # pragma: no cover - flat layout fallback
    from database import SqliteDatabase


# ---------------------------------------------------------------- API ----

def _run_sync(coro):
    """Run a coroutine from sync code — safe even when the caller already
    has a running event loop (Jupyter, FastAPI, an async Node bridge):
    in that case the quest executes on a fresh thread with its own loop."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    import threading
    box = {}

    def _worker():
        try:
            box['result'] = asyncio.run(coro)
        except BaseException as exc:  # propagate to the calling thread
            box['error'] = exc
    t = threading.Thread(target=_worker, daemon=True)
    t.start()
    t.join()
    if 'error' in box:
        raise box['error']
    return box['result']


def execute_quest(source, quest=None, db=None, live=False, scar_ttl=None):
    """Execute one quest from VOW source; return the engine trace dict.
    quest=None runs the first quest in the source (same rule as the CLI)."""
    if quest is None:  # resolve the CLI's default: first quest in source
        from main import VowAdvancedParser
        quests = getattr(VowAdvancedParser(source).parse_program(), 'quests', [])
        if not quests:
            raise ValueError('no quest found in the VOW source')
        quest = quests[0].name
    database = SqliteDatabase(db) if db else MockDatabase()
    manager = VowEngineManager(database, scar_ttl=scar_ttl)
    with contextlib.redirect_stdout(io.StringIO()):  # engine chatter stays
        trace = _run_sync(manager.execute_vow_quest(source, quest,
                                                    dry_run=not live))
    return trace


def _exec_mode(args):
    if args.file:
        try:
            source = open(args.file).read()
        except OSError as exc:
            print(json.dumps({'error': 'cannot read %s: %s' % (args.file, exc)}))
            return 2
    else:
        source = sys.stdin.read()
    if not source.strip():
        print(json.dumps({'error': 'no VOW source given (--file or stdin)'}))
        return 2
    try:
        trace = execute_quest(source, quest=args.quest, db=args.db,
                              live=args.live, scar_ttl=args.scar_ttl)
    except Exception as exc:
        print(json.dumps({'error': '%s: %s' % (type(exc).__name__, exc)}))
        return 3
    # final_result may be a repr string; normalize to a real object so the
    # whole output is clean JSON for the calling backend
    fr = trace.get('final_result')
    if isinstance(fr, str):
        import ast
        try:
            trace['final_result'] = ast.literal_eval(fr)
        except Exception:
            pass
    print(json.dumps(trace, default=str))
    return 0


# ---------------------------------------------------------------- CLI ----

def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == 'exec':
        p = argparse.ArgumentParser(prog='vow_unified.py exec',
                                    description='Backend exec: one JSON '
                                                'object to stdout.')
        p.add_argument('--file', metavar='PATH', default=None,
                       help='VOW source file (default: read stdin)')
        p.add_argument('--quest', metavar='NAME', default=None,
                       help='quest to run (default: first in source)')
        p.add_argument('--db', metavar='PATH', default=None,
                       help='persist memory to SQLite at PATH')
        p.add_argument('--scar-ttl', metavar='SECONDS', type=float,
                       default=None, help='scar decay TTL')
        p.add_argument('--live', action='store_true',
                       help='live side effects (default: dry-run shadow)')
        return _exec_mode(p.parse_args(argv[1:]))
    # file-first form (Worked Examples): `vow_unified.py file.vow run`
    # == `vow_unified.py run file.vow`. If the first token is a .vow file,
    # move it behind the first recognized command word.
    if argv[0].lower().endswith('.vow') and len(argv) > 1:
        commands = {'run', 'transpile', 'shadow', 'validate-shadow',
                    'roundtrip', 'scars', 'fmt', 'lint', 'reverse', 'report'}
        for i in range(1, len(argv)):
            if argv[i] in commands:
                argv = [argv[i], argv[0]] + argv[1:i] + argv[i + 1:]
                break
    # everything else: delegate to the full CLI
    import vow_cli
    return vow_cli.main(argv if argv else None)


if __name__ == '__main__':
    sys.exit(main())
