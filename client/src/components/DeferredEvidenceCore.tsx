import { lazy, Suspense, useEffect, useRef, useState } from "react";

// Keep the original orbital sculpture, but defer its Canvas and WebGL setup
// until the secondary section is near the viewer's viewport.
const EvidenceCore = lazy(() => import("./EvidenceCore"));

function OrbitStill() {
  return (
    <figure className="wl-sculpture customer-hero-sculpture wl-static-orbit" aria-label="JCEE WorldLab orbital sculpture preview">
      <img
        className="wl-fallback-art"
        src={`${import.meta.env.BASE_URL}brand/worldlab-sculpture.svg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

export default function DeferredEvidenceCore() {
  const mount = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = mount.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        setActive(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px 0px", threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mount} className="wl-orbit-mount" data-orbit-gate={active ? "active" : "deferred"}>
      {active ? (
        <Suspense fallback={<OrbitStill />}>
          <EvidenceCore />
        </Suspense>
      ) : <OrbitStill />}
    </div>
  );
}
