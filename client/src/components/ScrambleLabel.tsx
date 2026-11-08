import { useEffect, useRef, useState } from "react";

const CHARACTERS = "01ACEF2479ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Short hover-only decryption effect. The accessible label remains stable. */
export default function ScrambleLabel({ text, className = "" }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text);
  const timer = useRef<number | null>(null);
  const ticks = useRef(0);
  const stop = () => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; setShown(text); };
  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);
  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current !== null) window.clearInterval(timer.current);
    ticks.current = 0;
    timer.current = window.setInterval(() => {
      ticks.current += 1;
      const count = Math.floor(ticks.current * text.length / 10);
      const next = Array.from(text).map((char, i) => {
        if (i < count || /[^A-Za-z0-9]/.test(char)) return char;
        return CHARACTERS[(i * 7 + ticks.current * 3) % CHARACTERS.length];
      }).join("");
      setShown(next);
      if (ticks.current >= 10) stop();
    }, 33);
  };
  return <span className={className} aria-label={text} role="text" onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>{shown}</span>;
}
