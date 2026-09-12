"""Unit gates for engine dockets #2-#5 — The Surgeon's first theater
(2026-07-23). Twin gates of frozen trial cases 015/016/016b/017: these
run in the project suite (pytest AND the pytest-less function-runner);
the frozen cases run in the trial gallery. Every fix ships with both —
a patch without a regression gate is malpractice."""
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import time

from vow.vow_parser import VowAdvancedParser, VowSyntaxError
from vow.vow_reverse import VowReverseTranspiler
from vow.vow_transpiler import VowTranspiler
from vow.database import SqliteDatabase as Database

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ---------- docket #4: the Parser Guillotine -------------------------------

def test_misplaced_keywords_error_fast():
    """Any reserved KEYWORD without a quest-item branch must die the same
    honest death a misplaced IDENT gets — a VowSyntaxError, in
    milliseconds. Used to loop forever (docket #4)."""
    for kw in ('axiom pi_days = 3', 'quest', 'deduce', 'domain', 'else',
               'given', 'collapse', 'when'):
        src = ('quest T {\n  goal "t"\n  %s\n  prove true\n'
               '  success when true\n}\n' % kw)
        t0 = time.time()
        try:
            VowAdvancedParser(src).parse_program()
            raise AssertionError('misplaced %r parsed without error' % kw)
        except VowSyntaxError as e:
            assert 'expected a quest item' in str(e), str(e)
        assert time.time() - t0 < 1.0, 'parser hung on %r' % kw


def test_valid_quest_unaffected_by_catchall():
    src = ('quest OK {\n  goal "t"\n  let x = 1\n  prove x == 1\n'
           '  success when x == 1\n}\n')
    prog = VowAdvancedParser(src).parse_program()
    assert prog.quests[0].name == 'OK'


# ---------- docket #2: duplicate scar rows ---------------------------------

def _scar():
    return {'quest_name': 'Q',
            'message': 'prove failed: 1 == 2 [equality_mismatch]',
            'context': {'quest': 'Q', 'strategy': 'bad_path',
                        'seed': 'ba92b970c28c3938'}}


def test_scar_reinjury_appends_under_write_once_law():
    """WRITE-ONCE LAW (author decree 2026-07-23, superseding docket #2's
    dedup): a repeated wound is a NEW scar — appended with its own
    timestamp and fingerprint; the old row is never touched. And the
    wall holds: raw SQL UPDATE/DELETE on scars is refused by trigger."""
    import sqlite3 as _sq
    with tempfile.TemporaryDirectory() as d:
        db = Database(os.path.join(d, 't.db'))
        db.record_scar_sync(_scar())
        db.record_scar_sync(_scar())
        rows = db._conn.execute(
            'SELECT created_at, scar_hash FROM scars ORDER BY id'
        ).fetchall()
        assert len(rows) == 2, rows          # re-injury is history too
        assert all(r[1] for r in rows)       # every scar fingerprinted
        assert rows[1][0] >= rows[0][0]      # newest carries fresh time
        assert db.verify_scar_chain()['ok']
        for sql in ("UPDATE scars SET created_at='1970-01-01'",
                    "DELETE FROM scars"):
            try:
                db._conn.execute(sql)
                db._conn.commit()
                raise AssertionError('WRITE-ONCE LAW violated by: ' + sql)
            except _sq.IntegrityError as e:
                assert 'WRITE-ONCE LAW' in str(e)


def test_scar_chain_detects_forgery():
    """The fingerprint testifies: a row inserted with a broken chain link
    is caught by verify_scar_chain (defense in depth behind the wall —
    an attacker who drops the trigger still cannot forge history)."""
    with tempfile.TemporaryDirectory() as d:
        db = Database(os.path.join(d, 't.db'))
        db.record_scar_sync(_scar())
        assert db.verify_scar_chain()['ok']
        db._conn.execute(
            "INSERT INTO scars (quest_name, message, context, created_at,"
            " prev_hash, scar_hash) VALUES ('q','forged','{}','now',"
            " 'WRONG','ALSO-WRONG')")
        db._conn.commit()
        report = db.verify_scar_chain()
        assert not report['ok'], report


# ---------- docket #3: amputation-blind certification ----------------------

WAITQ = ('quest W {\n  goal "park"\n  let a = 1\n  wait until 1893456000\n'
         '  let b = 2\n  prove true\n  success when true\n}\n')


def test_wait_roundtrip_is_faithful():
    """`wait until` is reconstructed, not amputated (docket #3)."""
    code1 = VowTranspiler().transpile(
        VowAdvancedParser(WAITQ).parse_program())
    rt = VowReverseTranspiler()
    vow2 = rt.reverse_shadow(code1)
    assert 'wait until 1893456000' in vow2, vow2
    assert rt._amputations == [], rt._amputations


def test_foreign_shadow_amputation_is_recorded():
    """A smuggled module-level statement is amputated VISIBLY and ON THE
    RECORD — the certificate must see what the comment admits."""
    code1 = VowTranspiler().transpile(
        VowAdvancedParser(WAITQ).parse_program())
    rt = VowReverseTranspiler()
    vow2 = rt.reverse_shadow(code1 + '\n_smuggled = 1\n')
    assert '_smuggled = 1' in rt._amputations
    assert '# unsupported: _smuggled = 1' in vow2


def test_certificate_requires_zero_amputations():
    """The fixpoint certificate has teeth: gen2==gen3 AND no amputations."""
    import vow_cli
    src = open(vow_cli.__file__).read()
    assert 'and not amputations' in src


# ---------- docket #5: tail truncation breaks exactly-once ------------------

PARK = ('quest P {\n  goal "park"\n  capability shell\n'
        '  let a = shell_exec("echo pre >> %s")\n'
        '  wait until %d\n'
        '  let b = shell_exec("echo post >> %s")\n'
        '  prove true\n  success when true\n}\n')


def test_tail_truncation_refuses_resume():
    """Delete the journal's tail and the resume must refuse against the
    registry's memory — the effect must NOT re-execute (docket #5)."""
    with tempfile.TemporaryDirectory() as d:
        log = os.path.join(d, 'p.log')
        q = os.path.join(d, 'p.vow')
        with open(q, 'w') as fh:
            fh.write(PARK % (log, int(time.time()) - 1, log))
        db = os.path.join(d, 'p.db')
        env = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
        r1 = subprocess.run([sys.executable, 'vow_cli.py', 'run', q,
                             '--db', db, '--live'],
                            capture_output=True, text=True, cwd=PROJECT,
                            env=env, timeout=120)
        assert '"status": "suspended"' in r1.stdout, r1.stdout[-200:]
        rid = json.loads(r1.stdout[r1.stdout.index('{'):])['run_id']
        con = sqlite3.connect(db)
        # WRITE-ONCE LAW: the wall refuses naive truncation; a determined
        # attacker drops the trigger — and the registry must still catch
        # the truncated tail (docket #5's whole point).
        try:
            con.execute('DELETE FROM journal_events WHERE seq >= 3')
            con.commit()
            raise AssertionError('the wall did not refuse truncation')
        except sqlite3.IntegrityError as e:
            assert 'WRITE-ONCE LAW' in str(e)
        con.execute("DROP TRIGGER write_once_journal_events_delete")
        con.execute('DELETE FROM journal_events WHERE seq >= 3')
        con.commit()
        con.close()
        r2 = subprocess.run([sys.executable, 'vow_cli.py', 'run', q,
                             '--db', db, '--live', '--resume', rid],
                            capture_output=True, text=True, cwd=PROJECT,
                            env=env, timeout=120)
        assert r2.returncode == 1, r2.stdout[-200:]
        assert 'truncation detected' in r2.stderr
        with open(log) as fh:
            assert fh.read().split() == ['pre'], 'effect re-executed!'
