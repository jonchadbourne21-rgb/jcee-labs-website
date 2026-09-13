# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Rate Limiter (Reconciled Architecture §2, Capability Layer).

Token-bucket throttling for capability-gated actions. Policy is a
deployment/security concern, so limits are configured at the engine level
(not in VOW source) and enforced inside the modal layer (_vow_gated):

- dry-run: rehearsals are free — the limiter is PROBED (no tokens spent)
  and the shadow result records whether the call would be throttled.
- live:    tokens are spent; an empty bucket raises VowRateLimitExceeded
  carrying a retry_after hint. (In a strategy context that surfaces as
  honest runtime_error evidence; at quest level the run stops — policy
  denial is not something to paper over.)

Keys: 'capability:action' (e.g. 'network:http_get'). A limit configured
for the bare capability name ('network') covers all its actions.
"""
import time
from typing import Callable, Dict, Optional


class VowRateLimitExceeded(Exception):
    """A live gated action was denied by the rate-limit policy."""

    def __init__(self, key: str, retry_after: float):
        self.key = key
        self.retry_after = retry_after
        super().__init__(
            f"rate limit exceeded for '{key}' — retry after "
            f"{retry_after:.3f}s")


class RateLimiter:
    def __init__(self, limits: Optional[Dict] = None,
                 clock: Callable[[], float] = time.monotonic):
        # limits: {key: {'rate': tokens_per_sec, 'burst': n} or (rate, burst)}
        self._clock = clock
        self._cfg: Dict[str, tuple] = {}
        self._buckets: Dict[str, list] = {}
        for key, spec in (limits or {}).items():
            if isinstance(spec, dict):
                self.configure(key, spec['rate'], spec.get('burst'))
            else:
                rate, burst = (spec + (None,))[:2] if isinstance(spec, tuple) \
                    else (spec, None)
                self.configure(key, rate, burst)

    def configure(self, key: str, rate: float,
                  burst: Optional[float] = None) -> None:
        burst = float(rate) if burst is None else float(burst)
        self._cfg[key] = (float(rate), burst)
        self._buckets[key] = [burst, self._clock()]

    def _match(self, key: str) -> Optional[str]:
        """Exact key wins; otherwise fall back to the capability prefix."""
        if key in self._cfg:
            return key
        prefix = key.split(':', 1)[0]
        return prefix if prefix in self._cfg else None

    def _level(self, key: str) -> Optional[float]:
        cfg_key = self._match(key)
        if cfg_key is None:
            return None  # unconfigured = unlimited
        rate, burst = self._cfg[cfg_key]
        tokens, ts = self._buckets[cfg_key]
        now = self._clock()
        tokens = min(burst, tokens + max(0.0, now - ts) * rate)
        self._buckets[cfg_key] = [tokens, now]
        return tokens

    def probe(self, key: str, cost: float = 1.0) -> bool:
        """Would a call be allowed right now? Spends nothing (dry-run)."""
        lvl = self._level(key)
        return lvl is None or lvl >= cost

    def retry_after(self, key: str, cost: float = 1.0) -> float:
        lvl = self._level(key)
        if lvl is None or lvl >= cost:
            return 0.0
        rate, _ = self._cfg[self._match(key)]
        return (cost - lvl) / rate if rate > 0 else float('inf')

    def rehearse(self, key: str, cost: float = 1.0) -> bool:
        """Dry-run path: spend from a rehearsal ledger (kept separate from
        live tokens) so later rehearsals in the same run see depletion.
        Never raises — returns False when the live bucket would be empty."""
        cfg_key = self._match(key)
        if cfg_key is None:
            return True
        if not hasattr(self, '_rehearsal'):
            self._rehearsal = {}
        if cfg_key not in self._rehearsal:
            lvl = self._level(key)          # start from the live level
            rate, burst = self._cfg[cfg_key]
            self._rehearsal[cfg_key] = [
                burst if lvl is None else lvl, self._clock()]
        rate, burst = self._cfg[cfg_key]
        tokens, ts = self._rehearsal[cfg_key]
        now = self._clock()
        tokens = min(burst, tokens + max(0.0, now - ts) * rate)
        self._rehearsal[cfg_key] = [tokens, now]
        if tokens < cost:
            return False
        self._rehearsal[cfg_key][0] -= cost
        return True

    def rehearsal_retry_after(self, key: str, cost: float = 1.0) -> float:
        cfg_key = self._match(key)
        if cfg_key is None:
            return 0.0
        entry = getattr(self, '_rehearsal', {}).get(cfg_key)
        if not entry or entry[0] >= cost:
            return 0.0
        rate, _ = self._cfg[cfg_key]
        return (cost - entry[0]) / rate if rate > 0 else float('inf')

    def acquire(self, key: str, cost: float = 1.0) -> bool:
        """Spend tokens (live). Raises VowRateLimitExceeded when empty."""
        lvl = self._level(key)
        if lvl is None:
            return True
        if lvl < cost:
            raise VowRateLimitExceeded(key, self.retry_after(key, cost))
        self._buckets[self._match(key)][0] -= cost
        return True
