import type { PointerEvent } from "react";

const rows = [
  {
    id: "01", title: "IT & Business Systems", heading: "Resolve uncertain changes.",
    copy: "Employee access, internal service requests, and approved changes across your service desk and business applications.",
    start: "Start with: an approved access change whose outcome is unclear.",
    state: "ILLUSTRATION / CHECK OUTCOME", code: "AUTHORITY → OBSERVATION", format: "hero",
  },
  {
    id: "02", title: "Software Operations", heading: "Make changes accountable.",
    copy: "Engineering workflows that need clear permissions, execution records, and recovery procedures.",
    start: "Start with: a deployment that needs an approval and a confirmed result.",
    state: "ILLUSTRATION / REVIEW REQUIRED", code: "REQUEST → EFFECT", format: "compact",
  },
  {
    id: "03", title: "Business Operations", heading: "Connect the process.",
    copy: "Internal requests and approval processes that cross multiple applications.",
    start: "Start with: an internal request passed between teams and tools.",
    state: "ILLUSTRATION / RECONCILE", code: "HANDOFF → RECORD", format: "wide",
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
          <div className="wl-bento-signal" aria-label="Illustrative status, not live telemetry">
            <span className="wl-bento-led" aria-hidden="true" />
            <span>{item.state}</span>
            <code>{item.code}</code>
          </div>
          <p className="wl-bento-disclosure">CONCEPTUAL INTERFACE · NOT LIVE SYSTEM STATUS</p>
        </article>
      ))}
    </div>
  );
}
