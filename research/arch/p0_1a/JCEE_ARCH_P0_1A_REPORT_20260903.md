# JCEE-ARCH-P0.1A — Substrate-Neutral Plug Contract & Reversibility Gate Report

Status: **CLOSED / PASS_BOUNDED_SHADOW**
Date: 2026-09-03 America/Chicago (execution 2026-09-04 UTC)

## Frozen preregistration
- Branch: `jcee-arch-p0.1a-20260903`
- Prereg commit: `a7205c6241743a95fed2514d20cf00c5f2330ad9`
- Workflow execution head: `cfdf3a3624e60d9384af733f2fe04cc8aa6641fd`

## Execution identity
- GitHub Actions run: `33825354238`
- Job: `100876726889`
- Runner: GitHub-hosted Ubuntu 24.04.4, Azure `eastus`
- Node: `v22.23.2`
- npm: `10.9.8`
- Docker: `28.0.4`
- Restate TypeScript SDK: `1.16.9`
- Restate clients: `1.16.9`
- Restate Testcontainers: `1.16.9`

The real Restate Testcontainer started successfully, registered service `JceeShadowPlug`, and executed the frozen synthetic workflow corpus.

## Evidence artifact
- Artifact name: `jcee-arch-p0-1a-evidence`
- Artifact ID: `9919742572`
- Artifact ZIP SHA-256: `6ef5000e6a8c74673cfb9823807b09efd8d57dffd5c7a22f6542049025df8dfa`
- `JCEE_ARCH_P0_1A_RESULTS.json` SHA-256: `eb532ccca5058b093b8ca513a9e8ab1661be6384e3d5ab3571fa7d995473d8b2`
- `JCEE_ARCH_P0_1A_NPM_TREE.txt` SHA-256: `bafb0e3e3a9a1bc5dea4c55a0a534b99fac59198b45bc2fcd39d6c4cac3eab97`

## Qualification boundary
### Executed for real
- Restate server/container execution;
- Restate workflow registration;
- Restate workflow submissions and attaches;
- Restate durable workflow identity behavior for C09;
- canonical JCEE receipt generation inside the Restate handler.

### Not executed in this gate
- actual VOW runtime;
- payment, deployment, cloud-control, or other consequential target;
- production credentials;
- production Restate Cloud/BYOC;
- production security configuration.

The VOW arm was the preregistered frozen VOW-reference semantic fixture only. Therefore this report does **not** claim executable VOW↔Restate parity.

## Results

| Scenario | Result | Frozen property |
|---|---|---|
| C01 | PASS | Known effect remains `CLOSED_EFFECT_OCCURRED`; no recovery re-execution. |
| C02 | PASS | Restate/substrate `RETRY` plus ambiguous target remains `OBSERVE_FIRST`; retry did not become authority. |
| C03 | PASS | Ambiguous target without retry signal remains `OBSERVE_FIRST`. |
| C04 | PASS | Target proved not occurred but stale authority yielded `ABSTAIN_AUTHORITY`. |
| C05 | PASS | Target proved not occurred but stale dependency yielded `ABSTAIN_DEPENDENCY`. |
| C06 | PASS | Current authority/dependency plus explicit recovery authority yielded `RETRY_AUTHORIZED_SHADOW_ONLY`; zero external effect. |
| C07 | PASS | Substrate `COMPLETED` did not inflate ambiguous target truth; result remained `OBSERVE_FIRST / OPEN_AMBIGUOUS`. |
| C08 | PASS | C01-C07 Restate semantic projections exactly matched the frozen VOW-reference semantic fixture after substrate-specific metadata was removed. |
| C09 | PASS | First workflow submission `Accepted`; second same workflow identity `PreviouslyAccepted`; attached canonical result unchanged. |

All synthetic receipts recorded `external_effect_performed=false`. No real external target was connected.

## Decisive findings

### 1. Substrate retry can be contained below JCEE authority
The real Restate arm successfully accepted a substrate `RETRY` signal while the canonical JCEE result remained `OBSERVE_FIRST` under ambiguity. The adapter boundary can therefore represent Restate retry/recovery machinery without allowing it to create JCEE consequence authority in this bounded corpus.

### 2. Runtime completion can remain separate from target truth
C07 passed with substrate signal `COMPLETED` and target observation `AMBIGUOUS`. The canonical receipt remained ambiguous. This demonstrates the intended non-inflation boundary in the synthetic contract: Restate completion is evidence of Restate execution, not automatically evidence that an independently governed target accepted a consequential effect.

### 3. Restate workflow identity is compatible with canonical operation identity
C09 returned `PreviouslyAccepted` on the repeated workflow identity and the attached canonical result remained unchanged. This is useful substrate plumbing evidence. It is **not** promoted into an exactly-once external-effect claim.

### 4. Contract-level reversibility is feasible
The Restate-specific evidence section could be excluded while authority, effect, target, recovery, and closure semantics remained exactly equal to the frozen VOW-reference fixture across C01-C07. This supports the architectural idea that substrate metadata can remain subordinate to a canonical JCEE contract.

## Operational/security observations

### Local handler-signature warning
The Restate test service logged that requests were accepted without validating request signatures and that handler access must be restricted. That is acceptable for this isolated local Testcontainer only. It would be a production blocker until authenticated/signed endpoint configuration is separately qualified.

### Dependency audit warning
`npm install` reported **4 moderate severity vulnerabilities** in the installed dependency graph. This gate did not perform a security-advisory root-cause audit. The warning does not alter the semantic shadow result, but it prevents using this run as production-security qualification and must be reviewed before any production-facing Restate adoption.

### Reproducibility limitation
Top-level Restate package versions were pinned and the full installed dependency tree was captured, but no generated `package-lock.json` was preserved in this first run. The evidence is sufficient for this bounded semantic result but a future stronger reproduction should preserve a lockfile/container digest as part of the preregistered environment.

## Verdict

**`PASS_BOUNDED_SHADOW`**

Earned:
- a real local Restate substrate can implement the frozen substrate-neutral JCEE shadow contract;
- substrate retry non-authority was preserved across the frozen ambiguity cases;
- target-truth non-inflation was preserved;
- stale authority/dependency failed closed;
- contract-level semantic equality to the frozen VOW-reference fixture held across C01-C07;
- repeated Restate workflow identity preserved one canonical result in C09;
- Restate-specific metadata was separable from canonical JCEE semantics.

Not earned:
- executable VOW↔Restate parity;
- real external-effect closure;
- crash-after-real-target-commit proof under Restate;
- production security/readiness;
- Restate Cloud/BYOC qualification;
- performance/latency equivalence;
- universal reversibility;
- production migration/adoption authority.

## Architectural disposition

`RESTATE_SHADOW_PLUG_CONTRACT_FEASIBLE`

VOW remains preserved as JCEE-native reference/fallback. Restate remains an optional substrate candidate rather than a replacement. The result strengthens the plug architecture without authorizing production adoption.

## Recommended successor

Stop automatic architecture promotion here unless a stronger proof is needed for a concrete commercialization/integration decision.

If strengthened later, the next scientifically useful gate is an **actual VOW runtime × Restate runtime paired shadow reproduction** against the same canonical corpus, with both runtimes executed independently and a preserved lockfile/container digest. A real consequential target remains prohibited until a separate commercial/native-system residual justifies it.