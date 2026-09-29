"""Tests for OWED 3 — TTL as runbook configuration (2026-07-24).

The dissertation's debt: "Today, whether a wounded path is skipped or
cautiously retried depends on a command-line argument the operator
happened to pass. Two operators, same runbook, same database, different
behavior." The cure: a `runbook { scar_ttl = … }` directive, versioned
with the code it governs; the CLI flag survives only as a deliberate,
journaled override.

Pinned here: parsing, compile-time resolution (axioms in scope), the
precedence law (flag > runbook > never-decay), loud errors for unknown
or non-constant rows, contextual-keyword safety, fmt/reverse round
trips, and the run_begin attestation.
"""
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}

try:
    import pytest
except ImportError:  # pytest-less machines: honest fallback
    import re
    import unittest

    class _Shim:
        class _Raises:
            def __init__(self, exc, match=None):
                self.exc, self.match = exc, match

            def __enter__(self):
                return self

            def __exit__(self, t, v, tb):
                assert t is not None and issubclass(t, self.exc), \
                    f'expected {self.exc}'
                if self.match:
                    assert re.search(self.match, str(v)), \
                        f'no match {self.match!r} in {v}'
                return True

        def raises(self, exc, match=None):
            return self._Raises(exc, match)

        def skip(self, reason=''):
            raise unittest.SkipTest(reason)

    pytest = _Shim()

from vow.vow_parser import VowAdvancedParser, VowSyntaxError      # noqa: E402
from vow.vow_transpiler import VowTranspiler, VowTranspileError   # noqa: E402
from vow.vow_formatter import format_program                      # noqa: E402
from vow.vow_reverse import VowReverseTranspiler                  # noqa: E402

SRC = '''domain "sop"
axiom day = 86400
runbook {
  scar_ttl = day * 7
}
quest Q {
  goal "g"
  let runbook = 5
  prove runbook == 5
  success when true
}
'''


def _code(src):
    return VowTranspiler().transpile(
        VowAdvancedParser(src).parse_program())


def test_runbook_parses_and_resolves_at_compile_time():
    prog = VowAdvancedParser(SRC).parse_program()
    assert list(prog.runbook) == ['scar_ttl']
    code = _code(SRC)
    assert '_VOW_RUNBOOK = {\'scar_ttl\': 604800}' in code


def test_precedence_law_flag_over_runbook_over_never():
    code = _code(SRC)
    g = {}
    exec(code, g)
    assert g['_VOW_SCAR_TTL'] == 604800          # runbook law stands
    g2 = {'_VOW_SCAR_TTL': 60}                    # operator override injected
    exec(code, g2)
    assert g2['_VOW_SCAR_TTL'] == 60              # …and wins
    plain = _code('quest Q { goal "g" success when true }')
    g3 = {}
    exec(plain, g3)
    assert g3['_VOW_SCAR_TTL'] is None            # no runbook: never decay


def test_unknown_row_is_a_loud_error():
    with pytest.raises(VowTranspileError, match='unknown runbook row'):
        _code('runbook { scar_tll = 60 }\n'
              'quest Q { goal "g" success when true }')


def test_non_constant_row_is_a_loud_error():
    with pytest.raises(VowTranspileError):
        _code('runbook { scar_ttl = some_runtime_ref }\n'
              'quest Q { goal "g" success when true }')


def test_negative_ttl_is_a_loud_error():
    with pytest.raises(VowTranspileError, match='non-negative'):
        _code('runbook { scar_ttl = 0 - 5 }\n'
              'quest Q { goal "g" success when true }')


def test_duplicate_row_is_a_loud_error():
    with pytest.raises(VowSyntaxError, match='duplicate runbook row'):
        VowAdvancedParser('runbook { scar_ttl = 1 scar_ttl = 2 }\n'
                          'quest Q { goal "g" success when true }'
                          ).parse_program()


def test_runbook_is_contextual_not_reserved():
    """'runbook' as an ordinary identifier must keep working — inside
    quests AND (as a quest item target) without a declaration block."""
    prog = VowAdvancedParser(SRC).parse_program()   # 'let runbook = 5'
    assert prog.quests[0].name == 'Q'
    code = _code(SRC)
    g = {}
    exec(code, g)                                   # proves runbook == 5


def test_fmt_preserves_declarations():
    """The amputation cure: fmt previously dropped domain/axioms/routes —
    an SOP program came back exploratory. Never again."""
    fmted = format_program(VowAdvancedParser(SRC).parse_program())
    assert 'domain "sop"' in fmted
    assert 'axiom day = 86400' in fmted
    assert 'runbook {' in fmted and 'scar_ttl = (day * 7)' in fmted
    prog2 = VowAdvancedParser(fmted).parse_program()
    assert prog2.domain == 'sop'
    assert list(prog2.runbook) == ['scar_ttl']


def test_reverse_reconstructs_runbook_and_domain():
    code = _code(SRC)
    rev = VowReverseTranspiler().reverse_shadow(code)
    assert 'domain "sop"' in rev
    assert 'runbook {' in rev and 'scar_ttl = 604800' in rev
    assert '# unsupported: if _VOW_SCAR_TTL is None' not in rev


def test_run_begin_attestation(tmp_path=None):
    """The standing law is journaled: runbook directive in run_begin,
    and a flag override recorded as scar_ttl_override."""
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_rb_')
    db = os.path.join(base, 'rb.db')
    r = subprocess.run(
        [sys.executable, 'vow_cli.py', 'run', 'examples/runbook_ttl.vow',
         '--db', db], capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]
    run_id = json.loads(r.stdout)['run_id']
    j = subprocess.run(
        [sys.executable, 'vow_cli.py', 'journal', run_id, '--db', db],
        capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert j.returncode == 0, j.stderr[-600:]
    events = json.loads(j.stdout)['events']
    begin = [e for e in events if e['kind'] == 'run_begin'][0]
    payload = begin['payload']
    if isinstance(payload, str):
        payload = json.loads(payload)
    assert payload['runbook'] == {'scar_ttl': 'hour'}, payload
    assert 'scar_ttl_override' not in payload
    # and the override path attests itself
    db2 = os.path.join(base, 'rb2.db')
    r2 = subprocess.run(
        [sys.executable, 'vow_cli.py', 'run', 'examples/runbook_ttl.vow',
         '--db', db2, '--scar-ttl', '30'],
        capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r2.returncode == 0, r2.stderr[-600:]
    j2 = subprocess.run(
        [sys.executable, 'vow_cli.py', 'journal',
         json.loads(r2.stdout)['run_id'], '--db', db2],
        capture_output=True, text=True, cwd=PROJ, env=ENV)
    ev2 = json.loads(j2.stdout)['events']
    p2 = [e for e in ev2 if e['kind'] == 'run_begin'][0]['payload']
    if isinstance(p2, str):
        p2 = json.loads(p2)
    assert p2['scar_ttl_override'] == 30.0, p2
