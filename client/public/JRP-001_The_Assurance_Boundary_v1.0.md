# JRP-001 — The Assurance Boundary

## What JCEE Assurance Can Verify—and What It Must Refuse to Claim

**Author:** Jonathan Chadbourne, Founder, JCEE Labs  
**Version:** 1.0  
**Date:** August 13, 2026  
**Status:** Verified Milestone — Bounded Internal Verification  
**Document class:** JCEE Labs Research Publication

---

## Abstract

JCEE Labs is developing an assurance layer for consequential software and AI-directed execution.

The purpose of that layer is not to declare a system trustworthy. Its purpose is to determine what a preserved body of evidence actually supports—and to refuse conclusions that the evidence has not earned.

This paper records the first frozen JCEE Assurance / Evidence Engine milestone.

Four foundational gates have now been completed:

1. The product boundary was frozen.
2. The interface schemas and conformance fixtures were frozen.
3. A deterministic verification kernel was implemented against those unchanged interfaces.
4. An append-only evidence ledger and snapshot resolver were implemented and tested.

The resulting system can preserve evidence identities, reconstruct exact snapshots, detect the tested forms of tampering and anchored rollback, and reproduce deterministic verification results within the frozen test environment.

It cannot establish that external evidence is true merely because the evidence is well formed. It does not establish universal exactly-once execution, production readiness, legal conformity, independent certification, multi-host consensus, or correctness in environments that have not been tested.

That distinction is the assurance boundary.

## I. The Problem

A system can produce a technically valid record of something that never occurred.

A verifier can correctly evaluate malformed evidence without knowing whether valid evidence corresponds to reality.

A ledger can preserve an assertion without making the assertion true.

This creates a fundamental problem for assurance systems:

> How can a system verify evidence without quietly converting internal consistency into a claim about the external world?

JCEE Assurance is being built around a strict answer:

> Verification authority must never exceed the authority contained in the evidence.

The verifier may establish that an artifact is valid under a frozen schema, that its commitments are internally consistent, that it has not changed under the tested integrity model, and that a defined decision follows from the supplied evidence.

It may not invent missing authority.

It may not convert absence of evidence into proof of success.

It may not treat a passing internal test as external certification.

## II. The Frozen Product Boundary

The first gate, **JA-0.1-PCF — Product Contract Freeze**, established the boundary between several related but distinct systems.

- **VOW** is an evidence-first execution runtime.
- **QCS** is a separate transition-calculus research program.
- **JCEE Assurance** evaluates evidence against frozen profiles and decision rules.
- **Evidence Engine** is the broader direction for preserving, resolving, and evaluating evidence packages.

These names are not interchangeable.

A successful VOW test does not automatically validate every JCEE Assurance claim. A QCS result does not automatically activate a production assurance profile. An assurance verdict does not prove that an external event occurred unless the supplied authority is sufficient to support that conclusion.

Freezing this separation was necessary before implementation could continue.

Without a product boundary, research findings, runtime behavior, and assurance claims could gradually collapse into one overstated promise.

## III. Frozen Interfaces and Conformance Fixtures

The second gate, **JA-P0.2 — Interface Schema and Conformance Fixtures**, froze the objects that pass through the assurance boundary.

The frozen interface layer defines the forms required for:

- submitted evidence;
- verification requests;
- results and typed verdicts;
- proof packages;
- replay references;
- assurance profiles;
- profile activation;
- snapshot reconstruction; and
- VOW-facing projections.

The frozen conformance corpus contains 30 fixtures.

All **30 of 30** fixtures passed the frozen acceptance procedure.

The corpus tested:

- deterministic result construction;
- proof recomputation;
- immutable replay-reference reconstruction;
- snapshot immutability;
- typed error and verdict exclusivity; and
- refusal to activate unsupported QCS-backed profiles.

That final refusal is important.

The exact final normative digest required to bind QCS-2.0 into an assurance profile had not been supplied to this interface layer. The system therefore left those profiles blocked.

It did not infer the missing digest.

It did not substitute a description of the QCS result.

It did not treat successful reproduction and preservation of QCS-2.0 as permission to activate an unbound profile.

That refusal is a successful assurance behavior.

## IV. The Deterministic Verification Kernel

The third gate, **JA-P0.3 — Independent Verification Kernel**, implemented the verifier against the frozen interfaces.

The kernel consumed the existing fixtures without changing them.

Its frozen acceptance results were:

- **14 of 14 kernel fixtures passed**
- **500 of 500 adversarial mutations passed**
- **Cold extraction and rerun passed**
- The frozen JA-P0.2 corpus remained **30 of 30 passed**

Here, “independent” describes the separation of the verification kernel from the producing system and its obligation to consume frozen inputs unchanged.

It does not mean that an outside laboratory or certification body independently validated the product.

The kernel demonstrated deterministic behavior against the preserved corpus. It recomputed covered results instead of trusting supplied conclusions and rejected the tested mutations.

This supports a narrow claim:

> Under the frozen interfaces, fixtures, and execution conditions, the verification kernel reproduced the expected results and rejected the tested adversarial modifications.

It does not support a universal claim about every evidence source, authority, runtime, storage system, or failure mode.

## V. Immutable Evidence Ledger and Snapshot Resolver

The fourth gate, **JA-P0.4 — Immutable Evidence Ledger and Snapshot Resolver**, added preserved evidence identities and deterministic historical reconstruction.

The frozen behavior includes:

- SHA-256 content commitments;
- append-only accepted identities;
- idempotent duplicate handling;
- preserved conflict records;
- transactional event chaining;
- exact identifier, version, and digest resolution;
- byte-identical reconstruction of old snapshots;
- explicit creation of new snapshots when new evidence is admitted; and
- prohibition against creating new assurance authority during snapshot construction.

The frozen acceptance results were:

- **27 of 27 native ledger and resolver tests passed**
- **100 of 100 fresh-ledger reproductions passed**
- All reproductions produced **one unique snapshot reference**
- All reproductions produced **one unique verification-result commitment**
- **1,000 of 1,000 adversarial mutations were safely rejected or preserved as conflicts**
- **Zero malformed-evidence false acceptances**
- **Zero identity overwrites**
- **Zero false permissions**
- **24 of 24 concurrent distinct writers were accepted with zero errors**
- In the conflicting-writer test, there was **one accepted winner and 15 preserved refusals**

The system also passed the defined checks for:

- tampered content;
- tampered event chains;
- anchored rollback;
- historical snapshot replay;
- schema validation; and
- non-broadening VOW projections.

These results establish deterministic application-level ledger and snapshot behavior within the tested environment.

They do not establish physical immutability.

In this milestone, “immutable” means application-enforced append-only state supported by tamper-evident commitments and event chaining. It does not mean physical write-once storage.

Rollback detection also depends on an independently preserved expected-head anchor. If both the ledger and the only known anchor can be replaced together, this milestone does not claim that the replacement will be detected.

## VI. Admitted Claim

Under the evidence rules established by **JRP-000 — The Evidence Boundary**, JCEE Labs admits the following bounded claim:

> Within the frozen interfaces, fixtures, implementation revisions, and tested execution conditions, JCEE Assurance can deterministically validate covered evidence packages, reproduce covered verification results, preserve accepted evidence identities, reconstruct historical snapshots, and refuse the tested malformed, conflicting, tampered, or unauthorized inputs without broadening the authority contained in the evidence.

**Verdict:** Verified Milestone  
**Reproduction status:** Documented internal reproduction  
**Scope:** Frozen JA-0.1-PCF through JA-P0.4 artifacts and their preserved acceptance corpora  
**Independence status:** No external third-party certification claimed

## VII. Claims Not Admitted

This milestone does not establish:

- external-world truth;
- universal exactly-once execution;
- universal causal correctness;
- physical write-once storage;
- cryptographic signatures or identity attestation;
- multi-host consensus;
- tenant isolation;
- PostgreSQL transfer;
- hardware-crash qualification;
- remote-authority correctness;
- production readiness;
- regulatory or legal conformity;
- independent certification; or
- activation of QCS-backed assurance profiles.

These are not implied future features.

They are separate claims requiring separate evidence.

Some may later pass. Some may fail. None are admitted by this result.

## VIII. Why the Refusals Matter

The most important result in this milestone is not that the system can return a passing verdict.

It is that the system preserves the difference between:

- a valid record and a true event;
- deterministic replay and universal correctness;
- internal reproduction and independent verification;
- tamper evidence and physical immutability; and
- a preserved research result and an activated assurance profile.

Assurance systems become dangerous when those distinctions disappear.

A polished proof package can create unjustified confidence if the underlying authority is weak. A durable ledger can preserve a falsehood perfectly. A deterministic verifier can repeat an incorrect rule forever.

JCEE Assurance must therefore be able to refuse a conclusion even when every available artifact is technically well formed.

The system should not ask only:

> “Can this evidence be processed?”

It must also ask:

> “What conclusion, if any, is this evidence authorized to support?”

## IX. Next Scientific and Engineering Gates

The next gates must test boundaries that this milestone intentionally leaves open.

They include:

1. Binding the exact final normative QCS-2.0 digest before activating any QCS-backed profile.
2. Transferring the frozen ledger and resolver behavior to PostgreSQL without changing the accepted semantics.
3. Testing hardware and process interruption during evidence admission and snapshot construction.
4. Adding authenticated signatures and independently preserved anchors.
5. Testing multi-host and remote-authority behavior.
6. Separating evidence integrity from external-authority truth through controlled adversarial cases.
7. Conducting reproduction outside the originating implementation environment.

Passing those gates would strengthen specific claims.

It would not retroactively make this milestone broader than it was.

## X. Conclusion

JCEE Assurance has reached a frozen, reproducible internal milestone.

The foundational contract, interfaces, deterministic verifier, evidence ledger, and snapshot resolver now form a coherent assurance path under the tested conditions.

The system can preserve and evaluate evidence without automatically granting that evidence more authority than it contains.

That is not complete assurance.

It is the beginning of disciplined assurance.

The boundary remains explicit:

> JCEE Assurance may verify what the preserved evidence supports. It must refuse everything beyond it.

## Publication Record

**Version 1.0 — August 13, 2026**

Initial publication.

This paper records a bounded internal verified milestone. Publication does not imply independent certification, production readiness, legal conformity, or universal validity.
