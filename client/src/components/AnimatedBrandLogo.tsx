import { useEffect, useId, useMemo, useRef, useState } from "react";
import horizontal from "../assets/jcee-logo-animated.svg?raw";
import stacked from "../assets/jcee-logo-stacked-animated.svg?raw";
import "./brand-logo.css";

export default function AnimatedBrandLogo() {
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const artwork = useMemo(() => [horizontal, stacked].map((svg, index) =>
    ({ __html: svg.replaceAll("motion", `logo-${id}-${index}`).replaceAll("<animateTransform", '<animateTransform begin="indefinite"') })
  ), [id]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const svgs = Array.from(root.current?.querySelectorAll("svg") ?? []);
    svgs.forEach(svg => {
      svg.pauseAnimations();
      svg.setCurrentTime(0);
      svg.querySelectorAll("animateTransform").forEach(animation => {
        (animation as SVGAnimationElement).beginElement();
      });
    });
  }, [artwork]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const svgs = Array.from(element.querySelectorAll("svg"));
    let visible = false;
    const sync = () => svgs.forEach(svg => {
      if (!paused && !reduced && visible && !document.hidden) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      svgs.forEach(svg => svg.pauseAnimations());
    };
  }, [paused, reduced, artwork]);

  return <div className="animated-brand" ref={root}>
    <a href="/" aria-label="JCEE WorldLab home" className="animated-brand-link">
      <span className="animated-brand-horizontal" aria-hidden="true" dangerouslySetInnerHTML={artwork[0]} />
      <span className="animated-brand-stacked" aria-hidden="true" dangerouslySetInnerHTML={artwork[1]} />
    </a>
    {!reduced && <button type="button" className="brand-motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? "Play logo animation" : "Pause logo animation"}
    </button>}
  </div>;
}
