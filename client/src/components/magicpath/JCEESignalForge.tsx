import React, { useEffect, useRef, useState } from 'react';
import './JCEESignalForge.css';
type Phase = 0 | 1 | 2 | 3;
const phases = [{
  name: 'Intent',
  label: '01 / THE REQUEST',
  title: 'Every action\nstarts with\na signal.',
  detail: 'One instruction. One authorized action. Follow what happens when the response disappears.',
  state: 'READY TO TRANSMIT',
  color: '#6ab8ff'
}, {
  name: 'Silence',
  label: '02 / THE UNKNOWN',
  title: 'No response.\nNot the\nwhole story.',
  detail: 'The request timed out. Did the action fail, or did only the response disappear? The next move matters.',
  state: 'OUTCOME UNKNOWN',
  color: '#efb869'
}, {
  name: 'Observe',
  label: '03 / THE CHECK',
  title: 'Look before\nyou act\nagain.',
  detail: 'Inspect the target state. Check current permission. In this fictional example, the action is already complete.',
  state: 'EFFECT OBSERVED',
  color: '#95cbff'
}, {
  name: 'Record',
  label: '04 / THE RECORD',
  title: 'Make the\ninvisible\ninspectable.',
  detail: 'The example records what was requested, what was checked, and what was observed. No repeat dispatch.',
  state: 'TRACE COMPLETE',
  color: '#6ab8ff'
}];
function Mark({
  small = false
}: {
  small?: boolean;
}) {
  return <svg width={small ? 23 : 34} height={small ? 23 : 34} viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="12" stroke="currentColor" /><ellipse cx="20" cy="20" rx="19" ry="6" transform="rotate(-35 20 20)" stroke="currentColor" /><circle cx="20" cy="20" r="3" fill="currentColor" /></svg>;
}
function Arrow({
  down = false
}: {
  down?: boolean;
}) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={down ? {
    transform: 'rotate(90deg)'
  } : undefined}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function OrbitalField({
  phase,
  motion
}: {
  phase: Phase;
  motion: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({
    x: 0,
    y: 0
  });
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let frame = 0,
      raf = 0,
      width = 0,
      height = 0;
    const resize = () => {
      const b = el.getBoundingClientRect();
      width = b.width;
      height = b.height;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      el.width = width * d;
      el.height = height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const draw = () => {
      frame++;
      const t = motion ? frame * .003 : 0.2;
      ctx.clearRect(0, 0, width, height);
      const cx = width * .56,
        cy = height * .49,
        scale = Math.min(width * .37, height * .43);
      const warm = phase === 1;
      const ambient = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.6);
      ambient.addColorStop(0, warm ? 'rgba(121,79,32,.16)' : 'rgba(36,100,170,.18)');
      ambient.addColorStop(1, 'rgba(4,8,10,0)');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);
      const project = (x: number, y: number, z: number) => {
        const ax = .60 + pointer.current.y * .20,
          ay = -.4 + t * .18 + pointer.current.x * .20;
        const x1 = x * Math.cos(ay) - z * Math.sin(ay),
          z1 = x * Math.sin(ay) + z * Math.cos(ay);
        const y1 = y * Math.cos(ax) - z1 * Math.sin(ax),
          z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
        const p = 3.8 / (3.8 + z2);
        return {
          x: cx + x1 * scale * p,
          y: cy + y1 * scale * p,
          z: z2
        };
      };
      for (let j = 0; j < 15; j++) {
        const angle = j / 15 * Math.PI * 2 + t * .25;
        ctx.beginPath();
        for (let i = 0; i <= 160; i++) {
          const a = i / 160 * Math.PI * 2;
          const r = .79 + .235 * Math.cos(angle);
          let x = r * Math.cos(a),
            y = r * Math.sin(a),
            z = .235 * Math.sin(angle);
          if (phase === 1) {
            const fracture = Math.sin(a * 3 + t) * .04;
            x += Math.cos(a) * fracture;
            y += Math.sin(a) * fracture;
          }
          const p = project(x, y, z);
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = warm ? `rgba(213,159,80,${.15 + j * .014})` : `rgba(100,166,232,${.10 + j * .016})`;
        ctx.lineWidth = j % 4 === 0 ? 1.0 : .55;
        ctx.stroke();
      }
      for (let j = 0; j < 62; j++) {
        const a = j / 62 * Math.PI * 2 + t * .08;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const b = i / 48 * Math.PI * 2;
          const r = .79 + .235 * Math.cos(b);
          const p = project(r * Math.cos(a), r * Math.sin(a), .235 * Math.sin(b));
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = warm ? 'rgba(166,127,72,.20)' : 'rgba(68,127,196,.20)';
        ctx.lineWidth = .6;
        ctx.stroke();
      }
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const a = i / 180 * Math.PI * 2;
          const r = 1.18 + j * .10;
          const p = project(r * Math.cos(a), r * Math.sin(a) * .45, Math.sin(a) * r * .65 + (j - 1) * .14);
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = j === 1 ? 'rgba(106,184,255,.52)' : 'rgba(77,133,207,.18)';
        ctx.lineWidth = j === 1 ? .9 : .6;
        ctx.stroke();
      }
      for (let i = 0; i < 90; i++) {
        const a = i * 2.39996 + t * (i % 2 ? 1 : -1) * .14,
          r = .53 + i % 8 * .12;
        const p = project(Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 3.7) * .53);
        ctx.fillStyle = warm ? 'rgba(247,201,129,.7)' : 'rgba(176,218,255,.72)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, i % 11 === 0 ? 1.7 : .7, 0, Math.PI * 2);
        ctx.fill();
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * .43);
      core.addColorStop(0, warm ? 'rgba(254,207,132,.38)' : 'rgba(106,184,255,.29)');
      core.addColorStop(.22, warm ? 'rgba(207,150,72,.10)' : 'rgba(69,134,209,.12)');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.fillRect(cx - scale, cy - scale, scale * 2, scale * 2);
      ctx.fillStyle = warm ? '#e6b877' : '#6ab8ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (motion) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [phase, motion]);
  return <canvas ref={canvas} className="sf-canvas" role="img" aria-label="Procedurally rendered orbital sculpture, shifting from orbital blue to amber when the outcome is uncertain" onPointerMove={e => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: (e.clientX - r.left) / r.width - .5,
      y: (e.clientY - r.top) / r.height - .5
    };
  }} onPointerLeave={() => pointer.current = {
    x: 0,
    y: 0
  }} />;
}
export const JCEESignalForge = () => {
  const [phase, setPhase] = useState<Phase>(0);
  const [motion, setMotion] = useState(false);
  useEffect(() => { setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  const [playing, setPlaying] = useState(false);
  const [branch, setBranch] = useState(false);
  const [modal, setModal] = useState<'trace' | null>(null);
  const [notice, setNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const current = phases[phase];
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => () => clear(), []);
  useEffect(() => {
    if (!modal) return;
    const prev = document.activeElement as HTMLElement;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'Tab') {
        const items = dialog.current?.querySelectorAll<HTMLElement>('button,a[href],input');
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      prev?.focus();
    };
  }, [modal]);
  function selectPhase(p: Phase) {
    clear();
    setPlaying(false);
    setBranch(false);
    setPhase(p);
    setNotice(`Scene ${p + 1}: ${phases[p].name}. Fictional simulation.`);
  }
  function play() {
    clear();
    setPhase(0);
    setBranch(false);
    setPlaying(true);
    setNotice('Fictional request sent. Watch for the response.');
    timer.current = setTimeout(() => {
      setPhase(1);
      setPlaying(false);
      setNotice('The response timed out. Choose the next move below.');
    }, 2200);
  }
  function inspect() {
    clear();
    setBranch(false);
    setPhase(2);
    setPlaying(true);
    setNotice('Checking fictional target state and current permission.');
    timer.current = setTimeout(() => {
      setPhase(3);
      setPlaying(false);
      setNotice('Example complete: the effect was already present. No repeat dispatch.');
    }, 1800);
  }
  function retry() {
    clear();
    setPlaying(false);
    setBranch(true);
    setPhase(1);
    setNotice('Unsafe branch simulated: a blind retry could duplicate an action. No actual action was sent.');
  }
  return <div className="sf-app" data-demo="browser-only" style={{
    '--sf-accent': current.color
  } as React.CSSProperties}>

    <main>
      <section className="sf-hero" id="experience" aria-labelledby="sf-title">
        <div className="sf-hero-grid" aria-hidden="true" />
        <div className="sf-art"><OrbitalField phase={phase} motion={motion} /><div className="sf-art-top"><span>CAUSAL FIELD / LOCAL RENDER</span><span>SF—0042</span></div><div className="sf-sculpture-label"><span className="sf-cross">+</span><div><span>SIGNAL FORGE</span><small>A study in action & consequence</small></div></div><div className="sf-orbit-caption"><span className="sf-dot" /> {current.state}</div></div>
        <div className="sf-hero-copy"><p className="sf-eyebrow"><span className="sf-line" /> INTELLIGENCE THAT LEAVES RECEIPTS</p><div className="sf-scene-label">{current.label}</div><h1 id="sf-title" key={phase}>{current.title.split('\n').map((line, i) => <React.Fragment key={i}>{i === 1 ? <em>{line}</em> : line}{i < 2 && <br />}</React.Fragment>)}</h1><p className="sf-description">{current.detail}</p><div className="sf-hero-actions"><button className="sf-primary" onClick={phase === 1 ? inspect : play} disabled={playing}>{playing ? <span className="sf-spin" /> : <span className="sf-play">▷</span>}{playing ? 'Sequence running' : phase === 1 ? 'Inspect the state' : phase === 3 ? 'Replay the experience' : 'Enter the simulation'}<Arrow /></button><button className="sf-sound" onClick={() => setMotion(!motion)} aria-pressed={motion} aria-label={motion ? 'Pause ambient motion' : 'Enable ambient motion'}>{motion ? <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="2" height="10" /><rect x="8" y="2" width="2" height="10" /></svg> : <span aria-hidden="true">▷</span>}</button></div><p className="sf-small-note">INTERACTIVE CONCEPT <span>·</span> FICTIONAL DATA <span>·</span> NO LIVE ACTIONS</p></div>
        <div className="sf-hero-bottom"><span>SCROLL TO EXPLORE <Arrow down /></span><span>DESIGNED TO BE QUESTIONED.</span><span className="sf-motion-status">MOTION {motion ? 'ON' : 'OFF'} <i /></span></div>
      </section>
      <section className="sf-sequence" aria-label="Explore the four scenes">{phases.map((p, i) => <button key={p.name} onClick={() => selectPhase(i as Phase)} className={phase === i ? 'active' : ''} aria-pressed={phase === i}><span className="sf-step-number">0{i + 1}</span><span className="sf-step-text"><strong>{p.name}</strong><small>{['A request enters the system', 'The response disappears', 'Check before repeating', 'Keep an inspectable record'][i]}</small></span><span className="sf-step-indicator">{phase === i ? '●' : <Arrow />}</span></button>)}</section>
      <section className="sf-decision" ref={statusRef} aria-labelledby="sf-decision-title"><div className="sf-decision-intro"><p className="sf-eyebrow">THE HUMAN IN THE LOOP</p><h2 id="sf-decision-title">One silence.<br /><span>Two very different moves.</span></h2><p>A missing response leaves two possibilities: the action failed, or the confirmation was lost.</p></div><div className="sf-decision-body"><div className={`sf-outcome ${branch ? 'warning' : ''}`}><span className="sf-dot" /><strong>{branch ? 'A blind retry risks a duplicate.' : phase === 3 ? 'Observed. Recorded. No repeat dispatch.' : phase === 2 ? 'Checking state and authority…' : 'A timeout tells you about the response. Not the effect.'}</strong><p>{branch ? 'This is an illustrative risk, not an observed production event. Reset the branch by inspecting the fictional target.' : phase === 3 ? 'The fictional membership already exists. The example keeps the trace instead of repeating the action.' : 'Explore both choices below. Everything stays in your browser.'}</p></div><div className="sf-choice-row"><button className="sf-choice safe" onClick={inspect} disabled={playing}><span className="sf-choice-icon">◎</span><span><strong>Inspect the state</strong><small>Observe first. Decide second.</small></span><Arrow /></button><button className="sf-choice risk" onClick={retry} disabled={playing}><span className="sf-choice-icon">↻</span><span><strong>Try a blind retry</strong><small>Explore the unsafe branch.</small></span><Arrow /></button></div><div className="sf-trace-link"><span>{phase === 3 ? 'TRACE / DEMO-SF-0042' : 'BROWSER-LOCAL SIMULATION'}</span><button onClick={() => setModal('trace')}>Inspect the example trace <Arrow /></button></div></div></section>

      <div className="sf-announcement" aria-live="polite">{notice}</div>
    </main>
    {modal && <div className="sf-backdrop" onMouseDown={e => {
      if (e.target === e.currentTarget) setModal(null);
    }}><section ref={dialog} className="sf-dialog" role="dialog" aria-modal="true" aria-labelledby="sf-dialog-title"><div className="sf-dialog-top"><span className="sf-eyebrow">FICTIONAL EXAMPLE / DEMO-SF-0042</span><button onClick={() => setModal(null)} aria-label="Close dialog">×</button></div><h2 id="sf-dialog-title">A trace you can question.</h2><><p className="sf-dialog-lead">A completed illustrative trace, independent of the scene you are viewing. It is not a durable or cryptographically verified receipt.</p><ol className="sf-receipt"><li><span>01</span><div><strong>Intent captured</strong><p>Add an example member to an example workspace.</p></div></li><li><span>02</span><div><strong>Response timed out</strong><p>The effect is unknown. A timeout alone does not authorize a retry.</p></div></li><li><span>03</span><div><strong>Authority and state checked</strong><p>Example permission still matches. The fictional membership is already present.</p></div></li><li><span>04</span><div><strong>No repeat dispatch</strong><p>Record the observation and its limits. No real system was contacted.</p></div></li></ol></><div className="sf-dialog-boundary">Fictional data. This browser-only example does not contact external systems or create a verified receipt.</div></section></div>}
  </div>;
};
