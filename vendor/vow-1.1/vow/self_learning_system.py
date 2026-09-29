# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW Self-Learning System (Reconciled Architecture §5).

The learning loop:

    scars recorded -> ScarVectorMemory (persisted, scars.json)
                   -> ScarPatternAnalyzer (recurring failure patterns)
                   -> AdaptiveStrategySelector (performance-history ranking)
                   -> future quests select better strategies

API contract matches learning_demo.py and
"VOW Language & Ecosystem: Worked Examples" §4 exactly:

    analyzer = ScarPatternAnalyzer()
    analyzer.add_scar(quest, strategy, error, timestamp)
    analyzer.analyze_patterns()
    analyzer.get_top_patterns(limit) -> [ScarPattern(description, pattern_id,
                                                      occurrence_count)]

    selector = AdaptiveStrategySelector()
    selector.record_performance(strategy, success=bool,
                                execution_time=float, resource_usage=float)
    selector.select_best_strategy([names]) -> name
    selector.get_performance_report() -> {name: stats}

Similarity model: honest, dependency-free bag-of-words cosine similarity
over normalized scar text (vector memory without external embedding APIs;
an embedding backend can be plugged into ScarVectorMemory.similarity later).
"""
import json
import math
import os
import re
import hashlib
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Dict, List, Optional, Tuple


# ------------------------------------------------------------ utilities ---
_WORD = re.compile(r'[a-z0-9]+')


def _tokenize(text: str) -> List[str]:
    return _WORD.findall(text.lower())


def _bow_vector(tokens: List[str]) -> Dict[str, float]:
    vec: Dict[str, float] = {}
    for t in tokens:
        vec[t] = vec.get(t, 0.0) + 1.0
    norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
    return {t: v / norm for t, v in vec.items()}


def _cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    small, big = (a, b) if len(a) <= len(b) else (b, a)
    return sum(v * big.get(t, 0.0) for t, v in small.items())


def _normalize_error(text: str) -> str:
    """Strip volatile detail (numbers, paths, ids) so 'timeout after 30s'
    and 'timeout after 45s' collapse into one pattern signature."""
    text = text.lower()
    text = re.sub(r'\d+(?:\.\d+)?', '<n>', text)
    text = re.sub(r'/\S+', '<path>', text)
    return re.sub(r'\s+', ' ', text).strip()


# ------------------------------------------------------- vector memory ----
@dataclass
class ScarRecord:
    quest: str
    strategy: str
    error: str
    timestamp: str
    vector: Dict[str, float] = field(default_factory=dict)
    reason: Optional[Dict] = None  # failure autopsy (prove/bindings/margin)

    def to_dict(self):
        return {'quest': self.quest, 'strategy': self.strategy,
                'error': self.error, 'timestamp': self.timestamp,
                'vector': self.vector, 'reason': self.reason}

    @staticmethod
    def from_dict(d):
        return ScarRecord(d['quest'], d['strategy'], d['error'],
                          d['timestamp'], d.get('vector', {}),
                          d.get('reason'))


class ScarVectorMemory:
    """Persistent scar store with similarity recall (scars.json)."""

    def __init__(self, path: Optional[str] = None,
                 similarity_fn: Optional[Callable] = None):
        self.path = path
        self.similarity_fn = similarity_fn or _cosine
        self._scars: List[ScarRecord] = []
        if path and os.path.exists(path):
            try:
                self._scars = [ScarRecord.from_dict(d)
                               for d in json.load(open(path))]
            except (json.JSONDecodeError, KeyError):
                self._scars = []

    def add(self, quest: str, strategy: str, error: str,
            timestamp: Optional[datetime] = None) -> ScarRecord:
        rec = ScarRecord(quest, strategy, error,
                         (timestamp or datetime.now()).isoformat(),
                         _bow_vector(_tokenize(error)))
        self._scars.append(rec)
        self._flush()
        return rec

    def recall(self, query: str, limit: int = 5,
               min_similarity: float = 0.0) -> List[Tuple[ScarRecord, float]]:
        qv = _bow_vector(_tokenize(query))
        scored = [(s, self.similarity_fn(qv, s.vector)) for s in self._scars]
        scored = [x for x in scored if x[1] >= min_similarity]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]

    def all(self) -> List[ScarRecord]:
        return list(self._scars)

    def _flush(self):
        if self.path:
            json.dump([s.to_dict() for s in self._scars], open(self.path, 'w'),
                      indent=2)


# ------------------------------------------------------ pattern analysis --
@dataclass
class ScarPattern:
    description: str
    pattern_id: str
    occurrence_count: int
    quests: List[str] = field(default_factory=list)
    strategies: List[str] = field(default_factory=list)


class ScarPatternAnalyzer:
    """Groups scars by normalized error signature and ranks recurrence."""

    def __init__(self, memory: Optional[ScarVectorMemory] = None):
        self.memory = memory
        self._pending: List[ScarRecord] = []
        self._patterns: List[ScarPattern] = []

    def add_scar(self, quest: str, strategy: str, error: str,
                 timestamp: Optional[datetime] = None,
                 reason: Optional[Dict] = None) -> ScarRecord:
        ts = timestamp or datetime.now()
        rec = ScarRecord(quest, strategy, error, ts.isoformat(),
                         _bow_vector(_tokenize(error)), reason)
        self._pending.append(rec)
        if self.memory is not None:
            self.memory.add(quest, strategy, error, ts)
        return rec

    @staticmethod
    def _signature_of(rec: 'ScarRecord') -> str:
        """Scars carrying an autopsy cluster by the failed expectation
        itself ('prove: batch_size < 500') — diagnosis by declared intent.
        Others fall back to normalized error text."""
        if rec.reason and rec.reason.get('prove'):
            prove = re.sub(r'\s+', ' ', str(rec.reason['prove'])).strip().lower()
            return f'prove: {prove}'
        return _normalize_error(rec.error)

    def analyze_patterns(self) -> List[ScarPattern]:
        groups: Dict[str, List[ScarRecord]] = {}
        seen = set()
        for rec in list(self._pending) + (self.memory.all() if self.memory else []):
            key = (rec.quest, rec.strategy, rec.error, rec.timestamp)
            if key in seen:
                continue
            seen.add(key)
            groups.setdefault(self._signature_of(rec), []).append(rec)
        self._pending = []
        patterns = []
        for signature, recs in groups.items():
            pid = hashlib.md5(signature.encode()).hexdigest()[:8]
            label = (f'Pattern: `{recs[0].reason["prove"]}` failed'
                     if recs[0].reason and recs[0].reason.get('prove')
                     else f'Pattern: {recs[0].error}')
            patterns.append(ScarPattern(
                description=label,
                pattern_id=pid,
                occurrence_count=len(recs),
                quests=sorted({r.quest for r in recs}),
                strategies=sorted({r.strategy for r in recs})))
        patterns.sort(key=lambda p: p.occurrence_count, reverse=True)
        self._patterns = patterns
        return patterns

    def get_top_patterns(self, limit: int = 5) -> List[ScarPattern]:
        if not self._patterns:
            self.analyze_patterns()
        return self._patterns[:limit]


# -------------------------------------------------- adaptive selection ----
@dataclass
class StrategyStats:
    runs: int = 0
    successes: int = 0
    total_time: float = 0.0
    total_resource: float = 0.0

    @property
    def success_rate(self) -> float:
        return self.successes / self.runs if self.runs else 0.0

    @property
    def avg_time(self) -> float:
        return self.total_time / self.runs if self.runs else 0.0

    @property
    def avg_resource(self) -> float:
        return self.total_resource / self.runs if self.runs else 0.0

    def score(self) -> float:
        """success_rate * 0.6 + speed * 0.25 + frugality * 0.15,
        speed/frugality normalized with a 1/(1+x) squashing function."""
        speed = 1.0 / (1.0 + self.avg_time)
        frugality = 1.0 / (1.0 + self.avg_resource)
        return self.success_rate * 0.6 + speed * 0.25 + frugality * 0.15


class AdaptiveStrategySelector:
    """Picks the best strategy from recorded performance history."""

    def __init__(self):
        self._history: Dict[str, StrategyStats] = {}

    def record_performance(self, strategy: str, success: bool,
                           execution_time: float,
                           resource_usage: float = 0.0) -> None:
        stats = self._history.setdefault(strategy, StrategyStats())
        stats.runs += 1
        stats.successes += 1 if success else 0
        stats.total_time += float(execution_time)
        stats.total_resource += float(resource_usage)

    def select_best_strategy(self, candidates: List[str]) -> Optional[str]:
        known = [c for c in candidates if c in self._history]
        if not known:
            return None
        return max(known, key=lambda c: self._history[c].score())

    def get_performance_report(self) -> Dict[str, Dict[str, float]]:
        return {name: {
            'runs': s.runs, 'successes': s.successes,
            'success_rate': round(s.success_rate, 4),
            'avg_time': round(s.avg_time, 4),
            'avg_resource': round(s.avg_resource, 4),
            'score': round(s.score(), 4),
        } for name, s in self._history.items()}


# ---------------------------------------------- loop wiring (runtime) -----
class SelfLearningSystem:
    """The full loop as one object: memory + analyzer + selector, plus
    hooks the VOW runtime calls after tournaments and proof failures."""

    def __init__(self, memory_path: Optional[str] = None):
        self.memory = ScarVectorMemory(memory_path)
        self.analyzer = ScarPatternAnalyzer(self.memory)
        self.selector = AdaptiveStrategySelector()

    def on_proof_failure(self, quest: str, strategy: str, error: str,
                         reason: Optional[Dict] = None):
        self.analyzer.add_scar(quest, strategy, error, reason=reason)

    def on_tournament_results(self, quest: str,
                              results: List[Dict]) -> Optional[str]:
        """Feed tournament metrics into the selector; return the historical
        favorite for next time (adaptive selection)."""
        names = []
        for r in results:
            name = r.get('strategy')
            if not name or r.get('skipped'):
                continue  # scar-skipped runs aren't performance data
            names.append(name)
            self.selector.record_performance(
                name,
                success=bool(r.get('proof_success', 0.0) >= 1.0),
                execution_time=max(0.0, 1.0 / max(r.get('speed', 1.0), 1e-9) - 1.0),
                resource_usage=float(r.get('cost', 1.0)))
            if r.get('reason') and r.get('proof_success', 1.0) < 1.0:
                # a failed run with an autopsy: feed the diagnosis to the
                # pattern analyzer so recurring failures cluster by WHY
                self.analyzer.add_scar(quest, name, 'prove failed',
                                       reason=r['reason'])
        return self.selector.select_best_strategy(names)
