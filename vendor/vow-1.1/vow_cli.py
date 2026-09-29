#!/usr/bin/env python3
# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""vow_cli.py -- command line interface for the VOW language.

Usage:
    python vow_cli.py run <file.vow> [--quest NAME] [--live]

The CLI parses and transpiles the .vow source, then executes it through the
exact same mechanism as main.py (VowEngineManager + MockDatabase), prints the
resulting JSON trace to stdout, and exits 0 when the trace status is
"success", 1 otherwise.

Modes:
    default      dry-run (shadow) mode: side effects are recorded, not run
    --live       live mode: guarded side effects execute for real
"""

import argparse
import asyncio
import contextlib
import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

# main.py owns the import shim for the vow package (package layout with flat
# fallback); importing it here gives the CLI the exact same parse -> transpile
# -> execute mechanism and the same runtime symbols.
from main import MockDatabase, VowAdvancedParser, VowEngineManager

try:
    from vow.vow_reverse import VowReverseTranspiler, VowReverseError
    from vow.compliance import ComplianceExporter
    from vow.database import SqliteDatabase
    from vow.database_backends import PostgresDatabase, MongoDatabase
    from vow.vow_transpiler import VowTranspiler
    from vow.vow_formatter import format_source, lint_source
    from vow.self_learning_system import ScarPatternAnalyzer
except ImportError:
    from vow_reverse import VowReverseTranspiler, VowReverseError
    from compliance import ComplianceExporter
    from database import SqliteDatabase
    from database_backends import PostgresDatabase, MongoDatabase
    from vow_transpiler import VowTranspiler
    from vow_formatter import format_source, lint_source
    from self_learning_system import ScarPatternAnalyzer


def cmd_reverse(args):
    path = args.file
    if not os.path.isfile(path):
        _emit_error("file not found: %s" % path, phase="read")
        return 1
    try:
        with open(path, "r", encoding="utf-8") as handle:
            source = handle.read()
    except OSError as exc:
        _emit_error("could not read %s: %s" % (path, exc), phase="read")
        return 1
    try:
        rt = VowReverseTranspiler()
        vow_src = rt.reverse_shadow(source) if args.shadow else rt.reverse_source(source)
    except VowReverseError as exc:
        _emit_error(str(exc), phase="reverse")
        return 1
    if not args.shadow and "__expr__(" in vow_src:
        print("note: output contains __expr__ placeholders and will not "
              "execute via `vow run`", file=sys.stderr)
    if args.shadow and rt._amputations:
        # engine docket #3: shadow mode admits its losses exactly the way
        # general mode admits its __expr__ placeholders — by count, on
        # stderr
        print("note: %d statement(s) were not recognized and survive only "
              "as '# unsupported' comments — the round trip is NOT "
              "faithful" % len(rt._amputations), file=sys.stderr)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(vow_src)
        print("wrote %s" % args.out, file=sys.stderr)
    else:
        print(vow_src)
    return 0


def _emit_error(message, quest_name=None, phase=None):
    """Print a JSON error object to stderr (stdout stays reserved for traces)."""
    payload = {"status": "error", "error": message}
    if quest_name is not None:
        payload["quest_name"] = quest_name
    if phase is not None:
        payload["phase"] = phase
    print(json.dumps(payload, indent=2), file=sys.stderr)


def _default_quest_name(source):
    """Parse the program and return the first quest's name (SPEC section 2:
    a program is one or more quests). Raises on syntax error."""
    program = VowAdvancedParser(source).parse_program()
    if not getattr(program, "quests", None):
        raise ValueError("no quests defined in source file")
    return program.quests[0].name



def _open_database(args):
    """Build the durable backend from CLI flags. --db = SQLite file
    (default: in-memory mock), --postgres = PostgreSQL DSN, --mongo =
    MongoDB URI. Driver problems are reported honestly, never swallowed."""
    if getattr(args, "postgres", None):
        try:
            return PostgresDatabase(args.postgres)
        except ImportError as exc:
            _emit_error(str(exc), phase="connect")
            raise SystemExit(1)
        except Exception as exc:
            _emit_error("could not connect to PostgreSQL: %s" % exc,
                        phase="connect")
            raise SystemExit(1)
    if getattr(args, "mongo", None):
        try:
            from pymongo import MongoClient
        except ImportError:
            _emit_error("--mongo needs the pymongo driver installed",
                        phase="connect")
            raise SystemExit(1)
        try:
            client = MongoClient(args.mongo)
            # db name: path component of the URI, else vow_memory
            name = (args.mongo.rstrip("/").rsplit("/", 1)[-1]
                    if "/" in args.mongo.replace("://", "X", 1)[1:]
                    else "vow_memory")
            return MongoDatabase(client[name or "vow_memory"])
        except Exception as exc:
            _emit_error("could not connect to MongoDB: %s" % exc,
                        phase="connect")
            raise SystemExit(1)
    if getattr(args, "db", None):
        return SqliteDatabase(args.db)
    return MockDatabase()


def _add_db_flags(parser):
    parser.add_argument("--db", metavar="PATH", default=None,
                        help="persist to a SQLite database at PATH "
                             "(default: in-memory mock)")
    parser.add_argument("--postgres", metavar="DSN", default=None,
                        help="persist to PostgreSQL (needs psycopg/psycopg2/"
                             "pg8000 installed)")
    parser.add_argument("--mongo", metavar="URI", default=None,
                        help="persist to MongoDB (needs pymongo installed)")


def _read_source_or_error(path):
    if not os.path.isfile(path):
        _emit_error("file not found: %s" % path, phase="read")
        return None
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return handle.read()
    except OSError as exc:
        _emit_error("could not read %s: %s" % (path, exc), phase="read")
        return None


def cmd_transpile(args):
    """VOW -> Shadow Python (auditable Python a human or LLM can read)."""
    source = _read_source_or_error(args.file)
    if source is None:
        return 1
    try:
        code = VowTranspiler().transpile(
            VowAdvancedParser(source).parse_program())
    except Exception as exc:
        _emit_error("%s: %s" % (type(exc).__name__, exc), phase="transpile")
        return 1
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(code)
        print(json.dumps({"written": args.out, "bytes": len(code)}))
    else:
        sys.stdout.write(code)
    return 0


def _fixpoint_check(source):
    """Shared by validate-shadow/roundtrip: transpile -> reverse ->
    re-transpile twice; the meaningful fidelity check is that the second
    generation is identical to the third (first pass may canonicalize a
    no-op `success when true` away — semantically identical)."""
    def transpile(vow_src):
        return VowTranspiler().transpile(
            VowAdvancedParser(vow_src).parse_program())

    def strip(code):
        return '\n'.join(l for l in code.splitlines()
                          if not l.startswith('# VOW-SIGNATURE'))
    rt = VowReverseTranspiler()
    code1 = transpile(source)
    vow2 = rt.reverse_shadow(code1)
    # engine docket #3: a round trip is faithful only if NOTHING was
    # amputated on the way back — two generations descending from the
    # same amputated artifact agree with each other and prove nothing.
    amputations = list(rt._amputations)
    code2 = transpile(vow2)
    vow3 = rt.reverse_shadow(code2)
    code3 = transpile(vow3)
    return vow2, strip(code2) == strip(code3) and not amputations, amputations


def cmd_validate_shadow(args):
    """Check VOW -> Shadow Python reversibility (faithful round trip)."""
    source = _read_source_or_error(args.file)
    if source is None:
        return 1
    try:
        _, reversible, amputations = _fixpoint_check(source)
    except Exception as exc:
        _emit_error("%s: %s" % (type(exc).__name__, exc), phase="validate")
        return 1
    print(json.dumps({"reversible": reversible, "file": args.file,
                      "amputations": amputations}))
    return 0 if reversible else 1


def cmd_roundtrip(args):
    """VOW -> Shadow Python -> VOW: print the regenerated VOW source and
    whether the round trip is faithful."""
    source = _read_source_or_error(args.file)
    if source is None:
        return 1
    try:
        vow2, reversible, amputations = _fixpoint_check(source)
    except Exception as exc:
        _emit_error("%s: %s" % (type(exc).__name__, exc), phase="roundtrip")
        return 1
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(vow2)
    print(json.dumps({"reversible": reversible,
                      "amputations": amputations,
                      "roundtrip_vow": vow2 if not args.out else None,
                      "written": args.out}))
    return 0 if reversible else 1


def cmd_scars(args):
    """Inspect durable scar memory: list/stats, plus fleet export/inherit
    of redacted, signed lesson packs (.vowscars)."""
    database = _open_database(args)
    if hasattr(database, 'recall_all_scars_sync'):
        all_scars = database.recall_all_scars_sync()
    else:
        all_scars = list(getattr(database, 'scars', []))

    if args.action == 'export':
        from vow.fleet import build_pack, FORMAT
        key = os.environ.get(args.key_env) if args.key_env else None
        # OWED 6: the pack's provenance is signed by the STORE's identity
        # (one key per deployment: '<db>.seckey'/'.pubkey'; VOW_ED25519_KEY
        # overrides). Non-file stores need the env key — no silent
        # unsigned mode.
        key_base = getattr(args, 'db', None)
        if (not key_base or '://' in str(key_base)) \
                and not os.environ.get('VOW_ED25519_KEY'):
            _emit_error('export needs a signing identity: a file '
                        '--db (mints <db>.seckey/.pubkey) or '
                        'VOW_ED25519_KEY in the environment',
                        phase='export')
            return 1
        pack = build_pack(all_scars, args.label, key=key, full=args.full,
                          key_base=key_base or 'env-key')
        with open(args.out, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, indent=1)
        print(json.dumps({'exported': len(pack['lessons']), 'out': args.out,
                          'format': FORMAT,
                          'key_id': pack['provenance']['key_id'],
                          'hmac_fleet_key': bool(key),
                          'redacted': not args.full}))
        return 0

    if args.action == 'inherit':
        from vow.fleet import (verify_pack, verify_pack_v2, to_scar_record,
                               lesson_key, FORMAT, LEGACY_FORMAT)
        try:
            pack = json.load(open(args.path, encoding='utf-8'))
        except (OSError, json.JSONDecodeError) as exc:
            _emit_error('%s: %s' % (type(exc).__name__, exc),
                        phase='inherit')
            return 1
        fmt = pack.get('format')
        if fmt not in (FORMAT, LEGACY_FORMAT):
            _emit_error('unsupported pack format: %r' % fmt,
                        phase='inherit')
            return 1
        key = os.environ.get(args.key_env) if args.key_env else None
        if fmt == FORMAT:
            # OWED 6: provenance must VERIFY. A rumor with consequences
            # is refused by default; --allow-unsigned does not exist for
            # v2 (a v2 pack is signed by construction — failure means
            # tampering or the wrong key).
            verdict = verify_pack_v2(
                pack, pubkey_path=getattr(args, 'pubkey', None), key=key)
            if not verdict.get('verified'):
                _emit_error('provenance rejected: %s'
                            % verdict.get('error', 'unsigned'),
                            phase='inherit')
                return 2
            if verdict.get('hmac') is False:
                # defense in depth: the caller offered a fleet key and
                # the pack carries the legacy layer — a mismatch is a
                # refusal, not a shrug
                _emit_error('fleet HMAC layer invalid (wrong fleet key)',
                            phase='inherit')
                return 2
            provenance = verdict
            sig_state = ('verified (key %s%s)'
                         % (verdict.get('key_id'),
                            '' if verdict.get('pinned') else
                            ', trust-on-first-use — pin --pubkey for '
                            'certainty'))
        else:
            verdict = verify_pack(pack, key)
            if verdict is False:
                _emit_error('signature invalid (tampered or wrong key)',
                            phase='inherit')
                return 2
            if verdict is None and not args.allow_unsigned:
                _emit_error('pack is unsigned (v1 legacy); pass '
                            '--allow-unsigned to admit it as a LABELED '
                            'rumor', phase='inherit')
                return 2
            provenance = {'verified': bool(verdict), 'key_id': None,
                          'engine': (pack.get('source') or {}).get('engine'),
                          'exported_at': pack.get('exported_at')}
            sig_state = 'verified (v1 hmac)' if verdict else \
                        'UNSIGNED — rumor admitted deliberately'
        src = (pack.get('source') or {}).get('label', 'unknown')
        existing_keys = set()
        for s in all_scars:
            c = s.get('context') if isinstance(s.get('context'), dict) \
                else {}
            if c.get('inherited'):
                r = c.get('reason') or {}
                existing_keys.add((
                    s.get('quest_name') or c.get('quest'), c.get('strategy'),
                    r.get('prove'), r.get('kind'), c.get('source')))
        new, dupe = 0, 0
        for lesson in pack.get('lessons', []):
            k = lesson_key(lesson, src)
            if k in existing_keys:
                dupe += 1
                continue
            rec = to_scar_record(lesson, src, provenance=provenance)
            if hasattr(database, 'record_scar_sync'):
                database.record_scar_sync(rec)
            else:
                database.scars.append(rec)
            existing_keys.add(k)
            new += 1
        print(json.dumps({
            'inherited': new, 'duplicates_skipped': dupe, 'source': src,
            'format': fmt,
            'signature': sig_state,
            'note': 'imported lessons are cautionary-only (never exact-skip)'
        }))
        return 0

    if args.quest:
        all_scars = [x for x in all_scars
                     if x.get('quest_name') == args.quest]
    if args.action == 'list':
        print(json.dumps({"scars": all_scars, "count": len(all_scars)},
                         default=str))
        return 0
    # stats: counts per quest/strategy + recurring patterns from the
    # pattern analyzer (the same component the learning loop uses)
    by_quest, by_strategy = {}, {}
    analyzer = ScarPatternAnalyzer()
    for x in all_scars:
        q = x.get('quest_name') or '<unknown>'
        by_quest[q] = by_quest.get(q, 0) + 1
        ctx = x.get('context') if isinstance(x.get('context'), dict) else {}
        st = ctx.get('strategy')
        if st:
            by_strategy[st] = by_strategy.get(st, 0) + 1
        analyzer.add_scar(q, st or '<none>', x.get('message', ''))
    analyzer.analyze_patterns()
    print(json.dumps({
        "total": len(all_scars),
        "by_quest": by_quest,
        "by_strategy": by_strategy,
        "top_patterns": [
            {"id": pt.pattern_id, "description": pt.description,
             "occurrences": pt.occurrence_count,
             "strategies": pt.strategies}
            for pt in analyzer.get_top_patterns(limit=5)],
    }, default=str))
    return 0


def cmd_why(args):
    """The WHY query: explain a quest's memory in causal terms — what hurt,
    what works, and what the engine will do next time. Every claim is
    sourced to a scar or success record; no new data is produced, this is
    a read-only query over existing memory."""
    database = _open_database(args)
    if hasattr(database, 'recall_all_scars_sync'):
        scars = database.recall_all_scars_sync()
    else:
        scars = list(getattr(database, 'scars', []))
    scars = [s for s in scars
             if (s.get('quest_name') or s.get('quest')) == args.quest]
    wins = (database.recall_all_success_sync()
            if hasattr(database, 'recall_all_success_sync') else [])
    wins = [w for w in wins if w.get('quest') == args.quest]
    if args.strategy:
        scars = [s for s in scars
                 if (s.get('context') or {}).get('strategy') == args.strategy]
        wins = [w for w in wins if w.get('strategy') == args.strategy]

    hurt, exact_pairs, scarred_names = [], set(), set()
    for i, s in enumerate(scars, 1):
        ctx = s.get('context') if isinstance(s.get('context'), dict) else {}
        reason = ctx.get('reason') if isinstance(ctx.get('reason'), dict) \
            else {}
        margin = reason.get('margin') if isinstance(reason.get('margin'),
                                                    dict) else {}
        strat, seed = ctx.get('strategy'), ctx.get('seed')
        if strat:
            scarred_names.add(strat)
        if strat and seed:
            exact_pairs.add((strat, seed))
        hurt.append({
            'n': i, 'created_at': s.get('created_at'),
            'strategy': strat, 'seed': seed,
            'message': s.get('message'),
            'prove': reason.get('prove'), 'kind': reason.get('kind'),
            'margin': margin or None,
            'bindings': reason.get('bindings') or None,
            'inherited': bool(ctx.get('inherited')),
            'source': ctx.get('source'),
            'verified': ctx.get('verified'),
            'origin_key_id': ctx.get('origin_key_id'),
        })

    works = {}
    for w in wins:
        d = works.setdefault(w.get('strategy'),
                             {'successes': 0, 'latest': None,
                              'situations': set()})
        d['successes'] += 1
        d['latest'] = w.get('created_at') or d['latest']
        if w.get('seed'):
            d['situations'].add(w['seed'])

    next_time = []
    for strat, seed in sorted(exact_pairs):
        next_time.append({
            'subject': '%s in situation %s' % (strat, seed[:8]),
            'prediction': 'SKIPPED on identical recurrence',
            'basis': 'exact scar (strategy + situation fingerprint)'})
    for strat in sorted(scarred_names):
        next_time.append({
            'subject': '%s in any new situation' % strat,
            'prediction': 'runs under CAUTION',
            'basis': 'scar history under a different fingerprint'})
    for strat, d in sorted(works.items()):
        if strat not in scarred_names:
            next_time.append({
                'subject': strat,
                'prediction': 'runs clean',
                'basis': '%d successes, no scars' % d['successes']})

    report = {
        'quest': args.quest,
        'scar_count': len(scars),
        'success_count': len(wins),
        'what_hurt': hurt,
        'what_works': [{'strategy': k, 'successes': d['successes'],
                        'latest': d['latest'],
                        'situations': len(d['situations'])}
                       for k, d in sorted(works.items())],
        'next_time': next_time,
    }
    if args.json:
        print(json.dumps(report, default=str))
        return 0

    print("WHY - quest '%s'" % args.quest)
    if not scars and not wins:
        print('  no memory: this quest has no scars or successes '
              'in this database yet.')
        return 0
    print('\nWHAT HURT (%d)' % len(hurt))
    for h in hurt:
        loc = 'strategy=%s' % h['strategy'] if h['strategy'] else 'quest-level'
        seed = ' · seed=%s' % h['seed'][:8] if h['seed'] else ''
        ts = '%s · ' % h['created_at'] if h['created_at'] else ''
        print('  #%d %s%s%s' % (h['n'], ts, loc, seed))
        if h['inherited']:
            # OWED 6: provenance said out loud — verified packs name
            # their key; admitted rumors are labeled rumors, forever
            if h.get('verified'):
                prov = 'key %s, verified' % (h.get('origin_key_id') or '?')
            elif h.get('verified') is False:
                prov = 'UNSIGNED — rumor, admitted deliberately'
            else:
                prov = 'provenance unknown (pre-Owed-6 import)'
            print('      [inherited from %s (%s) — cautionary lesson, '
                  'never exact-skips]' % (h['source'] or 'unknown', prov))
        print('      %s' % h['message'])
        if h['margin'] and h['margin'].get('off_by') is not None:
            m = h['margin']
            print('      measured: actual %s %s expected %s - off by %s'
                  % (m.get('actual'), m.get('op'), m.get('expected'),
                     m.get('off_by')))
    print('\nWHAT WORKS (%d strategies, %d proven runs)'
          % (len(report['what_works']), len(wins)))
    for w in report['what_works']:
        print('  %s - %d successes, latest %s'
              % (w['strategy'], w['successes'], w['latest']))
    print('\nWHAT HAPPENS NEXT TIME')
    for n in next_time:
        print('  %s -> %s' % (n['subject'], n['prediction']))
        print('      basis: %s' % n['basis'])
    return 0


_GOLDEN_AFTER = 3  # mirrors _VOW_GOLDEN_AFTER in the shadow runtime


def cmd_digest(args):
    """The Daily Behavioral Intelligence Report: one JSON digest of the
    deployment's behavior for a date (default: today, UTC) — scars by kind,
    golden paths, success/latency stats, whispers, skips, fleet lessons.
    Pure aggregation over durable memory; the overseer's complete,
    non-fabricated feed. Read-only."""
    import ast as _ast
    import datetime as _dt
    database = _open_database(args)
    date = args.date or _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%d')
    label = args.label or os.path.basename(
        getattr(args, 'db', None) or 'memory')

    def _dated(row):
        # rows without a timestamp (in-memory fallback) are always included
        ca = row.get('created_at')
        return True if ca is None else str(ca).startswith(date)

    scars = (database.recall_all_scars_sync()
             if hasattr(database, 'recall_all_scars_sync')
             else list(getattr(database, 'scars', [])))
    scars = [s for s in scars if _dated(s)]
    successes = (database.recall_all_success_sync()
                 if hasattr(database, 'recall_all_success_sync') else [])
    successes = [s for s in successes if _dated(s)]
    traces = (database.recall_all_traces_sync()
              if hasattr(database, 'recall_all_traces_sync') else [])
    traces = [t for t in traces if _dated(t)]

    scar_by_kind, scar_by_quest, entangled = {}, {}, 0
    inherited, sources = 0, set()
    inherited_verified = 0
    for s in scars:
        ctx = s.get('context') if isinstance(s.get('context'), dict) else {}
        reason = ctx.get('reason') if isinstance(ctx.get('reason'),
                                                 dict) else {}
        kind = reason.get('kind', 'unknown')
        scar_by_kind[kind] = scar_by_kind.get(kind, 0) + 1
        if reason.get('entangled_refs'):
            entangled += 1
        q = s.get('quest_name') or ctx.get('quest') or 'unknown'
        scar_by_quest[q] = scar_by_quest.get(q, 0) + 1
        if ctx.get('inherited'):
            inherited += 1
            if ctx.get('source'):
                sources.add(ctx['source'])
            if ctx.get('verified'):
                inherited_verified += 1

    strat = {}
    streaks = {}
    for e in successes:
        st = strat.setdefault(e.get('strategy'),
                              {'runs': 0, 'wins': 0, 'durations': []})
        st['runs'] += 1
        if isinstance(e.get('duration'), (int, float)):
            st['durations'].append(e['duration'])
        if e.get('won'):
            st['wins'] += 1
            key = (e.get('quest'), e.get('strategy'), e.get('seed'))
            streaks[key] = streaks.get(key, 0) + 1
    by_strategy = {}
    for name, st in sorted(strat.items()):
        ds = st['durations']
        by_strategy[name] = {
            'runs': st['runs'], 'wins': st['wins'],
            'mean_duration': (sum(ds) / len(ds)) if ds else None}
    golden_paths = [{'quest': q, 'strategy': s, 'seed': sd, 'wins': n}
                    for (q, s, sd), n in sorted(streaks.items())
                    if n >= _GOLDEN_AFTER]

    whisper_by_kind, skip_by_kind, quests = {}, {}, set()
    for t in traces:
        data = t.get('data') if isinstance(t.get('data'), dict) else {}
        if data.get('quest_name'):
            quests.add(data['quest_name'])
        fr = data.get('final_result')
        if isinstance(fr, str):
            try:
                fr = _ast.literal_eval(fr)
            except Exception:
                fr = {}
        if not isinstance(fr, dict):
            fr = {}
        for w in fr.get('whispers') or []:
            k = w.get('kind', 'unknown') if isinstance(w, dict) \
                else 'unknown'
            whisper_by_kind[k] = whisper_by_kind.get(k, 0) + 1
        for m in fr.get('tournament') or []:
            if isinstance(m, dict) and m.get('skipped'):
                k = m['skipped']
                skip_by_kind[k] = skip_by_kind.get(k, 0) + 1

    digest = {
        'digest': 'vow-behavioral-daily/1',
        'date': date,
        'deployment': label,
        'runs': len(traces),
        'quests': sorted(quests),
        'scars': {'total': len(scars), 'by_kind': scar_by_kind,
                  'by_quest': scar_by_quest, 'entangled_marked': entangled,
                  'inherited': inherited},
        'successes': {'total': len(successes),
                      'wins': sum(1 for e in successes if e.get('won')),
                      'by_strategy': by_strategy},
        'golden_paths': golden_paths,
        'whispers': {'total': sum(whisper_by_kind.values()),
                     'by_kind': whisper_by_kind},
        'skips': skip_by_kind,
        'fleet': {'inherited_lessons': inherited,
                  'inherited_verified': inherited_verified,
                  'sources': sorted(sources)},
    }
    out = json.dumps(digest, indent=2, default=str)
    if args.out:
        with open(args.out, 'w', encoding='utf-8') as fh:
            fh.write(out + '\n')
    print(out)
    return 0


def cmd_runs(args):
    """List the durability run registry: every journaled run with its
    status — 'running' means crashed (no run_end), and is resumable."""
    database = _open_database(args)
    if not hasattr(database, 'list_runs'):
        _emit_error("the run registry requires a SQLite --db backend",
                    phase="read")
        return 1
    print(json.dumps(database.list_runs(), indent=2, default=str))
    return 0


def _load_approval_run(database, run_id, phase):
    """Shared validation for approve/deny: backend, run, status, chain.
    Returns (row, events) or None after emitting the error."""
    if not hasattr(database, 'create_run'):
        _emit_error("approvals require a SQLite --db backend", phase=phase)
        return None
    row = database.get_run(run_id)
    if row is None:
        _emit_error("no such run: %s" % run_id, phase=phase)
        return None
    if row['status'] != 'awaiting_approval':
        _emit_error("run %s is not awaiting approval (status: %s)"
                    % (run_id, row['status']), phase=phase)
        return None
    from vow.vow_transpiler import JournalRuntime
    events = database.load_journal(run_id)
    ok, msg = JournalRuntime.verify_chain(run_id, events)
    if not ok:
        _emit_error("journal corrupt: %s" % msg, phase=phase)
        return None
    return row, events


def cmd_approve(args):
    """Grant a pending human approval: the decision is journaled INSIDE the
    run's own hash chain (tamper-evident oversight evidence), then the run
    resumes through the normal --resume path."""
    found = _load_approval_run(database := _open_database(args),
                               args.run_id, "approve")
    if found is None:
        return 1
    row, events = found
    # Arc 3D: claim the decision atomically — two approvers cannot both
    # grant; the token rides the delegation into the resume re-claim.
    _stale = int(os.environ.get('VOW_CLAIM_STALE_MINUTES', '60'))
    _token = os.urandom(6).hex()
    if hasattr(database, 'claim_run') and not database.claim_run(
            args.run_id, _token, from_statuses=('awaiting_approval',),
            stale_minutes=_stale):
        _emit_error("run %s is being decided by another process"
                    % args.run_id, phase="approve")
        return 1
    from vow.vow_transpiler import JournalRuntime
    import datetime as _dt
    journal = JournalRuntime(database, args.run_id, mode='live',
                             events=events)
    database.journal = journal
    journal.append('approval_granted',
                   {'approver': args.approver or 'unknown',
                    'note': args.note or '',
                    'at': _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime(
                        '%Y-%m-%dT%H:%M:%S')})
    # hand back to the normal resume path (which re-validates source,
    # engine and chain, then replays): status 'running' opens its gate
    hh, cnt = journal.head
    database.suspend_run(args.run_id, 'running', None, hh, cnt)
    import argparse as _ap
    run_args = _ap.Namespace(
        file=args.file, quest=None, db=getattr(args, 'db', None),
        postgres=getattr(args, 'postgres', None),
        mongo=getattr(args, 'mongo', None),
        live=True, resume=args.run_id, no_journal=False, scar_ttl=None,
        effect_adapter=getattr(args, 'effect_adapter', None),
        _claim_token=_token)
    return cmd_run(run_args)


def cmd_deny(args):
    """Deny a pending approval: journaled in the chain, run ends 'denied'.
    A refusal is evidence too — the request and its answer both persist."""
    found = _load_approval_run(database := _open_database(args),
                               args.run_id, "deny")
    if found is None:
        return 1
    row, events = found
    # Arc 3D: claim the decision atomically (same guard as approve)
    _stale = int(os.environ.get('VOW_CLAIM_STALE_MINUTES', '60'))
    if hasattr(database, 'claim_run') and not database.claim_run(
            args.run_id, os.urandom(6).hex(),
            from_statuses=('awaiting_approval',), stale_minutes=_stale):
        _emit_error("run %s is being decided by another process"
                    % args.run_id, phase="deny")
        return 1
    from vow.vow_transpiler import JournalRuntime
    import datetime as _dt
    journal = JournalRuntime(database, args.run_id, mode='live',
                             events=events)
    database.journal = journal
    journal.append('approval_denied',
                   {'approver': args.approver or 'unknown',
                    'note': args.note or '',
                    'at': _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime(
                        '%Y-%m-%dT%H:%M:%S')})
    journal.append('run_end', {'status': 'denied'})
    hh, cnt = journal.head
    database.finish_run(args.run_id, 'denied', hh, cnt)
    print(json.dumps({'status': 'denied', 'run_id': args.run_id,
                      'approver': args.approver or 'unknown',
                      'note': args.note or ''}, indent=2))
    return 0


def cmd_due(args):
    """The scheduler's worklist: suspended runs whose wake time has come,
    plus every approval-waiting run. Cron drives the resumptions."""
    database = _open_database(args)
    if not hasattr(database, 'due_runs'):
        _emit_error("`due` requires a SQLite --db backend", phase="read")
        return 1
    import datetime as _dt
    now = _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%dT%H:%M:%S')
    print(json.dumps({'now': now, 'due': database.due_runs(now)},
                     indent=2, default=str))
    return 0


def cmd_sweep(args):
    """The sweeper (Arc 3C + Owed 4, docs/DURABILITY.md §6): reconcile,
    then resume every due run in one call — the cron one-liner.
    RECONCILE: a 'running' row whose heartbeat stopped (older than
    --stale-after / VOW_RUN_STALE_SECONDS, default 30s) is declared
    crashed BY EVIDENCE and resumes automatically. Due = suspended runs
    whose wake time has passed; each resumes through the normal --resume
    path (same source/engine/chain validation, same replay).
    Approval-waiting runs are listed with their hint and NEVER
    auto-granted — a human decision is the point. --crashed remains for
    rows with NO heartbeat evidence (pre-heartbeat stores): the
    operator's call. A row whose heartbeat is FRESH is refused even
    under --crashed — evidence outranks the operator."""
    database = _open_database(args)
    if not hasattr(database, 'due_runs'):
        _emit_error("`sweep` requires a SQLite --db backend", phase="sweep")
        return 1
    import argparse as _ap
    import datetime as _dt
    import io as _io
    now = _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime(
        '%Y-%m-%dT%H:%M:%S')
    # OWED 4: reconcile BEFORE listing work. A 'running' row whose
    # heartbeat stopped (older than --stale-after, default
    # VOW_RUN_STALE_SECONDS=30s) is declared crashed BY EVIDENCE and
    # joins the worklist automatically — the registry no longer says
    # 'running' forever, and crashed resume is no longer the operator's
    # guess. Rows with NO heartbeat (pre-heartbeat stores) carry no
    # evidence: they remain the operator's explicit --crashed call.
    reconciled = []
    if hasattr(database, 'reconcile_crashed'):
        _stale_after = float(getattr(args, 'stale_after', None)
                             or os.environ.get('VOW_RUN_STALE_SECONDS',
                                               '30'))
        reconciled = database.reconcile_crashed(_stale_after)
    due = database.due_runs(now)
    worklist = [r for r in due if r['status'] == 'suspended']
    approvals = [r for r in due if r['status'] == 'awaiting_approval']
    worklist += [r for r in database.list_runs()
                 if r['status'] == 'crashed']
    refused_live = []
    if getattr(args, 'crashed', False):
        # the operator's override — but evidence outranks even the
        # operator: a row whose heartbeat is FRESH looks alive, and
        # resuming a live run would fork the journal. Refuse, loudly.
        for r in database.list_runs():
            if r['status'] != 'running':
                continue
            row = database.get_run(r['run_id']) or {}
            hb = row.get('heartbeat_at')
            if hb is None:
                worklist.append(r)      # no evidence: operator's call
            else:
                # still 'running' after reconciliation == heartbeat is
                # fresh == looks alive. Refuse, with the evidence named.
                refused_live.append({'run_id': r['run_id'],
                                     'last_heartbeat': hb})
    results = []
    rc = 0
    for entry in worklist:
        rid = entry['run_id']
        row = database.get_run(rid) or {}
        src = row.get('source_path')
        if not src or not os.path.isfile(src):
            rc = 1
            results.append({
                'run_id': rid, 'quest': entry.get('quest'),
                'outcome': 'skipped',
                'reason': ("quest source unknown or moved (%s) — resume "
                           "manually: vow run <file> --db <db> --live "
                           "--resume %s" % (src or 'not recorded', rid))})
            continue
        run_args = _ap.Namespace(
            file=src, quest=None, db=getattr(args, 'db', None),
            postgres=getattr(args, 'postgres', None),
            mongo=getattr(args, 'mongo', None),
            live=True, resume=rid, no_journal=False, scar_ttl=None,
            effect_adapter=getattr(args, 'effect_adapter', None))
        buf = _io.StringIO()
        err = _io.StringIO()
        with contextlib.redirect_stdout(buf), \
                contextlib.redirect_stderr(err):
            sub_rc = cmd_run(run_args)
        # Arc 3D: losing the atomic claim is NOT a failure — another
        # executor is resuming that run; report it and keep exit 0.
        lost_claim = 'claimed by another process' in err.getvalue()
        if sub_rc != 0 and not lost_claim:
            rc = 1
        outcome = 'resumed' if sub_rc == 0 else (
            'claimed' if lost_claim else 'failed')
        final = database.get_run(rid) or {}
        results.append({
            'run_id': rid, 'quest': entry.get('quest'),
            'outcome': outcome,
            'status': final.get('status'),
            'repaired': '"repaired": true' in buf.getvalue(),
            **({'detail': err.getvalue()[-300:]} if outcome == 'failed'
               else {})})
    print(json.dumps({
        'now': now,
        'reconciled': reconciled,
        'swept': results,
        'awaiting_approval': [
            {'run_id': a['run_id'], 'quest': a['quest'],
             'resume': "vow approve %s <file> --db <db>" % a['run_id']}
            for a in approvals],
        'refused_live': [
            dict(x, reason='heartbeat is fresh — this run looks ALIVE; '
                 'resuming a live run would fork the journal. If it is '
                 'truly dead, its beat will go stale and the next sweep '
                 'reconciles it by evidence.')
            for x in refused_live],
        'counts': {
            'reconciled': len(reconciled),
            'resumed': sum(1 for r in results if r['outcome'] == 'resumed'),
            'failed': sum(1 for r in results if r['outcome'] == 'failed'),
            'skipped': sum(1 for r in results if r['outcome'] == 'skipped'),
            'claimed': sum(1 for r in results if r['outcome'] == 'claimed'),
            'awaiting_approval': len(approvals),
            'refused_live': len(refused_live)}},
        indent=2, default=str))
    return rc


def cmd_journal(args):
    """Dump a run's hash-chained event journal and verify its integrity —
    the durability record is evidence, so it is verifiable."""
    database = _open_database(args)
    if not hasattr(database, 'load_journal'):
        _emit_error("the journal requires a SQLite --db backend",
                    phase="read")
        return 1
    from vow.vow_transpiler import JournalRuntime
    events = database.load_journal(args.run_id)
    if not events:
        _emit_error("no journal for run: %s" % args.run_id, phase="read")
        return 1
    ok, msg = JournalRuntime.verify_chain(args.run_id, events)
    # engine docket #5: report truncation next to chain integrity — a
    # valid prefix is not the whole truth when the registry remembers more
    _row = database.get_run(args.run_id) or {}
    _bn = _row.get('event_count') or 0
    _truncated = bool(_bn and len(events) < _bn)
    print(json.dumps({'run_id': args.run_id, 'chain_intact': ok,
                      'chain': msg,
                      'truncated': _truncated,
                      'registry_events': _bn,
                      'run': database.get_run(args.run_id),
                      'events': events}, indent=2, default=str))
    return 0 if (ok and not _truncated) else 1


def _payload_of(event):
    import json as _j
    p = event.get('payload')
    if isinstance(p, str):
        try:
            return _j.loads(p)
        except ValueError:
            return {}
    return p if isinstance(p, dict) else {}


def _pick(payload, *keys):
    for k in keys:
        if payload.get(k) is not None:
            return payload[k]
    return None


def _wake_epoch(w):
    """wake_at may be epoch seconds or an ISO timestamp — normalize."""
    try:
        return float(w)
    except (TypeError, ValueError):
        pass
    if isinstance(w, str):
        from datetime import datetime
        try:
            return datetime.fromisoformat(w.replace('Z', '+00:00')).timestamp()
        except ValueError:
            return None
    return None


def cmd_explain(args):
    """Explain a run's current state in plain language: why it is parked,
    what it waits on, who holds it, how it ended. Read-only."""
    database = _open_database(args)
    run = database.get_run(args.run_id)
    if not run:
        _emit_error("no such run: %s" % args.run_id, phase="read")
        return 1
    import time as _t
    status = run.get('status')
    why = []
    if status == 'suspended':
        wake = run.get('wake_at')
        we = _wake_epoch(wake)
        if we is not None:
            due = we <= _t.time()
            why.append("parked on `wait until %s` — %s"
                       % (wake, "DUE NOW: awaiting the next sweep"
                          if due else "not yet due"))
        else:
            why.append("parked (no wake time recorded)")
    elif status == 'awaiting_approval':
        reason = None
        if hasattr(database, 'load_journal'):
            for e in database.load_journal(args.run_id):
                if e.get('kind') == 'approval_request':
                    reason = _pick(_payload_of(e), 'reason', 'message')
        why.append("awaiting a human's approval"
                   + (": %s" % reason if reason else ""))
    elif status == 'running':
        if run.get('claimed_by'):
            why.append("claimed by %s at %s — a resume is in flight"
                       % (run['claimed_by'], run.get('claimed_at')))
        else:
            why.append("running (unclaimed)")
    elif status in ('success', 'failed', 'failed_proof'):
        why.append("ended %s at %s"
                   % (status, run.get('ended_at') or run.get('finished_at')))
    else:
        why.append("state: %s" % status)
    last = None
    if hasattr(database, 'load_journal'):
        ev = database.load_journal(args.run_id)
        if ev:
            last = ev[-1].get('kind')
    print(json.dumps({'run_id': args.run_id, 'status': status,
                      'explanation': why, 'last_heartbeat': last,
                      'run': run}, indent=2, default=str))
    return 0


def cmd_verify(args):
    """Batch-verify every run's hash chain in a store — the integrity of
    the whole evidence locker, one command. Read-only."""
    database = _open_database(args)
    if not hasattr(database, 'load_journal'):
        _emit_error("verify requires a journaled --db backend", phase="read")
        return 1
    from vow.vow_transpiler import JournalRuntime
    results = []
    for r in database.list_runs():
        rid = r['run_id']
        events = database.load_journal(rid)
        if not events:
            results.append({'run_id': rid, 'chain_intact': None,
                            'note': 'no journal events'})
            continue
        ok, msg = JournalRuntime.verify_chain(rid, events)
        results.append({'run_id': rid, 'chain_intact': ok,
                        'events': len(events),
                        'status': r.get('status')})
    broken = [x['run_id'] for x in results if x['chain_intact'] is False]
    # SIGNATURE ARC: chains prove integrity; the store report proves
    # authorship (HMAC signatures) across every table.
    store = (database.verify_store()
             if hasattr(database, 'verify_store') else {'ok': None})
    print(json.dumps({'runs': len(results),
                      'verified': sum(1 for x in results
                                      if x['chain_intact'] is True),
                      'broken': broken, 'results': results,
                      'store_signatures': store},
                     indent=2, default=str))
    return 1 if (broken or store.get('ok') is False) else 0


def cmd_export_evidence(args):
    """HYBRID SIGNATURE ARC: bundle a store's evidence (rows keep their
    HMAC seals) and ed25519-sign the pack so ANYONE holding the public
    key can verify it — proof that survives leaving the building."""
    database = _open_database(args)
    if not hasattr(database, 'dump_evidence'):
        _emit_error("export-evidence requires a journaled --db backend",
                    phase="read")
        return 1
    from vow.evidence_pack import export_pack
    summary = export_pack(database, args.out, run_id=args.run_id)
    print(json.dumps(summary, indent=2, default=str))
    return 0


def cmd_verify_evidence(args):
    """Verify an exported evidence pack WITHOUT the store: fingerprint,
    ed25519 signature (pinned to the published .pubkey when given), and
    every chain re-walked from the pack's own rows. Read-only."""
    from vow.evidence_pack import verify_pack
    try:
        report = verify_pack(args.pack, pubkey_path=args.pubkey)
    except (OSError, ValueError) as exc:
        _emit_error("cannot verify pack: %s" % exc, phase="read")
        return 1
    print(json.dumps(report, indent=2, default=str))
    return 0 if report.get('ok') else 1


def cmd_replay(args):
    """Narrate a run's journal as the story of its lives: each resume a
    new life, each event a sentence. Read-only."""
    database = _open_database(args)
    if not hasattr(database, 'load_journal'):
        _emit_error("replay requires a journaled --db backend", phase="read")
        return 1
    events = database.load_journal(args.run_id)
    if not events:
        _emit_error("no journal for run: %s" % args.run_id, phase="read")
        return 1
    lines, life = [], 0
    for e in events:
        kind = e.get('kind')
        p = _payload_of(e)
        if kind == 'run_begin':
            life = 1
            lines.append("life 1 begins — quest: %s"
                         % (_pick(p, 'quest', 'quest_name') or '?'))
        elif kind == 'resume_begin':
            life += 1
            lines.append("life %d begins — replaying the journal of lives "
                         "past" % life)
        elif kind == 'effect_intent':
            lines.append("  intends an effect: %s"
                         % (_pick(p, 'op', 'label', 'name') or p))
        elif kind == 'effect_result':
            lines.append("  effect completed: %s"
                         % (_pick(p, 'op', 'label', 'name') or 'ok'))
        elif kind == 'wait_enter':
            lines.append("  parks: `wait until %s`"
                         % (_pick(p, 'wake_at') or '?'))
        elif kind == 'wait_done':
            lines.append("  the gate opens (wake %s)"
                         % (_pick(p, 'wake_at') or '?'))
        elif kind == 'approval_request':
            lines.append("  asks a human: %s"
                         % (_pick(p, 'reason', 'message') or '?'))
        elif kind in ('approval_granted', 'approval_grant'):
            lines.append("  a human GRANTS the decision")
        elif kind in ('approval_denied', 'approval_deny'):
            lines.append("  a human DENIES the decision")
        elif kind == 'scar':
            lines.append("  learns a scar: %s"
                         % (_pick(p, 'message', 'scar') or '?'))
        elif kind in ('proof_failed', 'proof_failure'):
            lines.append("  PROOF FAILS: %s"
                         % (_pick(p, 'expr', 'message') or '?'))
        elif kind == 'run_suspend':
            lines.append("  exits — parked, journal sealed behind it")
        elif kind == 'run_end':
            lines.append("  quest ends: %s"
                         % (_pick(p, 'status', 'result') or 'done'))
        else:
            lines.append("  [%s] %s" % (kind, p if p else ''))
    print(json.dumps({'run_id': args.run_id, 'lives': life,
                      'narrative': lines}, indent=2, default=str))
    return 0


def cmd_doctor(args):
    """Examine a store's health: every chain verified, due-queue sanity,
    orphaned claims, heartbeat evidence, scar memory readable. The
    engine's own physical. Read-only."""
    import time as _t
    import datetime as _dt
    database = _open_database(args)
    checks, issues = [], []
    if hasattr(database, 'load_journal'):
        from vow.vow_transpiler import JournalRuntime
        total, intact = 0, 0
        for r in database.list_runs():
            ev = database.load_journal(r['run_id'])
            if not ev:
                continue
            total += 1
            ok, _ = JournalRuntime.verify_chain(r['run_id'], ev)
            intact += 1 if ok else 0
            if not ok:
                issues.append('broken chain: %s' % r['run_id'])
        checks.append('hash chains: %d/%d intact' % (intact, total))
    now = _t.time()
    past_due = [r['run_id'] for r in database.list_runs()
                if r.get('status') == 'suspended'
                and _wake_epoch(r.get('wake_at')) is not None
                and _wake_epoch(r.get('wake_at')) <= now]
    checks.append('due queue: %d run(s) past due, awaiting a sweep'
                  % len(past_due))
    orphaned = [r['run_id'] for r in database.list_runs()
                if r.get('claimed_by')
                and r.get('status') not in ('running', 'awaiting_approval')]
    if orphaned:
        issues.append('orphaned claims: %s' % ', '.join(orphaned))
    checks.append('claims: %d orphaned' % len(orphaned))
    # OWED 4: the registry must not say 'running' forever. A stopped
    # heartbeat is evidence of a crash (report; `vow sweep` reconciles);
    # a reconciled-crash awaiting resume is a worklist, said out loud.
    _stale_after = float(os.environ.get('VOW_RUN_STALE_SECONDS', '30'))
    _cutoff = (_dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None)
               - _dt.timedelta(seconds=_stale_after)).isoformat(
                   sep=' ', timespec='seconds')
    stale, crashed = [], []
    for r in database.list_runs():
        if r.get('status') == 'crashed':
            crashed.append(r['run_id'])
        elif r.get('status') == 'running':
            hb = (database.get_run(r['run_id']) or {}).get('heartbeat_at')
            if hb is not None and hb < _cutoff:
                stale.append(r['run_id'])
    if stale:
        issues.append('heartbeat stopped (crashed, unreconciled): %s — '
                      '`vow sweep` reconciles and resumes by evidence'
                      % ', '.join(stale))
    if crashed:
        issues.append('crashed runs awaiting resume: %s — `vow sweep` '
                      'resumes them' % ', '.join(crashed))
    checks.append('heartbeat: %d stale, %d crashed awaiting resume'
                  % (len(stale), len(crashed)))
    try:
        n = (len(database.recall_all_scars_sync())
             if hasattr(database, 'recall_all_scars_sync')
             else len(getattr(database, 'scars', [])))
        checks.append('scar memory: %d lesson(s) readable' % n)
    except Exception as e:
        issues.append('scar memory unreadable: %s' % e)
    healthy = not issues
    print(json.dumps({'health': 'HEALTHY' if healthy else 'NEEDS CARE',
                      'checks': checks, 'issues': issues},
                     indent=2, default=str))
    return 0 if healthy else 1


def cmd_route(args):
    """Classify text with a program's route table — the deterministic
    intent pre-filter. Zero tokens; the model never sees the enumerable
    majority. Read-only (parses the file, never executes it)."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from vow.vow_parser import VowAdvancedParser
    src = _read_source_or_error(args.file)
    if src is None:
        return 1
    program = VowAdvancedParser(src).parse_program()
    if not program.routes:
        print(json.dumps({'error': 'no route block in %s' % args.file}))
        return 1
    route = program.routes[0]
    text = (args.text or '').lower()
    for patterns, label in route.rows:
        for p in patterns:
            if p.lower() in text:
                print(json.dumps({'intent': label, 'matched': p,
                                  'source': route.source}))
                return 0
    print(json.dumps({'intent': route.fallback, 'matched': None,
                      'source': route.source}))
    return 0


def cmd_engine_hash(args):
    """Print the engine attestation: the build hash every evidence bundle
    carries, so a bundle can be verified against a known engine."""
    from vow.compliance import engine_attestation
    print(json.dumps(engine_attestation(), indent=2))
    return 0


def cmd_fmt(args):
    source = _read_source_or_error(args.file)
    if source is None:
        return 1
    if any(line.lstrip().startswith('#') for line in source.splitlines()):
        print("fmt: warning: comments are not preserved by the AST and "
              "will be dropped", file=sys.stderr)
    try:
        formatted = format_source(source)
    except Exception as exc:
        _emit_error("%s: %s" % (type(exc).__name__, exc), phase="fmt")
        return 1
    if args.check:
        unchanged = formatted == source
        print(json.dumps({"formatted_already": unchanged}))
        return 0 if unchanged else 1
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(formatted)
        print(json.dumps({"written": args.out}))
    else:
        sys.stdout.write(formatted)
    return 0


def cmd_lint(args):
    source = _read_source_or_error(args.file)
    if source is None:
        return 1
    report = lint_source(source)
    report["file"] = args.file
    print(json.dumps(report, indent=1))
    return 1 if report["errors"] else 0


def cmd_serve(args):
    import api_server
    argv = ["--host", args.host, "--port", str(args.port)]
    if getattr(args, "db", None):
        argv += ["--db", args.db]
    if getattr(args, "postgres", None):
        argv += ["--postgres", args.postgres]
    if getattr(args, "mongo", None):
        argv += ["--mongo", args.mongo]
    if getattr(args, "scar_ttl", None) is not None:
        argv += ["--scar-ttl", str(args.scar_ttl)]
    return api_server.main(argv)


def cmd_run(args):
    from vow.vow_transpiler import VowSuspend  # noqa: F401 — except clause
    from vow.effect_recovery import (adapter_identity,
                                     load_recovery_adapter)
    path = args.file
    if not os.path.isfile(path):
        _emit_error("file not found: %s" % path, phase="read")
        return 1

    try:
        with open(path, "r", encoding="utf-8") as handle:
            source = handle.read()
    except OSError as exc:
        _emit_error("could not read %s: %s" % (path, exc), phase="read")
        return 1

    quest_name = args.quest
    if quest_name is None:
        try:
            quest_name = _default_quest_name(source)
        except Exception as exc:
            _emit_error(str(exc), phase="parse")
            return 1

    _adapter_spec = (getattr(args, 'effect_adapter', None)
                     or os.environ.get('VOW_EFFECT_RECOVERY_ADAPTER'))
    try:
        _recovery_resolver = load_recovery_adapter(
            _adapter_spec, require_manifest=bool(_adapter_spec))
        _adapter_identity = adapter_identity(_recovery_resolver)
    except Exception as exc:
        _emit_error("effect adapter rejected: %s" % exc,
                    phase="effect_adapter")
        return 1

    database = _open_database(args)

    # --- durability (Arc 3A, docs/DURABILITY.md) -----------------------------
    # With a SQLite backend every run is journaled by default: a run
    # registry row, a hash-chained event log, and a resumable identity.
    # --resume continues a crashed run (status 'running', chain intact,
    # source + engine hashes unchanged). --no-journal opts out. Other
    # backends degrade honestly: no journal, and we say so.
    resume_id = getattr(args, 'resume', None)
    no_journal = getattr(args, 'no_journal', False)
    journal = None
    run_id = None
    _journaled = hasattr(database, 'create_run')
    if _recovery_resolver is not None and (no_journal or not _journaled):
        _emit_error("effect adapters require a durable journal; refusing "
                    "receipt-free recovery", phase="effect_adapter")
        return 1
    if _journaled and not no_journal:
        import hashlib as _hl
        from vow.compliance import engine_attestation
        from vow.vow_transpiler import JournalRuntime
        _src_sha = _hl.sha256(source.encode()).hexdigest()
        _eng_sha = engine_attestation()['engine_sha256']
        if resume_id:
            row = database.get_run(resume_id)
            if row is None:
                _emit_error("no such run: %s" % resume_id, phase="resume")
                return 1
            st = row['status']
            if st == 'awaiting_approval':
                _emit_error(
                    "run %s awaits a human decision — grant it with "
                    "`vow approve %s %s` or refuse it with `vow deny`"
                    % (resume_id, resume_id, args.file), phase="resume")
                return 1
            if st == 'suspended':
                import datetime as _dt
                _now = _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%dT%H:%M:%S')
                if row.get('wake_at') and row['wake_at'] > _now:
                    _emit_error(
                        "run %s is suspended until %s — not due yet "
                        "(`vow due --db …` lists resumable runs)"
                        % (resume_id, row['wake_at']), phase="resume")
                    return 1
            elif st not in ('running', 'crashed'):
                _emit_error(
                    "run %s is not resumable (status: %s) — resume is for "
                    "crashed or suspended runs; a completed run is history"
                    % (resume_id, st), phase="resume")
                return 1
            if row['source_sha256'] != _src_sha:
                _emit_error(
                    "source changed since the original run — refusing to "
                    "resume (a different quest is a different world)",
                    phase="resume")
                return 1
            if row['engine_sha256'] != _eng_sha:
                _emit_error(
                    "engine changed since the original run (%s… -> %s…) — "
                    "refusing to resume" % (row['engine_sha256'][:12],
                                            _eng_sha[:12]),
                    phase="resume")
                return 1
            events = database.load_journal(resume_id)
            _original_begin = next(
                (event for event in events if event['kind'] == 'run_begin'),
                None)
            _recorded_adapter = (
                _original_begin['payload'].get('effect_adapter')
                if _original_begin is not None else None)
            if _recorded_adapter != _adapter_identity:
                _emit_error(
                    "effect adapter changed since the original run; "
                    "refusing to resume under a different recovery law",
                    phase="effect_adapter")
                return 1
            ok, msg = JournalRuntime.verify_chain(resume_id, events)
            if not ok:
                _emit_error("journal corrupt: %s" % msg, phase="resume")
                return 1
            # engine docket #5: a truncated journal is a VALID prefix —
            # verify_chain alone cannot see it. The registry remembers the
            # last boundary atomically (event_count / head_hash): if the
            # journal is shorter than remembered, or the event at the
            # remembered boundary no longer matches, events were deleted
            # and replay would re-execute effects — the exact failure
            # this system exists to prevent. Refuse. (A journal LONGER
            # than remembered is the Arc 3C crash-between-boundaries case
            # below, and stays legal.)
            _bn = row.get('event_count') or 0
            _bh = row.get('head_hash')
            if _bn and _bh:
                if len(events) < _bn:
                    _emit_error(
                        "journal corrupt: the registry remembers %d "
                        "events but the journal presents %d — tail "
                        "truncation detected; refusing to resume"
                        % (_bn, len(events)), phase="resume")
                    return 1
                if events[_bn - 1]['event_hash'] != _bh:
                    _emit_error(
                        "journal corrupt: the event at the registry's "
                        "remembered boundary (seq %d) no longer matches "
                        "— refusing to resume" % _bn, phase="resume")
                    return 1
            # Arc 3C: a crash can land between `run_end` (journal
            # complete) and `finish_run` (registry updated) — the chain
            # says done, the registry says running. The work is finished
            # and the intact chain proves it: repair the registry from
            # the evidence and report, never re-execute.
            _last_real = next(
                (e for e in reversed(events)
                 if e['kind'] not in JournalRuntime.MARKERS), None)
            if _last_real is not None and _last_real['kind'] == 'run_end':
                _st = _last_real['payload'].get('status')
                database.finish_run(resume_id, _st,
                                    events[-1]['event_hash'],
                                    events[-1]['seq'])
                print(json.dumps({
                    'status': _st, 'run_id': resume_id, 'repaired': True,
                    'note': ('the journal already held run_end — the '
                             'crash landed after completion; registry '
                             'repaired from the chain, nothing '
                             're-executed')}, indent=2))
                return 0 if _st == 'success' else 1
            # Arc 3D: atomically claim the run — exactly one resumer
            # wins; a concurrent sweep/manual resume loses loudly here
            # instead of double-executing side effects (docs/
            # DURABILITY.md §7). The approve handoff re-claims with the
            # token it already holds.
            _stale = int(os.environ.get('VOW_CLAIM_STALE_MINUTES', '60'))
            _token = getattr(args, '_claim_token', None) \
                or os.urandom(6).hex()
            if hasattr(database, 'claim_run') and not database.claim_run(
                    resume_id, _token, stale_minutes=_stale):
                _emit_error(
                    "run %s was claimed by another process — a resume is "
                    "already in flight (claims go stale after %d minutes, "
                    "VOW_CLAIM_STALE_MINUTES)" % (resume_id, _stale),
                    phase="resume")
                return 1
            run_id = resume_id
            journal = JournalRuntime(
                database, run_id, mode='replay', events=events,
                recovery_resolver=_recovery_resolver)
            journal.append('resume_begin',
                           {'source_sha256': _src_sha,
                            'engine_sha256': _eng_sha,
                            'effect_adapter': _adapter_identity,
                            'at_seq': events[-1]['seq'] if events else 0})
            database.journal = journal
        else:
            run_id = os.urandom(8).hex()
            database.create_run(run_id, quest_name, _src_sha, _eng_sha,
                                source_path=os.path.abspath(path))
            journal = JournalRuntime(
                database, run_id, mode='live',
                recovery_resolver=_recovery_resolver)
            # OWED 3: the standing law this run executes under is
            # journaled — the source's runbook directive, plus any
            # deliberate operator override. Evidence answers "whose TTL?"
            # without having to ask the operator.
            _rb = {}
            try:
                from vow.vow_parser import VowAdvancedParser
                from vow.vow_formatter import render_expr as _render
                _rb = {k: _render(v) for k, v in
                       VowAdvancedParser(source).parse_program()
                       .runbook.items()}
            except Exception:
                pass  # the engine raises the real parse error downstream
            _begin = {'quest': quest_name,
                      'source_sha256': _src_sha,
                      'engine_sha256': _eng_sha,
                      'effect_adapter': _adapter_identity}
            if _rb:
                _begin['runbook'] = _rb
            if getattr(args, 'scar_ttl', None) is not None:
                _begin['scar_ttl_override'] = args.scar_ttl
            journal.append('run_begin', _begin)
            database.journal = journal
    elif resume_id:
        _emit_error("resume requires a SQLite --db backend (the journal "
                    "lives there)", phase="resume")
        return 1
    elif not no_journal:
        print("[durability] journal disabled: backend is not SQLite; "
              "run is not resumable", file=sys.stderr)

    # Arc 3C deterministic crash injection (docs/DURABILITY.md §6): with
    # VOW_KILL_AFTER=K set, the process dies the moment the write after
    # committed journal event #K is attempted. A test hook — never armed
    # in normal use, and a resumed run only inherits it if the caller
    # deliberately re-arms it.
    _kill_after = os.environ.get('VOW_KILL_AFTER')
    if _kill_after and journal is not None:
        journal._kill_after = int(_kill_after)

    manager = VowEngineManager(database,
                                 scar_ttl=getattr(args, 'scar_ttl', None),
                                 run_id=run_id, journal=journal)

    # OWED 4: the heartbeat. While this process executes, it beats into
    # the registry every VOW_HEARTBEAT_SECONDS (default 5); a crash
    # stops the beat and the stale timestamp becomes EVIDENCE that the
    # row's 'running' is a corpse, not a claim (`vow sweep` reconciles).
    # A missed beat is evidence-by-absence — it must never cause one.
    import threading as _th
    _hb_stop = _th.Event()
    if journal is not None and run_id and hasattr(database, 'heartbeat'):
        _hb_interval = float(os.environ.get('VOW_HEARTBEAT_SECONDS', '5'))

        def _beat():
            while not _hb_stop.wait(_hb_interval):
                try:
                    database.heartbeat(run_id)
                except Exception:
                    pass  # evidence-by-absence; never a crash cause

        _th.Thread(target=_beat, daemon=True,
                   name='vow-heartbeat').start()

    # The engine prints progress/DB chatter; keep stdout pure JSON by
    # redirecting that noise to stderr while the quest executes.
    try:
        with contextlib.redirect_stdout(sys.stderr):
            trace = asyncio.run(
                manager.execute_vow_quest(source, quest_name, dry_run=not args.live)
            )
    except VowSuspend as susp:
        # Arc 3B: the run parked itself — journal already holds the
        # wait_enter / approval_request. Mark the registry and hand the
        # user exact resumption instructions. Not an error: exit 0.
        hh, cnt = journal.head
        if susp.kind == 'wait':
            database.suspend_run(run_id, 'suspended', susp.wake_at, hh, cnt)
            print(json.dumps({
                'status': 'suspended', 'kind': 'wait', 'run_id': run_id,
                'wake_at': susp.wake_at,
                'resume': ("vow run %s --db <db> --live --resume %s  "
                           "(accepted at/after the wake time; `vow due` "
                           "lists due runs)" % (args.file, run_id))},
                indent=2))
        else:
            database.suspend_run(run_id, 'awaiting_approval', None, hh, cnt)
            print(json.dumps({
                'status': 'awaiting_approval', 'kind': 'approval',
                'run_id': run_id, 'reason': susp.reason,
                'resume': ("vow approve %s %s --db <db> [--approver N] "
                           "[--note M]   (or: vow deny %s --db <db>)"
                           % (run_id, args.file, run_id))},
                indent=2))
        return 0
    except Exception as exc:
        # Parse/transpile errors raised before the engine's own try/except
        # (and unexpected failures) land here.
        if journal is not None:
            try:
                hh, cnt = journal.head
                database.finish_run(run_id, 'error', hh, cnt)
            except Exception as reg_exc:
                # OWED 7 (the socket-loss drill caught this): the store
                # itself may be the casualty — a dead socket turned the
                # error path into an unhandled psycopg traceback. The
                # honest JSON error must still reach the operator (stderr —
                # stdout is reserved for traces); the corpse's status
                # stays 'running' for the sweeper's heartbeat evidence
                # to reconcile.
                _emit_error('%s (and the store could not record the '
                            'failure: %s — the run will reconcile as '
                            'crashed by heartbeat evidence)'
                            % (exc, reg_exc),
                            quest_name=quest_name, phase="execute")
                return 1
        _emit_error(str(exc), quest_name=quest_name, phase="execute")
        return 1
    finally:
        _hb_stop.set()  # the beat rests when the process stops executing

    if journal is not None:
        try:
            journal.append('run_end', {'status': trace.get('status'),
                                       'unconsumed_events':
                                       journal.unconsumed})
            journal.kill_if_boundary()  # Arc 3C: the final crash boundary
            hh, cnt = journal.head
            database.finish_run(run_id, trace.get('status'), hh, cnt)
        except Exception as reg_exc:
            # OWED 7: the store died AT the completion boundary — the
            # quest's outcome must still be reported honestly (never a
            # raw driver traceback); the run reconciles as crashed by
            # heartbeat evidence and resumes through the normal path.
            _emit_error('quest completed but the store could not record '
                        'it: %s — the run will reconcile as crashed and '
                        'resume' % reg_exc,
                        quest_name=quest_name, phase="finalize")
            return 1

    # The engine persists scars to its database instead of the in-memory
    # class store; surface them in the printed trace so recalls stay visible.
    if hasattr(database, "recall_scars_sync"):
        _scars = database.recall_scars_sync(quest_name)
    else:
        _scars = list(database.scars)
    if _scars:
        trace = dict(trace)
        trace["db_scars"] = [dict(scar) for scar in _scars]

    print(json.dumps(trace, indent=2))
    return 0 if trace.get("status") == "success" else 1


def cmd_report(args):
    """Run a quest and export an EU AI Act evidence bundle."""
    import datetime as _dt
    path = args.file
    if not os.path.isfile(path):
        _emit_error("file not found: %s" % path, phase="read")
        return 1
    with open(path, "r", encoding="utf-8") as handle:
        source = handle.read()
    quest_name = args.quest or _default_quest_name(source)
    database = _open_database(args)
    manager = VowEngineManager(database)
    try:
        with contextlib.redirect_stdout(sys.stderr):
            trace = asyncio.run(
                manager.execute_vow_quest(source, quest_name, dry_run=not args.live)
            )
    except Exception as exc:
        _emit_error(str(exc), quest_name=quest_name, phase="execute")
        return 1
    # db_scars: include durable memory in the evidence bundle regardless of
    # backend — SqliteDatabase exposes recall_all_scars_sync(), the in-memory
    # MockDatabase exposes .scars (same duck-typing as the engine tripwire).
    if hasattr(database, 'recall_all_scars_sync'):
        _db_scars = database.recall_all_scars_sync()
    else:
        _db_scars = getattr(database, 'scars', [])
    if _db_scars:
        trace["db_scars"] = [dict(sc) for sc in _db_scars]
    exporter = ComplianceExporter()
    evidence = exporter.build_evidence(trace)
    outdir = args.out or ("vow_compliance_%s" % _dt.datetime.now().strftime("%Y%m%dT%H%M%S"))
    os.makedirs(outdir, exist_ok=True)
    jpath = os.path.join(outdir, "evidence.json")
    mpath = os.path.join(outdir, "report.md")
    with open(jpath, "w", encoding="utf-8") as fh:
        json.dump(evidence, fh, indent=2, default=str)
    with open(mpath, "w", encoding="utf-8") as fh:
        fh.write(exporter.render_markdown(evidence))
    print(json.dumps({"status": "ok", "evidence_json": jpath,
                      "report_md": mpath,
                      "bundle_sha256": evidence["bundle_sha256"]}, indent=2))
    return 0


def _cmd_repl(args):
    from vow_repl import cmd_repl
    return cmd_repl(args)


def build_arg_parser():
    parser = argparse.ArgumentParser(
        prog="vow",
        description="VOW -- a quest-oriented programming language. "
                    "Quests have goals, beliefs with confidence, scar memory, "
                    "proofs, strategy tournaments, and dry-run side-effect "
                    "shadowing.",
    )
    subparsers = parser.add_subparsers(dest="command", metavar="command")
    subparsers.required = True

    run = subparsers.add_parser(
        "run",
        help="run a .vow quest file and print its JSON trace",
    )
    run.add_argument("file", help="path to the .vow source file")
    run.add_argument(
        "--quest",
        metavar="NAME",
        default=None,
        help="quest to execute (default: the first quest in the file)",
    )
    run.add_argument(
        "--live",
        action="store_true",
        help="live mode: execute guarded side effects for real "
             "(default is dry-run shadow mode, where effects are recorded)",
    )
    _add_db_flags(run)
    run.add_argument(
        "--scar-ttl",
        metavar="SECONDS",
        type=float,
        default=None,
        help="scar decay OVERRIDE: exact scars older than SECONDS demote "
             "from 'skip' to a cautionary retry. Deliberately overrides "
             "the source's runbook directive (Owed 3: the runbook is the "
             "standing law, versioned with the code; default: runbook, "
             "else scars never decay)",
    )
    run.add_argument(
        "--resume",
        metavar="RUN_ID",
        default=None,
        help="resume a crashed journaled run: completed effects are never "
             "re-executed; replay is strict (source + engine must be "
             "unchanged, hash chain intact)",
    )
    run.add_argument(
        "--no-journal",
        action="store_true",
        help="opt out of durability journaling for this run",
    )
    run.add_argument(
        "--effect-adapter",
        metavar="FILE:FUNCTION",
        default=None,
        help="typed authority-recovery adapter. Its manifest and code hash "
             "are pinned in run_begin and must match on resume",
    )
    run.set_defaults(func=cmd_run)

    runs_p = subparsers.add_parser(
        "runs",
        help="list the durability run registry (status 'running' = crashed "
             "and resumable)",
    )
    _add_db_flags(runs_p)
    runs_p.set_defaults(func=cmd_runs)

    jr = subparsers.add_parser(
        "journal",
        help="dump a run's hash-chained event journal and verify it",
    )
    jr.add_argument("run_id", help="the run to inspect")
    _add_db_flags(jr)
    jr.set_defaults(func=cmd_journal)

    ap = subparsers.add_parser(
        "approve",
        help="grant a pending human approval (journaled in the run's hash "
             "chain) and resume the run",
    )
    ap.add_argument("run_id", help="the approval-waiting run")
    ap.add_argument("file", help="the quest's .vow source (hash-verified "
                                 "against the run before resuming)")
    ap.add_argument("--approver", default=None, help="who is deciding")
    ap.add_argument("--note", default=None, help="recorded rationale")
    ap.add_argument(
        "--effect-adapter",
        metavar="FILE:FUNCTION",
        default=None,
        help="the same pinned effect adapter used by the original run",
    )
    _add_db_flags(ap)
    ap.set_defaults(func=cmd_approve)

    dn = subparsers.add_parser(
        "deny",
        help="deny a pending approval (journaled) and end the run 'denied'",
    )
    dn.add_argument("run_id", help="the approval-waiting run")
    dn.add_argument("--approver", default=None, help="who is deciding")
    dn.add_argument("--note", default=None, help="recorded rationale")
    _add_db_flags(dn)
    dn.set_defaults(func=cmd_deny)

    due = subparsers.add_parser(
        "due",
        help="list suspended runs due to resume, plus approval-waiting runs",
    )
    _add_db_flags(due)
    due.set_defaults(func=cmd_due)

    sw = subparsers.add_parser(
        "sweep",
        help="resume every due run in one call — the cron one-liner "
             "(approvals are never auto-granted)",
    )
    sw.add_argument("--crashed", action="store_true",
                    help="also resume 'running' rows with NO heartbeat "
                         "evidence (pre-heartbeat stores) — the operator's "
                         "call; rows with a FRESH heartbeat are refused "
                         "even under this flag (Owed 4: evidence outranks "
                         "the operator)")
    sw.add_argument("--stale-after", metavar="SECONDS", type=float,
                    default=None,
                    help="heartbeat age that declares a 'running' row "
                         "crashed (default: VOW_RUN_STALE_SECONDS or 30)")
    sw.add_argument(
        "--effect-adapter",
        metavar="FILE:FUNCTION",
        default=None,
        help="effect adapter for adapter-pinned runs resumed by this sweep",
    )
    _add_db_flags(sw)
    sw.set_defaults(func=cmd_sweep)

    rev = subparsers.add_parser(
        "reverse",
        help="reverse-transpile Python (or Shadow Python) back to VOW "
             "(note: on a FULL shadow file with its runtime preamble, "
             "general mode emits a noisy quest __module__ — use "
             "roundtrip or --shadow for transpiler output; SPEC 9b)",
    )
    rev.add_argument("file", help="path to the .py source file")
    rev.add_argument(
        "--shadow",
        action="store_true",
        help="input is Shadow Python (transpiler output) - faithful round trip",
    )
    rev.add_argument("--out", metavar="PATH", default=None,
                     help="write the .vow output to PATH (default: stdout)")
    rev.set_defaults(func=cmd_reverse)

    rep = subparsers.add_parser(
        "report",
        help="run a quest and export an EU AI Act evidence bundle "
             "(evidence.json + report.md)",
    )
    rep.add_argument("file", help="path to the .vow source file")
    rep.add_argument("--quest", metavar="NAME", default=None,
                     help="quest to run (default: first quest in file)")
    rep.add_argument("--live", action="store_true",
                     help="live mode (default: dry-run shadow mode)")
    rep.add_argument("--out", metavar="DIR", default=None,
                     help="output directory for the bundle")
    _add_db_flags(rep)
    rep.set_defaults(func=cmd_report)

    repl = subparsers.add_parser(
        "repl",
        help="interactive session: define quests, run them, watch it learn",
    )
    repl.add_argument("--db", metavar="PATH", default=None,
                      help="persist memory to a SQLite database at PATH "
                           "(default: session-only in-memory)")
    repl.add_argument("--scar-ttl", metavar="SECONDS", type=float, default=None,
                      help="scar decay TTL (default: scars never decay)")
    repl.set_defaults(func=_cmd_repl)

    tr = subparsers.add_parser(
        "transpile", aliases=["shadow"],
        help="emit the Shadow Python for a .vow file (auditable Python)",
    )
    tr.add_argument("file", help="path to the .vow source file")
    tr.add_argument("--to-python", action="store_true",
                    help="accepted for doc compatibility (the only direction)")
    tr.add_argument("--out", metavar="PATH", default=None,
                    help="write the Shadow Python to PATH (default: stdout)")
    tr.set_defaults(func=cmd_transpile)

    vs = subparsers.add_parser(
        "validate-shadow",
        help="check that VOW -> Shadow Python is faithfully reversible",
    )
    vs.add_argument("file", help="path to the .vow source file")
    vs.set_defaults(func=cmd_validate_shadow)

    rt = subparsers.add_parser(
        "roundtrip",
        help="VOW -> Shadow Python -> VOW: print the regenerated source",
    )
    rt.add_argument("file", help="path to the .vow source file")
    rt.add_argument("--out", metavar="PATH", default=None,
                    help="write the regenerated .vow to PATH")
    rt.set_defaults(func=cmd_roundtrip)

    sc = subparsers.add_parser(
        "scars",
        help="inspect durable scar memory: list scars or aggregate stats",
    )
    sc.add_argument("action", choices=["list", "stats", "export", "inherit"])
    sc.add_argument("path", nargs="?", default=None,
                    help=".vowscars pack file (inherit)")
    sc.add_argument("--quest", metavar="NAME", default=None,
                    help="restrict to one quest")
    sc.add_argument("--out", default=None,
                    help=".vowscars pack file to write (export)")
    sc.add_argument("--label", default="fleet",
                    help="source label embedded in the pack (export)")
    sc.add_argument("--full", action="store_true",
                    help="export bindings and absolute values "
                         "(default: redacted - failure shape only)")
    sc.add_argument("--key-env", default="VOW_FLEET_KEY",
                    help="env var holding the fleet HMAC key (legacy v1 "
                         "layer; v2 packs sign ed25519 with the store's "
                         "identity automatically)")
    sc.add_argument("--pubkey", metavar="PATH", default=None,
                    help="the origin's published .pubkey to pin against "
                         "(inherit, v2; recommended — without it the "
                         "in-pack key is trust-on-first-use)")
    sc.add_argument("--allow-unsigned", action="store_true",
                    help="accept UNSIGNED v1 legacy packs as LABELED "
                         "rumors (v2 packs are signed by construction — "
                         "failure means tampering, always refused)")
    _add_db_flags(sc)
    sc.set_defaults(func=cmd_scars)

    why = subparsers.add_parser(
        "why", help="explain a quest's memory: what hurt, what works, "
                    "and what happens next time (read-only)",
    )
    why.add_argument("quest", help="quest name to explain")
    why.add_argument("--strategy", default=None,
                     help="narrow the explanation to one strategy")
    why.add_argument("--json", action="store_true",
                     help="emit the explanation as JSON")
    _add_db_flags(why)
    why.set_defaults(func=cmd_why)

    ex = subparsers.add_parser(
        "explain", help="explain a run's current state in plain language: "
                        "why it is parked, what it waits on, who holds it, "
                        "how it ended (read-only)",
    )
    ex.add_argument("run_id", help="run to explain")
    _add_db_flags(ex)
    ex.set_defaults(func=cmd_explain)

    vf = subparsers.add_parser(
        "verify", help="batch-verify every run's hash chain in a store "
                       "(read-only)",
    )
    _add_db_flags(vf)
    vf.set_defaults(func=cmd_verify)

    rp = subparsers.add_parser(
        "replay", help="narrate a run's journal as the story of its lives "
                       "(read-only)",
    )
    rp.add_argument("run_id", help="run to narrate")
    _add_db_flags(rp)
    rp.set_defaults(func=cmd_replay)

    xp = subparsers.add_parser(
        "export-evidence", help="export a signed evidence pack: HMAC-sealed "
                                "rows + ed25519 pack signature — proof that "
                                "travels outside the building",
    )
    xp.add_argument("--out", metavar="PATH", required=True,
                    help="write the pack JSON to PATH")
    xp.add_argument("--run-id", default=None,
                    help="scope the pack to one run (default: whole store)")
    _add_db_flags(xp)
    xp.set_defaults(func=cmd_export_evidence)

    vp = subparsers.add_parser(
        "verify-evidence", help="verify an exported pack without the store: "
                                "fingerprint, ed25519 signature, chains "
                                "(read-only)",
    )
    vp.add_argument("pack", help="path to the evidence pack JSON")
    vp.add_argument("--pubkey", metavar="PATH", default=None,
                    help="authoritative .pubkey to pin against (recommended)")
    vp.set_defaults(func=cmd_verify_evidence)

    dc = subparsers.add_parser(
        "doctor", help="examine a store's health: chains, due queue, "
                       "claims, scar memory (read-only)",
    )
    _add_db_flags(dc)
    dc.set_defaults(func=cmd_doctor)

    dg = subparsers.add_parser(
        "digest", help="daily behavioral intelligence report: scars, "
                       "golden paths, whispers, successes — one JSON "
                       "digest for the overseer (read-only)",
    )
    dg.add_argument("--date", default=None,
                    help="UTC date YYYY-MM-DD (default: today)")
    dg.add_argument("--label", default=None,
                    help="deployment name (default: db filename)")
    dg.add_argument("--out", metavar="PATH", default=None,
                    help="also write the digest to PATH")
    _add_db_flags(dg)
    dg.set_defaults(func=cmd_digest)

    rt = subparsers.add_parser(
        "route", help="classify text with a program's route table — the "
                      "deterministic intent pre-filter (read-only)",
    )
    rt.add_argument("file", help=".vow source with a route block")
    rt.add_argument("text", help="the user input to classify")
    rt.set_defaults(func=cmd_route)

    eh = subparsers.add_parser(
        "engine-hash", help="print the engine attestation every evidence "
                            "bundle carries",
    )
    eh.set_defaults(func=cmd_engine_hash)

    fm = subparsers.add_parser(
        "fmt", help="format a .vow file to canonical layout",
    )
    fm.add_argument("file", help="path to the .vow source file")
    fm.add_argument("--check", action="store_true",
                    help="exit 1 if the file is not already formatted")
    fm.add_argument("--out", metavar="PATH", default=None,
                    help="write formatted source to PATH (default: stdout)")
    fm.set_defaults(func=cmd_fmt)

    li = subparsers.add_parser(
        "lint", help="static checks: syntax, scar injection, gating, proofs",
    )
    li.add_argument("file", help="path to the .vow source file")
    li.set_defaults(func=cmd_lint)

    sv = subparsers.add_parser(
        "serve", help="start the REST API server (api_server.py)",
    )
    sv.add_argument("--host", default="127.0.0.1")
    sv.add_argument("--port", type=int, default=8080)
    sv.add_argument("--scar-ttl", type=float, default=None)
    _add_db_flags(sv)
    sv.set_defaults(func=cmd_serve)
    return parser


def main(argv=None):
    args = build_arg_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
