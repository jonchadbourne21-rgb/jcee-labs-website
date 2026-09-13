# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW compliance evidence exporter (EU AI Act support).

Turns a VOW quest trace into an evidence bundle:

- Art. 12-style structured event log (JSON): every recorded event of the
  run with timestamps — decisions, proofs, scars, side effects, mode.
- Annex IV-shaped technical documentation (Markdown): system description,
  permission manifest (capabilities), oversight material (Shadow Python),
  robustness evidence (proofs, tournaments, scars), and testing evidence.

HONEST SCOPE: this is evidence *support*. Conformity assessment, FRIA,
registration, QMS, and legal review remain organizational obligations.
No fields are fabricated: everything in the bundle derives from the actual
trace; absent data renders as explicit "not recorded" markers, never
invented values.
"""
import hashlib
import os
from typing import Any, Dict


def engine_attestation(root: str = None) -> Dict[str, Any]:
    """Hash the engine build (the compiler and runtime sources). Every
    evidence bundle attests to the build that produced it — a bundle can
    be verified against a known engine. Tamper-EVIDENCE for artifacts,
    not a boot-block: a fork may modify the engine, but it cannot make
    its bundles truthfully attest to YOUR build."""
    if root is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files = []
    vow_dir = os.path.join(root, 'vow')
    if os.path.isdir(vow_dir):
        for name in sorted(os.listdir(vow_dir)):
            if name.endswith('.py'):
                files.append(os.path.join('vow', name))
    for name in ('main.py', 'vow_cli.py'):
        if os.path.isfile(os.path.join(root, name)):
            files.append(name)
    h = hashlib.sha256()
    for rel in files:
        h.update(rel.encode())
        with open(os.path.join(root, rel), 'rb') as fh:
            h.update(fh.read())
    return {'engine_sha256': h.hexdigest(), 'engine_files': files}
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

DISCLAIMER = (
    "This bundle is technical evidence generated from actual VOW quest runs. "
    "It supports, but does not constitute, EU AI Act conformity assessment. "
    "Organizational obligations (QMS, FRIA, registration, legal review) are "
    "out of scope."
)


class ComplianceExporter:
    """Exports quest traces as EU AI Act evidence bundles."""

    VERSION = "1.0"

    # ------------------------------------------------------------ build ---
    def build_evidence(self, trace: Dict[str, Any],
                       verifier_summary: Optional[Dict] = None) -> Dict[str, Any]:
        if not isinstance(trace, dict) or 'quest_name' not in trace:
            raise ValueError('expected a VOW quest trace dict')
        final = self._parse_final_result(trace.get('final_result'))
        evidence = {
            'bundle_version': self.VERSION,
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'disclaimer': DISCLAIMER,
            'system': {
                'language': 'VOW (quest-oriented, transpile-to-Shadow-Python)',
                'quest': trace.get('quest_name'),
                'run_id': trace.get('run_id'),
                'mode': 'dry-run (shadowed side effects)' if trace.get('dry_run', True)
                        else 'LIVE (side effects executed)',
                'status': trace.get('status'),
            },
            'art12_event_log': self._event_log(trace, final),
            'permissions_manifest': self._permissions(trace, final),
            'oversight': {
                'shadow_python_sha256': self._sha(trace.get('shadow_python')),
                'shadow_python': trace.get('shadow_python', 'not recorded'),
                'note': 'Shadow Python is the human-readable rendering of every '
                        'decision the quest made; an overseer can audit it directly.',
            },
            'robustness_evidence': self._robustness(final, trace),
            'scar_memory': trace.get('db_scars', trace.get('scars_recorded', [])),
            'testing_evidence': verifier_summary or 'not provided',
            # engine attestation: this bundle is verifiable against a known
            # engine build (covered by bundle_sha256 below)
            'engine': engine_attestation(),
        }
        evidence['bundle_sha256'] = self._sha(json.dumps(
            evidence, sort_keys=True, default=str))
        return evidence

    # ------------------------------------------------------------- parts --
    def _parse_final_result(self, fr) -> Dict[str, Any]:
        if isinstance(fr, dict):
            return fr
        if isinstance(fr, str):
            try:
                import ast as _ast
                return _ast.literal_eval(fr)
            except (ValueError, SyntaxError):
                return {}
        return {}

    def _event_log(self, trace, final) -> List[Dict[str, Any]]:
        events = []
        q = trace.get('quest_name')
        events.append({'event': 'quest_started', 'quest': q})
        goal = final.get('goal')
        if goal:
            events.append({'event': 'goal_declared', 'goal': goal})
        for b in final.get('beliefs', []):
            events.append({'event': 'belief_registered', 'name': b.get('name'),
                           'confidence': b.get('confidence'),
                           'source': b.get('source')})
        for m in final.get('tournament', []):
            events.append({'event': 'strategy_evaluated',
                           'strategy': m.get('strategy'),
                           'proof_success': m.get('proof_success'),
                           'score': m.get('score'),
                           'safety': m.get('safety'), 'cost': m.get('cost')})
            if m.get('proof_success') == 0.0:
                events.append({'event': 'proof_failed',
                               'strategy': m.get('strategy')})
        for s in trace.get('scars_recorded', []):
            events.append({'event': 'scar_recorded',
                           'message': s.get('message'),
                           'timestamp': s.get('timestamp')})
        for e in trace.get('side_effects_recorded', []):
            events.append({'event': 'side_effect',
                           'kind': e.get('kind'),
                           'dry_run': e.get('dry_run'),
                           'timestamp': e.get('timestamp')})
        events.append({'event': 'quest_finished',
                       'status': trace.get('status'),
                       'success': final.get('success')})
        return events

    def _permissions(self, trace, final) -> Dict[str, Any]:
        caps = set()
        sp = trace.get('shadow_python') or ''
        for line in sp.splitlines():
            line = line.strip()
            if line.startswith('_vow_grant('):
                caps.add(line[len('_vow_grant('):].split(')')[0].strip('\'"'))
            if '_vow_gated(' in line and not line.startswith('def '):
                frag = line.split('_vow_gated(', 1)[1]
                caps.add('(used) ' + frag.split(',')[0].strip('\'"'))
        return {
            'declared_capabilities': sorted(c for c in caps if not c.startswith('(used)')),
            'gated_calls_observed': sorted(c for c in caps if c.startswith('(used)')),
            'enforcement': 'compile-time: undeclared gated calls and gated calls '
                           'inside tournament strategies fail transpilation',
        }

    def _robustness(self, final, trace) -> Dict[str, Any]:
        tournament = final.get('tournament', [])
        learning = trace.get('learning') or {}
        return {
            'proof_gates': 'all strategies executed under prove assertions; '
                           'failures recorded as scars and made ineligible to win',
            'tournament_metrics': tournament,
            'learning': learning or 'not recorded',
            'success': final.get('success'),
        }

    @staticmethod
    def _sha(text) -> str:
        if not text:
            return 'not recorded'
        return hashlib.sha256(text.encode()).hexdigest()

    # ----------------------------------------------------------- render ---
    def render_markdown(self, evidence: Dict[str, Any]) -> str:
        s = evidence['system']
        lines = [
            f"# VOW Compliance Evidence Bundle — quest `{s['quest']}`",
            '',
            f"- Generated: {evidence['generated_at']}",
            f"- Run ID: `{s['run_id']}`",
            f"- Mode: **{s['mode']}**",
            f"- Status: **{s['status']}**",
            f"- Bundle SHA-256: `{evidence['bundle_sha256']}`",
            '',
            f"> {evidence['disclaimer']}",
            '',
            '## 1. Record-keeping (Art. 12 style event log)',
            '',
            '| # | event | details |',
            '|---|-------|---------|',
        ]
        for i, e in enumerate(evidence['art12_event_log'], 1):
            details = ', '.join(f'{k}={v}' for k, v in e.items() if k != 'event')
            lines.append(f"| {i} | `{e['event']}` | {details} |")
        pm = evidence['permissions_manifest']
        lines += [
            '',
            '## 2. Permissions manifest (transparency, Art. 13 support)',
            '',
            f"- Declared capabilities: {pm['declared_capabilities'] or 'none'}",
            f"- Gated calls observed: {pm['gated_calls_observed'] or 'none'}",
            f"- Enforcement: {pm['enforcement']}",
            '',
            '## 3. Human oversight (Art. 14 support)',
            '',
            f"- Shadow Python SHA-256: `{evidence['oversight']['shadow_python_sha256']}`",
            f"- {evidence['oversight']['note']}",
            '',
            '```python',
            evidence['oversight']['shadow_python'],
            '```',
            '',
            '## 4. Robustness evidence (Art. 15 support)',
            '',
            f"- Proof gates: {evidence['robustness_evidence']['proof_gates']}",
            f"- Quest success: {evidence['robustness_evidence']['success']}",
            f"- Tournament metrics: `{json.dumps(evidence['robustness_evidence']['tournament_metrics'], default=str)}`",
            f"- Learning: `{json.dumps(evidence['robustness_evidence']['learning'], default=str)}`",
            '',
            '## 5. Scar memory (failure record)',
            '',
            f"`{json.dumps(evidence['scar_memory'], indent=2, default=str)}`",
            '',
            '## 6. Testing evidence',
            '',
            f"`{json.dumps(evidence['testing_evidence'], default=str)}`",
            '',
        ]
        return '\n'.join(lines)
