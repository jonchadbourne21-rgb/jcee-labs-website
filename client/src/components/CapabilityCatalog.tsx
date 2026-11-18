import { BookOpen, ClipboardCheck, FileCheck2, GitBranch, History, LockKeyhole, Network, ShieldCheck, type LucideIcon } from "lucide-react";
import { publicCapabilities, type CapabilityId } from "@/content/capabilities";
import "./capability-catalog.css";
const icons: Record<CapabilityId, LucideIcon> = {
  authorization: LockKeyhole, "consequence-control": ShieldCheck,
  "durable-recovery": History, "evidence-verification": FileCheck2,
  "receipts-and-audit": ClipboardCheck, "governed-knowledge": BookOpen,
  "connected-workflows": Network, qualification: GitBranch,
};
/** Native fragment navigation and disclosure controls preserve existing route state. */
export default function CapabilityCatalog() {
 return <>
  <section className="editorial-section capability-catalog" aria-labelledby="capability-catalog-heading">
   <div className="capability-catalog__heading">
    <div><p className="editorial-kicker">JCEE WORLDLAB / CAPABILITIES</p><h2 id="capability-catalog-heading">Eight capabilities. One accountable action path.</h2></div>
    <p>Established foundations for keeping intelligence, current permission and observed outcomes connected. Explore the customer value and evidence boundary behind each capability.</p>
   </div>
   <ul className="capability-catalog__grid" aria-label="JCEE WorldLab capability catalog">
    {publicCapabilities.map((c,index) => {
     const Icon=icons[c.id as CapabilityId];
     return <li className="capability-catalog__card" key={c.id}>
      <a href={`#detail-${c.id}`} aria-label={`Read about ${c.title}`}>
       <span className="capability-catalog__card-top"><Icon size={27} strokeWidth={1.55} aria-hidden="true"/><span className="capability-catalog__number" aria-hidden="true">{String(index+1).padStart(2,"0")}</span></span>
       <strong>{c.title}</strong>
       <span className="capability-catalog__summary">{c.summary}</span>
       <span className="capability-catalog__link">Explore capability <span aria-hidden="true">↗</span></span>
      </a>
     </li>;
    })}
   </ul>
   <p className="capability-catalog__note">These categories describe connected capabilities of existing JCEE systems, not eight independently released products. Qualification is specific to the target and configuration.</p>
  </section>
  <section className="editorial-section capability-details" aria-labelledby="capability-details-heading">
   <div className="capability-details__heading"><p className="editorial-kicker">CAPABILITY DETAILS / SCOPE & EVIDENCE</p><h2 id="capability-details-heading">What changes for your workflow.</h2><p>Start with the systems and authorities your organization already trusts.</p></div>
   <div className="capability-details__grid">
    {publicCapabilities.map(c=><article key={c.id} className="capability-details__item" id={`detail-${c.id}`} aria-labelledby={`heading-${c.id}`}>
      <h3 id={`heading-${c.id}`}>{c.title}</h3><p className="capability-details__summary">{c.summary}</p>
      <p><strong>Why it matters.</strong> {c.customerNeed}</p><p><strong>In practice.</strong> {c.useCase}</p>
      <details><summary>Architecture and qualification</summary><div className="capability-details__expanded">
       <p><strong>Existing architecture.</strong> {c.architecture}</p>
       <p><strong>Implemented.</strong> {c.implemented}</p>
       <p><strong>Qualification boundary.</strong> {c.qualification}</p>
      </div></details>
      <a className="capability-details__related" href={c.relatedHref}>{c.relatedLabel} <span aria-hidden="true">→</span></a>
     </article>)}
   </div>
   <div className="capability-details__footer"><p>Selected tests support their declared configurations; they do not establish universal execution protection or production qualification.</p><a href="/consultation">Discuss your workflow <span aria-hidden="true">↗</span></a></div>
  </section>
 </>;
}
