# A Research Result Needs a Boundary

Company blog · JCEE Labs · 2026-10-05 · Version 1.0

Our BB84 preprint now has a dedicated reading page. Here is how to distinguish what its results establish, what the model assumes, and what remains open.

## A paper is more than its headline

A research headline names a question. A mathematical result answers a specified version of that question, under specified assumptions. Removing those assumptions can make a short summary sound broader while making it less accurate.

JCEE’s public preprint, Classical Communication in BB84 Monogamy Games: Perfect Recovery and One-Message Bounds, asks how much classical communication two separated holders of quantum side information need to recover the same complete BB84 measurement outcome after a public basis reveal.

The dedicated paper page brings the released manuscript, its identity, and its limits together. The manuscript remains the authorized October 1, 2026 v0.4-P2 release. Adding a page is a publication step, not a new theorem or a revision of the accepted claims.

## Keep the result attached to its model

The paper establishes an exact perfect-recovery cost of n classical bits for an n-bit outcome under finite-round classical interaction, together with a bounded-error converse. It also gives one-message lower and upper bounds that meet when the communication budget is n − 1 bits. In that family, the optimal success probability is cos²(π/8).

These statements concern simultaneous recovery of the complete outcome string. The model permits arbitrary finite-dimensional prior entanglement prepared independently of the later basis choice, excludes post-split quantum communication, and uses the manuscript’s worst-case classical communication accounting. They should not be casually translated into claims about every quantum communication task.

The exact equations, definitions, and proofs live in the paper. The overview is a guide to reading them, not a substitute for them.

## An exact family is not the whole frontier

Solving the perfect-recovery cost does not settle every limited-budget guessing problem. The general one-message interior frontier, interactive near-full recovery for n ≥ 3, and the exact physical one-message (3,1) case remain open. Those limits belong beside the result, not out of sight beneath a broad success claim.

It is equally important not to erase what has been established. Clear boundaries preserve both sides: the stated results remain intact, and the unresolved questions remain unresolved. This website release neither expands nor automatically narrows the accepted mathematical claims.

## Publication and review are different milestones

The manuscript is a public preprint. No independent human expert review was obtained; it is not a peer-reviewed publication. Making it available to readers does not establish independent validation, novelty, priority, or a deployed cryptographic system.

A stable version and a PDF checksum let readers identify the exact artifact being discussed. That makes a subsequent comment or correction easier to connect to the relevant text. It does not replace substantive review.

We want the reader to be able to ask three simple questions and find direct answers: What is the claim? Under what assumptions? Which version contains the proof? The new paper page is organized around those questions.

## Continue reading

- [Read the BB84 paper and download v0.4-P2](https://jceelabs.com/research/bb84-communication)
- [The Evidence Boundary](https://jceelabs.com/research/jrp-000)
- [Explore JCEE research](https://jceelabs.com/research)
