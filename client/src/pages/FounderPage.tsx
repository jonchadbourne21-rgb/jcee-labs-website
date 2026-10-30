import EditorialLayout from "@/components/EditorialLayout";
import "@/founder-page.css";

const engineeringNotes = [
  {
    title: "When Tested Components Work Together",
    href: "/blog/when-tested-components-work-together",
    description:
      "What the connected software candidate demonstrated, how authorized work completed, and which outcomes remained unresolved.",
  },
  {
    title: "Restoring a Backup Without Restoring Permission",
    href: "/blog/restoring-a-backup-without-restoring-permission",
    description:
      "Why recovering old data also requires checking current permission and accounting for actions that already happened.",
  },
  {
    title: "Testing the Evidence Pipeline",
    href: "/blog/testing-the-evidence-pipeline",
    description:
      "Failures found in the qualification process, the repairs that followed, and the records needed to support a result.",
  },
];

export default function FounderPage() {
  return (
    <EditorialLayout
      current="company"
      eyebrow="The founder / JCEE WorldLab"
      title="Jonathan Matthew Chadbourne"
      description="Independent researcher and solo founder of JCEE WorldLab in Dallas, Texas. I build software around a practical question: what would someone need to establish what actually happened?"
    >
      <div className="founder-page">
        <section
          className="editorial-section founder-introduction"
          aria-labelledby="founder-introduction-title"
        >
          <div className="founder-intro-grid">
            <aside className="founder-identity" aria-label="Founder details">
              <div className="founder-monogram" aria-hidden="true">JMC</div>
              <dl>
                <div>
                  <dt>Role</dt>
                  <dd>Founder &amp; independent researcher</dd>
                </div>
                <div>
                  <dt>Based in</dt>
                  <dd>Dallas, Texas</dd>
                </div>
                <div>
                  <dt>Current focus</dt>
                  <dd>Permission, action, and recovery in software</dd>
                </div>
              </dl>
            </aside>
            <div className="founder-copy">
              <p className="editorial-kicker">A personal introduction</p>
              <h2 id="founder-introduction-title">The person behind the work.</h2>
              <p>
                My background is in sales. My attention is on the practical work
                around software: the handoff that needs another check, the
                exception someone has to investigate, and the record that helps
                the next person understand a decision.
              </p>
              <p>
                I started JCEE WorldLab to pursue questions that kept leading back to
                evidence. A system can report success, and an AI can give a
                convincing explanation. I want to know what supports that
                account, what remains uncertain, and who is responsible for the
                next step. As a solo founder, I direct the research and
                development you see here and take responsibility for its claims.
              </p>
            </div>
          </div>
        </section>

        <section className="editorial-section editorial-section-muted">
          <p className="editorial-kicker">The starting point</p>
          <h2>From reflection to accountable action.</h2>
          <div className="founder-copy">
            <p>
              Mirrored was my first project. It brings together the ideas of
              voice conversation, daily check-ins, journaling, philosophy, and
              habits in a tool for reflection. It remains in development.
            </p>
            <p>
              That starting point is personal: how can a conversation help
              someone notice patterns, think more clearly, and decide what to do
              next? The wider work asks related questions about software. What
              did it observe? What did it infer? What did it actually change?
              When software begins taking action, those distinctions affect the
              people relying on it.
            </p>
            <p>
              JCEE WorldLab developed as those questions moved into research and
              practical operations. The connection is still straightforward:
              preserve what supports a conclusion, make uncertainty visible,
              and keep human judgment involved when the evidence runs out.
            </p>
          </div>
          <a className="editorial-text-link" href="/registry#personal-apps">
            Mirrored and the personal-app work →
          </a>
        </section>

        <section className="editorial-section">
          <p className="editorial-kicker">Current work / October 19, 2026</p>
          <h2>Making interrupted work understandable.</h2>
          <div className="founder-copy">
            <p>
              My current focus is JCEE-INFRA: connecting permission, actions, and
              recovery across software systems. An approved request can reach a
              database and lose its response. Permission can change while work
              is pending. The person supervising that workflow needs to know
              whether an action happened and whether another attempt is allowed.
            </p>
            <p>
              On October 19, a tested software candidate moved into working
              integration with the tested source preserved. In a controlled
              PostgreSQL ledger using fictional data, authorized actions
              completed, recovery accounted for an existing effect without
              duplicating it, and an uncertain outcome stayed held for human
              resolution.
            </p>
            <p>
              This result has specific conditions, including trusted services
              and a separately protected checkpoint that survives the tested
              restoration. Production admission, physical commitment, and
              independent human review remain open. The public record explains
              what the tests establish and what still needs work.
            </p>
          </div>
          <div className="editorial-actions">
            <a className="editorial-text-link" href="/technology#current-integration">
              Read the current result →
            </a>
            <a className="editorial-text-link" href="/registry#infra-integrated-software">
              Inspect its evidence and limits →
            </a>
          </div>
        </section>

        <section className="editorial-section editorial-section-muted">
          <p className="editorial-kicker">How I work</p>
          <h2>Ask a clear question. Keep the result inspectable.</h2>
          <div className="founder-copy">
            <p>
              I begin with a concrete problem and define what a useful result
              would show. Then I examine failures as well as successful runs:
              missing information, changed permission, interrupted processes,
              and records that disagree. When a test exposes a problem, the
              failure belongs in the record alongside the repair.
            </p>
            <p>
              AI tools assist my development and review. I direct the questions,
              choose the next steps, and remain responsible for the decisions.
              Tests, retained records, and the conditions actually examined
              establish what I can claim. I identify AI-assisted review
              separately from independent human review.
            </p>
            <p>
              For business software, that same approach begins with listening
              to the people doing the work. A useful improvement needs to fit
              their workflow and make the next decision easier to understand.
            </p>
          </div>
          <a className="editorial-text-link" href="/blog/the-work-nobody-sees">
            Read my founder essay, The Work Nobody Sees →
          </a>
        </section>

        <section className="editorial-section" aria-labelledby="founder-work-title">
          <p className="editorial-kicker">Selected engineering notes</p>
          <h2 id="founder-work-title">Start with the work itself.</h2>
          <div className="founder-work-list">
            {engineeringNotes.map((note, index) => (
              <a className="founder-work-link" href={note.href} key={note.href}>
                <span className="founder-work-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="founder-work-copy">
                  <strong>{note.title}</strong>
                  <span>{note.description}</span>
                </span>
                <span className="founder-work-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="editorial-section editorial-section-dark founder-contact">
          <p className="editorial-kicker">An open invitation</p>
          <h2>Talk with me directly.</h2>
          <div className="founder-copy">
            <p>
              Bring a workflow that is difficult to trust, an interruption that
              is difficult to recover from, or a research result you want to
              examine. We can discuss the problem, the evidence that would make
              progress visible, and whether I can help. You can request a
              consultation or reach me through the JCEE WorldLab email below.
            </p>
          </div>
          <div className="editorial-actions">
            <a className="editorial-button" href="/consultation">
              Talk with Jonathan →
            </a>
            <a className="editorial-text-link" href="mailto:support@jceelabs.com">
              support@jceelabs.com ↗
            </a>
          </div>
        </section>
      </div>
    </EditorialLayout>
  );
}
