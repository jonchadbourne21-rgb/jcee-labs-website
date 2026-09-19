# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""LLM Strategy Optimizer (Reconciled Architecture §5; Master Directive:
"Self-Optimization — LLM-assisted strategy refinement").

Closes the learning loop:

    scars -> ScarPatternAnalyzer -> LLMStrategyOptimizer
                                     -> AdaptiveStrategySelector

Two modes, one contract:

- Deterministic (always available, zero tokens): reads the pattern
  analyzer's recurring-failure clusters and the selector's measured
  performance history, and emits concrete, evidence-cited suggestions.
  Every claim in a suggestion quotes the numbers it is derived from.

- LLM-assisted (optional): the same real data is handed to a pluggable
  model callable (any fn(prompt: str) -> str — e.g. wired to model_ask's
  handler). The model's structured answer is parsed into suggestions.
  If the model errors or returns unparseable output, the optimizer
  falls back to the deterministic path and SAYS SO in the suggestion
  source field — no silent pretend-AI.
"""
import json
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional


@dataclass
class Suggestion:
    kind: str            # demote_strategy | promote_strategy |
                         # investigate_pattern | llm_refinement
    target: str
    rationale: str
    evidence: Dict[str, Any] = field(default_factory=dict)
    source: str = 'deterministic'   # 'deterministic' | 'llm'


class LLMStrategyOptimizer:
    PROMPT_TEMPLATE = (
        "You are optimizing an agentic quest system. Below is measured "
        "performance history and recurring failure patterns, as JSON.\n"
        "Propose up to {limit} concrete strategy refinements.\n"
        "Respond with ONLY a JSON list of objects, each with keys: "
        "\"kind\" (demote_strategy|promote_strategy|investigate_pattern), "
        "\"target\" (strategy name), \"rationale\" (one sentence citing "
        "the numbers).\n\nPERFORMANCE:\n{performance}\n\nPATTERNS:\n{patterns}\n")

    def __init__(self, learning=None, llm: Optional[Callable[[str], str]] = None):
        # learning: a SelfLearningSystem (analyzer + selector + memory)
        self.learning = learning
        self.llm = llm

    # ---- deterministic core ----
    def _deterministic(self, quest: Optional[str],
                       limit: int) -> List[Suggestion]:
        out: List[Suggestion] = []
        if self.learning is None:
            return out
        report = self.learning.selector.get_performance_report()
        patterns = self.learning.analyzer.get_top_patterns(limit=limit)
        pat_by_strategy: Dict[str, list] = {}
        for p in patterns:
            for sname in (p.strategies or []):
                pat_by_strategy.setdefault(sname, []).append(p)
        for name, stats in sorted(report.items()):
            if stats['runs'] < 2:
                continue
            linked = pat_by_strategy.get(name, [])
            ev = {'performance': stats,
                  'patterns': [{'id': p.pattern_id,
                                'description': p.description,
                                'occurrences': p.occurrence_count}
                               for p in linked]}
            if stats['success_rate'] < 0.5:
                out.append(Suggestion(
                    'demote_strategy', name,
                    f"'{name}' succeeded only {stats['successes']}/"
                    f"{stats['runs']} runs (rate {stats['success_rate']}); "
                    f"order it after higher-scoring alternatives or gate it "
                    f"behind a precondition",
                    ev))
            elif stats['success_rate'] == 1.0 and stats['runs'] >= 3:
                out.append(Suggestion(
                    'promote_strategy', name,
                    f"'{name}' is {stats['runs']}/{stats['runs']} successful "
                    f"(avg_time {stats['avg_time']}); make it the default "
                    f"first attempt",
                    ev))
        for p in patterns:
            if p.occurrence_count < 2:
                continue
            out.append(Suggestion(
                'investigate_pattern',
                ','.join(p.strategies or ['<unknown>']),
                f"failure pattern seen {p.occurrence_count}x: "
                f"'{p.description}' — fix the root cause or encode a "
                f"precondition check before these strategies run",
                {'pattern_id': p.pattern_id,
                 'occurrences': p.occurrence_count,
                 'quests': p.quests, 'strategies': p.strategies}))
        return out[:limit]

    # ---- LLM-assisted path ----
    def _llm_suggestions(self, limit: int) -> Optional[List[Suggestion]]:
        if self.llm is None or self.learning is None:
            return None
        performance = self.learning.selector.get_performance_report()
        patterns = [{'id': p.pattern_id, 'description': p.description,
                     'occurrences': p.occurrence_count,
                     'strategies': p.strategies}
                    for p in self.learning.analyzer.get_top_patterns(limit=limit)]
        prompt = self.PROMPT_TEMPLATE.format(
            limit=limit,
            performance=json.dumps(performance, indent=1),
            patterns=json.dumps(patterns, indent=1))
        raw = self.llm(prompt)   # may raise — caller handles
        text = str(raw).strip()
        start, end = text.find('['), text.rfind(']')
        if start < 0 or end <= start:
            return None
        data = json.loads(text[start:end + 1])
        if not isinstance(data, list):
            return None
        out = []
        for item in data[:limit]:
            if not isinstance(item, dict) or 'target' not in item:
                continue
            out.append(Suggestion(
                str(item.get('kind', 'llm_refinement')),
                str(item['target']),
                str(item.get('rationale', '')),
                {'model_response': True},
                source='llm'))
        return out or None

    # ---- public ----
    def suggest(self, quest: Optional[str] = None,
                limit: int = 5) -> List[Dict[str, Any]]:
        """Ranked optimization suggestions with evidence. LLM-assisted when
        a model callable is configured; deterministic otherwise. Honest
        fallback: if the LLM path fails, suggestions are deterministic and
        a marker suggestion records that fact."""
        if self.llm is not None:
            try:
                llm_out = self._llm_suggestions(limit)
            except Exception as e:
                llm_out = None
                fallback_note = f'llm error: {type(e).__name__}: {e}'
            else:
                fallback_note = 'llm returned unparseable output'
            if llm_out is not None:
                return [asdict(s) for s in llm_out]
            det = self._deterministic(quest, limit - 1)
            det.append(Suggestion(
                'llm_refinement', '<engine>',
                f'LLM optimization unavailable ({fallback_note}); '
                f'showing deterministic suggestions only',
                {}, source='deterministic'))
            return [asdict(s) for s in det]
        return [asdict(s) for s in self._deterministic(quest, limit)]
