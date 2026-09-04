export const CONTRACT_VERSION = "JCEE-ARCH-P0.1A-CANONICAL-V1";

export function decideCanonical(input) {
  const admission = {
    contract_version: CONTRACT_VERSION,
    operation_id: input.operation_id,
    effect_digest: input.effect_digest,
    target_id: input.target_id,
    authority_current: input.authority_current,
    authority_version: input.authority_version,
    dependency_current: input.dependency_current,
  };

  const target_evidence = {
    observation: input.target_observation,
    target_attempts: 0,
    external_effect_performed: false,
  };

  let recovery;
  let closure;

  if (input.target_observation === "EFFECT_OCCURRED") {
    recovery = {
      action: "NONE",
      reexecution_authorized: false,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "CLOSED_EFFECT_OCCURRED" };
  } else if (input.target_observation === "AMBIGUOUS") {
    recovery = {
      action: "OBSERVE_FIRST",
      reexecution_authorized: false,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "OPEN_AMBIGUOUS" };
  } else if (!input.authority_current) {
    recovery = {
      action: "ABSTAIN_AUTHORITY",
      reexecution_authorized: false,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "OPEN_ABSTAINED" };
  } else if (!input.dependency_current) {
    recovery = {
      action: "ABSTAIN_DEPENDENCY",
      reexecution_authorized: false,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "OPEN_ABSTAINED" };
  } else if (input.recovery_authorized) {
    recovery = {
      action: "RETRY_AUTHORIZED_SHADOW_ONLY",
      reexecution_authorized: true,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "OPEN_RECOVERY_AUTHORIZED" };
  } else {
    recovery = {
      action: "ABSTAIN_NO_RECOVERY_AUTHORITY",
      reexecution_authorized: false,
      substrate_retry_consumed_as_authority: false,
    };
    closure = { state: "OPEN_ABSTAINED" };
  }

  return { admission, target_evidence, recovery, closure };
}

export function makeReceipt(input, substrateEvidence) {
  return {
    ...decideCanonical(input),
    substrate_evidence: substrateEvidence,
  };
}

export function semanticProjection(receipt) {
  return {
    admission: receipt.admission,
    target_evidence: receipt.target_evidence,
    recovery: receipt.recovery,
    closure: receipt.closure,
  };
}
