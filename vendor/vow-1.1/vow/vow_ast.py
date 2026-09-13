# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW AST node definitions (SPEC §3)."""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


# --- Expressions ---
@dataclass
class Num:
    value: float

@dataclass
class Str:
    value: str

@dataclass
class Bool:
    value: bool

@dataclass
class Name:
    id: str

@dataclass
class BinOp:
    op: str
    left: Any
    right: Any

@dataclass
class UnaryOp:
    op: str
    operand: Any

@dataclass
class Call:
    func: Any
    args: List[Any] = field(default_factory=list)
    # Owed 1 (idempotency keys): call keyword args — gated calls accept
    # exactly one, `key=`; everything else is a loud compile error.
    kwargs: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ListLit:
    items: List[Any] = field(default_factory=list)

@dataclass
class DictLit:
    pairs: List[Any] = field(default_factory=list)  # [(key_expr, value_expr)]

@dataclass
class Lambda:
    params: List[str] = field(default_factory=list)
    body: Any = None

@dataclass
class Attr:
    obj: Any = None
    name: str = ''


# --- Statements / quest items ---
@dataclass
class Goal:
    text: str

@dataclass
class Constraint:
    expr: Any

@dataclass
class Believe:
    name: str
    value: Any
    confidence: float = 1.0
    source: Optional[str] = None

@dataclass
class ScarStmt:
    message: str

@dataclass
class Let:
    name: str
    value: Any
    annotation: Optional[str] = None  # declared type contract: int|str|bool|float|list|dict

@dataclass
class Prove:
    expr: Any

@dataclass
class Success:
    expr: Any

@dataclass
class Strategy:
    name: str
    cost: float = 1.0
    risk: float = 0.0
    body: List[Any] = field(default_factory=list)

@dataclass
class Tournament:
    score_expr: Any
    strategies: List[Strategy] = field(default_factory=list)
    collapse: bool = False  # True: `collapse by` — scoring sees strategy
                            # outputs as well as engine metrics

@dataclass
class Set:
    name: str
    value: Any

@dataclass
class If:
    cond: Any
    body: List[Any] = field(default_factory=list)
    orelse: List[Any] = field(default_factory=list)

@dataclass
class Repeat:
    count: Any
    body: List[Any] = field(default_factory=list)

@dataclass
class Capability:
    name: str

@dataclass
class RecallScars:
    pass

@dataclass
class OnFail:
    body: List[Any] = field(default_factory=list)

@dataclass
class Quest:
    name: str
    items: List[Any] = field(default_factory=list)
    learn: bool = False

@dataclass
class Axiom:
    """Compile-time constant: evaluated at transpile time, immutable at
    runtime, hashed into the situation fingerprint."""
    name: str
    expr: object = None


@dataclass
class Deduce:
    """Compile-time decision table: givens must resolve over axioms and
    literals; the first true given's result becomes a new axiom."""
    name: str
    clauses: list = field(default_factory=list)  # [(given_expr, result_expr)]


@dataclass
class RouteDecl:
    """Deterministic intent router: substring patterns -> intent labels,
    first match wins, else fallback. Zero tokens, nanosecond latency —
    absorbs the enumerable majority; the model keeps the rest."""
    source: str = ''
    rows: list = field(default_factory=list)   # [(patterns: list, label: str)]
    fallback: str = None


@dataclass
class IntentDecl:
    """Quest-level intent declaration with an effect policy: the quest
    declares what it IS, and the runtime denies the listed gated effects
    (whisper, never crash). Intent/action misalignment becomes detectable."""
    name: str = ''
    denied: list = field(default_factory=list)  # gated action names


@dataclass
class OntologyCall:
    """A user-defined keyword (from the program's ontology block) applied
    to one argument. Emits a host-function call through the registry."""
    keyword: str = ''
    arg: Any = None


@dataclass
class WaitStmt:
    """`wait until <expr>` — suspend the run until a wall-clock time
    (docs/DURABILITY.md §5). CONTEXTUAL syntax: 'wait'/'until' are IDENT
    values here, not reserved words. Dry-run shadows (records, never parks).
    """
    wake: Any = None   # Expr -> ISO-8601 UTC string or epoch seconds


@dataclass
class AwaitStmt:
    """`await approval "reason"` — suspend for a human decision; the grant
    or denial is journaled inside the run's hash chain (tamper-evident
    human oversight). CONTEXTUAL: 'await'/'approval' are IDENT values."""
    reason: str = ''


@dataclass
class Program:
    quests: List[Quest] = field(default_factory=list)
    domain: str = 'exploratory'  # 'exploratory' (scar-driven) | 'sop' (golden-path)
    axioms: List = field(default_factory=list)  # Axiom | Deduce, in order
    runbook: dict = field(default_factory=dict)  # row name -> expr (Owed 3:
    # the deployment's standing law — scar_ttl v1 — versioned with the code
    # it governs; constant-resolved at transpile)
    routes: List = field(default_factory=list)  # RouteDecl
    ontology: dict = field(default_factory=dict)  # keyword -> host fn name
