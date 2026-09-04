import assert from "node:assert/strict";
import fs from "node:fs";
import { RestateTestEnvironment } from "@restatedev/restate-sdk-testcontainers";
import * as clients from "@restatedev/restate-sdk-clients";
import { jceeShadowWorkflow } from "./restate_shadow.mjs";
import { semanticProjection } from "./canonical.mjs";
import { vowReferenceReceipt } from "./vow_reference.mjs";

const base = {
  contract_version: "JCEE-ARCH-P0.1A-CANONICAL-V1",
  effect_digest: "sha256:synthetic-effect-001",
  target_id: "shadow://no-external-target",
  authority_version: 7,
  authority_current: true,
  dependency_current: true,
  target_observation: "EFFECT_NOT_OCCURRED",
  substrate_signal: "NONE",
  recovery_authorized: false,
};

const cases = [
  {
    id: "C01",
    input: { ...base, operation_id: "p01a-c01", target_observation: "EFFECT_OCCURRED" },
    expected_action: "NONE",
    expected_closure: "CLOSED_EFFECT_OCCURRED",
  },
  {
    id: "C02",
    input: { ...base, operation_id: "p01a-c02", target_observation: "AMBIGUOUS", substrate_signal: "RETRY" },
    expected_action: "OBSERVE_FIRST",
    expected_closure: "OPEN_AMBIGUOUS",
  },
  {
    id: "C03",
    input: { ...base, operation_id: "p01a-c03", target_observation: "AMBIGUOUS" },
    expected_action: "OBSERVE_FIRST",
    expected_closure: "OPEN_AMBIGUOUS",
  },
  {
    id: "C04",
    input: { ...base, operation_id: "p01a-c04", authority_current: false, substrate_signal: "RETRY" },
    expected_action: "ABSTAIN_AUTHORITY",
    expected_closure: "OPEN_ABSTAINED",
  },
  {
    id: "C05",
    input: { ...base, operation_id: "p01a-c05", dependency_current: false, substrate_signal: "RETRY" },
    expected_action: "ABSTAIN_DEPENDENCY",
    expected_closure: "OPEN_ABSTAINED",
  },
  {
    id: "C06",
    input: { ...base, operation_id: "p01a-c06", recovery_authorized: true, substrate_signal: "RETRY" },
    expected_action: "RETRY_AUTHORIZED_SHADOW_ONLY",
    expected_closure: "OPEN_RECOVERY_AUTHORIZED",
  },
  {
    id: "C07",
    input: { ...base, operation_id: "p01a-c07", target_observation: "AMBIGUOUS", substrate_signal: "COMPLETED" },
    expected_action: "OBSERVE_FIRST",
    expected_closure: "OPEN_AMBIGUOUS",
  },
];

const results = [];
let env;
try {
  env = await RestateTestEnvironment.start({ services: [jceeShadowWorkflow] });
  const ingress = clients.connect({ url: env.baseUrl() });

  for (const testCase of cases) {
    const workflow = ingress.workflowClient(jceeShadowWorkflow, testCase.input.operation_id);
    const submit = await workflow.workflowSubmit(testCase.input);
    const restateReceipt = await workflow.workflowAttach();
    const vowReceipt = vowReferenceReceipt(testCase.input);

    const restateProjection = semanticProjection(restateReceipt);
    const vowProjection = semanticProjection(vowReceipt);

    assert.deepEqual(restateProjection, vowProjection, `${testCase.id}: cross-substrate semantic projection mismatch`);
    assert.equal(restateReceipt.recovery.action, testCase.expected_action, `${testCase.id}: recovery action mismatch`);
    assert.equal(restateReceipt.closure.state, testCase.expected_closure, `${testCase.id}: closure mismatch`);
    assert.equal(restateReceipt.target_evidence.external_effect_performed, false, `${testCase.id}: external effect prohibition violated`);
    assert.equal(restateReceipt.target_evidence.target_attempts, 0, `${testCase.id}: target attempt prohibition violated`);
    assert.equal(restateReceipt.recovery.substrate_retry_consumed_as_authority, false, `${testCase.id}: substrate retry became authority`);

    if (testCase.id === "C02" || testCase.id === "C07") {
      assert.equal(restateReceipt.recovery.reexecution_authorized, false, `${testCase.id}: ambiguous boundary broadened to retry`);
      assert.equal(restateReceipt.target_evidence.observation, "AMBIGUOUS", `${testCase.id}: runtime signal inflated target truth`);
    }

    results.push({
      scenario: testCase.id,
      pass: true,
      submit_status: submit?.status ?? "UNSPECIFIED",
      restate_substrate: restateReceipt.substrate_evidence.substrate,
      recovery_action: restateReceipt.recovery.action,
      closure: restateReceipt.closure.state,
      semantic_projection_equal_to_vow_reference: true,
      external_effect_performed: false,
    });
  }

  const c09Input = {
    ...base,
    operation_id: "p01a-c09",
    target_observation: "AMBIGUOUS",
    substrate_signal: "RETRY",
  };
  const c09 = ingress.workflowClient(jceeShadowWorkflow, c09Input.operation_id);
  const firstSubmit = await c09.workflowSubmit(c09Input);
  const firstReceipt = await c09.workflowAttach();
  let secondSubmitStatus = "UNSPECIFIED";
  try {
    const secondSubmit = await c09.workflowSubmit(c09Input);
    secondSubmitStatus = secondSubmit?.status ?? "UNSPECIFIED";
  } catch (error) {
    secondSubmitStatus = `REJECTED_EXISTING:${error?.name ?? "Error"}`;
  }
  const secondReceipt = await c09.workflowAttach();
  assert.deepEqual(semanticProjection(firstReceipt), semanticProjection(secondReceipt), "C09: repeated workflow identity changed canonical result");
  assert.equal(secondReceipt.recovery.action, "OBSERVE_FIRST", "C09: replay broadened recovery authority");
  assert.equal(secondReceipt.target_evidence.external_effect_performed, false, "C09: external effect prohibition violated");

  results.push({
    scenario: "C09",
    pass: true,
    first_submit_status: firstSubmit?.status ?? "UNSPECIFIED",
    second_submit_status: secondSubmitStatus,
    same_canonical_result_after_repeat_identity: true,
    external_effect_performed: false,
  });

  const output = {
    schema: "JCEE_ARCH_P0_1A_RESULTS_V1",
    contract_id: "JCEE-ARCH-P0.1A",
    execution_mode: "REAL_LOCAL_RESTATE_TESTCONTAINER_PLUS_VOW_REFERENCE_FIXTURE",
    verdict: "PASS_BOUNDED_SHADOW",
    restate_real_execution: true,
    executable_vow_runtime_in_this_gate: false,
    external_consequential_target_connected: false,
    zero_real_external_effects: true,
    substrate_retry_non_authority_preserved: true,
    target_truth_non_inflation_preserved: true,
    semantic_equivalence_c01_c07: true,
    reversibility_claim: "CONTRACT_LEVEL_TO_FROZEN_VOW_REFERENCE_FIXTURE",
    scenarios: results,
    claim_ceiling: "Bounded Restate shadow plug-contract feasibility and semantic equivalence to frozen VOW reference fixture only; no production integration or executable VOW-Restate parity claim.",
  };

  fs.writeFileSync("JCEE_ARCH_P0_1A_RESULTS.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(output, null, 2));
} catch (error) {
  const output = {
    schema: "JCEE_ARCH_P0_1A_RESULTS_V1",
    contract_id: "JCEE-ARCH-P0.1A",
    verdict: "FAIL_OR_INDETERMINATE",
    error: String(error?.stack ?? error),
  };
  fs.writeFileSync("JCEE_ARCH_P0_1A_RESULTS.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.error(error);
  process.exitCode = 1;
} finally {
  if (env) await env.stop();
}
