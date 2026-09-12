# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Self-learning system demo (Worked Examples §7, corrected import path:
the package is `vow`, not the legacy `src` layout).

Run:  python3 examples/learning_demo.py
"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from vow.self_learning_system import ScarPatternAnalyzer, AdaptiveStrategySelector

# ---- pattern analysis over scars ----
analyzer = ScarPatternAnalyzer()
analyzer.add_scar("CheckoutBatcher", "big_batch", "Connection timeout after 30s",
                  datetime.now())
analyzer.add_scar("CheckoutBatcher", "big_batch", "Connection timeout after 45s",
                  datetime.now())
analyzer.add_scar("ResilientFetcher", "primary_api", "HTTP 503 from primary",
                  datetime.now())
analyzer.analyze_patterns()

print("Top failure patterns:")
for pattern in analyzer.get_top_patterns(limit=3):
    print(f"  [{pattern.pattern_id}] {pattern.description} "
          f"({pattern.occurrence_count}x)")

# ---- adaptive strategy selection ----
selector = AdaptiveStrategySelector()
selector.record_performance("primary_api", success=False, execution_time=30.0,
                            resource_usage=0.4)
selector.record_performance("primary_api", success=True, execution_time=1.2,
                            resource_usage=0.4)
selector.record_performance("mirror_api", success=True, execution_time=0.9,
                            resource_usage=0.3)
selector.record_performance("mirror_api", success=True, execution_time=0.8,
                            resource_usage=0.3)

best = selector.select_best_strategy(["primary_api", "mirror_api"])
print(f"\nHistorical favorite: {best}")
print("\nPerformance report:")
for name, stats in selector.get_performance_report().items():
    print(f"  {name}: {stats}")
