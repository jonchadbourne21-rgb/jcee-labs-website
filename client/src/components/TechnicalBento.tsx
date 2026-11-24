import type { PointerEvent } from "react";

const rows = [
  {
    id: "01", title: "Industrial Distribution", heading: "Catch order mismatches earlier.",
    copy: "Compare purchase orders with entered orders. Give sales, warehouse, and accounting a shared view of discrepancies that need review.",
    start: "Start with: a price, quantity, or freight instruction that differs from the order record.",
    format: "hero",
  },
  {
    id: "02", title: "IT & Software Operations", heading: "Make changes accountable.",
    copy: "Engineering workflows that need clear permissions, execution records, and recovery procedures.",
    start: "Start with: a deployment that needs an approval and a confirmed result.",
    format: "compact",
  },
  {
    id: "03", title: "Business Operations", heading: "Connect the process.",
    copy: "Connect CRM, ERP, and internal tools through custom workflows, approval screens, and reviewable handoffs.",
    start: "Start with: an internal request passed between teams and tools.",
    format: "wide",
  },
] as const;

export default function TechnicalBento() {
  const track = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };
  return (
    <div className="wl-technical-bento" aria-label="Example workflow engagement areas">
      {rows.map(item => (
        <article
          key={item.id}
          className={`wl-bento-tile wl-bento-${item.format}`}
          onPointerMove={track}
          onPointerLeave={event => {
            event.currentTarget.style.removeProperty("--spot-x");
            event.currentTarget.style.removeProperty("--spot-y");
          }}
        >
          <div className="wl-bento-top"><span>{item.id} / {item.title.toUpperCase()}</span><span aria-hidden="true">⊕</span></div>
          <div className="wl-bento-content">
            <h3>{item.heading}</h3>
            <p>{item.copy}</p>
            <p className="wl-bento-start">{item.start}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
