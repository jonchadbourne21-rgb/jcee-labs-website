# CRUCIBLE P0.2: a bounded result, with conventional parity

Research brief · JCEE Labs · 2026-09-14 · Version 1.0

What the latest synthetic benchmark supports—and why the conventional comparator belongs beside the result.

## The question

CRUCIBLE P0.2 examined whether a bounded set of semantic capabilities could support correct verdicts in a frozen synthetic payment corpus and transfer to a held-out repository/deployment corpus. It also tested a conventional composite, so a successful JCEE result would not be mistaken for exclusive differentiation.

## Recorded results

The September 14 R52 terminal review records 96 of 96 exact payment verdicts and 64 of 64 first-run held-out verdicts for the full candidate. A Go implementation reproduced all 160 verdicts without importing the Python/JCEE runtime.

The conventional composite also matched all 160 verdicts. It used 26 executable lines of code compared with 31 for the full candidate, with 20 predicates and seven durable fields in each. It did not trigger the preregistered burden threshold, but the outcome remains conventional parity rather than an exclusive JCEE mechanism.

## Adversarial and ablation checks

The review records 3,072 evaluator-private mutations with zero common-oracle changes and detection of all 64 deliberately contaminated sentinel batches. Across exhaustive subsets of the six tested capabilities, the complete set was the sole perfect minimal subset in the frozen payment corpus.

That establishes a bounded property of this experiment. It is not a proof that the same set is necessary or sufficient for every real-world system.

## What remains open

The terminal classification is PASS_BOUNDED_SEMANTIC_KERNEL / CONVENTIONAL_PARITY. The result does not establish novelty, production safety, independent-team replication, or unification of the JCEE product portfolio.

The Go result is language/runtime reproduction, not independent-team verification. The P0.2 GitHub CI gate is recorded as NOT_RUN. Operational integration burden and real-system evaluation remain separate questions.

## Source and publication status

Source: JCEE Component Capability Review R52, September 14, 2026, 09:51:52 UTC, and canonical register v1.92/R52. This is an author-reported public research brief, not a peer-reviewed paper or a new rerun. The full experiment and private evaluation artifacts are retained separately for controlled review.
