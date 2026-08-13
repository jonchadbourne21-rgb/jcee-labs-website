import { useEffect } from "react";

const contents = [
  ["preamble", "Preamble"],
  ["why", "I. Why JCEE Labs Exists"],
  ["problems", "II. The Problems We Pursue"],
  ["refuse", "III. The Problems We Refuse"],
  ["research", "IV. Our Research Principles"],
  ["engineering", "V. Our Engineering Principles"],
  ["publication", "VI. Our Publication Principles"],
  ["governance", "VII. Human Responsibility and AI Governance"],
  ["law", "VIII. Law Is the Floor"],
  ["success", "IX. What Success Looks Like"],
  ["constraint", "X. A Living Constraint"],
  ["references", "Regulatory References"],
  ["revisions", "Revision History"],
];

const githubUrl =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website/blob/main/public/JCEE_Labs_Charter_v1.0.md";

export default function Charter() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "The JCEE Labs Charter";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="charter-page" id="top">
      <header className="site-header charter-header">
        <a className="wordmark" href="/" aria-label="JCEE Labs home">
          <img className="wordmark-mark" src="/brand/jcee-labs-mark.png" alt="" aria-hidden="true" />
          <span>JCEE LABS</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="/#vow">VOW</a>
          <a href="/#mirrored">MIRRORED</a>
          <span className="nav-menu">
            <a href="/#company">ABOUT</a>
            <span className="nav-submenu">
              <a href="/charter" aria-current="page">CHARTER</a>
              <a href="/research-evidence">RESEARCH &amp; EVIDENCE</a>
            </span>
          </span>
        </nav>

        <a className="header-contact" href="mailto:support@jceelabs.com">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="charter-masthead">
        <p className="eyebrow"><span /> PUBLIC STANDARD · VERSION 1.0</p>
        <h1 className="charter-title">The JCEE Labs<br /><em>Charter</em></h1>
        <p className="charter-position">
          This is not a blog post. It is the public standard JCEE Labs agrees
          to be judged against.
        </p>
        <div className="charter-version-row">
          <span>VERSION 1.0 — AUGUST 4, 2026</span>
          <span>STATUS · CURRENT</span>
        </div>
      </section>

      <div className="charter-shell">
        <aside className="charter-toc" aria-label="Charter table of contents">
          <p>CONTENTS</p>
          <ol>
            {contents.map(([id, label]) => (
              <li key={id}><a href={`#${id}`}>{label}</a></li>
            ))}
          </ol>
          <div className="charter-file-links">
            <a href={githubUrl} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a>
            <a href="/JCEE_Labs_Charter_v1.0.md" download>DOWNLOAD .MD ↓</a>
          </div>
        </aside>

        <article className="charter-document">
          <section id="preamble">
            <p className="charter-section-label">PREAMBLE</p>
            <p className="charter-opening">Artificial intelligence has been granted increasing power before the systems around it have earned corresponding trust.</p>
            <p>An AI-enabled system can modify data, initiate consequential actions, coordinate complex work, and operate across long periods. Yet the same system may fail mid-run and lose a day of work. It may alter or delete information without leaving enough evidence to reconstruct what happened. Its execution history may disappear. It may restart without understanding its prior state—or never restart at all. It may report success with confidence while offering no independently testable proof that the work was completed correctly.</p>
            <p>These are not merely inconveniences. They are failures of architecture, accountability, and institutional judgment.</p>
            <p>JCEE Labs exists to close the gap between what intelligent systems are capable of doing and what they can be trusted to do. We build and study systems whose actions can be inspected, whose histories can endure, whose failures can become knowledge, and whose claims can be tested against evidence.</p>
            <p>We are not opposed to artificial intelligence. We are opposed to unaccountable power, unverifiable claims, disposable history, and the human habit of blaming tools for choices made by people.</p>
            <p>Our position is straightforward:</p>
            <blockquote>Capability without accountability is unfinished engineering.</blockquote>
            <p>This Charter defines why JCEE Labs exists, which problems deserve our attention, how we conduct research, how we engineer consequential systems, what we publish, what we protect, what we refuse, and how we will know whether our work mattered.</p>
            <p>It is both a public commitment and an internal constraint. It is intended to govern us most when convenience, excitement, competition, or profit would tempt us to behave differently.</p>
          </section>

          <section id="why">
            <h2><span>I.</span> Why JCEE Labs Exists</h2>
            <p>JCEE Labs exists to make advanced software more capable without making human responsibility weaker.</p>
            <p>The software industry has become exceptionally good at producing demonstrations of intelligence. It is less mature at producing durable proof of execution. Systems are often judged by whether they generate a convincing answer, complete an ideal-path demo, or appear autonomous under controlled conditions. That standard becomes inadequate when software is trusted with real data, real permissions, real money, real infrastructure, or work that unfolds beyond a single session.</p>
            <p>In consequential environments, a system should be able to answer more than <em>What did you intend to do?</em> It should be able to establish:</p>
            <ul>
              <li>What actually happened?</li>
              <li>Which actions produced external effects?</li>
              <li>Which actions were attempted but not completed?</li>
              <li>What evidence supports each consequential claim?</li>
              <li>What state existed immediately before failure?</li>
              <li>Can execution resume without duplicating or losing effects?</li>
              <li>What did the system learn, and what prevents the same failed path from being repeated blindly?</li>
              <li>Which human authorized the objective, permissions, and boundaries?</li>
            </ul>
            <p>JCEE Labs works on the infrastructure, methods, and ideas required to answer those questions honestly.</p>
            <p>Our purpose is not to make AI appear trustworthy. It is to create conditions under which trust can be earned, tested, limited, and withdrawn.</p>
            <h3>Our founding conviction</h3>
            <p>The central problem is not that machines have become too intelligent. The deeper problem is that humans are deploying increasingly capable systems through architectures that forget, obscure, overclaim, fail silently, or make responsibility difficult to locate.</p>
            <p>The human layer remains decisive. People define objectives, grant authority, select incentives, establish deployment environments, accept evidence, and decide which consequences are tolerable. AI can participate in reasoning and execution; it cannot be used as a moral shield by the people and institutions that place it into the world.</p>
            <p>At JCEE Labs, accountability always resolves upward to humanity.</p>
          </section>

          <section id="problems">
            <h2><span>II.</span> The Problems We Pursue</h2>
            <p>We pursue consequential human and technical problems for which better architecture, deeper research, or a more disciplined model of execution can produce a demonstrable improvement.</p>
            <p>We are especially drawn to problems involving:</p>
            <ul>
              <li>reliable execution across interruption, failure, and recovery;</li>
              <li>durable histories of what systems attempted, observed, decided, and changed;</li>
              <li>independently inspectable evidence for consequential actions;</li>
              <li>safe coordination among humans, models, agents, tools, and external systems;</li>
              <li>bounded authority, explicit permissions, and meaningful human control;</li>
              <li>learning mechanisms that preserve failed paths as usable knowledge;</li>
              <li>evaluation methods that separate genuine structural improvement from persuasive presentation;</li>
              <li>the conversion of experimental discoveries into reliable systems; and</li>
              <li>tools that expand human creativity and agency without concealing responsibility.</li>
            </ul>
            <p>We do not limit ourselves to one product category. We pursue mechanisms that may matter across products, environments, and industries. A narrow implementation may be worth building when it tests a broader principle. A broad idea is not worth pursuing when it cannot survive a narrow test.</p>
            <h3>The JCEE Project Gate</h3>
            <p>An idea does not deserve our time merely because it is interesting or technically possible. Before JCEE Labs commits meaningful effort, we ask:</p>
            <ol className="charter-gate">
              <li><strong>Is there a real problem?</strong><p>The work must address a consequential human or technical failure—not novelty in search of a use.</p></li>
              <li><strong>Is the proposed solution better than what already exists?</strong><p>Difference alone is not improvement. The advantage must be defined in terms that can be observed and compared.</p></li>
              <li><strong>Can the central claim be falsified?</strong><p>We must be able to describe what evidence would prove the idea wrong, insufficient, or limited.</p></li>
              <li><strong>Can the advantage be demonstrated rather than merely described?</strong><p>A claim earns weight through tests, artifacts, traces, benchmarks, recoveries, or other inspectable evidence.</p></li>
              <li><strong>Which JCEE Labs principle does the project serve?</strong><p>Every material feature and research program must connect to a governing principle. If we cannot identify the principle, we reconsider the work.</p></li>
              <li><strong>Does the result justify the time and effort required?</strong><p>Opportunity cost is real. A possible project may still be the wrong project.</p></li>
              <li><strong>Does the work advance or interfere with the company’s vision?</strong><p>Revenue, attention, and technical novelty do not excuse strategic drift.</p></li>
            </ol>
            <p>A project that fails this gate may be revised, deferred, or refused. Discipline in what we do not build protects the quality of what we do.</p>
          </section>

          <section id="refuse">
            <h2><span>III.</span> The Problems We Refuse</h2>
            <p>JCEE Labs will refuse work whose primary value depends on:</p>
            <ul>
              <li>deception, impersonation, or manipulation;</li>
              <li>mass surveillance or indiscriminate monitoring;</li>
              <li>autonomous weapons or automated targeting;</li>
              <li>engineered addiction or the exploitation of psychological vulnerability;</li>
              <li>removing meaningful human authority from irreversible, high-impact decisions;</li>
              <li>claims that cannot be honestly tested, inspected, or audited; or</li>
              <li>using AI as a mechanism for laundering human responsibility.</li>
            </ul>
            <p>These refusals apply regardless of profitability, prestige, competitive pressure, or technical interest.</p>
            <p>We also refuse collaborations founded on a basic evasion: that AI itself is the responsible party and that the humans designing, directing, deploying, or profiting from it are merely bystanders. We will explain our methods and publish our reasoning, but our research mission is not remedial debate over whether humans remain accountable for human-created systems.</p>
            <p>This does not mean every failure is caused by a single operator, nor that responsibility is always simple. Responsibility may be distributed across designers, model providers, deployers, organizations, and users. But distributed responsibility is not absent responsibility.</p>
            <blockquote>We will not allow complexity to become an alibi.</blockquote>
          </section>

          <section id="research">
            <h2><span>IV.</span> Our Research Principles</h2>
            <h3>1. Begin with a falsifiable claim</h3>
            <p>Research begins by defining the claim, its scope, the mechanism believed to produce the result, and the evidence that would count against it. A theory that explains every possible outcome predicts none of them.</p>
            <p>We distinguish among evidence that supports a hypothesis, evidence that contradicts it, and evidence that remains inconclusive. We do not force uncertainty into a binary verdict for the sake of a stronger headline.</p>
            <h3>2. Evidence outranks attachment</h3>
            <p>We may care deeply about an idea. The evidence does not owe that idea success.</p>
            <p>When results contradict a JCEE Labs hypothesis, we preserve the failure and its complete evidence. We do not erase the run, hide the inconvenient case, silently change the test, or treat the failed result as an embarrassment to be cleaned away.</p>
            <p>A contradictory result is opened to reproduction and adversarial testing when responsible. One failure may reveal a broken theory, a narrow boundary, an implementation defect, or an invalid experiment. Our task is to determine which—not to choose the interpretation that protects our pride.</p>
            <h3>3. Failure must become durable knowledge</h3>
            <p>A failed experiment is valuable only if the conditions, actions, observations, and outcome survive long enough to teach us something.</p>
            <p>We preserve negative paths, disconfirming evidence, and meaningful anomalies. We design research records so future work can distinguish a genuinely new attempt from the repetition of a known mistake. Memory is not merely storage; it is the ability to let prior evidence constrain future behavior.</p>
            <h3>4. Mechanism matters more than category recognition</h3>
            <p>We seek to understand why a result transfers, not merely where a familiar pattern appears to work. When testing a proposed general principle, we vary task families, representations, implementations, and surface cues so that apparent transfer cannot be explained by memorizing a category.</p>
            <p>We prefer the smallest experiment capable of closing a gate. If a simple controlled environment can falsify a general claim, we run that test before adding realism, scale, or complexity.</p>
            <h3>5. Claims must remain within the evidence boundary</h3>
            <p>A successful demonstration establishes what it tested—not everything that resembles it.</p>
            <p>We state assumptions, scope conditions, unresolved questions, and known limitations. We distinguish research evidence from product readiness, benchmarks from guarantees, and support for compliance from formal conformity assessment.</p>
            <h3>6. Independent challenge improves the work</h3>
            <p>Where responsible and practical, we invite independent reproduction, adversarial evaluation, and attempts to break our claims. Criticism is most valuable when it can identify the test, assumption, or mechanism in dispute.</p>
            <p>We do not measure research quality by how difficult it is to criticize. We measure it by how clearly criticism can reach the truth.</p>
          </section>

          <section id="engineering">
            <h2><span>V.</span> Our Engineering Principles</h2>
            <h3>1. Recovery is part of correctness</h3>
            <p>A system that works only when nothing interrupts it is not reliable enough for consequential work.</p>
            <p>Our systems should recover cleanly after process death, operator loss, network interruption, or other expected failures. Recovery must begin from durable evidence of prior state, not from optimistic guesses. Work already completed should not be lost, and consequential effects should not be duplicated merely because execution resumed.</p>
            <h3>2. History must survive the process that created it</h3>
            <p>Logs that disappear with the worker cannot establish what happened.</p>
            <p>Consequential systems should maintain a durable and independently inspectable history. That history should make it possible to reconstruct relevant actions, transitions, effects, failures, and recoveries. The evidence should outlive the process, model session, or operator that produced it.</p>
            <h3>3. Effects must be provable and safely repeatable</h3>
            <p>Where systems can change the external world, intent is not enough. We require evidence about whether an effect was attempted, committed, observed, or recovered.</p>
            <p>Retries must be designed around the semantics of the effect. When an operation requires exactly-once behavior, idempotency, deduplication, keyed effects, reconciliation, or another explicit mechanism must make that property testable. We do not turn a desirable slogan into a guarantee without proof.</p>
            <h3>4. Failure must be explicit</h3>
            <p>Silent corruption is worse than an honest stop.</p>
            <p>Systems should expose failures as distinguishable states, preserve the evidence needed to diagnose them, and avoid presenting partial completion as success. Degraded or uncertain behavior must be labeled as such.</p>
            <h3>5. Authority must be bounded</h3>
            <p>Capability does not imply permission.</p>
            <p>Agents, models, tools, and operators should receive only the authority required for their defined role. Permissions should be explicit, reviewable, and revocable. Secrets should remain outside public evidence and should not be embedded unnecessarily in instructions, traces, or artifacts.</p>
            <h3>6. Humans retain authority over irreversible consequences</h3>
            <p>Meaningful human authority must remain available wherever actions can materially affect rights, safety, livelihood, privacy, or other high-impact interests.</p>
            <p>Human oversight is not a ceremonial approval box. The responsible person must receive enough information to understand the proposed action, its evidence, its uncertainty, and the consequences of approving or rejecting it.</p>
            <h3>7. Auditability is designed in</h3>
            <p>Evidence architecture should not be added after deployment as a reporting feature. The system’s ability to prove, resume, constrain, and explain its execution must be considered from the beginning.</p>
            <h3>8. The system must not depend on belief in JCEE Labs</h3>
            <p>Our strongest engineering outcome is one that can be verified without trusting our reputation, confidence, or marketing. A third party should be able to inspect the relevant evidence and reach a conclusion independently.</p>
          </section>

          <section id="publication">
            <h2><span>VI.</span> Our Publication Principles</h2>
            <p>JCEE Labs publishes to contribute durable knowledge, expose claims to scrutiny, and allow others to distinguish demonstrated results from ambition.</p>
            <h3>We publish negative and contradictory results</h3>
            <p>Meaningful failures belong in the research record. We will not publish only the experiments that make our theories look inevitable. When negative or contradictory results materially change the interpretation of a claim, we disclose them with the context required to understand their significance.</p>
            <h3>We protect mechanisms without making untestable claims</h3>
            <p>Independent testability does not require indiscriminate disclosure of every proprietary mechanism, source file, security control, or implementation detail.</p>
            <p>JCEE Labs may protect intellectual property while exposing a claim to meaningful independent testing. The standard is not whether every internal detail is public. The standard is whether the public evidence is sufficient to test the public claim.</p>
            <p>We will not use intellectual-property protection as an excuse to make grand claims that no outsider can challenge.</p>
            <h3>We withhold information when disclosure would create material harm</h3>
            <p>We do not publish private data, credentials, exploit instructions, security-sensitive implementation details, or information whose release would create a material and foreseeable danger.</p>
            <p>Responsible withholding must protect people, systems, or legitimate intellectual property—not protect a claim from scrutiny.</p>
            <h3>We disclose the boundary of what we know</h3>
            <p>Public work should identify material limitations, conflicts of interest, revisions, contradictory evidence, and unresolved uncertainty. When later evidence changes a published conclusion, we correct or revise the record rather than allowing an obsolete claim to remain silently authoritative.</p>
            <p>Publication is not performance. It is part of the evidence system.</p>
          </section>

          <section id="governance">
            <h2><span>VII.</span> Human Responsibility and AI Governance</h2>
            <p>JCEE Labs rejects two equally inadequate positions.</p>
            <p>The first is careless acceleration: the belief that increasing capability excuses weak controls, missing evidence, or unclear responsibility.</p>
            <p>The second is technological scapegoating: the belief that the tool itself can absorb the moral responsibility of the humans and institutions that design, deploy, direct, and govern it.</p>
            <p>We choose neither.</p>
            <p>AI can increase the scale, speed, and complexity of human action. That makes disciplined governance more important, not human responsibility less relevant. The accountability chain may contain many participants, but its top remains human.</p>
            <p>For JCEE Labs, responsible AI therefore means:</p>
            <ul>
              <li>humans define the purpose and acceptable boundaries;</li>
              <li>authority is intentionally granted rather than silently accumulated;</li>
              <li>consequential actions create inspectable evidence;</li>
              <li>high-impact decisions preserve meaningful human control;</li>
              <li>organizations remain answerable for the systems they deploy;</li>
              <li>failures are investigated rather than attributed vaguely to “the AI”; and</li>
              <li>safeguards are treated as engineering requirements, not public-relations language.</li>
            </ul>
            <p>We will work with people and institutions prepared to accept that responsibility.</p>
          </section>

          <section id="law">
            <h2><span>VIII.</span> Law Is the Floor</h2>
            <p>JCEE Labs supports regulation grounded in evidence, technical reality, proportionality, fundamental rights, and a serious understanding of how AI systems are actually built and operated.</p>
            <p>The European Union’s AI Act reflects an important movement toward risk-based governance. Among its provisions, it associates higher-risk systems with requirements concerning risk management, activity logging and traceability, documentation, human oversight, robustness, cybersecurity, and accuracy. These concerns align with much of the engineering territory JCEE Labs believes consequential systems must address.</p>
            <p>But legal compliance is not the ceiling of responsibility.</p>
            <p>We aim to build systems whose evidence can support audits, regulatory analysis, and organizational accountability. We will not imply that a product, evidence bundle, benchmark, or research result constitutes legal conformity, certification, or an official assessment unless that determination has been made through the appropriate formal process.</p>
            <p>We support regulation that constrains harmful uses without treating AI itself as the moral actor. Rules should locate duties among the people and organizations able to make decisions, implement controls, and bear consequences.</p>
            <p>Laws will change. Our obligation to produce honest evidence should not depend on whether a particular jurisdiction has already required it.</p>
          </section>

          <section id="success">
            <h2><span>IX.</span> What Success Looks Like</h2>
            <p>JCEE Labs succeeds if it helps establish a new standard for provable autonomous systems and if its products materially improve how people and machines work together.</p>
            <p>Success will be visible when:</p>
            <ul>
              <li>interrupted work can resume from durable state instead of beginning again;</li>
              <li>consequential effects can be reconstructed and verified;</li>
              <li>failures produce reusable knowledge rather than disappearing history;</li>
              <li>public claims can survive independent testing;</li>
              <li>human operators gain leverage without surrendering authority;</li>
              <li>organizations can adopt advanced systems without accepting blind trust as an operating requirement;</li>
              <li>JCEE Labs principles influence systems beyond JCEE Labs; and</li>
              <li>our work remains useful even to someone who does not know or trust our name.</li>
            </ul>
            <p>Revenue, growth, recognition, patents, and market adoption may sustain and extend the mission. They are not substitutes for it. A commercially successful product that weakens our principles is not a JCEE Labs success. A respected theory that does not improve real systems is incomplete.</p>
            <p>Our deepest success would be cultural as well as technical: that the question asked of autonomous systems changes from <em>Does it look intelligent?</em> to <em>What can it prove?</em></p>
          </section>

          <section id="constraint">
            <h2><span>X.</span> A Living Constraint</h2>
            <p>This Charter is intended to endure, but it is not immune to evidence.</p>
            <p>JCEE Labs may revise it as our research matures, our responsibilities expand, or our understanding changes. Revisions should be dated and preserved. We will not silently rewrite our founding principles to make past decisions appear consistent or present compromises appear inevitable.</p>
            <p>When a proposed action conflicts with this Charter, the first question is:</p>
            <blockquote>Which principle does this serve?</blockquote>
            <p>If the answer is unclear, the action should pause.</p>
            <p>If the answer depends on hiding evidence, displacing human responsibility, exploiting vulnerability, or weakening meaningful oversight, the action should stop.</p>
            <p>If evidence proves one of our assumptions wrong, we preserve the evidence, invite serious challenge, and improve the work.</p>
            <p>That is the institution we intend to build: unusually constructed, independently testable, and willing to be governed by the same standard it asks of intelligent systems.</p>
            <div className="charter-signoff">
              <strong>Evidence over claims.</strong>
              <strong>Capability with accountability.</strong>
              <strong>Humanity remains responsible.</strong>
            </div>
          </section>

          <section id="references" className="charter-references">
            <h2>Regulatory References</h2>
            <ul>
              <li><a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" target="_blank" rel="noreferrer">European Commission, AI Act overview and implementation framework ↗</a></li>
              <li><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng" target="_blank" rel="noreferrer">European Union, Regulation (EU) 2024/1689 — Artificial Intelligence Act ↗</a></li>
            </ul>
            <p className="charter-note">This Charter states JCEE Labs’ institutional principles. It is not legal advice, a conformity assessment, or a representation that any product has been certified under the EU AI Act or another regulatory framework.</p>
          </section>

          <section id="revisions" className="revision-history">
            <div className="revision-heading">
              <h2>Revision History</h2>
              <span>PUBLIC RECORD</span>
            </div>
            <div className="revision-row">
              <strong>1.0</strong>
              <span>AUGUST 4, 2026</span>
              <p>Initial publication.</p>
              <span className="revision-status">CURRENT</span>
            </div>
          </section>
        </article>
      </div>

      <footer className="charter-footer">
        <div className="footer-wordmark">JCEE LABS</div>
        <div className="footer-meta">
          <span>© 2026 HOWM HOLDINGS LLC</span>
          <span>VERSION 1.0 · AUGUST 4, 2026</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
