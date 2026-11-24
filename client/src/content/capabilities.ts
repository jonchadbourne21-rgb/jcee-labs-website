/** Public customer-facing capability copy. Not a product release or qualification register. */
export type CapabilityId = "authorization" | "consequence-control" | "durable-recovery" | "evidence-verification" | "receipts-and-audit" | "governed-knowledge" | "connected-workflows" | "qualification";
export type PublicCapability = {id: string; title: string; summary: string; customerNeed: string; architecture: string; useCase: string; implemented: string; qualification: string; relatedHref: string; relatedLabel: string};
export const publicCapabilities: readonly PublicCapability[] = [
  {
    "id": "authorization",
    "title": "Authorization",
    "summary": "Check current authority before an AI action proceeds.",
    "customerNeed": "A previous approval or an agent's confidence is not permission for a change now.",
    "architecture": "JCEE-INFRA and QCS connect the proposed effect to declared identity, authority, policy and current evidence.",
    "useCase": "Recheck a service owner's approval before an AI-initiated infrastructure change.",
    "implemented": "Authority-scoped decisions and expiry/revocation cases have bounded test evidence.",
    "qualification": "Each target and credential boundary requires its own qualification; no universal authority-at-commit claim.",
    "relatedHref": "/qcs",
    "relatedLabel": "Explore QCS and its evidence limits"
  },
  {
    "id": "consequence-control",
    "title": "Consequence Control",
    "summary": "Keep the target system in control of consequential changes.",
    "customerNeed": "An agent's recommendation must not become unrestricted permission to mutate production systems.",
    "architecture": "JCEE-INFRA and JCEE-CAB bind the requested effect to a target-owned consequence boundary.",
    "useCase": "Require the target system's final decision before changing a protected service.",
    "implemented": "Target-native checks and effect-identity binding have been exercised in bounded configurations.",
    "qualification": "Privileged-route bypass and physical durable-authority closure remain unresolved; universal no-bypass protection is not established.",
    "relatedHref": "/solutions#assessment",
    "relatedLabel": "See the Workflow Assurance assessment"
  },
  {
    "id": "durable-recovery",
    "title": "Durable Recovery",
    "summary": "Reconcile uncertain outcomes before deciding whether to retry.",
    "customerNeed": "When a remote call times out, blind replay may duplicate the actual external effect.",
    "architecture": "JCEE VOW preserves effect intent, stable identity and typed recovery decisions, consulting competent external records where available.",
    "useCase": "Investigate a deployment that committed before its acknowledgement was lost.",
    "implemented": "Durable execution intent and typed recovery behavior are implemented and tested in declared scenarios.",
    "qualification": "Provider-specific observation contracts and target integration require qualification; exactly-once behavior is not universal.",
    "relatedHref": "/vow",
    "relatedLabel": "Explore JCEE VOW recovery"
  },
  {
    "id": "evidence-verification",
    "title": "Evidence Verification",
    "summary": "Determine what available evidence supports—and what remains unknown.",
    "customerNeed": "A signed record or confident conclusion is not automatically proof of what happened outside the model.",
    "architecture": "JCEE Assurance, JA, JEC and QCS separate assertions, evidence, authority and verdicts.",
    "useCase": "Evaluate conflicting incident records before closing an investigation.",
    "implemented": "Portable evidence and verification kernels have bounded implementation and reproduction results.",
    "qualification": "Integrity of evidence cannot independently establish a dishonest issuer's truthfulness or physical outcome.",
    "relatedHref": "/assurance",
    "relatedLabel": "Explore the JCEE Assurance method"
  },
  {
    "id": "receipts-and-audit",
    "title": "Receipts & Audit",
    "summary": "Reconstruct what was proposed, permitted and observed.",
    "customerNeed": "Audit teams need more than a tool-call success message after an important change.",
    "architecture": "JA and JCEE Evidence Engine connect provenance, verification results and inspectable action records.",
    "useCase": "Investigate who approved a service restart and what the system of record confirmed.",
    "implemented": "Receipt inspection and evidence-reconstruction components exist with bounded validation.",
    "qualification": "Receipts inherit their evidence and trust-anchor limits; universal independent source truth is not established.",
    "relatedHref": "/experiences/evidence-engine",
    "relatedLabel": "View the illustrative Evidence Engine experience"
  },
  {
    "id": "governed-knowledge",
    "title": "Governed Knowledge",
    "summary": "Connect agent context to source identity, revisions and authority.",
    "customerNeed": "An outdated policy document can look persuasive after the actual controlling information changes.",
    "architecture": "JCEE Knowledge Retrieval relates retrieved context to source and revision identity.",
    "useCase": "Review which policy version supported an AI-generated operational recommendation.",
    "implemented": "Source-aware retrieval candidate software and local test evidence exist.",
    "qualification": "Live source synchronization and joined qualification remain deployment-dependent; retrieved context does not grant authority.",
    "relatedHref": "/registry",
    "relatedLabel": "Review dated engineering evidence"
  },
  {
    "id": "connected-workflows",
    "title": "Connected Workflows",
    "summary": "Bring authorization, execution, recovery and evidence together.",
    "customerNeed": "Business actions cross tools and providers; control meaning must survive each handoff.",
    "architecture": "JCEE Workflow, JCEE-INFRA and private client/service interfaces compose established assurance components.",
    "useCase": "Govern an infrastructure-change request from approval to observed outcome.",
    "implemented": "Private installable workflow and interface components have bounded extraction and component-test results.",
    "qualification": "The complete G0 joined admission and production release remain on hold.",
    "relatedHref": "/solutions#build",
    "relatedLabel": "See how we build connected workflows"
  },
  {
    "id": "qualification",
    "title": "Qualification",
    "summary": "Challenge consequential action paths before promotion.",
    "customerNeed": "A successful demonstration cannot prove behavior under revocation, duplication, crash and conflicting evidence.",
    "architecture": "JCEE qualification tooling tests bounded contracts, hostile cases and observed evidence.",
    "useCase": "Challenge expiry, response loss and duplicate requests before enabling an automated change.",
    "implemented": "Adversarial and synthetic qualification suites exist with retained scoped results.",
    "qualification": "Passing selected tests does not constitute independent certification or production qualification for every environment.",
    "relatedHref": "/registry",
    "relatedLabel": "Review published test results and limits"
  }
] as const;
