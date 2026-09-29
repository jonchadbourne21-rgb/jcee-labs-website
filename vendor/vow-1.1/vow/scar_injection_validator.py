# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Scar Injection Validator (Reconciled Architecture §5).

"Scar injection in @learn strategies is mandatory, not optional — this is
what gives the pattern analyzer a complete failure record to work from."

Two enforcement surfaces:

1. Source level — validate_program(): an @learn quest must AUTHOR scar
   statements (curated lessons) on its failure paths. Missing authored
   scars is an 'error' finding for lint/CI; the runtime auto-record still
   guarantees the raw failure record, so execution is never blocked.

2. Runtime level — validate_trace(): an integrity tripwire. Any failed
   strategy in an @learn quest MUST have produced at least one recorded
   scar. This cannot be violated by construction (prove failures,
   type violations, and runtime errors all auto-record) — so a violation
   means the engine itself is broken, and we fail loudly.
"""
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List

from .vow_ast import Program, Quest, ScarStmt, OnFail, Strategy, Tournament


class ScarInjectionError(AssertionError):
    """Engine integrity violation: a failure left no scar behind."""


@dataclass
class InjectionFinding:
    quest: str
    severity: str          # 'error' | 'warning' | 'info'
    message: str
    detail: Dict[str, Any] = field(default_factory=dict)


def _count_scars(items) -> int:
    """Scar statements in a list of quest items, descending into blocks."""
    n = 0
    for item in items:
        if isinstance(item, ScarStmt):
            n += 1
        for attr in ('body', 'orelse'):
            sub = getattr(item, attr, None)
            if isinstance(sub, list):
                n += _count_scars(sub)
    return n


class ScarInjectionValidator:
    """Validates the mandatory scar-injection rule for @learn quests."""

    def validate_program(self, program: Program) -> Dict[str, Any]:
        findings: List[InjectionFinding] = []
        for quest in getattr(program, 'quests', []):
            if not getattr(quest, 'learn', False):
                continue
            strategies = [i for i in quest.items if isinstance(i, Strategy)]
            for t in (i for i in quest.items if isinstance(i, Tournament)):
                strategies.extend(t.strategies)
            on_fail = next((i for i in quest.items
                            if isinstance(i, OnFail)), None)
            scars_in_strategies = {
                s.name: _count_scars(s.body) for s in strategies}
            scars_on_fail = _count_scars(on_fail.body) if on_fail else 0
            total = sum(scars_in_strategies.values()) + scars_on_fail
            if total == 0:
                findings.append(InjectionFinding(
                    quest.name, 'error',
                    f"@learn quest '{quest.name}' authors no scar statements "
                    f"— curated lessons are mandatory (Reconciled §5); the "
                    f"runtime auto-record still captures raw failures",
                    {'strategies': [s.name for s in strategies]}))
            else:
                bare = [name for name, c in scars_in_strategies.items()
                        if c == 0]
                if bare and scars_on_fail == 0:
                    findings.append(InjectionFinding(
                        quest.name, 'warning',
                        f"@learn quest '{quest.name}': strategies "
                        f"{bare} have no scar statements and there is no "
                        f"on-fail scar — their failures are only recorded "
                        f"by the runtime auto-record",
                        {'covered': [n for n, c in scars_in_strategies.items()
                                     if c > 0]}))
        return {
            'quests_checked': sum(1 for q in getattr(program, 'quests', [])
                                  if getattr(q, 'learn', False)),
            'findings': [asdict(f) for f in findings],
            'errors': sum(1 for f in findings if f.severity == 'error'),
            'warnings': sum(1 for f in findings if f.severity == 'warning'),
        }

    def validate_trace(self, trace: Dict[str, Any]) -> bool:
        """Integrity tripwire: every failed strategy in an @learn run must
        have produced a recorded scar. Loud by design — a violation means
        the learning engine itself is broken."""
        final = trace.get('final_result')
        if isinstance(final, str):
            return True   # repr-string traces: checked at engine level
        if not isinstance(final, dict) or not final.get('learn'):
            return True
        failed = [m.get('strategy')
                  for m in final.get('tournament', [])
                  if not m.get('skipped')
                  and m.get('proof_success', 1.0) < 1.0]
        if not failed:
            return True
        scars = trace.get('scars_recorded') or []
        if not scars:
            raise ScarInjectionError(
                f"@learn quest had failures {failed} but no scar was "
                f"recorded — the learning engine is broken; do not trust "
                f"this run")
        return True


def validate_source(source: str) -> Dict[str, Any]:
    """Convenience: VOW source text -> validation report."""
    from .vow_parser import VowAdvancedParser
    program = VowAdvancedParser(source).parse_program()
    return ScarInjectionValidator().validate_program(program)
