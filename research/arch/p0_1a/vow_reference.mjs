import { makeReceipt } from "./canonical.mjs";

export function vowReferenceReceipt(input) {
  return makeReceipt(input, {
    substrate: "VOW_REFERENCE_FIXTURE",
    execution_id: `vow-ref:${input.operation_id}`,
    durable_recorded: true,
    note: "Frozen semantic fixture only; not an executable VOW runtime claim in P0.1A.",
  });
}
