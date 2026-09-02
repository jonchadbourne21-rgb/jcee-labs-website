# Recruiting Toy Flow

This diagram describes only the public recruiting demonstrator.

```mermaid
flowchart LR
    A[Proposal data] --> B[Deterministic gate]
    B -->|Refuse| C[Refusal receipt]
    B -->|Allow| D[Simulated effect boundary]
    D --> E[Effect recorded in toy store]
    E --> F[Approval receipt]

    G[Explicit demo policy] --> B
    H[Consumed proposal IDs] --> B
```

The proposal is never treated as execution authority. A refused proposal stops before the simulated effect boundary. An approved proposal may materialize one in-memory effect; a repeated proposal ID is then refused.
