# A Confident Model Still Needs Permission

Company blog · JCEE Labs · 2026-09-29 · Version 1.0

A useful prediction does not grant authority to act. Why evidence, judgment, permission, and consequence need separate checks.

## A plausible correction is still a proposed action

A purchase order says to use the customer’s freight account. The sales order does not show one. An AI assistant notices the mismatch and proposes a correction. Its explanation is clear. Its confidence is high. The correction may even be right.

That still leaves another question: who has permission to change the order? The answer depends on the workflow, the person or system responsible for it, the scope of the approval, and the state of the order now. The model’s certainty cannot supply that authority.

This is an illustrative example, not a report of an automated customer deployment. In JCEE Distribution’s recorded synthetic workflow, a discrepancy is something for a person to investigate. Finding it does not authorize an ERP write.

## Four questions worth keeping separate

An AI-assisted workflow becomes easier to inspect when it answers four questions explicitly. What did we observe? What conclusion does that evidence support? What action is currently permitted? What actually happened?

These questions are related, but answering one does not answer the others. A correct observation may support several interpretations. A well-supported recommendation may sit outside an assistant’s permissions. A permitted action can fail. A successful action still needs an observable result.

- Evidence: retain the source instruction and the observed record, including what is missing or uncertain.
- Judgment: explain the proposed correction and the limits of the reasoning.
- Permission: establish who may approve the particular change, within what scope, under the current conditions.
- Consequence: record the attempted action and its observed outcome, including an unresolved outcome when completion cannot be established.

## Confidence belongs inside the reasoning

Confidence can help prioritize review when it has been evaluated for the task. It does not become reliable simply because a model states a percentage, and it is not a substitute for checking the relevant evidence.

Even a perfectly correct recommendation would not create permission. If an assistant is allowed to compare orders, that does not imply permission to edit them, send a message, commit a payment, or broaden its own access. Each consequential step needs authority appropriate to that step.

Permission can also change. An earlier approval may concern a different record, a smaller scope, or a state that no longer exists. A workflow needs a way to stop and ask again when the current action is no longer covered.

## What our bounded research does—and does not—show

JCEE’s preserved JEV P0.1 study examines this separation in a local evaluator using supplied synthetic state. Its recovered replay checks include changes in confidence and provider labels. That is useful evidence about the specified local decision boundary, not a demonstration of a live assistant, a deployed execution system, or independent verification.

One limit deserves particular attention: the fixture includes a wrong answer whose action is otherwise authorized. The evaluator can allow it. A permission check does not establish semantic correctness. Better reasoning, reliable evidence, suitable review, and clear permission remain distinct responsibilities.

The successor comparison is design-only and has not been run. We are not claiming that the full JCEE component stack has been integrated or that this local result establishes production safety.

## A practical boundary for the next workflow

Start by naming the smallest useful action: compare a purchase order with a sales order and show the differences. Define the evidence the comparison may read and the person who reviews the result. Keep proposed corrections visible as proposals.

If a later stage is allowed to make changes, define that permission separately. Tie it to the specific operation and current conditions, provide a clear stop when evidence or authority is unresolved, and retain a record of what was attempted and observed.

The goal is useful AI-assisted work that people can inspect and control. A confident model can contribute to the decision. The authority to act must come from the workflow’s accountable owner.

## Continue reading

- [JEV’s current evidence boundary](https://jceelabs.com/registry#jev)
- [The recorded Distribution dry run](https://jceelabs.com/blog/distribution-first-dry-run)
- [JCEE’s assurance method](https://jceelabs.com/assurance)
