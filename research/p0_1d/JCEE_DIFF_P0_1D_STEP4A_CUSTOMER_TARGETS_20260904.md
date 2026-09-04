# JCEE-DIFF-P0.1D Step 4A — Payabli Customer-Side Target Qualification

Status: **PREPARED / UNSENT / NO PRIOR CONTACT FOUND**
Date: 2026-09-04
Parent: `JCEE_DIFF_P0_1D_STEP4A_PAYABLI_DISCOVERY_PACKET_20260904.md`

## Cross-stream and inbox overlap check
Before target qualification, JCEE Labs checked prior project context plus Gmail for `Fyxt`, `Builder Prime`, `Roofr`, and the domains `fyxt.com`, `builderprime.com`, and `roofr.com`.

Result: **no prior email contact found for these three companies** in the connected JCEE Labs Gmail account, and no retrieved prior JCEE stream established prior outreach/custody for these targets.

Existing Payabli-vendor and payOS-vendor outreach remain separate active lanes and must not be duplicated here.

No outreach is sent by this packet.

## Frozen customer-side residual under test
`DURABLE LOGICAL OPERATION IDENTITY + TARGET OBSERVATION + CURRENT RECOVERY AUTHORITY + EXACT RECOVERY ACTION + VERIFIABLE CLOSURE`

after a Payabli-backed payment/payout may have succeeded but the software platform lacks a trustworthy synchronous result.

## Rank 1 — Fyxt

### Why it is the strongest first customer target
Fyxt and Payabli publicly launched `Vendor Pay`, explicitly connecting job workflows and invoice approvals to real-time vendor payouts. Fyxt's current Financial Operations product describes Vendor Pay as connecting vendors and FinOps teams in one automated workflow with real-time approvals, embedded compliance, and same-day payouts.

This creates the cleanest direct test of JCEE's recovery-authority hypothesis because the business approval/obligation and the consequential payout are already connected inside one vertical SaaS workflow.

### Current relevant roles
- Ryan Botwinick — CEO/founder, current public company/event materials.
- Vidya Chokkalingam — Co-Founder / CTO, current executive listings.
- Rob Eberenz — CFO / COO, current executive listings.
- Product function: public/secondary sources identify a long-tenured Fyxt product manager; exact current payment ownership should be verified before any send.

### Preferred discovery owner
**Product/CTO first, CFO/COO second.**

Reason: the first questions concern operation identity, approval-to-payout binding, retry/reissue semantics, and target-state reconciliation. CFO/COO is useful for economic consequence if technical residual survives.

### Fyxt-specific falsification questions
1. When Vendor Pay receives an ambiguous Payabli result, what durable Fyxt object represents the underlying vendor-payment obligation independent of the Payabli transaction?
2. Can Fyxt prove that any retry/reissue references the same approved invoice/payment obligation rather than creating a new payable action?
3. Does recovery re-check current invoice approval/vendor/payee authority, or inherit authority from the original attempt?
4. How are webhook/polling conflicts and delayed payout states reconciled before any second money-moving action?
5. Does Fyxt already maintain one authoritative recovery ledger/receipt that closes original attempt → target observation → permitted recovery → final payout?
6. What operational cost remains when payout state is delayed, ambiguous, duplicated, or requires manual intervention?

### Kill condition
Kill the Fyxt wedge if its native application layer already persists durable business-payment identity, re-validates current approval on recovery, and reconciles Payabli target truth before any retry with negligible operational burden.

### Current disposition
`PRIORITY_1 / READY_FOR_DISCOVERY_REVIEW / UNSENT`

## Rank 2 — Builder Prime

### Why it is high value
Builder Prime uses Payabli as its payment processor and publicly reports a 1000% increase in payment volume since adopting Payabli. Its own help center exposes transaction/batch reporting and routes some payment-limit operational issues directly to Payabli.

More importantly, Payabli's August 2026 material quotes Builder Prime's SVP of Operations saying the company had struggled to get real-time day-to-day payment data across its customer base before using Payabli's Amigo tooling. That is direct evidence of a meaningful payment-operations visibility burden, although not yet evidence of ambiguity/recovery pain.

### Current relevant roles
- Lindsey Hulet — SVP of Operations, publicly quoted by Payabli in 2026 and matched in LinkedIn search.
- Jess Ourand — Senior Product Manager, current Builder Prime author/product materials.
- Jonathan Weinberg — Founder/CEO, publicly associated with the Payabli integration and current product roadmap.

### Preferred discovery owner
**Lindsey Hulet first; payments/product owner second.**

Reason: operations can tell us whether ambiguous transaction state, duplicate notifications, reconciliation, refunds, chargebacks, or payment investigations create real cost. Product can then tell us how recovery authority is implemented.

### Builder Prime-specific falsification questions
1. When a Builder Prime payment submission has an uncertain result, is the business payment/invoice operation held in a durable pending/ambiguous state until Payabli truth is known?
2. Is the Payabli idempotency key durably tied to Builder Prime's invoice/payment identity across long retry windows?
3. Who owns uncertain-result reconciliation today—application code, ops, support, or Payabli?
4. Before a retry/refund/new payment operation, what current invoice/customer/business authority is re-checked?
5. Are transaction/batch reports and Amigo enough to eliminate manual recovery ambiguity, or do operators still investigate exceptions?
6. What is the actual cost of unresolved payment exceptions: tickets, delayed deposits, accounting reconciliation, refunds, customer support, or engineering time?

### Kill condition
Kill the Builder Prime wedge if its existing invoice/payment model plus Payabli reconciliation already closes ambiguous recovery automatically and cheaply, with no material ops burden.

### Current disposition
`PRIORITY_2 / READY_FOR_DISCOVERY_REVIEW / UNSENT`

## Rank 3 — Roofr

### Why it remains useful but ranks below the first two
Roofr has a mature integrated payments product with transaction/funding statuses, automated reconciliation, invoices, partial payments/deposits, and a dedicated current payments product owner. Roofr's privacy policy states its payment processors currently include Stripe or Centavo (DBA Payabli), so Payabli is clearly in the processor set but should not be assumed to underlie every Roofr payment flow.

This makes Roofr a valuable stronger-native-control falsifier: Roofr publicly claims that deposited funds and individual transaction statuses are automatically matched, reducing manual reconciliation.

### Current relevant role
- Gabby Yu — current Roofr public team page: `Group Product Manager - Payments`.
- Payabli's own public material previously identified Gabriela Yu as a principal product manager at Roofr and described the Payabli integration as getting stable quickly.

### Preferred discovery owner
**Gabby Yu / payments product.**

### Roofr-specific falsification questions
1. Which Roofr payment flows currently use Payabli versus Stripe?
2. Does Roofr maintain one durable business-payment identity independent of processor transaction identity?
3. When processor response is ambiguous, does Roofr's automatic reconciliation guarantee that no user/system can cause a second payment attempt until target truth is established?
4. Are partial payments/deposits/retries always bound to the exact invoice obligation and current authorization?
5. Does the transaction/funding dashboard represent only processor state, or also a durable Roofr recovery decision/lineage?
6. Have automatic matching and integrated status already eliminated manual ambiguous-payment recovery as a meaningful burden?

### Kill condition
Kill the Roofr wedge if its existing payment orchestration and reconciliation already provides durable operation identity, target-truth gating, and exact recovery semantics with low operational cost.

### Current disposition
`PRIORITY_3 / STRONG_FALSIFIER / UNSENT`

## Ranked sequence
1. **Fyxt** — exact Vendor Pay approval→payout boundary.
2. **Builder Prime** — strongest public evidence of real payment-operations data burden and large Payabli volume.
3. **Roofr** — strongest native reconciliation/product control falsifier with an identified payments PM.

## Outreach/control status
- No email has been sent to Fyxt, Builder Prime, or Roofr by this packet.
- No credential, sandbox, or customer-data access has been requested.
- Payabli vendor thread remains active and awaiting substantive response.
- payOS vendor thread remains active and awaiting response.
- Any actual customer outreach is a separate explicit action and should be re-checked against Gmail immediately before send.

## Build authority
**NONE.**

This target qualification does not authorize a Payabli adapter, sandbox use, VOW/QCS/DCC modification, Restate production use, or customer deployment.