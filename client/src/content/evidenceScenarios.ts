/** Fictional scenarios, never a backend operation or qualification receipt. */
export const evidenceScenarios = {
  authorized: {
    index: "01",
    title: "An order ready to move.",
    description:
      "The request is supported, current permission is present, and the target confirms the release.",
    values: [
      "Release order SO-1042",
      "Current permission present",
      "Target confirms release",
      "Confirmed in the target record",
    ],
    detail: [
      "The original request identifies the order and the exact intended change.",
      "The modeled authority source permits this action at the illustrated action boundary.",
      "The modeled target accepts the release. A request alone would not establish this result.",
      "Modeled outcome: confirmed release, linked to its request and permission. This illustration creates no real receipt.",
    ],
  },
  revoked: {
    index: "02",
    title: "Permission changed first.",
    description:
      "The instruction still exists, but its approval has been withdrawn before the action boundary.",
    values: [
      "Release order SO-1042",
      "Permission withdrawn",
      "Action held at the boundary",
      "Held — no release attempted",
    ],
    detail: [
      "The same requested change remains in the record. Intent is preserved even when permission changes.",
      "The current modeled authority source shows that approval was withdrawn.",
      "The modeled boundary holds the action. Earlier approval cannot stand in for current permission.",
      "Modeled outcome: held, with the reason recorded. A new action would require its own current authority.",
    ],
  },
  lost: {
    index: "03",
    title: "The response never arrived.",
    description:
      "The target committed the change, but its response was lost. Recovery must inspect the target record before another attempt.",
    values: [
      "Release order SO-1042",
      "Permission present at action",
      "Committed; response lost",
      "Existing effect reconciled",
    ],
    detail: [
      "The preserved request identifies the intended action so recovery can match the correct effect.",
      "The modeled action had permission at its boundary. This is not permission for an unrestricted retry.",
      "The modeled target committed the release before the response was lost. A timeout alone cannot tell the caller this.",
      "Modeled outcome: the existing effect is found in the competent target record and reconciled without another release. Without that evidence, the outcome would remain unresolved.",
    ],
  },
  conflict: {
    index: "04",
    title: "The records disagree.",
    description:
      "One source says the order is ready; another reports a hold. There is not enough consistent evidence to release it.",
    values: [
      "Release order SO-1042",
      "Conflicting evidence unresolved",
      "Action held for review",
      "Unresolved — review required",
    ],
    detail: [
      "The requested action is clear. The available evidence supporting it is not.",
      "The modeled records disagree. An assertion of readiness cannot silently resolve the conflict or create permission.",
      "The modeled action is held while the discrepancy is investigated by the accountable person.",
      "Modeled outcome: unresolved, with the conflicting records preserved. Missing evidence is not converted into a confirmed result.",
    ],
  },
} as const;
export type EvidenceScenario = keyof typeof evidenceScenarios;
