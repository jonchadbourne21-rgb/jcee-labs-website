# VOW Key Concepts (from ONTOLOGYPRIMER.md)

## Core Architecture
- VOW is a PaaS + coding language with formal ontological foundations
- Uses upper ontology (Continuant/Occurrent distinction) for architectural reasoning
- Entities/capabilities are continuants (persist); transpile runs/actions are occurrents (happen over time)
- VowScarMemory: record-keeping continuant that accumulates traces of occurrents

## Formal Foundations
1. **Continuant/Occurrent** — every construct is classified as persistent-thing or event-thing
2. **Mereology (Part-Whole)** — strategies composed of sub-strategies, tournaments of pure computations; compile-time enforcement of category consistency
3. **Subsumption (Description Logic)** — type checking via necessary+sufficient conditions, not resemblance; transpile targets must satisfy every semantic constraint
4. **Deontic Logic (Permission/Obligation)** — capability gating = deontic structure; dry-run mode = separating permission layer from actuality layer

## Key Constructs
- `vow_guarded_action`: deontic permission gate (permitted/forbidden independent of execution)
- Capability gating: compile-time error if gated action inside pure-computation body
- Dry-run mode: evaluates what would be permitted without making it actual
- Tournament: pure computation composition with transitivity enforcement
- Shadow-Python: canonical execution engine (transpile target)
- Scar Memory: learning from failures, accumulating traces

## EU AI Act Compliance Angle
- Formal ontological reasoning = auditable AI decision-making
- Deontic logic (permission/obligation/forbidden) maps directly to regulatory compliance
- Continuant/Occurrent distinction = clear audit trail of what persists vs what happened
- Subsumption checking = provable type safety, not just "looks right"
- Dry-run mode = simulate without executing = risk assessment before deployment
- Part-whole consistency = no hidden effectful operations buried in "pure" code
- Every architectural decision has formal justification = documentation for regulators
