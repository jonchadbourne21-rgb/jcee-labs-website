/** Four public claim labels, separate from original historical status descriptions.
 *  Additions default to HOLD in the UI until manually classified and reviewed.
 *  This presentation mapping does not change test evidence, source status, or release authority.
 *  In particular, REPRODUCED means only the exact recorded method/environment
 *  replication, NOT independent-team confirmation unless an entry says so.
 */
export type PublicClaimTier = "defined" | "tested" | "reproduced" | "hold";

export const publicClaimTierById: Readonly<Record<string, PublicClaimTier>> = {
  // defined — explicit scope-grounded public classification.
  "jec-1-0": "defined",
  "jrp-000": "defined",
  "first-principle": "defined",
  "vow-dx": "defined",
  "aeel": "defined",
  "mirrored": "defined",
  "tot": "defined",
  "artle-november": "defined",
  "physical-materials-november": "defined",

  // tested — explicit scope-grounded public classification.
  "distribution": "tested",
  "vow-dev3": "tested",
  "ap-gate": "tested",
  "jcee-vow-1-1": "tested",
  "jcee-assurance": "tested",
  "iej": "tested",
  "evidence-engine": "tested",
  "crucible-p03": "tested",
  "jec-ea": "tested",
  "compound": "tested",
  "autography": "tested",
  "howm": "tested",
  "mise": "tested",
  "lem": "tested",
  "lam": "tested",
  "rtl": "tested",
  "infra-integrated-software": "tested",
  "protected-restoration": "tested",
  "current-evidence-eligibility": "tested",
  "numerical-assurance-v01": "tested",
  "native-recovery-november": "tested",
  "installed-interfaces-november": "tested",
  "hosted-evidence-november": "tested",
  "formal-foundation-november": "tested",
  "operational-self-use-november": "tested",
  "retrieval-lens-november": "tested",
  "bank-sandbox-november": "tested",
  "native-comparisons-november": "tested",
  "security-crypto-november": "tested",
  "observer-november": "tested",
  "bb84-math-november": "tested",
  "bb84-hardware-november": "tested",
  "quantum-followup-simulation": "tested",
  "quantum-record-verification": "tested",
  "c1-numerical-november": "tested",
  "closed-results-november": "tested",
  "memory-material-models-november": "tested",
  "memory-evidence-extensions-november": "tested",
  "portfolio-simulation-november": "tested",

  // reproduced — explicit scope-grounded public classification.
  "crucible-p02": "reproduced",
  "qcs-2-0": "reproduced",
  "ja-p03": "reproduced",
  "ja-p04": "reproduced",
  "jev": "reproduced",
  "qualification-evidence-pipeline": "reproduced",
  "wave-assessment-001": "reproduced",
  "granular-measurement-software": "reproduced",

  // hold — explicit scope-grounded public classification.
  "vow-i1": "hold",
  "vela": "hold",
  "gmda": "hold",
  "physical-commitment": "hold",
  "portable-evidence-november": "hold",
};

export const publicClaimLabel: Readonly<Record<PublicClaimTier, string>> = {
  defined: "DEFINED",
  tested: "TESTED — BOUNDED",
  reproduced: "REPRODUCED — BOUNDED",
  hold: "HOLD / NOT QUALIFIED",
};

/** Unknown records fail closed instead of receiving an inferred PASS label. */
export function getPublicClaimLabel(id: string): string {
  return publicClaimLabel[publicClaimTierById[id] ?? "hold"];
}
