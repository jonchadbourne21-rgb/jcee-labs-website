/** Source-derived, pre-reviewed JCEE editorial redesign (D0.1).
 * Static authored markup only; no user-provided HTML or scripts.
 * Preserve existing routes, public evidence limits and inquiry surfaces.
 */
import { useEffect, useRef } from "react";
import "./EditorialSite.css";

export type EditorialPage = "home" | "infrastructure" | "assurance" | "technology-validation";

const PAGE_HOME = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell nav">
      <a class="logo" href="#top" aria-label="JCEE Labs, home">
        <svg class="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M4 4h40v40H4z" stroke="#17302c" stroke-width="1.5"/><path d="M11 32V17l13-8 13 8v15l-13 8-13-8Z" stroke="#17302c" stroke-width="1.5"/><path d="M11 17l13 8 13-8M24 25v15" stroke="#b44d33" stroke-width="1.5"/><circle cx="24" cy="25" r="3.5" fill="#b44d33"/></svg>
        <span class="logo-name">JCEE<span>LABS</span></span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        <a href="#capabilities">Capabilities</a><a href="#engineering">Engineering services</a><a href="#work">Selected work</a><a href="/research">Research</a><a href="/company">Company</a>
      </nav>
      <a class="nav-cta" href="/consultation">Discuss a project &nbsp;↗</a>
      <button class="menu-btn mobile-menu-toggle" type="button" aria-controls="nav-links" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
    </div>
  </header>
  <main id="main">
    <div class="shell hero" id="top">
      <section class="hero-copy" aria-labelledby="hero-title">
        <div class="hero-kicker eyebrow">Advanced technology &amp; engineering</div>
        <h1 id="hero-title">Build what<br/>comes next.<br/><em>Prove what holds.</em></h1>
        <p class="hero-deck">JCEE Labs invents and engineers advanced technologies. We help teams move from promising ideas to testable systems—with clear evidence of what works, what doesn't, and what remains unknown.</p>
        <div class="actions"><a class="button" href="#capabilities">Explore our work <span aria-hidden="true">↗</span></a><a class="inline-link" href="/consultation">Talk with JCEE <span aria-hidden="true">↗</span></a></div>
        <div class="hero-foot"><span>Dallas, Texas · United States</span><span>Research / Engineering / Verification</span></div>
      </section>
      <aside class="hero-visual" aria-label="Technical illustration of a claim progressing through a verification boundary">
        <div class="visual-head"><span>JCEE / SYSTEM STUDY</span><span>PLATE 001</span></div>
        <div class="floating-annotation">CLAIM<br/>→ TEST PLAN<br/>→ EVIDENCE</div>
        <div class="hero-art">
          <svg viewBox="0 0 530 555" aria-hidden="true">
            <g fill="none" stroke="#76958a" stroke-width="1.2" opacity=".85"><circle cx="265" cy="268" r="160"/><circle cx="265" cy="268" r="118"/><circle cx="265" cy="268" r="72"/><path d="M47 268H483M265 50V490M105 108l320 320M425 108L105 428" stroke-dasharray="4 9"/></g>
            <g fill="none" stroke="#203f39" stroke-width="1.8"><path d="M116 311L219 206L305 269L410 157"/><path d="M116 312L185 346L303 269L410 390" stroke-dasharray="5 7"/><path d="M265 109L265 427" stroke-dasharray="1 8"/></g>
            <g fill="#e4e6dd" stroke="#183c36" stroke-width="3"><circle cx="116" cy="311" r="8"/><circle cx="219" cy="206" r="8"/><circle cx="305" cy="269" r="8"/><circle cx="410" cy="157" r="8"/></g>
            <path d="M410 157L410 390" fill="none" stroke="#b44d33" stroke-width="3"/><path d="M403 382L410 392L417 382" fill="none" stroke="#b44d33" stroke-width="3"/>
            <circle cx="265" cy="268" r="26" fill="#183a34"/><path d="M256 268l6 6 12-14" fill="none" stroke="#e7e9df" stroke-width="2.5"/>
            <g fill="#17372f" font-family="Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="2"><text x="180" y="192">OBSERVE</text><text x="334" y="145">VERIFY</text><text x="311" y="409">REVISE</text><text x="110" y="345">CLAIM</text></g>
            <g stroke="#47645d" fill="none"><path d="M264 67V30M264 467v40M62 268H27M467 268h36"/></g>
          </svg>
        </div>
        <div class="visual-caption"><div><b>FROM HYPOTHESIS TO<br/>INSPECTABLE RESULT</b><span>Visual concept · no runtime action</span></div><span>NOT TO SCALE<br/>© JCEE LABS</span></div>
      </aside>
    </div>
    <section class="capabilities shell section-anchor" id="capabilities" aria-labelledby="cap-heading">
      <div class="section-top"><p class="eyebrow">01 &nbsp;/&nbsp; What we do</p><h2 class="section-deck" id="cap-heading">One engineering company.<br/>Three ways to move work forward.</h2></div>
      <div class="cap-list">
        <a class="cap-row" href="/capabilities/infrastructure"><span class="cap-n">01</span><h3>Intelligent Infrastructure</h3><p>Runtimes, system architecture, and software for operations where execution, continuity, and recovery matter.</p><span class="cap-arr" aria-hidden="true">↗</span></a>
        <a class="cap-row" href="/capabilities/assurance"><span class="cap-n">02</span><h3>Assurance &amp; Evidence</h3><p>Methods and software for examining what systems were permitted to do, what occurred, and what can be supported.</p><span class="cap-arr" aria-hidden="true">↗</span></a>
        <a class="cap-row" href="/capabilities/technology-validation"><span class="cap-n">03</span><h3>Technology Validation</h3><p>Analytical assessment, experimental test design, and technical development for novel materials, devices, and research.</p><span class="cap-arr" aria-hidden="true">↗</span></a>
      </div>
      <div class="eyebrow-band"><span>Infrastructure is what we build.</span><span>Verification is where we start.</span></div>
    </section>
    <section class="dark-section section-anchor" id="engineering" aria-labelledby="eng-title">
      <div class="shell">
        <div class="section-top"><p class="eyebrow">02 &nbsp;/&nbsp; Engineering services</p><h2 class="section-deck" id="eng-title">Expertise you can engage.<br/>Technology you can build on.</h2></div>
        <div class="service-layout">
          <div class="service-main"><h3>From the<br/><em>first claim</em><br/>to the next test.</h3><p>We start with a defined technical question and an honest scope. A useful engagement produces something inspectable: an assessment, a test protocol, a system design, or a documented result.</p><a href="/partners/research" class="inline-link">Discuss research &amp; engineering <span aria-hidden="true">↗</span></a></div>
          <div class="service-items">
            <div class="service-item"><span>01</span><div><h4>Scientific &amp; Technical Assessment</h4><p>Examine assumptions, mathematical models, source evidence, competing explanations, and reproducibility requirements.</p></div></div>
            <div class="service-item"><span>02</span><div><h4>Experimental Verification Engineering</h4><p>Define meaningful measurements, controls, test conditions, decision thresholds, and the evidence a result would need to earn its claim.</p></div></div>
            <div class="service-item"><span>03</span><div><h4>R&amp;D Engineering &amp; Validation Support</h4><p>Translate analysis into bounded implementation steps, verification gates, and technical handoffs. Physical testing is scoped separately.</p></div></div>
            <div class="service-item"><span>04</span><div><h4>Software &amp; Consequence Assurance</h4><p>Examine permissions, target-system effects, recoverability, and inspectable records of consequential software workflows.</p></div></div>
          </div>
        </div>
      </div>
    </section>
    <section class="proof shell section-anchor" id="work" aria-labelledby="work-title">
      <div class="section-top"><p class="eyebrow">03 &nbsp;/&nbsp; Selected work</p><h2 class="section-deck" id="work-title">The work matters.<br/>So do its limits.</h2></div>
      <div class="proof-grid">
        <article class="proof-card"><div class="eyebrow"><span class="tiny-symbol">■</span> SOFTWARE / PUBLIC EVIDENCE</div><h3>What happened after the request?</h3><p>Our published JCEE-INFRA qualification records a bounded synthetic PostgreSQL workflow involving an authorized action, an uncertain outcome, and a reconciled result. It is not a production or universal guarantee.</p><a class="inline-link" href="/registry">Inspect the public record <span aria-hidden="true">↗</span></a></article>
        <article class="proof-card"><div class="eyebrow"><span class="tiny-symbol">■</span> ENGINEERING / HOW WE WORK</div><h3>A better question makes a better test.</h3><p>For an emerging technology, the first deliverable may be a carefully bounded claim, a reproducible test protocol, and a clear list of missing evidence. This is an illustration of our engineering method, not a claim of laboratory qualification.</p><a class="inline-link" href="/partners/research">Discuss a technical assessment <span aria-hidden="true">↗</span></a></article>
      </div>
      <p id="operating-cloud" class="small"><a href="/operating-cloud">Operating Cloud — in development ↗</a></p>
      <div class="limits"><b>Evidence policy</b><span>Published software results, candidate systems, designed experiments, and physical demonstrations are different categories. We describe each within the conditions actually examined. No claim of independent certification or production qualification is implied by these examples. <a class="inline-link" href="/registry">View public registry <span aria-hidden="true">↗</span></a></span></div>
    </section>
    <section class="cta" aria-labelledby="cta-head"><div class="shell cta-row"><div><p class="eyebrow">04 &nbsp;/&nbsp; Start with a question</p><h2 id="cta-head">What are you<br/><em>trying to establish?</em></h2><p>Bring a non-confidential summary of your problem, claim, or system. We’ll determine whether a bounded assessment, engineering engagement, or technical demonstration is the right first step.</p></div><a class="button" href="/consultation">Discuss your project <span aria-hidden="true">↗</span></a></div></section>
  </main>
  <footer class="site-footer brand-footer"><div class="shell"><div class="footer-top"><div class="footer-brand"><div class="footer-lockup">JCEE LABS<span>Intelligence That Leaves Receipts.</span></div><p>An advanced technology and engineering company. Founded by Jonathan Chadbourne in Dallas, Texas.</p></div><nav class="footer-nav" aria-label="Footer links"><div><b>Explore</b><a href="#capabilities">Capabilities</a><a href="#engineering">Engineering services</a><a href="/technology">Technology</a><a href="/research/evidence-standards#evidence-ladder">Evidence standards</a><a href="/research/physical-experiments#physical-validation">Physical experiments</a><a href="/technology#infrastructure-build">Infrastructure overview</a><a href="/research">Research</a><a href="/registry">Public Registry</a></div><div><b>Company</b><a href="/company">About JCEE Labs</a><a href="/founder">Meet the founder</a><a href="/partners">Partner with JCEE Labs</a><a href="/partners/enterprise">Enterprise pathway</a><a href="/partners/research">Research pathway</a><a href="/assurance">JCEE Assurance</a><a href="/terms">Terms</a><a href="mailto:support@jceelabs.com">Email JCEE Labs</a><a href="/privacy">Privacy</a></div></nav></div><div class="footer-bottom"><span>© 2026 JCEE Labs LLC</span><a href="#top">Back to top ↑</a></div></div></footer>`;
const PAGE_INFRASTRUCTURE = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell nav">
      <a class="logo" href="/" aria-label="JCEE Labs, home">
        <svg class="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M4 4h40v40H4z" stroke="#17302c" stroke-width="1.5"/><path d="M11 32V17l13-8 13 8v15l-13 8-13-8Z" stroke="#17302c" stroke-width="1.5"/><path d="M11 17l13 8 13-8M24 25v15" stroke="#b44d33" stroke-width="1.5"/><circle cx="24" cy="25" r="3.5" fill="#b44d33"/></svg>
        <span class="logo-name">JCEE<span>LABS</span></span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        <a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/#evidence">Selected work</a><a href="/research">Research</a><a href="/company">Company</a>
      </nav>
      <a class="nav-cta" href="/consultation">Discuss a project &nbsp;↗</a>
      <button class="menu-btn mobile-menu-toggle" type="button" aria-controls="nav-links" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
    </div>
  </header>
  <main id="main">
  <section class="shell detail-hero" id="top"><div class="detail-copy"><p class="eyebrow">JCEE Labs &nbsp;/&nbsp; Intelligent Infrastructure</p><h1>Build systems that keep their bearings.</h1><p class="detail-intro">JCEE develops execution, continuity, and recovery mechanisms for intelligent systems. Engagements begin with the specific operational boundary and the evidence needed to qualify it.</p><div class="actions"><a href="/consultation" class="button">Discuss a project <span aria-hidden="true">↗</span></a><a class="inline-link" href="/#capabilities">All capabilities <span aria-hidden="true">←</span></a></div><p class="hero-foot">DEFINED SCOPE &nbsp; / &nbsp; INSPECTABLE OUTCOME</p></div><aside class="detail-aside"><p class="eyebrow">Infrastructure for intelligent software.</p><div><h2>Engineering scope</h2><ul><li>Runtime architecture<span aria-hidden="true">↗</span></li><li>Recovery & continuity<span aria-hidden="true">↗</span></li><li>System integration<span aria-hidden="true">↗</span></li></ul></div><p class="small">Engagements are scoped; technical claims remain bounded by their supporting evidence.</p></aside></section>
  <section class="shell detail-band"><div class="section-top"><p class="eyebrow">01 / What we deliver</p><h2 class="section-deck">A specific problem.<br/>A specific next step.</h2></div><div class="deliverables"><article><span class="eyebrow">01 / Deliverable</span><h3>Runtime & application architecture</h3><p>Define where models, services, tools and operators meet, including action ownership, state transitions and failure behavior.</p></article><article><span class="eyebrow">02 / Deliverable</span><h3>Execution & recovery pathways</h3><p>Study interrupted operations, effect identity, permitted retry decisions and exact downstream readback.</p></article><article><span class="eyebrow">03 / Deliverable</span><h3>Integration prototypes</h3><p>Connect components in controlled environments and record the conditions under which the integration has been examined.</p></article></div><div class="detail-note"><strong>Scope &amp; limits</strong> &mdash; JCEE-INFRA, VOW and related engines have individually bounded software results. This preview does not represent a unified production deployment, general A4 qualification or customer release.</div></section>
  <section class="cta"><div class="shell cta-row"><div><p class="eyebrow">02 / Begin with the question</p><h2>Where software meets consequence, the implementation should not have to guess what happened.</h2><p>Share a non-confidential summary. We will determine whether an initial assessment, technical design or controlled pilot is appropriate.</p></div><a href="/consultation" class="button">Talk with JCEE <span aria-hidden="true">↗</span></a></div></section>
  </main>  <footer class="site-footer brand-footer"><div class="shell"><div class="footer-top"><div class="footer-brand"><div class="footer-lockup">JCEE LABS<span>Intelligence That Leaves Receipts.</span></div><p>An advanced technology and engineering company. Founded by Jonathan Chadbourne in Dallas, Texas.</p></div><nav class="footer-nav" aria-label="Footer links"><div><b>Explore</b><a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/technology">Technology</a><a href="/research">Research</a><a href="/registry">Public Registry</a></div><div><b>Company</b><a href="/company">About JCEE Labs</a><a href="/founder">Meet the founder</a><a href="/partners">Partner with JCEE Labs</a><a href="/partners/enterprise">Enterprise pathway</a><a href="/partners/research">Research pathway</a><a href="/assurance">JCEE Assurance</a><a href="/terms">Terms</a><a href="mailto:support@jceelabs.com">Email JCEE Labs</a><a href="/privacy">Privacy</a></div></nav></div><div class="footer-bottom"><span>© 2026 JCEE Labs LLC</span><a href="/">Back to top ↑</a></div></div></footer>`;
const PAGE_ASSURANCE = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell nav">
      <a class="logo" href="/" aria-label="JCEE Labs, home">
        <svg class="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M4 4h40v40H4z" stroke="#17302c" stroke-width="1.5"/><path d="M11 32V17l13-8 13 8v15l-13 8-13-8Z" stroke="#17302c" stroke-width="1.5"/><path d="M11 17l13 8 13-8M24 25v15" stroke="#b44d33" stroke-width="1.5"/><circle cx="24" cy="25" r="3.5" fill="#b44d33"/></svg>
        <span class="logo-name">JCEE<span>LABS</span></span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        <a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/#evidence">Selected work</a><a href="/research">Research</a><a href="/company">Company</a>
      </nav>
      <a class="nav-cta" href="/consultation">Discuss a project &nbsp;↗</a>
      <button class="menu-btn mobile-menu-toggle" type="button" aria-controls="nav-links" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
    </div>
  </header>
  <main id="main">
  <section class="shell detail-hero" id="top"><div class="detail-copy"><p class="eyebrow">JCEE Labs &nbsp;/&nbsp; Assurance & Evidence</p><h1>Trust the record. Not just the response.</h1><p class="detail-intro">We help organizations examine which actions were authorized, what receiving systems actually recorded, and which conclusions the available evidence supports.</p><div class="actions"><a href="/consultation" class="button">Discuss a project <span aria-hidden="true">↗</span></a><a class="inline-link" href="/#capabilities">All capabilities <span aria-hidden="true">←</span></a></div><p class="hero-foot">DEFINED SCOPE &nbsp; / &nbsp; INSPECTABLE OUTCOME</p></div><aside class="detail-aside"><p class="eyebrow">Evidence for consequential software.</p><div><h2>Assurance scope</h2><ul><li>Claim & evidence mapping<span aria-hidden="true">↗</span></li><li>Permission boundaries<span aria-hidden="true">↗</span></li><li>Reconstruction & recovery<span aria-hidden="true">↗</span></li></ul></div><p class="small">Engagements are scoped; technical claims remain bounded by their supporting evidence.</p></aside></section>
  <section class="shell detail-band"><div class="section-top"><p class="eyebrow">01 / What we deliver</p><h2 class="section-deck">A specific problem.<br/>A specific next step.</h2></div><div class="deliverables"><article><span class="eyebrow">01 / Deliverable</span><h3>Technical assurance assessment</h3><p>Define the consequential question, inspect existing controls, and specify what would support or defeat the required claim.</p></article><article><span class="eyebrow">02 / Deliverable</span><h3>Evidence and receipt design</h3><p>Structure the source records, permitted actions, target observations, and provenance needed for later inspection.</p></article><article><span class="eyebrow">03 / Deliverable</span><h3>Adversarial and recovery review</h3><p>Examine changing permissions, timeouts, missing confirmations and uncertain outcomes in a declared test scope.</p></article></div><div class="detail-note"><strong>Scope &amp; limits</strong> &mdash; JCEE Assurance, Evidence Engine and related source-pinned components have bounded test evidence. No general prevention of bypass, certification, production security or independent all-target verification is implied.</div></section>
  <section class="cta"><div class="shell cta-row"><div><p class="eyebrow">02 / Begin with the question</p><h2>A convincing response is not the same thing as an evidenced outcome.</h2><p>Share a non-confidential summary. We will determine whether an initial assessment, technical design or controlled pilot is appropriate.</p></div><a href="/consultation" class="button">Talk with JCEE <span aria-hidden="true">↗</span></a></div></section>
  </main>  <footer class="site-footer brand-footer"><div class="shell"><div class="footer-top"><div class="footer-brand"><div class="footer-lockup">JCEE LABS<span>Intelligence That Leaves Receipts.</span></div><p>An advanced technology and engineering company. Founded by Jonathan Chadbourne in Dallas, Texas.</p></div><nav class="footer-nav" aria-label="Footer links"><div><b>Explore</b><a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/technology">Technology</a><a href="/research">Research</a><a href="/registry">Public Registry</a></div><div><b>Company</b><a href="/company">About JCEE Labs</a><a href="/founder">Meet the founder</a><a href="/partners">Partner with JCEE Labs</a><a href="/partners/enterprise">Enterprise pathway</a><a href="/partners/research">Research pathway</a><a href="/assurance">JCEE Assurance</a><a href="/terms">Terms</a><a href="mailto:support@jceelabs.com">Email JCEE Labs</a><a href="/privacy">Privacy</a></div></nav></div><div class="footer-bottom"><span>© 2026 JCEE Labs LLC</span><a href="/">Back to top ↑</a></div></div></footer>`;
const PAGE_TECHNOLOGY_VALIDATION = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell nav">
      <a class="logo" href="/" aria-label="JCEE Labs, home">
        <svg class="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M4 4h40v40H4z" stroke="#17302c" stroke-width="1.5"/><path d="M11 32V17l13-8 13 8v15l-13 8-13-8Z" stroke="#17302c" stroke-width="1.5"/><path d="M11 17l13 8 13-8M24 25v15" stroke="#b44d33" stroke-width="1.5"/><circle cx="24" cy="25" r="3.5" fill="#b44d33"/></svg>
        <span class="logo-name">JCEE<span>LABS</span></span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        <a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/#evidence">Selected work</a><a href="/research">Research</a><a href="/company">Company</a>
      </nav>
      <a class="nav-cta" href="/consultation">Discuss a project &nbsp;↗</a>
      <button class="menu-btn mobile-menu-toggle" type="button" aria-controls="nav-links" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
    </div>
  </header>
  <main id="main">
  <section class="shell detail-hero" id="top"><div class="detail-copy"><p class="eyebrow">JCEE Labs &nbsp;/&nbsp; Technology Validation</p><h1>New ideas deserve tests that can say no.</h1><p class="detail-intro">For researchers, inventors, and R&D organizations developing complex technologies, we separate what a theory predicts from what an experiment can demonstrate.</p><div class="actions"><a href="/consultation" class="button">Discuss a project <span aria-hidden="true">↗</span></a><a class="inline-link" href="/#capabilities">All capabilities <span aria-hidden="true">←</span></a></div><p class="hero-foot">DEFINED SCOPE &nbsp; / &nbsp; INSPECTABLE OUTCOME</p></div><aside class="detail-aside"><p class="eyebrow">Scientific assessment & experimental engineering.</p><div><h2>Engagement paths</h2><ul><li>Analytical assessment<span aria-hidden="true">↗</span></li><li>Experimental verification<span aria-hidden="true">↗</span></li><li>Validation support<span aria-hidden="true">↗</span></li></ul></div><p class="small">Engagements are scoped; technical claims remain bounded by their supporting evidence.</p></aside></section>
  <section class="shell detail-band"><div class="section-top"><p class="eyebrow">01 / What we deliver</p><h2 class="section-deck">A specific problem.<br/>A specific next step.</h2></div><div class="deliverables"><article><span class="eyebrow">01 / Deliverable</span><h3>Scientific & technical assessment</h3><p>Examine the claim, mathematical structure, model assumptions, existing data and strongest competing explanations.</p></article><article><span class="eyebrow">02 / Deliverable</span><h3>Experimental verification engineering</h3><p>Develop measurable hypotheses, test controls, instruments, acceptance thresholds, blinding and evidence custody requirements.</p></article><article><span class="eyebrow">03 / Deliverable</span><h3>R&D engineering & validation support</h3><p>Build a stage-gated implementation and reproducibility plan, with deliverables matched to actual resources and authority.</p></article></div><div class="detail-note"><strong>Scope &amp; limits</strong> &mdash; A verification protocol is not evidence that a physical test was performed. Independent laboratory execution, certification and demonstrated device performance are separate scopes. Client-specific research remains private.</div></section>
  <section class="cta"><div class="shell cta-row"><div><p class="eyebrow">02 / Begin with the question</p><h2>A good assessment does not promise that an idea works. It shows what it would take to find out.</h2><p>Share a non-confidential summary. We will determine whether an initial assessment, technical design or controlled pilot is appropriate.</p></div><a href="/consultation" class="button">Talk with JCEE <span aria-hidden="true">↗</span></a></div></section>
  </main>  <footer class="site-footer brand-footer"><div class="shell"><div class="footer-top"><div class="footer-brand"><div class="footer-lockup">JCEE LABS<span>Intelligence That Leaves Receipts.</span></div><p>An advanced technology and engineering company. Founded by Jonathan Chadbourne in Dallas, Texas.</p></div><nav class="footer-nav" aria-label="Footer links"><div><b>Explore</b><a href="/#capabilities">Capabilities</a><a href="/#services">Engineering services</a><a href="/technology">Technology</a><a href="/research">Research</a><a href="/registry">Public Registry</a></div><div><b>Company</b><a href="/company">About JCEE Labs</a><a href="/founder">Meet the founder</a><a href="/partners">Partner with JCEE Labs</a><a href="/partners/enterprise">Enterprise pathway</a><a href="/partners/research">Research pathway</a><a href="/assurance">JCEE Assurance</a><a href="/terms">Terms</a><a href="mailto:support@jceelabs.com">Email JCEE Labs</a><a href="/privacy">Privacy</a></div></nav></div><div class="footer-bottom"><span>© 2026 JCEE Labs LLC</span><a href="/">Back to top ↑</a></div></div></footer>`;

const PAGES: Record<EditorialPage,string> = {
  home: PAGE_HOME, infrastructure: PAGE_INFRASTRUCTURE,
  assurance: PAGE_ASSURANCE, "technology-validation": PAGE_TECHNOLOGY_VALIDATION,
};
const PAGE_TITLES: Record<EditorialPage,string> = {
  home: "JCEE Labs — Advanced Technology & Engineering",
  infrastructure: "Intelligent Infrastructure | JCEE Labs",
  assurance: "Assurance & Evidence | JCEE Labs",
  "technology-validation": "Technology Validation | JCEE Labs",
};

export default function EditorialSite({page}: {page: EditorialPage}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.title = PAGE_TITLES[page];
    const root = ref.current;
    if (!root) return;
    const menu = root.querySelector<HTMLButtonElement>(".menu-btn");
    const links = root.querySelector<HTMLElement>(".nav-links");
    const close = () => {
      links?.classList.remove("open");
      menu?.setAttribute("aria-expanded", "false");
    };
    const toggle = () => {
      if (!links) return;
      const opened = links.classList.toggle("open");
      menu?.setAttribute("aria-expanded", String(opened));
    };
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    menu?.addEventListener("click", toggle);
    links?.addEventListener("click", close);
    document.addEventListener("keydown", handleKeys);
    return () => {
      menu?.removeEventListener("click", toggle);
      links?.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeys);
    };
  }, [page]);
  return <div className="jcee-editorial" ref={ref} dangerouslySetInnerHTML={{ __html: PAGES[page] }} />;
}