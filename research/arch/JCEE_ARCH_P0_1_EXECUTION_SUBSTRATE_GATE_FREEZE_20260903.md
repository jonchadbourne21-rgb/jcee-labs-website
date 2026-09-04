# JCEE-ARCH-P0.1 — Execution-Substrate Substitution & Commodity-Offload Gate

Status: **FROZEN / PRE-ADJUDICATION**
Date: 2026-09-03
Parent evidence: JCEE-DIFF-P0.1D Step 2A

## Governing architectural law
JCEE evolves additively and substitutably. No external substrate may require abandonment of VOW, QCS/DCC, JEC/JA, Evidence Engine, IEJ, or the frozen evidence lineage.

VOW remains the JCEE-native reference execution runtime and may continue to improve. External durable-execution systems are evaluated only as optional plugs beneath a stable JCEE consequence/evidence boundary.

A substrate plug may offload commodity execution machinery, but it may not become the source of JCEE authority semantics, broaden execution authority, erase target-side ambiguity, or replace independently verifiable JCEE evidence closure.

## Frozen architectures

### A — VOW_REFERENCE_NATIVE
JCEE owns durable execution/retry/recovery using VOW plus the existing JCEE stack.

### B — RESTATE_SUBSTRATE
Restate owns durable invocation, retry scheduling, journaled service communication, keyed durable state, and other native durable-execution functions within its documented scope. JCEE retains current-authority admission, exact-effect contract, dependency/currentness closure, external-target observation, ambiguity classification, recovery authority, receipt construction, and independent verification.

### C — DBOS_SUBSTRATE
DBOS owns durable workflow execution and supported database-transaction durability within its documented scope. JCEE retains the same consequence/evidence responsibilities outside that scope.

## Plug-in invariants
1. VOW is never deleted or made semantically dependent on Restate or DBOS.
2. Core JCEE contracts are substrate-neutral. A plug implements an adapter contract; the adapter does not redefine the contract.
3. Every substrate-specific receipt is translated into a canonical JCEE evidence form without claiming more than the substrate actually proves.
4. External target truth outranks runtime self-report for whether an externally governed consequence occurred.
5. Ambiguity remains explicit until target/evidence closure is established.
6. Recovery authority is separately adjudicated; retry/replay capability never creates permission.
7. Substrate failure/unavailability cannot broaden consequence authority.
8. Removal of a plug must leave the JCEE contract/evidence model intact and permit fallback to VOW or another qualified substrate.
9. No external substrate may silently become mandatory for scientific reproduction of already-frozen VOW/QCS evidence.
10. No migration, rewrite, or production adoption authority is created by this gate.

## Frozen evaluation dimensions
Each architecture will be scored qualitatively and with evidence on:
- comparator-property preservation;
- commodity durability offloaded;
- JCEE-specific semantics retained;
- trusted computing/base surface introduced;
- security/credential surface;
- operational burden for a solo founder;
- latency placement on consequential path;
- infrastructure/storage burden;
- cloud/provider lock-in;
- failure-domain additions;
- observability/evidence independence;
- external-effect ambiguity behavior;
- reversibility/removability;
- ability to preserve VOW as reference/fallback;
- integration complexity;
- commercial integration posture.

## Decisive tests
### D1 — Differentiator subtraction
If a substrate natively closes a property previously attributed to JCEE, remove that property from JCEE's differentiator rather than duplicating it for marketing reasons.

### D2 — Boundary survival
Place an irreversible externally governed effect beyond the substrate's strongest atomic boundary. Determine which JCEE consequence/evidence semantics remain necessary.

### D3 — Plug removability
Ask whether the substrate can be removed and VOW restored without changing the canonical authority/effect/evidence contract.

### D4 — Evidence non-inflation
Verify that substrate journal/history is treated only as evidence of what that substrate durably recorded, not automatically as proof of external target acceptance.

### D5 — Solo-founder burden
A substrate is not favorable merely because it is technically elegant. It must materially reduce implementation/operations burden relative to the security, lock-in, and integration surface it introduces.

## Terminal architecture verdicts
Only these are allowed:
- `KEEP_VOW_PRIMARY_NO_SUBSTRATE_ADOPTION`
- `QUALIFY_RESTATE_AS_OPTIONAL_PLUG`
- `QUALIFY_DBOS_AS_OPTIONAL_PLUG`
- `QUALIFY_BOTH_DIFFERENT_SCOPES`
- `INDETERMINATE_MORE_EVIDENCE_REQUIRED`

A qualification verdict does not authorize implementation. A separate bounded plug experiment would be required.

## Build authority
No implementation follows unless the gate identifies a concrete reduction in commodity burden while preserving JCEE's residual property and the user separately authorizes a bounded plug experiment.

No VOW abandonment, rewrite, migration, or deprecation is authorized.