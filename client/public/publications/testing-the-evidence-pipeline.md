# Testing the Evidence Pipeline

Engineering blog · Jonathan Matthew Chadbourne · 2026-10-19 · Version 1.0

A passing report is only useful when the process producing it can withstand scrutiny. Recent JCEE work repaired a false-PASS path, traced a captured storage rollback, and strengthened the evidence handoff for the integrated software candidate.

## The report needs its own evidence

A business evaluating an automated workflow will reasonably ask for a test report. The next question is how that report was produced. Did every required check execute? Does the preserved evidence describe the same software revision? Can another process reopen the records and reach the reported conclusion? A polished summary leaves those questions unanswered unless the supporting material is retained.

This matters in an illustrative order-processing pilot. A report might say that an authorized correction completed once, while the later record shows a different outcome. The buyer needs to know whether the discrepancy came from execution, storage, or evidence collection before relying on the workflow. This example is not a claim of a JCEE customer deployment.

## We found a path to a false PASS

Review of the P0.8 qualification runner found that an optimized runtime could remove required assertions. Under that condition, the runner could emit PASS despite a failed required check. The result exposed a weakness in the machinery that reported qualification, and it required its own repair.

The successor uses explicit failure handling, rejects the affected optimized entrypoints, and checks that the installed modules correspond to the reported artifact. Four injected-failure controls were required to finish with an error and without a final PASS receipt. Successful qualification controls were retained, so the repair had to distinguish a valid run from a deliberately failing one.

The frozen implementation and its wheel remained unchanged. The runner repair has its own evidence and was carried into the native-ledger qualification lineage. Keeping those identities separate lets a reviewer see which behavior changed and which earlier artifact was preserved.

## We captured a database changing after a successful commit

A separate local investigation reproduced a disagreement between the response and a later readback. The captured trace showed an effect after the database committed and after its connection closed. Background workspace synchronization then restored stale database state, and a subsequent read showed the effect missing.

That observation located the cause of the captured reproduction. We added an execution wrapper that keeps active qualification databases outside the synchronized workspace, verifies the resulting output, and then preserves an integrity-checked archive. The workflow can retain reviewable evidence without exposing active database state to that synchronization path.

The isolation successor passed local and hosted qualification, including 96 recovery checks and inspection of 400 expected database states, alongside the preserved action and runner controls. Those results do not assign every older corruption or input/output incident to the same cause. Earlier untraced failures remain in the record, and success in this setting does not establish power-loss durability.

## The current handoff checks more than summary flags

The October 19 integrated candidate has a stricter evidence handoff. It requires the expected package inventory, the correct source identity, raw observations, checkpoint verification, and reconstruction of selected effects. Saved PASS flags cannot substitute for missing records or observations that contradict the reported outcome.

The preserved successor package contains the exact 60-case restoration and recovery inventory. Its evidence review reconstructed six selected protected-path effects and ran five fresh offline verification or reconstruction processes. The candidate’s source contents match those advanced into the working integration branch. These are checks on the retained software result; they do not create new permission to execute an action.

The handoff also keeps unresolved outcomes visible. Confirmed committed effects have supporting records. The final intentional uncertain outcome remains held with retry permission denied and human resolution required. Authorized controls still complete. Treating every hold as success, or every uncertainty as confirmed failure, would misstate what the evidence shows.

## What this gives a prospective reviewer

A scoped reviewer can ask for the version tested, the required checks, the original failure observations, the repaired result, and the evidence needed to reconstruct the conclusion. That is a more useful basis for a pilot discussion than an aggregate pass count. It connects a claim to an inspectable result and identifies what must be repeated in the customer’s environment.

This is a first-party engineering report. Retained private evidence is available for scoped review. Separate AI review and hosted execution have been used; independent human or organizational certification has not been established. The current results concern controlled software and a fictional ledger. Production admission, broader custody conditions, and physical commitment qualification, including A4, remain open.

## Continue reading

- [Current software integration](https://jceelabs.com/technology#current-integration)
- [Integrated software evidence boundary](https://jceelabs.com/registry#infra-integrated-software)
- [When Tested Components Work Together](https://jceelabs.com/blog/when-tested-components-work-together)
- [Restoring a Backup Without Restoring Permission](https://jceelabs.com/blog/restoring-a-backup-without-restoring-permission)
