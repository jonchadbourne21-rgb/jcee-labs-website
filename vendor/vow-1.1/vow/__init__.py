# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW -- a quest-oriented programming language.

Programs are quests: goal-directed computations with beliefs
(confidence-tracked knowledge), scar memory (persisted failures that inform
future runs), proofs (assertions whose failure is recorded, not hidden),
strategy tournaments (competing approaches scored by weighted metrics under
cost/risk/attempt constraints), and side-effect shadowing (dry-run mode where
effects are recorded, not executed).

VOW transpiles to Shadow Python: ordinary Python plus the VOW runtime
preamble. See SPEC.md for the single source of truth.
"""

from .vow_lexer import Token, tokenize
from .vow_ast import (
    RecallScars,
    OnFail,
    Program,
    Quest,
    Goal,
    Constraint,
    Believe,
    ScarStmt,
    Tournament,
    Strategy,
    Prove,
    Success,
    Let,
    Num,
    Str,
    Bool,
    Name,
    BinOp,
    UnaryOp,
    Call,
)
from .vow_parser import VowAdvancedParser

# VowSyntaxError's public home is vow_parser (SPEC section 5); some builds
# define it in the lexer (SPEC section 4) and re-export it. Accept either.
try:
    from .vow_parser import VowSyntaxError
except ImportError:  # pragma: no cover - depends on lexer/parser split
    from .vow_lexer import VowSyntaxError

from .vow_transpiler import (
    verify_shadow_signature,
    VowSecurityError,
    SHADOW_RUNTIME_PREAMBLE,
    VOW_DRY_RUN,
    VowCapability,
    VowProofFailure,
    VowScarMemory,
    VowSideEffectRecorder,
    VowTranspiler,
    vow_set_dry_run,
)

__version__ = "1.1.0"


from .vow_reverse import VowReverseTranspiler, VowReverseError, reverse_file
from .self_learning_system import (
    ScarPatternAnalyzer,
    AdaptiveStrategySelector,
    ScarVectorMemory,
    SelfLearningSystem,
)
from .scar_injection_validator import (
    ScarInjectionValidator,
    ScarInjectionError,
    validate_source,
)
from .llm_strategy_optimizer import LLMStrategyOptimizer, Suggestion
from .rate_limiter import RateLimiter, VowRateLimitExceeded
from .database_backends import PostgresDatabase, MongoDatabase
from .causal_effects import (
    CAUSAL_EFFECT_PROTOCOL_VERSION,
    CausalEffectContract,
    CausalEffectReceipt,
    CausalMode,
    CausalModelError,
    CausalReceiptKind,
    CausalRetryContext,
    CausalRetryDecision,
    CausalTransition,
    RetryVerdict,
    decide_causal_retry,
)

__all__ = [
    "__version__",
    # Lexer
    "Token",
    "tokenize",
    # AST nodes
    "Program",
    "Quest",
    "Goal",
    "Constraint",
    "Believe",
    "ScarStmt",
    "Tournament",
    "Strategy",
    "Prove",
    "Success",
    "Let",
    "Num",
    "Str",
    "Bool",
    "Name",
    "BinOp",
    "UnaryOp",
    "Call",
    "RecallScars",
    "OnFail",
    # Parser
    "VowAdvancedParser",
    "VowSyntaxError",
    # Transpiler + runtime
    "VowTranspiler",
    "verify_shadow_signature",
    "VowSecurityError",
    "SHADOW_RUNTIME_PREAMBLE",
    "VOW_DRY_RUN",
    "VowScarMemory",
    "VowCapability",
    "VowProofFailure",
    "VowSideEffectRecorder",
    "vow_set_dry_run",
    # Reverse transpiler
    "VowReverseTranspiler",
    "VowReverseError",
    "reverse_file",
    # Self-learning system
    "ScarPatternAnalyzer",
    "AdaptiveStrategySelector",
    "ScarVectorMemory",
    "SelfLearningSystem",
    # Scar injection validator (mandatory injection, Reconciled §5)
    "ScarInjectionValidator",
    "ScarInjectionError",
    "validate_source",
    # LLM strategy optimizer (learning-loop closure, Reconciled §5)
    "LLMStrategyOptimizer",
    "Suggestion",
    # Capability-layer rate limiter (Reconciled §2)
    "RateLimiter",
    "VowRateLimitExceeded",
    # Data-layer backends (Reconciled §2)
    "PostgresDatabase",
    "MongoDatabase",
    # Evidence-backed causal retry authorization (v1.1)
    "CAUSAL_EFFECT_PROTOCOL_VERSION",
    "CausalEffectContract",
    "CausalEffectReceipt",
    "CausalMode",
    "CausalModelError",
    "CausalReceiptKind",
    "CausalRetryContext",
    "CausalRetryDecision",
    "CausalTransition",
    "RetryVerdict",
    "decide_causal_retry",
]
