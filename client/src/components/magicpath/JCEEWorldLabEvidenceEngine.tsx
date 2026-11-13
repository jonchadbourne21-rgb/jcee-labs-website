import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './JCEEWorldLabEvidenceEngine.css';
type Status = 'Uncertain' | 'Held' | 'Observed';
type Receipt = {
  id: string;
  title: string;
  system: string;
  time: string;
  status: Status;
  request: string;
  authority: string;
  effect: string;
};
const examples: Receipt[] = [{
  id: 'DEMO-0042',
  title: 'Application access request',
  system: 'Identity workflow',
  time: '10:42:18',
  status: 'Uncertain',
  request: 'Add example employee to the research-access group.',
  authority: 'Approval supplied. Current permission must be checked again.',
  effect: 'The response timed out. Target membership has not been observed.'
}, {
  id: 'DEMO-0041',
  title: 'Production service restart',
  system: 'Software operations',
  time: '10:38:04',
  status: 'Held',
  request: 'Restart the fictional production service.',
  authority: 'Permission was withdrawn before dispatch.',
  effect: 'Dispatch held in this example. No external action is performed.'
}, {
  id: 'DEMO-0040',
  title: 'Workspace role change',
  system: 'Business systems',
  time: '10:31:22',
  status: 'Observed',
  request: 'Change an example workspace role to read-only.',
  authority: 'Example approval matches the intended scope.',
  effect: 'The fictional target state matches the requested role.'
}, {
  id: 'DEMO-0039',
  title: 'Service request handoff',
  system: 'Business operations',
  time: '10:24:09',
  status: 'Observed',
  request: 'Pass an example request to the support queue.',
  authority: 'Example routing permission matches the destination.',
  effect: 'A fictional destination record is present. No real request was sent.'
}];
function Icon({
  name,
  size = 18
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
    diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    minus: <path d="M6 12h12" />,
    file: <><path d="M14 3H5v18h14V8l-5-5Z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.2" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
    refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.file}</svg>;
}
function Orbit({
  mini = false
}: {
  mini?: boolean;
}) {
  return <svg className={mini ? 'je-orbit-mini' : 'je-orbit'} viewBox="0 0 260 220" fill="none" aria-hidden="true">
    <defs><linearGradient id={mini ? 'je-mini-line' : 'je-line'} x1="40" y1="20" x2="220" y2="200"><stop stopColor="#b5e1f5" /><stop offset=".45" stopColor="#4689b7" /><stop offset="1" stopColor="#374f66" /></linearGradient></defs>
    <g stroke={`url(#${mini ? 'je-mini-line' : 'je-line'})`} strokeWidth={mini ? 6 : 1.1}>
      <ellipse cx="130" cy="110" rx="101" ry="40" transform="rotate(-34 130 110)" />
      <ellipse cx="130" cy="110" rx="101" ry="40" transform="rotate(34 130 110)" />
      <ellipse cx="130" cy="110" rx="40" ry="101" />
    </g>
    <circle cx="130" cy="110" r="23" fill="#101e2d" stroke="#44627d" /><path d="M134 96v21c0 10-15 10-15 0" stroke="#9aceef" strokeWidth="3" />
    <circle cx="200" cy="66" r={mini ? 8 : 5} fill="#72beff" /><circle cx="63" cy="151" r={mini ? 7 : 3} fill="#78c6c1" /><circle cx="155" cy="203" r={mini ? 7 : 3} fill="#577a97" />
  </svg>;
}
function StatusPill({
  status
}: {
  status: Status;
}) {
  return <span className={`je-status je-status-${status.toLowerCase()}`}><span />{status}</span>;
}
export const JCEEWorldLabEvidenceEngine = () => {
  const [records, setRecords] = useState(examples);
  const [selectedId, setSelectedId] = useState(examples[0].id);
  const [filter, setFilter] = useState('All records');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('Overview');
  const [detailTab, setDetailTab] = useState('Trace');
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const [boundaryOpen, setBoundaryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const selected = records.find(r => r.id === selectedId)!;
  const visible = records.filter(r => (filter === 'All records' || (filter === 'Needs review' ? r.status !== 'Observed' : r.status === 'Observed')) && `${r.title} ${r.id} ${r.system}`.toLowerCase().includes(search.toLowerCase()));
  const reviewCount = records.filter(r => r.status !== 'Observed').length;
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    if (!boundaryOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBoundaryOpen(false);
      if (e.key === 'Tab') {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('keydown', keyHandler);
      previous?.focus();
    };
  }, [boundaryOpen]);
  function navigate(next: string) {
    setView(next);
    setMenuOpen(false);
    setSearch('');
    setFilter(next === 'Review queue' ? 'Needs review' : 'All records');
    setDetailTab(next === 'Evidence library' ? 'Record' : 'Trace');
  }
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setRecords(examples);
    setSelectedId(examples[0].id);
    setRunning(false);
    setNotice('Example reset. No external systems are connected.');
    setFilter('All records');
    setSearch('');
    setView('Overview');
    setDetailTab('Trace');
  }
  function reconcile() {
    setRunning(true);
    setNotice('Checking a fictional target state…');
    timer.current = setTimeout(() => {
      setRecords(current => current.map(r => r.id === 'DEMO-0042' ? {
        ...r,
        status: 'Observed',
        authority: 'Example permission checked again and still matches the request.',
        effect: 'The fictional membership is already present. No repeat dispatch is needed.'
      } : r));
      setRunning(false);
      setNotice('Example reconciled: membership is already present. No retry was sent.');
    }, 900);
  }
  return <div className="je-app" data-demo="browser-only">
    <aside className={`je-sidebar ${menuOpen ? 'je-sidebar-open' : ''}`}>
      <div className="je-workspace"><span className="je-workspace-mark">W</span><div><strong>Example workspace</strong><small>Browser-only example</small></div><span className="je-workspace-dots">···</span></div>
      <p className="je-nav-label">WORKSPACE</p>
      <nav aria-label="Workspace navigation">
        {([['Overview', 'grid'], ['Review queue', 'clock'], ['Evidence library', 'layers']] as const).map(([label, icon]) => <button key={label} className={`je-nav-item ${view === label ? 'active' : ''}`} onClick={() => navigate(label)} aria-current={view === label ? 'page' : undefined}><Icon name={icon} /><span>{label}</span>{label === 'Review queue' && <small>{reviewCount}</small>}</button>)}
      </nav>
      <div className="je-sidebar-divider" />
      <p className="je-nav-label">FOUNDATION</p>
      <button className="je-nav-item" onClick={() => setBoundaryOpen(true)}><Icon name="shield" /><span>Evidence boundaries</span></button>
      <a className="je-nav-item" href="/technology"><Icon name="file" /><span>Engineering reference</span><Icon name="diagonal" size={13} /></a>
      <div className="je-sidebar-bottom"><Orbit /><p>Intelligence that<br />leaves receipts.</p><div className="je-prototype-label"><span /> FICTIONAL WORKSPACE</div><small>Fictional data. No system access.<br />No live or qualified evidence.</small><button onClick={() => setBoundaryOpen(true)}>About this prototype <Icon name="diagonal" size={13} /></button></div>
    </aside>

    <div className="je-shell">
      <header className="je-topbar"><div className="je-breadcrumb"><button className="je-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}><Icon name="menu" /></button><span>Workspace</span><span className="je-slash">/</span><strong>Evidence Engine</strong></div><div className="je-topbar-right"><span className="je-demo-label"><span /> PROTOTYPE</span><span className="je-avatar" aria-label="Example workspace">W</span></div></header>
      <main className="je-main">
        <section className="je-title-row"><div><p className="je-eyebrow"><span /> JCEE INFRASTRUCTURE / EVIDENCE ENGINE</p><h1>{view === 'Overview' ? 'Know what happened.' : view === 'Review queue' ? 'Resolve what’s uncertain.' : 'Follow the evidence.'}</h1><p className="je-subtitle">Current authority. Observed effect. An inspectable record.</p></div><button className="je-button je-button-muted je-reset" onClick={reset}><Icon name="refresh" size={15} /> Reset example</button></section>

        <div className="je-metrics" aria-label="Fictional example counts">
          <div><span className="je-metric-icon"><Icon name="layers" /></span><div><p>Example records</p><strong>{records.length.toString().padStart(2, '0')}</strong></div><small>FICTIONAL DATA</small></div>
          <div><span className="je-metric-icon je-amber"><Icon name="clock" /></span><div><p>Need review</p><strong>{reviewCount.toString().padStart(2, '0')}</strong></div><small>HELD OR UNCERTAIN</small></div>
          <div><span className="je-metric-icon je-mint"><Icon name="check" /></span><div><p>Effect observed</p><strong>{(records.length - reviewCount).toString().padStart(2, '0')}</strong></div><small>ILLUSTRATIVE ONLY</small></div>
        </div>

        <section className="je-feature" aria-labelledby="je-feature-heading">
          <div className="je-feature-copy"><p className="je-eyebrow">01 / THE TIMEOUT ILLUSION</p><h2 id="je-feature-heading">No response.<br /><span>Not the whole story.</span></h2><p>A timeout leaves an open question. Inspect the target state and check current permission before trying again.</p><button className="je-button je-button-primary" onClick={reconcile} disabled={running || records[0].status === 'Observed'}>{running ? <span className="je-spinner" /> : <Icon name={records[0].status === 'Observed' ? 'check' : 'arrow'} size={17} />} {running ? 'Checking example…' : records[0].status === 'Observed' ? 'Example reconciled' : 'Run example check'}</button><small>Browser-local simulation. No external action.</small></div>
          <div className="je-flow"><div className="je-flow-heading"><span>ILLUSTRATIVE CONTROL TRACE</span><span>DEMO-0042</span></div><div className="je-flow-line" aria-label="Illustrative workflow trace">
            <div className="je-flow-node"><div className="je-node-circle"><Icon name="shield" size={25} /></div><span>01 / AUTHORITY</span><strong>Check permission</strong><small>At the point of action</small></div>
            <div className={`je-flow-node ${records[0].status === 'Observed' ? 'resolved' : 'uncertain'}`}><div className="je-node-circle"><Icon name={records[0].status === 'Observed' ? 'check' : 'clock'} size={25} /></div><span>02 / EFFECT</span><strong>{records[0].status === 'Observed' ? 'Already present' : 'Outcome unknown'}</strong><small>{records[0].status === 'Observed' ? 'No repeat dispatch' : 'Response timed out'}</small></div>
            <div className="je-flow-node"><div className="je-node-circle"><Icon name="file" size={25} /></div><span>03 / EVIDENCE</span><strong>Keep the record</strong><small>State the limits</small></div>
          </div><div className={`je-flow-note ${records[0].status === 'Observed' ? 'resolved' : ''}`}><Icon name={records[0].status === 'Observed' ? 'check' : 'info'} size={16} /><span>{records[0].status === 'Observed' ? 'Fictional state observed. The example does not send a retry.' : 'Unknown is a state to resolve, not a reason to retry.'}</span></div></div>
        </section>

        <div className="je-workbench">
          <section className="je-records-panel" aria-labelledby="je-records-heading"><div className="je-panel-heading"><div><h2 id="je-records-heading">Action records</h2><span>Inspect the intent, decision, and result.</span></div><span className="je-mini-label">{visible.length} OF {records.length}</span></div>
            <div className="je-controls"><div className="je-filters" aria-label="Filter records">{['All records', 'Needs review', 'Observed'].map(f => <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'active' : ''} aria-pressed={filter === f}>{f}</button>)}</div><label className="je-search"><Icon name="search" size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a record" aria-label="Search action records" /></label></div>
            <div className="je-list-heading"><span>WORKFLOW / RECORD</span><span>OUTCOME</span></div>
            <div className="je-record-list">{visible.length ? visible.map(r => <button key={r.id} className={`je-record-row ${selectedId === r.id ? 'selected' : ''}`} onClick={() => {
                setSelectedId(r.id);
                setDetailTab('Trace');
              }} aria-pressed={selectedId === r.id}><span className={`je-record-symbol ${r.status.toLowerCase()}`}><Icon name={r.status === 'Observed' ? 'check' : r.status === 'Held' ? 'pause' : 'clock'} size={18} /></span><span className="je-record-name"><strong>{r.title}</strong><small>{r.id}<span>·</span>{r.system}</small></span><span className="je-record-state"><StatusPill status={r.status} /><small>{r.time} / EXAMPLE</small></span><Icon name="chevron" size={16} /></button>) : <div className="je-empty"><Icon name="search" size={24} /><h3>No matching records</h3><p>Try a different name or clear the filters.</p><button onClick={() => {
                  setSearch('');
                  setFilter('All records');
                }}>Clear search and filters</button></div>}</div>
            <div className="je-list-footer"><span className="je-square" /> All records are fictional interface examples.</div>
          </section>

          <section className="je-detail-panel" aria-label="Selected record details"><div className="je-detail-header"><div><span className="je-mini-label">RECORD INSPECTOR</span><h2>{selected.id}<span className="je-detail-dot" /></h2></div></div><div className="je-detail-tabs" role="tablist" aria-label="Record details">{['Trace', 'Record'].map(t => <button key={t} role="tab" aria-selected={detailTab === t} onClick={() => setDetailTab(t)}>{t === 'Trace' && <Icon name="layers" size={14} />} {t === 'Record' && <Icon name="file" size={14} />} {t}</button>)}</div>
            <div className="je-detail-content" role="tabpanel" aria-label={detailTab}>{detailTab === 'Trace' ? <><div className="je-detail-summary"><span>Observed outcome</span><StatusPill status={selected.status} /></div><ol className="je-timeline">{[['Intent captured', selected.request, 'file'], ['Current authority', selected.authority, 'shield'], [selected.status === 'Uncertain' ? 'Effect unresolved' : selected.status === 'Held' ? 'Action held' : 'Effect observed', selected.effect, selected.status === 'Uncertain' ? 'clock' : selected.status === 'Held' ? 'pause' : 'check']].map(([title, body, icon], i) => <li key={title}><span className={`je-timeline-point ${i === 2 ? selected.status.toLowerCase() : ''}`}><Icon name={icon} size={14} /></span><div><strong>{title}</strong><p>{body}</p></div></li>)}</ol></> : <dl className="je-record-summary"><div><dt>Request</dt><dd>{selected.request}</dd></div><div><dt>Permission</dt><dd>{selected.authority}</dd></div><div><dt>Outcome</dt><dd>{selected.effect}</dd></div></dl>}</div>
            <div className="je-detail-boundary"><Icon name="info" size={15} /><p>Example record only. No durable receipt, cryptographic verification, or production qualification.</p></div>
          </section>
        </div>

        <div className="je-announcement" aria-live="polite">{notice}</div>
      </main>
    </div>
    {boundaryOpen && <div className="je-modal-backdrop" onClick={() => setBoundaryOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="je-boundary-title" className="je-modal" onClick={e => e.stopPropagation()}><div className="je-modal-head"><span className="je-eyebrow">PROTOTYPE / EVIDENCE BOUNDARY</span><button ref={closeRef} onClick={() => setBoundaryOpen(false)} className="je-icon-button" aria-label="Close evidence boundaries"><Icon name="close" /></button></div><h2 id="je-boundary-title">A concept you can inspect.</h2><p>This interface explores how JCEE could make authority, uncertain outcomes, and evidence easier to review.</p><ul><li>Every record and timestamp is fictional.</li><li>The example check changes browser-local state only.</li><li>No real systems, VOW engine, or live telemetry are connected.</li><li>The displayed records are examples, not durable or cryptographically verified receipts.</li><li>This concept does not establish production readiness or customer outcomes.</li></ul><div className="je-modal-bottom"><Icon name="shield" /><span>This is a public browser-only interface study, not a connected or qualified evidence system.</span></div></section></div>}
  </div>;
};
