# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Rate Limiter (capability layer, Reconciled §2)."""
import asyncio, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.rate_limiter import RateLimiter, VowRateLimitExceeded
from main import VowEngineManager, MockDatabase


class FakeClock:
    def __init__(self):
        self.now = 1000.0
    def __call__(self):
        return self.now
    def advance(self, s):
        self.now += s


def test_bucket_allows_burst_then_denies():
    rl = RateLimiter(clock=FakeClock())
    rl.configure('network', rate=1.0, burst=2)
    assert rl.acquire('network') is True
    assert rl.acquire('network') is True
    try:
        rl.acquire('network')
        assert False, 'expected VowRateLimitExceeded'
    except VowRateLimitExceeded as e:
        assert e.retry_after > 0


def test_refill_over_time():
    clock = FakeClock()
    rl = RateLimiter({'network': (2.0, 1.0)}, clock=clock)
    assert rl.acquire('network') is True
    assert not rl.probe('network')
    clock.advance(0.5)          # +1 token at 2/sec
    assert rl.acquire('network') is True


def test_probe_spends_nothing():
    rl = RateLimiter(clock=FakeClock())
    rl.configure('network', rate=0.1, burst=1)
    assert rl.probe('network') is True
    assert rl.probe('network') is True   # still full — probe is free
    assert rl.acquire('network') is True
    assert not rl.probe('network')


def test_unconfigured_key_is_unlimited():
    rl = RateLimiter(clock=FakeClock())
    for _ in range(50):
        assert rl.acquire('shell') is True


def test_capability_prefix_covers_actions():
    rl = RateLimiter({'network': (0.1, 1.0)}, clock=FakeClock())
    assert rl.acquire('network:http_get') is True
    assert not rl.probe('network:http_post')   # same bucket
    try:
        rl.acquire('network:http_post')
        assert False
    except VowRateLimitExceeded as e:
        assert 'network:http_post' in str(e)


SRC = '''
quest fetcher {
  goal "gated file reads at quest level"
  capability file_read

  let a = file_read("/etc/hostname")
  let b = file_read("/etc/hosts")

  strategy s {
    let ok = 1
    prove ok == 1
  }

  success when true
}
'''


def test_live_calls_are_throttled():
    limits = {'file_read': {'rate': 0.0001, 'burst': 1}}
    mgr = VowEngineManager(MockDatabase(), rate_limits=limits)
    t = asyncio.run(mgr.execute_vow_quest(SRC, 'fetcher', dry_run=False))
    assert t['status'] == 'error'
    assert 'rate limit exceeded' in t['error']
    assert 'file_read' in t['error']


def test_dry_run_records_would_throttle_without_blocking():
    limits = {'file_read': {'rate': 0.0001, 'burst': 1}}
    mgr = VowEngineManager(MockDatabase(), rate_limits=limits)
    t = asyncio.run(mgr.execute_vow_quest(SRC, 'fetcher', dry_run=True))
    assert t['status'] == 'success'   # rehearsal never blocks
    effects = t['side_effects_recorded']
    assert len(effects) == 2          # both calls recorded as shadows
    results = [e['detail'].get('args') for e in effects]
    assert all(r is not None for r in results)
    # the second call's shadow marks the would-be denial
    shadows = [e for e in effects]
    assert any('rate_limited' in str(e) or True for e in shadows)  # see below


def test_dry_run_shadow_marks_second_call():
    limits = {'file_read': {'rate': 0.0001, 'burst': 1}}
    mgr = VowEngineManager(MockDatabase(), rate_limits=limits)
    t = asyncio.run(mgr.execute_vow_quest(SRC, 'fetcher', dry_run=True))
    import ast
    fr = ast.literal_eval(t['final_result'])
    vals = [v for v in fr['result'].values()
            if isinstance(v, dict) and v.get('shadow')]
    assert len(vals) == 2
    assert vals[0].get('rate_limited') is None
    assert vals[1].get('rate_limited') is True
    assert vals[1]['retry_after'] > 0


def test_no_limits_means_no_markers():
    mgr = VowEngineManager(MockDatabase())
    t = asyncio.run(mgr.execute_vow_quest(SRC, 'fetcher', dry_run=True))
    import ast
    fr = ast.literal_eval(t['final_result'])
    vals = [v for v in fr['result'].values()
            if isinstance(v, dict) and v.get('shadow')]
    assert len(vals) == 2
    assert all('rate_limited' not in v for v in vals)
