# QCS-2.0: reproducing a frozen specification

Technical report · JCEE Labs · 2026-09-14 · Version 1.0

A public report of the August 13 reproduction across transactional and remote network authorities, including the preserved harness failure.

## Abstract

QCS studies whether current authoritative evidence justifies a proposed transition. The August 13, 2026 final reproduction receipt records a successful implementation of its frozen specification across two tested authority classes: PostgreSQL transactional authority and a remote network-effect authority. The result supports the named reproduction gate within its tested scope.

This report summarizes that preserved receipt. It introduces no new experimental result and has not been peer reviewed. An implementation constructed separately from earlier QCS implementations is not, by itself, independent-team replication.

## Question and method

The question was whether the frozen specification could reproduce its authority, legality, evidence, recovery, and commit semantics on substantially different execution substrates without changing the calculus.

Grammar, judgments, proof-object and evidence semantics, the authority model, the substrate contract, recovery semantics, and conservative UNKNOWN / WAIT behavior remained frozen. Adapter translation was allowed; authority-specific exceptions in the verifier were not.

The reproduction implementation was constructed from the frozen normative specification. The final receipt states that the earlier QCS-1.8 shadow, VOW integration, and SQLite reproduction implementations were not imported as the QCS-2.0 implementation.

## Transactional authority result

The PostgreSQL evaluation covered current-state commit, stale-proof rejection, rollback, repeated stale-proof attacks, and concurrent writers. The reported adversarial soak used 50 rounds with 16 writers per round: 800 attempts, exactly 50 winners, 750 stale losers, and zero errors.

The receipt also records 100 stale-proof attacks rejected and zero unsafe commits. These counts apply to the described campaign; they do not establish a universal failure probability.

## Remote authority result

The remote evaluation used a separate private GitHub repository as a network authority. It exercised duplicate-create refusal, lost client responses after remote commit, process restart and reconciliation, delayed responses, stale replicas, conflicting state, concurrent clients, partitions, and reconnection.

The final combined soak reports 18 of 18 trials passed, 18 partition WAIT decisions, zero executions while the authority was unreachable, 18 authority overrides, 18 duplicate refusals, and zero unsafe duplicate remote effects.

## The failure that remains part of the record

The first Stage 5D campaign produced two harness failures associated with immediate post-write observation. Subsequent independent re-observation found a matching payload and exactly one remote commit.

The harness was corrected to verify successful writes against immutable authority commit identity instead of assuming immediate convergence through a mutable branch reference. The failed run was preserved. The QCS normative specification did not change, and the corrected campaign passed. This distinction matters: a harness repair is part of the experimental history, not a reason to erase a failure.

## Conclusion and limits

The recorded result is PASS for the planned frozen-specification reproduction gate across the two tested authority classes. It supports keeping the QCS-2.0 core frozen while directing further work toward reproduction, formalization, implementation, and evidence tooling.

It does not establish universal correctness, production safety, independent certification, performance on every substrate, or success under every failure model. Further claims need their own tests.

## Source record

QCS-2.0 — Frozen Specification Reproduction Final Receipt, August 13, 2026, status PASS. The technical freeze remains carried forward in the September 14 canonical review. This public report omits private repository identities and restricted archive contents. Review inquiries can be made through the research partnership page.
