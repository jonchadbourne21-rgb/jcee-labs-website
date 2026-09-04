# JCEE-DIFF-P0.1D Step 4A — Payabli Discovery Target Shortlist

Status: **PREPARED / UNSENT**
Date: 2026-09-04
Parent discovery packet: `JCEE_DIFF_P0_1D_STEP4A_PAYABLI_DISCOVERY_PACKET_20260904.md`

## Selection rule
Prioritize publicly confirmed Payabli users/partners where:
1. the consequential workflow is close to payout/payment operations;
2. payment volume or operational centrality is material;
3. the relevant payments/operations/product owner can plausibly be identified;
4. discovery can falsify the JCEE residual without requiring credentials.

Do not infer Pay Out use where only Pay In is publicly documented.

## Tier 1 — highest-value discovery

### 1. Fyxt
**Why first:** Payabli publicly announced Fyxt's `Vendor Pay`, a fully integrated CRE payment solution connecting job workflows and invoice approvals with real-time vendor payouts. This is the closest public customer workflow to the frozen Payabli Pay Out ambiguity/recovery residual.

**Primary role targets:**
- Payments/Fintech Product owner;
- Vendor Pay / AP product owner;
- Platform/Payments Engineering;
- Finance/Payment Operations.

**Discovery focus:**
- payout lost-response handling;
- durable mapping from job/invoice approval → Payabli logical payout;
- whether retry re-checks invoice/business approval;
- duplicate/exception burden;
- webhook/poll reconciliation ownership.

**Evidence:** Payabli announcement, June 26 2025 — `Fyxt and Payabli Partner to Launch Vendor Pay`.

### 2. Builder Prime
**Why:** Payabli's case study reports a 1000% increase in payment volume after integration, nearly half of Builder Prime users using the payment system, and continuing product expansion. Payabli's July 2026 intelligence announcement quotes Builder Prime operations leadership describing a need for better real-time visibility into day-to-day Payabli data.

**Publicly identifiable role targets:**
- Lindsey Hulet — VP/SVP Operations (title varies across current public company/Payabli pages; verify before outreach);
- Miles Gantt — Head of Product Engineering;
- payments/product owner if separately identified.

**Discovery focus:**
- frequency/cost of ambiguous or delayed payment outcomes;
- operational exception handling;
- current durable operation ledger;
- webhook/poll/manual reconciliation burden;
- whether future Payabli payables/vendor payments create a stronger recovery boundary.

**Important boundary:** public case study says sophisticated Payabli payables was a future expansion plan; do not assume it is live today without confirmation.

### 3. Roofr
**Why:** Payabli publicly uses Roofr as an integration testimonial, and Roofr's current public team page identifies a dedicated `Group Product Manager - Payments`, making this a strong role-aligned discovery target.

**Publicly identifiable role target:**
- Gabby/Gabriela Yu — Group Product Manager - Payments (current Roofr page; prior Payabli testimonial used Principal Product Manager).

**Discovery focus:**
- embedded-payment timeout/retry semantics;
- business-ID/idempotency mapping;
- how payments product handles ambiguous processor state;
- operational incidents and support burden;
- whether a metadata-only recovery control plane is acceptable.

**Boundary:** public evidence confirms Payabli payment integration, not Pay Out/vendor payout use. Ask about the actual workflow before applying payout-specific residual claims.

## Tier 2 — useful secondary discovery

### 4. ID Plans / ID Tenant
**Why:** July 2026 launch integrated Payabli into a commercial-real-estate tenant platform with recurring billing, autopay, split payments and real-time payment visibility. Fresh integration may provide high-quality integration/reconciliation evidence.

**Discovery focus:**
- split-payment logical identity;
- retry after lost synchronous result;
- reconciliation between invoice history and Payabli state;
- whether recent implementation required custom ambiguity handling.

**Boundary:** public evidence is primarily payment acceptance/tenant payments, not vendor Pay Out.

### 5. CurbWaste
**Why:** Payabli currently features CurbWaste publicly and attributes a material expansion in revenue opportunity to the partnership. Waste/field-service software is operationally payment-heavy and likely sensitive to payment reliability.

**Discovery focus:**
- payment operations scale;
- exception/reconciliation burden;
- current retry/idempotency architecture;
- payment ownership role and integration appetite.

**Boundary:** do not infer the exact Pay Out workflow from public marketing testimony alone.

### 6. ExactEstate
**Why:** confirmed Payabli property-management software partnership. Property management is a multi-stakeholder, operationally complex payment environment.

**Discovery focus:**
- application business ID ↔ Payabli transaction mapping;
- support/reconciliation burden;
- payout/vendor workflows if actually used;
- recovery-authority rules after ambiguous operations.

**Boundary:** public partnership announcement emphasizes payment acceptance; payout use must be confirmed.

## Strategic enterprise lane — high value / higher access burden

### Huntington National Bank
**Why:** February 2026 Payabli partnership powers integrated B2B capabilities for businesses to accept, issue and manage transactions inside Huntington's digital banking environment. This is high-consequence and likely has mature controls that could strongly falsify JCEE.

**Why not first:** enterprise security, procurement and architecture sophistication raise access and integration burden. A mature bank may already close much of the residual internally, which is scientifically valuable but slower for a solo founder.

**Use:** strongest later enterprise falsifier, not first outreach target.

## Payabli vendor-side target

### Payabli itself
**Priority functions:**
- Pay Out / Pay Ops Product;
- API/Platform Engineering;
- Security/Identity;
- Developer Platform/Integrations;
- AI/Agentic Payments Product;
- Risk/Compliance.

**Discovery focus:** use vendor questions VQ1–VQ9 from the frozen Step 4A discovery packet. The objective is to kill or narrow the stale-authority/native-recovery hypothesis, not pitch a finished product.

## Recommended contact order
1. Fyxt
2. Builder Prime
3. Roofr
4. Payabli vendor/product team in parallel
5. ID Plans
6. CurbWaste
7. ExactEstate
8. Huntington as a later mature-system falsifier

## Advancement rule
No company becomes a sandbox/build target merely by replying. A conversation must produce evidence for:
`RESIDUAL_PROPERTY + ECONOMIC_IMPORTANCE + ACCEPTABLE_INTEGRATION_BURDEN`
plus explicit willingness to evaluate a bounded test.

## Outreach status
**UNSENT.**