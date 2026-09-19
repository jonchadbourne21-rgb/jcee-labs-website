#!/usr/bin/env python3
# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""vow_repl.py -- interactive REPL for the VOW language.

Define quests, run them, and watch the learning loop work live: scars
accumulate, exact situations get skipped, similar ones get cautionary
retries, aged ones get retested. Memory persists for the whole session
(and across sessions with --db).

    vow> quest Greeter {
    ...>   goal "say hi"
    ...>   strategy greet { let message = "hi" prove message != "" }
    ...>   success when message == "hi"
    ...> }
    quest Greeter defined -- :run Greeter
    vow> :run Greeter
    Greeter: SUCCESS (0.4s)
      greet              score=0.96 proof=ok

Commands:
    :run NAME      run a defined quest
    :quests        list defined quests
    :scars         show scar memory (what hurt, and why)
    :successes     show success memory (what worked)
    :trace         full JSON trace of the last run
    :source NAME   show a quest's source
    :forget NAME   remove a quest definition
    :live / :dry   toggle live side effects (default: dry-run shadow)
    :ttl SECONDS   set scar decay TTL (0 or off = never decay)
    :help          this help
    :quit          exit
"""
import asyncio
import contextlib
import io
import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from main import MockDatabase, VowAdvancedParser, VowEngineManager  # noqa: E402

try:
    from vow.database import SqliteDatabase
except ImportError:  # pragma: no cover - flat layout fallback
    from database import SqliteDatabase

HELP = __doc__[__doc__.index('Commands:'):]


def _brace_delta(line):
    """Net { } balance of a line, ignoring string contents and comments."""
    out, in_str, quote, i = 0, False, '', 0
    while i < len(line):
        ch = line[i]
        if in_str:
            if ch == quote and line[i - 1] != '\\':
                in_str = False
        elif ch in ('"', "'"):
            in_str, quote = True, ch
        elif ch == '#':
            break
        elif ch == '{':
            out += 1
        elif ch == '}':
            out -= 1
        i += 1
    return out


class VowRepl:
    def __init__(self, database, scar_ttl=None, live=False,
                 input_fn=input, out=sys.stdout):
        self.database = database
        self.manager = VowEngineManager(database, scar_ttl=scar_ttl)
        self.live = live
        self.sources = {}      # quest name -> VOW source
        self.last_trace = None
        self._input = input_fn
        self._out = out

    # -- i/o helpers -----------------------------------------------------
    def _print(self, *args):
        print(*args, file=self._out)

    def _read(self, prompt):
        return self._input(prompt)

    @property
    def _program(self):
        return '\n\n'.join(self.sources.values())

    # -- main loop -------------------------------------------------------
    def loop(self):
        self._print('VOW REPL -- define quests, run them, watch it learn.'
                    '  :help for commands, :quit to exit.')
        while True:
            try:
                line = self._read('vow> ')
            except EOFError:
                self._print('')
                break
            except KeyboardInterrupt:
                self._print('\n(interrupt -- :quit to exit)')
                continue
            if not line.strip():
                continue
            try:
                if not self.handle(line):
                    break
            except Exception as exc:  # the session must never die
                self._print('error: %s' % exc)

    def handle(self, line):
        stripped = line.strip()
        if stripped.startswith(':'):
            return self._command(stripped)
        # VOW source: collect a full block if braces are open
        text = line
        balance = _brace_delta(line)
        while balance > 0:
            try:
                more = self._read('...> ')
            except EOFError:
                break
            text += '\n' + more
            balance += _brace_delta(more)
        self._define(text)
        return True

    # -- source handling -------------------------------------------------
    def _define(self, text):
        try:
            program = VowAdvancedParser(text).parse_program()
        except Exception as exc:
            self._print('syntax error (nothing stored): %s' % exc)
            return
        quests = getattr(program, 'quests', [])
        if not quests:
            self._print('no quest found in that input (nothing stored)')
            return
        for q in quests:
            self.sources[q.name] = text if len(quests) == 1 else self._quest_src(text, q)
            self._print('quest %s defined -- :run %s' % (q.name, q.name))

    @staticmethod
    def _quest_src(text, quest):
        # multi-quest input: re-emit this quest alone via its source span is
        # overkill; store the whole text under each name (parser handles it)
        return text

    # -- commands --------------------------------------------------------
    def _command(self, line):
        parts = line.split()
        cmd, args = parts[0].lower(), parts[1:]
        if cmd in (':quit', ':q', ':exit'):
            self._print('bye.')
            return False
        if cmd == ':help':
            self._print(HELP)
        elif cmd == ':quests':
            self._print('defined quests: %s'
                        % (', '.join(sorted(self.sources)) or '(none)'))
        elif cmd == ':run':
            self._run(args[0] if args else None)
        elif cmd == ':scars':
            self._scars()
        elif cmd == ':successes':
            self._successes()
        elif cmd == ':trace':
            self._print(json.dumps(self.last_trace, indent=2, default=str)
                        if self.last_trace else 'no run yet')
        elif cmd == ':source':
            name = args[0] if args else None
            self._print(self.sources.get(name, 'no such quest: %r' % name))
        elif cmd == ':forget':
            if args and args[0] in self.sources:
                del self.sources[args[0]]
                self._print('forgot %s' % args[0])
            else:
                self._print('no such quest')
        elif cmd == ':live':
            self.live = True
            self._print('live mode: guarded side effects execute for real')
        elif cmd == ':dry':
            self.live = False
            self._print('dry-run mode: side effects shadowed/recorded')
        elif cmd == ':ttl':
            val = args[0] if args else 'off'
            if val.lower() in ('off', '0', 'none'):
                self.manager._scar_ttl = None
                self._print('scar decay off: exact scars skip forever')
            else:
                try:
                    self.manager._scar_ttl = float(val)
                    self._print('scar TTL = %ss: older exact scars demote '
                                'to cautionary retries' % val)
                except ValueError:
                    self._print('usage: :ttl SECONDS | off')
        else:
            self._print('unknown command %r -- :help' % cmd)
        return True

    # -- execution -------------------------------------------------------
    def _run(self, name):
        if not name:
            self._print('usage: :run QUEST -- defined: %s'
                        % ', '.join(sorted(self.sources)))
            return
        if name not in self.sources:
            self._print('no such quest: %r -- defined: %s'
                        % (name, ', '.join(sorted(self.sources)) or '(none)'))
            return
        import time as _t
        start = _t.perf_counter()
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                trace = asyncio.run(self.manager.execute_vow_quest(
                    self._program, name, dry_run=not self.live))
        except Exception as exc:
            self._print('execution error: %s' % exc)
            return
        elapsed = _t.perf_counter() - start
        self.last_trace = trace
        status = trace.get('status', '?')
        self._print('%s: %s (%.1fs)%s' % (name, status.upper(), elapsed,
                                          '' if self.live else '  [dry-run]'))
        import ast as _ast
        try:
            result = trace.get('final_result')
            result = _ast.literal_eval(result) if isinstance(result, str) else result
        except Exception:
            result = None
        if isinstance(result, dict):
            for t in result.get('tournament', []):
                marks = []
                if t.get('skipped'):
                    marks.append('SKIPPED(%s)' % t['skipped'])
                if t.get('caution'):
                    marks.append('CAUTION(%s)' % t['caution'])
                proof = 'ok' if t.get('proof_success', 0) >= 1.0 else 'FAILED'
                self._print('  %-20s score=%-6s proof=%s %s'
                            % (t.get('strategy'), round(t.get('score', 0), 3),
                               proof, ' '.join(marks)))
            scars = [x for x in result.get('tournament', []) if x.get('reason')]
            for x in scars:
                r = x['reason']
                margin = r.get('margin') or {}
                off = (' (actual %s, expected %s, off by %s)'
                       % (margin.get('actual'), margin.get('expected'),
                          margin.get('off_by')) if margin.get('off_by') is not None else '')
                self._print('  why %s failed: %s%s'
                            % (x.get('strategy'), r.get('prove'), off))

    def _scars(self):
        if hasattr(self.database, 'recall_all_scars_sync'):
            rows = self.database.recall_all_scars_sync()
        else:
            rows = list(self.database.scars)
        if not rows:
            self._print('no scars yet -- nothing has gone wrong')
            return
        self._print('%d scar(s):' % len(rows))
        for sc in rows:
            ctx = sc.get('context') or {}
            if isinstance(ctx, str):
                try:
                    ctx = json.loads(ctx)
                except Exception:
                    ctx = {}
            reason = ctx.get('reason') or {}
            kind = reason.get('kind', '')
            seed = (ctx.get('seed') or '')[:8]
            self._print('  [%s] %s: %s %s %s'
                        % (sc.get('quest_name') or ctx.get('quest') or '?',
                           ctx.get('strategy') or '-',
                           sc.get('message'),
                             ('| %s' % kind) if kind else '',
                             ('| seed %s' % seed) if seed else ''))

    def _successes(self):
        if hasattr(self.database, 'recall_success_sync'):
            import sqlite3  # noqa: F401  (db is sqlite; raw query simplest)
            try:
                rows = self.database._conn.execute(
                    'SELECT quest_name, strategy, env, created_at'
                    ' FROM successes ORDER BY id DESC LIMIT 10').fetchall()
            except Exception:
                rows = []
            if not rows:
                self._print('no successes recorded yet')
                return
            self._print('recent successes:')
            for q, st, env, ts in rows:
                self._print('  [%s] %s env=%s (%s)' % (q, st, env, ts))
        else:
            self._print('success memory needs a database (start with --db)')


def cmd_repl(args):
    database = SqliteDatabase(args.db) if getattr(args, 'db', None) else MockDatabase()
    repl = VowRepl(database, scar_ttl=getattr(args, 'scar_ttl', None))
    repl.loop()
    return 0
