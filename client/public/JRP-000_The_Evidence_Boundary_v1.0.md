# JRP-000 — The Evidence Boundary

## How JCEE Labs Admits, Limits, and Rejects Technical Claims

**Author:** Jonathan Chadbourne, Founder, JCEE Labs  
**Version:** 1.0  
**Date:** August 13, 2026  
**Status:** Adopted  
**Series:** JCEE Labs Research Papers  
**Document class:** JCEE Labs research-governance standard  
**Adoption authority:** Jonathan Chadbourne, Founder, JCEE Labs  

---

## Abstract

Technical claims tend to grow as they travel. A measured result becomes a general capability. A successful demonstration becomes proof of reliability. An internal benchmark becomes a public promise. By the time the claim reaches a customer, partner, investor, or researcher, its scope may be far larger than the evidence that produced it.

JCEE Labs will not work that way.

This paper defines the evidence boundary: the point beyond which a technical claim is not supported by the available record. It establishes the minimum requirements for admitting a claim into the JCEE Labs public record, the conditions that limit that claim, and the circumstances under which the claim must be rejected, revised, or withdrawn.

The central rule is simple:

> A claim may be narrower than the evidence hoped for. It may never be broader than the evidence obtained.

The method presented here uses explicit claim specifications, evidence receipts, mandatory admission gates, bounded verdicts, and a non-compensatory review rule. It is designed for software systems, AI-enabled systems, infrastructure, applied research, and other technical work where performance depends on conditions that can be hidden, changed, or misunderstood.

This is not a claim that JCEE Labs can remove all uncertainty. It is a commitment to name uncertainty before making a claim, preserve it when reporting results, and correct the record when the evidence changes.

---

## 1. Purpose

The JCEE Labs Charter states what we value: falsifiability, inspectable evidence, explicit limitations, disciplined claims, and the willingness to publish negative results. This paper turns those principles into an operating rule.

Its purpose is to answer five questions:

1. What exactly is being claimed?
2. What evidence is allowed to support it?
3. What conditions define the edge of that support?
4. Who can inspect or reproduce the result?
5. What happens when the evidence is weak, incomplete, contradictory, or later shown to be wrong?

The paper applies to any claim JCEE Labs presents as a research result, verified milestone, measured capability, technical comparison, or evidence-backed statement. It also applies when a private result is summarized publicly. The public summary may omit protected implementation details, but it may not claim more certainty than the underlying record supports.

This paper does not define whether a system is useful, commercially valuable, safe for every application, legally compliant, or ready for deployment. Those are separate judgments. Evidence can inform them, but one successful test cannot settle them.

### 1.1 Adoption and authority

Version 1.0 is adopted as JCEE Labs' internal and public standard for admitting, limiting, correcting, and rejecting its own technical claims. It governs JCEE Labs work beginning August 13, 2026, and applies prospectively to later research and experiment records unless a later adopted version supersedes it.

Adoption means JCEE Labs has chosen to be bound by this method. It does not make this document an external consensus standard, an independent certification scheme, or an empirical research result. Conformance by JCEE Labs must be demonstrated claim by claim; publication of this paper is not evidence that every prior or future claim satisfies it.

---

## 2. The problem: claims expand faster than evidence

Most technical overclaiming does not begin with a fabricated result. It begins with an imprecise sentence.

Consider the difference between these statements:

- “The system recovered correctly in 1,000 controlled interruption trials.”
- “The system is reliable under interruption.”
- “The system cannot lose work.”
- “The system guarantees exactly-once completion.”

The first statement can be evaluated if the test conditions and the meaning of “correctly” are available. Each statement after it adds scope. New environments, failure modes, timing conditions, dependencies, and guarantees appear without new evidence.

That expansion is the evidence boundary problem.

The problem becomes more serious when:

- the success metric is chosen after results are visible;
- failed trials are omitted;
- a test dataset overlaps with development data;
- the environment is narrower than the published language;
- a demonstration depends on manual intervention;
- a result is averaged in a way that hides a critical failure;
- the artifact cannot be inspected or reproduced;
- limitations are treated as footnotes instead of part of the claim;
- a protected mechanism is used as a reason to avoid any meaningful scrutiny.

JCEE Labs treats these as research defects, not communication issues.

The job of a research paper is not to make a system sound strong. The job is to state exactly what survived a fair attempt to prove it wrong.

---

## 3. Definitions

The following terms have specific meanings in this standard.

### 3.1 Claim

A **claim** is a falsifiable statement about a system, method, process, or result. A claim must identify what is asserted and the conditions under which the assertion is expected to hold.

“The system performs well” is not a claim under this standard. It has no defined measure, population, condition, or failure threshold.

### 3.2 Evidence

**Evidence** is a preserved observation that bears on a specified claim. Evidence can support, weaken, or contradict the claim. A result is not disqualified merely because it is negative.

### 3.3 Evidence receipt

An **evidence receipt** is the inspectable record connecting a claim to a test. At minimum, it identifies:

- the claim tested;
- the artifact or system version;
- the protocol version;
- the execution environment;
- the data or workload used;
- the time of execution;
- the output and measurements;
- known deviations from the protocol;
- the person or process responsible for the run;
- the integrity identifier for preserved artifacts, where practical.

A chart without a receipt is an illustration, not an auditable result.

### 3.4 Condition

A **condition** is any fact that can materially change the meaning of the test: hardware, software version, configuration, workload, network behavior, dependency state, data selection, time window, operator action, or failure injection method.

### 3.5 Threshold

A **threshold** is the decision boundary set before a result is judged. It defines what will count as passing, failing, or inconclusive.

### 3.6 Limitation

A **limitation** is a known reason not to extend the result beyond its tested scope. Limitations are part of the claim. They are not optional disclosures added after the conclusion.

### 3.7 Reproduction

A **reproduction** is an attempt to obtain the stated result using the disclosed procedure and artifacts. A reproduction may be internal, independent, exact, or conceptual. The paper must state which kind occurred.

### 3.8 Verification

**Verification** means that specified evidence passed the admission rules in this paper. It does not mean universal truth, permanent correctness, production readiness, certification, or immunity from later revision.

---

## 4. Claim specification

Every admitted claim must be represented as a bounded object:

\[
C = (P, D, K, M, T, X)
\]

where:

- \(P\) is the proposition being tested;
- \(D\) is the domain, population, workload, or data scope;
- \(K\) is the set of operating conditions;
- \(M\) is the measurement procedure;
- \(T\) is the acceptance threshold;
- \(X\) is the set of exclusions and known limitations.

If one of these elements is missing, the claim is incomplete.

For example:

> For version 1.4 of System A, running in Environment B, under Workload C and interruption schedule D, at least 99.5% of eligible jobs will reach the defined terminal state within 60 seconds, with no duplicate externally observed completion in the test record. Manual interventions, dependency corruption, and network partitions longer than five minutes are excluded.

That sentence is longer than “System A is interruption-safe,” but the added words are the evidence boundary. Removing them does not make the result stronger. It makes the statement less honest.

### 4.1 Claim classes

Claims are classified because different statements require different evidence.

| Class | What it asserts | Minimum evidence posture |
|---|---|---|
| Observational | What occurred in a recorded test | Complete receipt and valid measurement |
| Operational | What the system does under stated conditions | Repeated trials across the specified condition set |
| Comparative | That one method differs from another | Frozen comparison rules, equivalent conditions, and uncertainty reporting |
| Causal | That a particular factor produced an effect | A design capable of ruling out material alternatives |
| Transfer | That a result extends to a new environment or population | Direct evidence in that environment or a justified transfer argument with explicit uncertainty |
| Assurance | That failure is prevented or bounded | Adversarial testing, clear assumptions, and evidence proportional to the severity of the promise |
| Production or compliance | That a result establishes readiness, safety, or conformity | The applicable operational, legal, or certification process; a research test alone is insufficient |

An observational claim must not be published as an assurance claim. A controlled benchmark must not be published as proof of production behavior. A correlation must not be written as a cause.

---

## 5. The evidence package

A claim is reviewed together with an evidence package:

\[
E = (R, A, V, H, N)
\]

where:

- \(R\) is the set of evidence receipts;
- \(A\) is the preserved artifact set;
- \(V\) is the validation record for the measurement procedure;
- \(H\) is the history of deviations, corrections, and prior verdicts;
- \(N\) is the negative evidence, including failures and contradictory observations.

Negative evidence belongs inside the package. It must not be removed because it complicates the result.

The package should allow a qualified reviewer to answer:

- What was planned?
- What actually ran?
- What changed?
- What passed?
- What failed?
- What was excluded?
- What is still unknown?

Not every artifact must be public. Some records may contain confidential data, security-sensitive information, licensed material, or restricted implementation material. In those cases, the public paper must state what is withheld, why it is withheld, and what form of inspection remains possible. Withholding details can limit disclosure. It cannot turn an uninspectable claim into a verified one.

---

## 6. Mandatory admission gates

JCEE Labs does not admit claims by averaging strengths and weaknesses. A high benchmark score cannot cancel missing provenance. A large test count cannot repair an unfalsifiable proposition. Strong documentation cannot erase data leakage.

Admission is conjunctive:

\[
\operatorname{Admit}(C,E) = F \land Q \land P \land M \land T \land S \land L \land R
\]

The symbols represent the following gates.

### Gate F — Falsifiability

There must be an observable outcome that would count against the claim. If no practical result could cause the claim to fail, it is commentary, aspiration, or belief—not an admitted technical claim.

### Gate Q — Frozen question and decision rule

The claim, principal metric, exclusions, and threshold must be fixed before the decisive evidence is evaluated. Exploratory work is allowed and encouraged, but it must be labeled exploratory. A pattern discovered after inspecting results becomes a new hypothesis and requires a new test.

Freezing the question does not require predicting every implementation detail. It requires preventing the pass rule from moving to wherever the result landed.

### Gate P — Provenance

The evidence must be traceable to identifiable artifacts, versions, data, conditions, and execution records. A result copied into a slide, transcription without a source record, or manually assembled summary without a preserved audit trail fails this gate.

### Gate M — Measurement validity

The measurement must correspond to the claim. Proxies are acceptable only when their relationship to the claimed property is stated and defended.

Examples of measurement failure include:

- measuring response speed and concluding system reliability;
- counting completed tasks without checking duplicate effects;
- scoring model fluency and claiming factual accuracy;
- measuring an average while the claim concerns a worst-case bound;
- using a synthetic workload while describing real-world performance without validation.

### Gate T — Threshold integrity

The pass, fail, and inconclusive thresholds must be declared before the verdict. The test count and stopping rule must also be fixed or justified. Repeatedly testing until a favorable result appears fails this gate.

Thresholds must match the consequence of the claim. A low-risk exploratory result can tolerate more uncertainty than a public assurance about safety, durability, financial impact, or irreversible action.

### Gate S — Scope control

The published wording must not exceed the tested domain and conditions.

Let \(B_E\) be the boundary supported by the evidence and \(B_C\) be the boundary expressed by the claim. Admission requires:

\[
B_C \subseteq B_E
\]

When the evidence covers only a subset of the desired claim, the claim must shrink. The evidence does not expand to meet the sentence.

### Gate L — Leakage and exception review

The review must check whether test information leaked into development, tuning, prompting, selection, or scoring. It must also identify operator overrides, excluded failures, retries, fallback paths, and unplanned interventions.

An exception is not automatically misconduct. Hidden exceptions are the problem. Disclosed exceptions may narrow the result, change the verdict, or require a new test.

### Gate R — Reproducibility and limitations

The procedure must be described at the level required for its claim class, and known limitations must appear next to the conclusion they limit. If the result has not been independently reproduced, the paper must say so.

Internal reproduction can establish that a result is repeatable within one team and environment. It does not establish independence. External reproduction can strengthen a claim, but only within the scope actually reproduced.

### 6.1 Gate outcomes

Each gate receives one of four outcomes:

- **Pass:** the requirement is satisfied for the stated claim;
- **Conditional pass:** the claim can proceed only with specified narrowing or disclosure;
- **Fail:** the claim cannot be admitted in its present form;
- **Not applicable:** permitted only with a written explanation.

Any unresolved failure blocks admission. Conditional passes must be incorporated into the published claim, not left in private review notes.

---

## 7. Evidence quality scorecard

The mandatory gates decide whether a claim is eligible for admission. A separate scorecard helps compare the maturity of evidence packages and identify the next work needed.

Each dimension is scored from 0 to 4:

| Dimension | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Specification | No testable claim | Vague claim | Partial claim card | Complete claim card | Complete, preregistered claim card |
| Measurement | No valid measure | Weak proxy | Plausible but incompletely validated | Direct or validated measure | Direct measure with uncertainty and failure checks |
| Provenance | No source record | Manual summary | Partial receipts | Complete receipts | Complete, integrity-checked receipts and artifacts |
| Adversarial coverage | No challenge testing | Happy-path only | Limited failure cases | Material failure classes tested | Systematic challenge plan tied to claim scope |
| Reproducibility | Cannot be rerun | Informal rerun only | Internal repeat | Documented internal reproduction | Independent reproduction of the stated result |
| Limitation disclosure | None | Generic caveat | Some conditions named | Material limits tied to conclusion | Limits, exclusions, and unknowns are complete and prominent |

For triage, a normalized maturity score may be calculated:

\[
Q_E = \frac{\sum_{i=1}^{n} w_i d_i}{4\sum_{i=1}^{n} w_i}
\]

where \(d_i\) is a dimension score and \(w_i\) is its declared weight.

The dimension anchors, weights, and bands below are JCEE Labs governance choices. They have not been statistically calibrated and must not be interpreted as probabilities of truth, confidence, reliability, or safety.

JCEE Labs triage interpretation:

| Score | Maturity label | Meaning |
|---:|---|---|
| Below 0.50 | Insufficient | Major evidence work remains |
| 0.50–0.69 | Experimental | Useful for exploration, not a verified milestone |
| 0.70–0.84 | Candidate | May enter formal review if all gates are addressed |
| 0.85–1.00 | Review-ready | Strong package; eligible for gate review, but admission still requires every mandatory gate to pass |

The score is diagnostic. It does not admit a claim. No total, including 1.00, overrides a failed gate.

This separation matters. Compensatory scores are easy to game: teams can accumulate points in documentation or test volume while leaving the central claim poorly measured. The scorecard should direct work, not manufacture certainty.

---

## 8. Verdicts and publication language

JCEE Labs uses a controlled vocabulary. The first group describes the evidence status of a claim or investigation.

### Planned

The problem and intended investigation have been identified, but the experiment or implementation has not been frozen. No result is claimed.

### Preregistered

The hypothesis, test conditions, principal measurements, scoring rules, stopping rules, and rejection thresholds have been defined before the decisive results are observed. A preregistered experiment is ready to run. It is not a verified result.

### Experimental

Evidence exists, but the claim has not passed every applicable admission gate. Experimental results may be shared if their missing requirements and limitations are explicit.

### Verified milestone

A specific and bounded claim passed every applicable admission gate. The exact admitted wording, version, conditions, and evidence-package identifier must be published together.

“Verified milestone” is deliberately narrower than “proven.” It records that a defined result passed a defined process at a defined time.

### Inconclusive

The test did not provide enough valid information to admit or reject the claim. Causes may include insufficient observations, invalid measurement, contradictory outcomes, uncontrolled conditions, or a protocol defect.

Inconclusive is a valid verdict. It must not be rewritten as “promising” unless a separate exploratory statement is clearly identified.

### Rejected

The claim failed its declared threshold, depended on an unsupported assumption, or was contradicted by valid evidence. A rejected claim can be redesigned and tested again, but the original verdict remains in the history.

### Closed

The investigation has ended because the claim was rejected, the research question was answered, or further work no longer provides enough value to justify continuing. Closing an investigation does not change its last evidence verdict.

The second group describes the lifecycle of a published record.

### Withdrawn

A previously admitted claim is no longer supportable because of newly discovered evidence, a material defect, an invalid assumption, or loss of artifact integrity.

### Superseded

A newer, explicitly linked claim or standard replaces an earlier record. The earlier record remains available and points to its successor.

---

## 9. Negative, contradictory, and null results

JCEE Labs does not treat an unfavorable result as a failed publication.

A negative result can reveal:

- that the proposed mechanism does not produce the expected effect;
- that the effect is smaller or less stable than expected;
- that the test cannot distinguish between competing explanations;
- that an environmental condition controls the outcome;
- that the metric does not measure what the team thought it measured;
- that the claim needs to be divided into narrower claims.

The correct response is to preserve the result and change the claim.

If multiple valid tests disagree, the contradiction must be visible in the evidence package. The paper should identify the most plausible sources of variation without selecting a preferred result merely because it supports the desired conclusion.

Null results require the same discipline. “No effect observed” does not automatically mean “no effect exists.” The conclusion must account for the sensitivity of the measurement, the tested range, and the amount of uncertainty.

---

## 10. Corrections and revision history

Evidence-based publication is not complete at release. It includes a correction process.

Every admitted claim must have:

- a stable identifier;
- a version number;
- a publication date;
- a link to its evidence index entry;
- a visible status;
- a revision history.

Material corrections must describe:

1. what changed;
2. why it changed;
3. which evidence or assumption was affected;
4. whether the verdict changed;
5. which later documents rely on the corrected claim.

Silent replacement is not correction. Earlier versions should remain inspectable unless removal is required for law, privacy, security, or another documented reason. When removal is necessary, the record should retain a notice that material existed and explain the category of reason for removal.

The standard for issuing a correction is not embarrassment. It is whether a reasonable reader would interpret the claim differently after learning the new information.

---

## 11. Public evidence and restricted material

Serious scrutiny does not require reckless disclosure.

JCEE Labs may protect source code, non-public implementation details, security details, private datasets, customer information, internal credentials, and licensed material. But protection creates a narrower public evidence posture; it does not create an exemption from evidence.

When full disclosure is not possible, the publication must state:

- the category of material withheld;
- why disclosure is limited;
- whether a qualified third party inspected it;
- which parts of the result remain publicly reproducible;
- which parts depend on trust in an internal or confidential review;
- how the limitation affects the verdict.

Permitted alternatives may include:

- a redacted protocol;
- hashed or signed artifact manifests;
- a sealed third-party review;
- synthetic or de-identified test data;
- a public harness against a protected implementation;
- delayed disclosure after a legal or security milestone;
- publication of outputs and failure records without enabling implementation detail.

None of these alternatives is equivalent to full public reproduction. The paper must not imply that it is.

This distinction protects responsible confidentiality and the credibility of the research record.

---

## 12. Worked example: a bounded interruption claim

The following example is intentionally generic. It demonstrates the method without describing a protected JCEE Labs implementation.

### 12.1 Proposed claim

> The job processor is failure-proof.

This claim is rejected before testing. “Failure-proof” has no practical boundary, includes undefined failure classes, and implies a universal assurance that cannot be established by a finite test.

### 12.2 Bounded claim card

**Proposition:** Eligible jobs interrupted during active processing reach one terminal state after the processor restarts, without more than one externally observed completion event.

**Artifact:** Processor build 0.8.3 and harness 0.4.1.

**Domain:** 10,000 generated jobs from the declared workload profile, with payload sizes from 1 KB to 10 MB.

**Conditions:** Single-node Linux test environment; interruption occurs at one of five declared execution windows; restart begins within 30 seconds; dependencies remain reachable.

**Measure:** Terminal-state count, externally observed completion-event count, and time to terminal state.

**Threshold:** At least 99.9% of eligible jobs reach one terminal state within 120 seconds; zero jobs produce more than one externally observed completion event.

**Exclusions:** Permanent storage corruption, operator modification of records, dependency outage longer than five minutes, and concurrent configuration change.

**Decision rule:** Any duplicate observed completion fails the claim. If more than ten eligible jobs do not reach a terminal state within 120 seconds, the claim fails. A harness defect affecting classification makes the result inconclusive.

### 12.3 Evidence

Suppose the test produces the following result:

- 10,000 trials executed;
- 9,996 reached one terminal state within 120 seconds;
- four reached one terminal state after 120 seconds;
- no duplicate externally observed completion events;
- one protocol deviation occurred, but it affected an ineligible setup run and was preserved in the receipt set;
- the full run was repeated internally with the same verdict;
- no independent reproduction occurred.

### 12.4 Verdict

The proposed threshold required at least 9,990 timely terminal states and zero duplicate observed completions. The measured result passed those thresholds.

The admitted statement is therefore:

> In two documented internal runs of the declared 10,000-job interruption protocol, Processor 0.8.3 exceeded the 99.9% terminal-state threshold and produced no duplicate externally observed completion events under the stated environment and exclusions. The result has not been independently reproduced.

The following statements are not admitted:

- “The processor is failure-proof.”
- “The processor guarantees exactly-once behavior.”
- “No work can ever be lost or duplicated.”
- “The result applies to multi-node production environments.”
- “The result proves safety during storage corruption or prolonged dependency failure.”

Those sentences cross the evidence boundary.

### 12.5 What happens next

The evidence suggests clear next tests: prolonged dependency failure, concurrent configuration change, storage faults, multi-node behavior, and independent reproduction. Each requires a new claim card. The successful first result does not pre-admit the next one.

---

## 13. Review responsibilities

The author of a claim is responsible for specifying it. The reviewer is responsible for trying to find where it breaks.

A reviewer should ask:

- What result would prove this statement wrong?
- Was that result possible under the protocol?
- Did the team see the data before fixing the decision rule?
- Are all material failures present in the package?
- Does the measure directly support the noun and verb used in the conclusion?
- Which words in the public sentence extend beyond the test?
- Could a reader mistake an internal repeat for independent reproduction?
- Are the limitations visible without searching an appendix?
- Would the verdict change if the worst valid result were emphasized instead of the average?

Review is not complete when the paper sounds reasonable. It is complete when the connection between sentence and evidence is inspectable.

No reviewer should approve a claim solely because of the author's title, prior success, reputation, or ownership of the system. Authority may determine responsibility. It does not determine whether a result is true.

---

## 14. Limits of this standard

This method has limits.

First, it cannot eliminate judgment. Researchers still choose questions, conditions, measures, thresholds, and exclusions. The method makes those choices visible; it does not make them automatically correct.

Second, reproducibility can confirm a stable procedure while preserving a shared blind spot. Multiple teams can reproduce the wrong measure.

Third, evidence can become stale. Software, dependencies, workloads, threats, and operating environments change. A claim must be tied to versions and dates because its support can decay.

Fourth, public evidence may remain incomplete when disclosure is restricted. A transparent limitation is better than concealed dependence, but it still limits independent confidence.

Fifth, no finite test establishes a universal guarantee across all possible conditions. Formal proof can establish properties within a formal model, but the connection between the model and a deployed system still requires evidence.

Finally, process can become theater. A team can produce claim cards, receipts, and scorecards without exercising real skepticism. The defense against that failure is cultural: reviewers must be rewarded for finding limits, authors must be willing to narrow their own conclusions, and negative results must remain publishable.

---

## 15. Conclusion

JCEE Labs will make ambitious claims only when the evidence earns them.

That means defining the claim before judging the result. It means preserving the failures. It means treating scope, exclusions, uncertainty, and reproduction status as part of the conclusion. It means correcting the record in public. It also means accepting that some of our strongest work may initially produce a narrow statement.

Narrow is not weak. A narrow claim with a complete evidence trail is more useful than a sweeping claim that cannot survive inspection.

The evidence boundary is where our authority ends. Past that line, we may have a hypothesis, a design intention, a commercial goal, or a conviction. We do not yet have a verified claim.

The rule remains:

> A claim may be narrower than the evidence hoped for. It may never be broader than the evidence obtained.

---

## Appendix A — Claim card template

**Claim identifier:**  
**Claim version:**  
**Owner:**  
**Date frozen:**  
**Claim class:**  

**Proposition \(P\):**  
What exact statement is being tested?

**Domain \(D\):**  
Which systems, versions, populations, data, or workloads are covered?

**Conditions \(K\):**  
Under which environmental, operational, and dependency conditions should it hold?

**Measurement \(M\):**  
What will be observed, with what instrument or procedure, and with what uncertainty?

**Threshold \(T\):**  
What counts as pass, fail, or inconclusive?

**Exclusions and limitations \(X\):**  
What is outside the claim, and what remains unknown?

**Failure condition:**  
What specific result would count against the claim?

**Stopping rule:**  
When does data collection end?

**Artifact set:**  
Which versions, manifests, data, and protocols are required?

**Reproduction requirement:**  
Internal, independent, exact, conceptual, or not yet required?

**Disclosure constraints:**  
What, if anything, cannot be public, and how will that limit the verdict?

---

## Appendix B — Admission checklist

- [ ] The claim is falsifiable.
- [ ] The claim card is complete.
- [ ] The principal metric and threshold were fixed before decisive evaluation.
- [ ] The stopping rule was fixed or justified.
- [ ] Artifact, data, protocol, and environment versions are identified.
- [ ] Evidence receipts are complete and preserved.
- [ ] The measurement corresponds to the published claim.
- [ ] Uncertainty and sensitivity are reported where material.
- [ ] Leakage, exclusions, retries, and operator interventions were reviewed.
- [ ] Negative and contradictory results are included.
- [ ] The public wording is no broader than the tested scope.
- [ ] Limitations appear next to the conclusion they limit.
- [ ] Reproduction status is stated accurately.
- [ ] Protected or withheld material is identified by category.
- [ ] Every applicable admission gate passed.
- [ ] The verdict and revision history have stable identifiers.

---

## Appendix C — Publication record

Each adopted JCEE Labs research or experiment record must publish the following record:

| Field | Required entry |
|---|---|
| Paper identifier | Stable JRP number |
| Version | Semantic document version |
| Document status | Draft, adopted, withdrawn, or superseded |
| Claim or investigation status | Planned, preregistered, experimental, verified milestone, inconclusive, rejected, or closed, when applicable |
| Claim identifiers | Every formal claim addressed |
| Evidence identifiers | Receipts or evidence packages supporting the verdict |
| Artifact availability | Public, restricted, sealed review, delayed, or unavailable, with reason |
| Reproduction status | None, internal, or independent, with scope |
| Limitations | Prominent summary and detailed location |
| Revision history | Date, change, reason, and affected claims |

---

## References

These sources inform the surrounding reproducibility and governance context. JRP-000 is an original JCEE Labs policy and does not claim certification by, endorsement from, or formal conformance to any cited organization.

1. Nosek, B. A., Ebersole, C. R., DeHaven, A. C., & Mellor, D. T. (2018). “[The preregistration revolution](https://www.pnas.org/doi/10.1073/pnas.1708274114).” *Proceedings of the National Academy of Sciences*, 115(11), 2600–2606.
2. Munafò, M. R., et al. (2017). “[A manifesto for reproducible science](https://www.nature.com/articles/s41562-016-0021).” *Nature Human Behaviour*, 1, 0021.
3. National Institute of Standards and Technology. (2023). “[Artificial Intelligence Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf).” NIST AI 100-1.
4. Association for Computing Machinery. “[Artifact Review and Badging — Current](https://www.acm.org/publications/policies/artifact-review-and-badging-current).” ACM Publications Policies.

---

## Revision history

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | August 13, 2026 | Draft for review | Initial complete draft |
| 1.0 | August 13, 2026 | Adopted | Reconciled the public status vocabulary; separated claim verdicts from record lifecycle states; clarified adoption authority and the non-statistical role of the scorecard; replaced disclosure language with public-safe terminology; adopted as the governing JCEE Labs claim-admission standard. |



