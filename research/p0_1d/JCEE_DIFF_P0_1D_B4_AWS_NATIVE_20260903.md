# JCEE-DIFF-P0.1D — B4 AWS-Native Composition Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Comparator: `JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`
Benchmark selection: B4 — AWS-native composition

## Target workflow
A consequential operation is orchestrated in AWS using a Standard Step Functions Workflow. Authorization is checked through Amazon Verified Permissions. Concurrency and state mutation are controlled through DynamoDB conditional writes/transactions where applicable. CloudTrail/EventBridge provide audit/event evidence where supported.

The attack asks whether a realistic AWS-native composition closes the entire comparator without introducing a substantial bespoke closure subsystem.

## Strongest-faithful native composition
Grant the workflow all legitimate documented controls:
- Step Functions **Standard** workflow exactly-once execution model and execution history;
- idempotent `StartExecution` behavior for Standard workflows using the same name/input while running and closed-name rejection during the name-retention period;
- state-machine version/alias pinning where appropriate;
- DynamoDB conditional writes/version checks;
- DynamoDB `TransactWriteItems` atomicity and `ClientRequestToken` idempotency;
- Amazon Verified Permissions `IsAuthorized` / `IsAuthorizedWithToken`, Cedar policies, explicit principal/action/resource/context;
- restricted IAM/service roles needed by the workflow;
- CloudTrail management/data events when configured for the relevant APIs;
- EventBridge retries/DLQ when event delivery is part of recovery;
- target re-query through native APIs where the target exposes authoritative resource state.

Not granted as native closure:
- a bespoke operation-ownership ledger specifically invented for this benchmark;
- a custom cross-service commit protocol that independently reimplements the comparator;
- application code that turns eventual Verified Permissions policy propagation into an immediate-revocation fence using an unrelated new authority store.

## Primary official evidence
1. Step Functions workflow-type docs: Standard Workflows use an exactly-once workflow execution model, persist execution state, and are suited to non-idempotent actions; states/tasks are not run more than once unless Retry behavior is specified. https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html
2. `StartExecution`: Standard executions are idempotent for same name+input while running; closed execution name reuse is rejected and names are reusable after 90 days. https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html
3. DynamoDB `TransactWriteItems`: `ClientRequestToken` makes identical transactions idempotent, but the token is valid for 10 minutes; changed parameters produce `IdempotentParameterMismatch`. https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html
4. DynamoDB optimistic locking/conditional writes: version conditions detect stale concurrent updates and fail the write. https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BestPractices_OptimisticLocking.html
5. Amazon Verified Permissions `IsAuthorized`: authorization is evaluated from principal/action/resource/context against determining policies. https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_IsAuthorized.html
6. Verified Permissions update/create APIs explicitly state the service is eventually consistent and changes can take a few seconds to appear in other operations. https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_UpdatePolicy.html
7. `IsAuthorizedWithToken`: identity tokens remain usable until expiration; token revocation/resource deletion do not invalidate the token in the policy store before expiry. https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_IsAuthorizedWithToken.html
8. CloudTrail: Event history is immutable/searchable for management events, but CloudTrail log files are not an ordered stack trace and duplicate log events can occur. https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html and https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-events.html
9. EventBridge retries target delivery; service event delivery may be best-effort or at-least-once depending on source, and duplicate target invocation can occur in rare cases. https://docs.aws.amazon.com/eventbridge/latest/ref/event-delivery-level.html and https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-troubleshooting.html

## H01–H14 matrix

| Case | Judgment | Strongest-faithful finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL for immediate-revocation workflows | Verified Permissions policy changes are explicitly eventually consistent. A recently revoked policy can therefore remain invisible for a propagation interval. |
| H02 revoke after accepted authorization | CLOSED_NATIVE under bounded token/request semantics, but no cross-service atomicity | An already valid token/request can legitimately remain valid under documented semantics; however, AVP authorization is not atomically committed with the later target effect. |
| H03 authority ABA/incarnation | RESIDUAL / workflow-specific | AVP does not expose a Zanzibar-style caller-selected authorization revision token that can be atomically bound to the subsequent target transaction. Application context can carry versions, but constructing an end-to-end incarnation fence is application design. |
| H04 material dependency mutation | CLOSED_NATIVE where dependency is the same DynamoDB transactional/conditional state | Conditional writes and transactions can reject stale versions. Arbitrary external dependencies remain outside this closure. |
| H05 dependency ABA | CLOSED_NATIVE where explicit version/incarnation is stored in DynamoDB and checked; otherwise RESIDUAL | DynamoDB can enforce version equality, but the application must model the relevant version. |
| H06 target-state race | CLOSED_NATIVE for DynamoDB-resident targets | Conditional writes/OCC/transactions reject stale concurrent target state. External targets require their own native CAS/idempotency semantics. |
| H07 concurrent same-operation workers | STRONGLY CLOSED_NATIVE at Standard Workflow identity boundary; workflow-specific at external sink | Standard StartExecution name/input and exactly-once workflow semantics materially reduce duplicate orchestrators. DynamoDB conditions can serialize native state mutations. If the final effect is external and a Task is retried, target ownership still depends on target semantics. |
| H08 crash after commit/before response | CLOSED_NATIVE for AWS-managed state transitions with durable Step Functions/DynamoDB state; RESIDUAL at arbitrary external sink | Step Functions state/history and DynamoDB authoritative reads can close AWS-native effects. A nontransactional external target that commits before a task response can still require target reconciliation. |
| H09 lost response | Same as H08 | Strong for AWS-native target APIs with authoritative re-query/idempotency; not universally closed for arbitrary external effects. |
| H10 duplicate retry | CLOSED_NATIVE_WITH_COST | Step Functions identity plus DynamoDB conditions/transaction token can close many duplicate paths; DynamoDB ClientRequestToken is only a 10-minute idempotency window, so durable operation identity beyond that needs target/state modeling. |
| H11 material-state host unavailable | CLOSED_NATIVE_WITH_COST | Managed service failures surface as task/API failure and workflow can retry/abstain; no permission is created from missing state. Availability behavior depends on service integration/retry policy. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE fail/error for unavailable AVP call; evidence services are asynchronous | Workflow can fail closed on authorization API failure. CloudTrail/EventBridge are not synchronous authorization evidence gates. |
| H13 partial/batch ambiguity | CLOSED_NATIVE for a single DynamoDB transaction; RESIDUAL across multiple nontransactional services | DynamoDB transaction atomicity closes in-region transactional item groups, but Step Functions across independent service effects is a saga/orchestration boundary, not a general atomic batch. |
| H14 recovery permission ambiguity | RESIDUAL for whole composition | Step Functions can encode recovery logic and AVP can authorize recovery actions, but native services do not atomically establish both what an arbitrary external prior effect did and that current authority permits the chosen recovery action. |

## Four-property matrix

| Property | Judgment |
|---|---|
| Current authority | RESIDUAL for immediate revocation because Verified Permissions policy state is eventually consistent; bounded token validity is documented and honored |
| Exact effect binding | STRONG native closure for DynamoDB/Step Functions-contained effects; target-dependent for external effects |
| Unique execution ownership | STRONG at Standard Workflow execution identity; target-dependent after explicit Task retries/external sinks |
| Independently verifiable receipt closure | STRONG for AWS-native resources via execution history + authoritative resource state; CloudTrail/EventBridge are corroborating but asynchronous/unordered and can duplicate |

## Mandatory execution-ownership analysis
1. Standard Step Functions is materially stronger than a generic durable-worker system for workflow identity: Standard execution is exactly-once and same running name+input is idempotent.
2. This can identify one Workflow Execution ARN/history as the owner of orchestration.
3. It does not automatically mean every external side effect invoked by retried Task logic has one native effect owner; the final service must provide suitable semantics.
4. CloudTrail can identify API actors/calls, but its event stream is not ordered and can contain duplicate events; it is audit evidence, not a synchronous ownership lock.
5. For a consequential effect entirely inside a conditional DynamoDB transaction and one Standard execution, AWS closes far more of the comparator than JCEE should claim as unique.

## Mandatory ambiguity/recovery analysis
The AWS composition is the strongest documentary falsifier in Step 2 because it can combine exactly-once durable workflow identity, conditional/transactional state, idempotent requests, authorization, authoritative resource reads, and audit history.

The residual remains at boundaries that are not one AWS transactional authority/effect domain: AVP policy revocation is eventually consistent; authorization decision and later external target effect are not one atomic operation; and recovery of arbitrary external effects still requires target-side observation/idempotency. A custom DynamoDB authority/effect/ownership ledger could close more, but under the frozen comparator that becomes bespoke comparator logic and cannot be called an AWS-native guarantee merely because DynamoDB can store it.

## Technical verdict

**`RESIDUAL_PROPERTY`**

Exact residual:
> The strongest-faithful AWS-native composition closes durable workflow ownership, target concurrency, idempotency, and evidence very strongly when the consequential state is contained inside AWS services such as Step Functions and DynamoDB. It does not natively provide one atomic current-authority-to-external-effect boundary: Verified Permissions policy changes are eventually consistent, and arbitrary external commit-before-ack effects still require target-specific reconciliation. Closing that union generally requires application-defined cross-service binding state or a bespoke closure protocol.

## Differentiator impact
This result kills any broad claim that JCEE uniquely combines durable execution, OCC, idempotency, workflow ownership, and audit evidence. AWS can compose those properties natively to a substantial degree. The possible residual is narrower: **causally/currently authorized exact consequential effect + unique ownership + independently provable ambiguity/recovery closure across service boundaries that do not share one native transaction.**

## Integration-burden observation
AWS can approximate/close much of the comparator, but the burden rises as the target moves outside DynamoDB/Step Functions transactional semantics. The residual must later be tested against economic importance; architectural elegance alone is not enough.

## Economic status
`NOT_EVALUATED_STEP_2`.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-B4-AWS-NATIVE`
- validity: comparator and benchmark frozen before adjudication
- native judgment: strongest-faithful AWS documentary composition
- cross-program judgment: H01–H14
- independence: official AWS documentation; no live AWS hostile harness in Step 2
- claim ceiling: bounded documentary residual across cross-service current-authority/external-effect boundary

## Claim ceiling
No claim that AWS cannot close a concrete workflow. Many AWS-contained workflows can be closed natively. The packet only identifies the residual left by the documented strongest-faithful composition for a consequential effect crossing authorization/orchestration/target service boundaries.