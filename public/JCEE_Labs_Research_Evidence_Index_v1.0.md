# JCEE Labs Research & Evidence Index

**Version 1.0 — August 13, 2026**

## Evidence Before Claims

JCEE Labs was founded on a simple position: increasingly capable systems should not be trusted based on demonstrations, promises, or appearances alone.

Their actions should produce evidence.

That principle also applies to our own work. We do not treat an idea as an invention, an experiment as a result, or a successful test as a universal claim. Every public claim should be limited to what the available evidence can actually support.

This index records the status of our work, the evidence behind it, its known limitations, and what remains unproven.

It exists so that our claims cannot quietly become stronger than our results.

---

## I. Evidence Classifications

Every JCEE Labs research program and technical claim is assigned a public status.

### Planned

The problem and intended investigation have been identified, but the experiment or implementation has not been frozen. No result is claimed.

### Preregistered

The hypothesis, test conditions, scoring rules, stopping rules, and rejection thresholds have been defined before results are observed. A preregistered experiment is ready to run. It is not a verified result.

### Experimental

The work has produced results, but reproduction, transfer testing, adversarial review, or independent verification remains incomplete. Experimental findings may guide further work. They are not presented as established facts.

### Verified Milestone

A specific and bounded claim has survived its defined verification process, and the supporting evidence has been preserved. “Verified” applies only to the claim and conditions identified. It does not mean universally proven, independently certified, or production-ready in every environment.

### Rejected

The claim failed its stated threshold, depended on an unsupported assumption, or could not be reproduced under the required conditions. Rejected results are preserved. They are not rewritten as successes.

### Closed

The investigation has ended because the claim was rejected, the research question was answered, or further work no longer provides enough value to justify continuing.

---

## II. Current Work

### VOW

**Classification:** Evidence-first execution runtime  
**Status:** Verified milestone; active hardening

VOW is a runtime designed for consequential software and AI-directed actions where interruption, retry, incomplete information, and external effects can create uncertainty.

Its purpose is to make execution inspectable, resumable, and accountable through durable evidence.

A pinned VOW 1.1 release has completed a bounded internal verification milestone. The release identity and supporting test record have been preserved.

Current work is focused on independent reproduction and the hardening required for real external integrations.

**What this status supports:**

- A defined VOW 1.1 release exists.
- Its preserved verification corpus completed the required release gate.
- The runtime can produce durable evidence about covered executions.
- Recovery behavior has been tested under the conditions included in that corpus.

**What this status does not claim:**

- Independent third-party certification
- Universal protection against every possible failure
- Legal or regulatory compliance by default
- Enterprise production readiness in every environment
- Validation against every external authority or provider

### QCS

**Classification:** Workflow-free transition calculus research
**Status:** Frozen candidate; independent reproduction

QCS is a separate JCEE Labs research program studying when available evidence is sufficient to justify a system transition.

The QCS 1.x line has been frozen as a candidate specification. QCS-2.0 is focused on independent reproduction against materially different execution environments without changing the frozen reasoning.

This status supports the existence of a defined candidate specification and an active reproduction program. It does not establish universal transfer, production readiness, or independent certification.

QCS is research. It is not the VOW product release, and the two names are not interchangeable.

### Independent Runtime Reproduction

**Classification:** Execution-assurance validation
**Status:** Active validation

This work tests whether bounded execution-assurance claims survive outside the environment in which they were first developed.

The current gate requires reproduction against independently authoritative systems while preserving the frozen decision standard.

A successful result would apply only to the tested environments and conditions. No universal claim has been admitted.

### Procedural Execution Science

**Classification:** Foundational research  
**Status:** Experimental

This program investigates whether reusable structural rules can improve execution across different tasks and failure mechanisms.

The work studies a small set of procedural roles:

- **Observe**
- **Intervene**
- **Condition**

The research question is whether arrangements of these roles produce predictable effects across different task families, rather than merely describing a result after it occurs.

Some experiments have produced promising internal results. Transfer, reproduction, and rejection testing are still active.

JCEE Labs does not currently claim that a general procedural grammar has been established.

### AEEL

**Classification:** Edge execution research  
**Status:** Experimental prototype

AEEL is a separate research program focused on evidence-producing AI execution for local, offline, and resource-constrained devices.

Its intended environment includes edge computers, embedded systems, and air-gapped deployments where cloud-dependent assumptions may not hold.

Current work includes local inference routing, tamper-evident execution records, replay verification, and signed evidence envelopes.

Hardware-backed signing and physical-device recovery testing remain incomplete. AEEL should therefore be understood as an experimental system, not a production-ready edge platform.

AEEL is separate from VOW. The two programs may share engineering principles, but they do not share the same identity or present evidence status.

---

## III. What Counts as Evidence

JCEE Labs does not treat screenshots, demonstrations, generated explanations, or passing examples as sufficient evidence by themselves.

Depending on the claim, an acceptable evidence package may include:

- A frozen specification
- A pinned source revision
- Defined inputs and expected outputs
- Test results and failure records
- Adversarial cases
- Reproduction instructions
- Environment and dependency information
- Hashes or checksums
- Execution receipts
- Known limitations
- Rejected or contradictory results

The required evidence depends on the claim being made. A narrow claim may require a narrow test. A broad claim requires stronger reproduction, transfer, and independent scrutiny.

The wording of the claim must remain inside the boundary established by the evidence.

---

## IV. Failed and Negative Results

Negative results are part of the research record.

When a claim fails, we preserve what failed, why it failed, and what changed afterward. We do not silently alter the original threshold or present a redesigned experiment as proof that the earlier version succeeded.

JCEE Labs intends to publish meaningful negative and contradictory results alongside successful ones whenever responsible disclosure permits.

A failed test can still produce useful knowledge. It cannot be counted as a pass.

---

## V. Public Evidence and Responsible Disclosure

Evidence-first research does not require making every working artifact public.

JCEE Labs will publish enough information to make public claims understandable, bounded, and open to scrutiny while practicing responsible disclosure.

When a result cannot be reproduced from the public record alone, that limitation will be stated directly.

An internal evidence package should not be mistaken for independent verification.

---

## VI. Product and Research Separation

JCEE Labs works across both products and research programs.

A product may use findings from a research program, but the existence of the product does not prove the research claim. Likewise, a promising experiment does not make a system production-ready.

We will identify which work is:

- A product
- A prototype
- A research program
- A verified milestone
- An active experiment

These categories will not be used interchangeably.

---

## VII. Our Standard

Before a claim becomes part of JCEE Labs, it must survive verification.

Enthusiasm is never sufficient evidence.

Ideas are welcomed freely. Beliefs are admitted reluctantly.

When the evidence changes, the claim changes with it.

---

## Revision History

### Version 1.0 — August 13, 2026

- Initial publication.
