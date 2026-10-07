const evidenceClasses = [
  {
    label: "01 / FORMAL OR MODEL-BASED",
    title: "What follows under stated assumptions.",
    evidence:
      "Proofs, derivations, and model checks can support bounded mathematical claims. They do not establish physical realization, independent priority, or production behavior.",
    example:
      "Example: selected BB84 communication bounds in the public preprint; independent scientific review and novelty assessment remain separate.",
  },
  {
    label: "02 / SYNTHETIC OR REPLAY",
    title: "What passed a defined software gate.",
    evidence:
      "Recorded fixtures, reproductions, and hostile tests qualify only the conditions actually exercised. Passing them does not transfer automatically to real external systems.",
    example:
      "Examples: VOW and QCS bounded milestones; Distribution's 20/20 expected synthetic classifications with zero external effects.",
  },
  {
    label: "03 / PHYSICAL VALIDATION PENDING",
    title: "What is proposed, but not observed in nature.",
    evidence:
      "A preregistered design, feasibility screen, or statistical simulation is not a physical outcome. The biological and living-cell quantum proposals below remain untested physically.",
    example:
      "Current physical-test candidates: JCEE-MMC-P0.1 and JCEE-QBIO-P0.1.",
  },
  {
    label: "04 / FIELD EVIDENCE NOT ESTABLISHED",
    title: "What still needs real-world qualification.",
    evidence:
      "Production reliability, customer outcomes, external transfer, and regulatory fitness require their own operational evidence and review. They are not inherited from proofs or synthetic tests.",
    example:
      "No general customer ROI, independent certification, or blanket regulatory compliance is claimed.",
  },
];

export default function EvidenceLadder() {
  return (
    <>
      <div className="evidence-ladder" aria-label="JCEE evidence classes and their limits">
        {evidenceClasses.map((item) => (
          <article className="evidence-ladder__item" key={item.label}>
            <p className="editorial-kicker">{item.label}</p>
            <h3>{item.title}</h3>
            <p>{item.evidence}</p>
            <p className="evidence-ladder__example">{item.example}</p>
          </article>
        ))}
      </div>
      <p className="evidence-ladder__note">
        These are different kinds of evidence, not a single score. Each claim
        retains its own test, assumptions, custody record, and limitations.
      </p>
    </>
  );
}
