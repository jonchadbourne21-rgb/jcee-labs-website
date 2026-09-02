# JCEE Labs — Career Portfolio Demonstrator

This repository area is a **recruiting-only, deliberately non-proprietary technical demonstrator** created to show Jonathan Chadbourne's engineering approach without publishing protected JCEE Labs source code, schemas, fixtures, attack corpora, algorithms, or private release artifacts.

JCEE Labs: https://jceelabs.com

## What this demonstrates

A small deterministic flow:

**proposal → deterministic gate → simulated effect → receipt**

The example is intentionally generic. It shows how Jonathan structures a consequential workflow around explicit inputs, deterministic refusal/approval rules, a separated effect boundary, duplicate protection, and an auditable result object.

It is **not** an implementation, subset, port, or reference version of JCEE VOW, QCS, JEC, JCEE Assurance, Agentic AP Gate, or any other protected JCEE system.

## Contents

- `demo.py` — one self-contained Python demonstrator using only the standard library.
- `samples/approved_receipt.json` — invented recruiting-only example receipt for an approved simulated effect.
- `samples/refused_receipt.json` — invented recruiting-only example receipt for a refused proposal.
- `tests/test_demo.py` — small deterministic test suite.
- `diagrams/flow.md` — public-safe toy architecture diagram.
- `diagrams/jcee-public-system-map.md` — public-safe high-level portfolio systems map.

## Run it

Requires Python 3.11+ and no third-party packages.

```bash
python demo.py
python -m unittest discover -s tests -v
```

## Design choices visible in the toy

1. **Proposal and effect are separate.** A request is data; it is not execution authority.
2. **The gate is deterministic.** The same proposal, policy, and consumed-ID state produce the same decision.
3. **Refusal is explicit.** Denied proposals produce a receipt and do not call the simulated effect boundary.
4. **Duplicate use is rejected.** A proposal ID already consumed by an effect cannot be materialized again.
5. **Receipts are bounded.** A receipt records what this toy observed; it does not claim external truth, legal compliance, or production guarantees.

## Public-disclosure boundary

This demonstrator was authored from scratch for recruiting. It intentionally omits proprietary implementation detail. The real JCEE Labs systems remain private where required for IP and trade-secret protection.

For JCEE Labs' current public record and public research surfaces, visit https://jceelabs.com.

---

**Jonathan Chadbourne** — Founder & Chief Architect, JCEE Labs  
Dallas, TX · support@jceelabs.com · https://jceelabs.com
