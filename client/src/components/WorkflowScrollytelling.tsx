import { useEffect, useRef, useState } from "react";

/** Scroll-position demonstration only: no action, VOW runtime, or provider call. */
const frames = [
  {
    id: "request", label: "01 / REQUEST", title: "A request enters.",
    copy: "An authorized employee-access request enters a fictional coordinator.",
    trace: ["[REQUEST] Add employee #8801 to group.", "[INPUT] Approval reference supplied.", "[STATE] Intent captured, no effect yet."],
    state: "RECEIVED / MOCK",
  },
  {
    id: "coordinate", label: "02 / COORDINATION", title: "The AI hands off.",
    copy: "The coordinator sends the intended change to a simulated application API.",
    trace: ["[AUTHORITY] Current permission checked in story.", "[DISPATCH] Example service request issued.", "[WAIT] Awaiting target acknowledgement."],
    state: "PENDING / MOCK",
  },
  {
    id: "timeout", label: "03 / INTERRUPTION", title: "The response disappears.",
    copy: "A timeout proves neither that a change occurred nor that it failed. Retrying blindly could duplicate an effect.",
    trace: ["[EVENT] No response before deadline.", "[OBSERVATION] Target membership unknown.", "[HOLD] No automatic retry authorized."],
    state: "UNKNOWN / MOCK",
  },
  {
    id: "reconcile", label: "04 / RECOVERY", title: "Reconcile before resuming.",
    copy: "The illustrated VOW-style recovery decision preserves uncertainty and calls for target-state inspection and current authorization.",
    trace: ["[CHECK] Read target state / action history.", "[CHECK] Revalidate permission.", "[RECORD] HOLD: outcome unresolved; inspect first."],
    state: "HOLD / ILLUSTRATIVE RECORD",
  },
] as const;

export default function WorkflowScrollytelling() {
  const [index, setIndex] = useState(0);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(x => x.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        const next = Number((visible[0].target as HTMLElement).dataset.step ?? 0);
        setIndex(next);
      }
    }, { rootMargin: "-18% 0px -35% 0px", threshold: [0, .25, .6] });
    steps.current.forEach(node => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  const active = frames[index];
  return (
    <div className="wl-scroll-story" aria-label="Illustrative workflow recovery as you scroll">
      <div className="wl-scroll-story-heading">
        <span>SCROLL THROUGH / FOUR CONCEPTUAL STATES</span>
        <p>As you move down the page, the example advances. No production service, real request or VOW engine is called.</p>
      </div>
      <div className="wl-scroll-story-grid">
        <div className="wl-scroll-story-steps">
          {frames.map((frame, i) => (
            <div
              key={frame.id}
              ref={node => { steps.current[i] = node; }}
              data-step={i}
              className={`wl-scroll-story-step${index === i ? " is-active" : ""}`}
              id={`workflow-step-${frame.id}`}
            >
              <p>{frame.label}</p>
              <h3>{frame.title}</h3>
              <p>{frame.copy}</p>
            </div>
          ))}
        </div>
        <div className="wl-scroll-story-visual">
          <div className="wl-scroll-story-console">
            <div className="wl-scroll-story-console-bar"><span>SIMULATED / CONTROLLED ACTION</span><span>{String(index + 1).padStart(2, "0")} / 04</span></div>
            <div className="wl-scroll-story-progress" aria-hidden="true"><i style={{ width: `${(index + 1) * 25}%` }} /></div>
            <p className="wl-scroll-story-state" role="status" aria-live="off">{active.state}</p>
            <ol aria-label={active.title}>
              {active.trace.map(line => <li key={line}>{line}</li>)}
            </ol>
            <div className="wl-scroll-story-chain" aria-hidden="true"><span>REQUEST</span><span>AUTHORITY</span><span>EFFECT?</span><span>EVIDENCE</span></div>
            <p className="wl-scroll-story-limit">DEMONSTRATION ONLY · UNKNOWN IS NOT FAILURE · NO LIVE RECEIPT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
