import { Link } from "wouter";
import { ArrowRight, Code, Shield, Brain, Layers, Lock, Scale, Eye, Workflow, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function VowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url('/manus-storage/vow-hero-logo_b1a4358a.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090514]/70 via-[#090514]/50 to-[#090514]" />

        <div className="container max-w-5xl mx-auto relative">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="px-4 py-2 rounded-full border border-[#d4a843]/30 bg-[#d4a843]/5 text-sm text-[#d4a843] font-mono">
              Ontology-Driven PaaS & Language
            </span>
            <span className="px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-xs text-green-400 font-mono">
              EU AI Act Ready
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a843] to-[#e8c56d]">VOW</span>
          </h1>

          <p className="text-xl text-[#A0AEC0] mb-4 max-w-3xl leading-relaxed">
            A formally-grounded coding language and platform that brings ontological reasoning to autonomous AI systems — making them auditable, provably safe, and compliant by design.
          </p>
          <p className="text-[#718096] mb-10 max-w-2xl leading-relaxed">
            VOW is the architectural backbone powering every Jcee Labs product. Its formal foundations ensure that AI agents operate within defined boundaries, learn from failures, and produce decision trails that satisfy regulatory scrutiny.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/services#contact">
              <Button className="rounded-xl bg-gradient-to-r from-[#c9952c] to-[#d4a843] hover:from-[#d4a843] hover:to-[#e8c56d] text-[#0d0b14] font-semibold shadow-lg shadow-[#d4a843]/20 active:scale-97 transition-all">
                Request Enterprise Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium cursor-default opacity-60">
              Open Source (Coming Soon)
            </Button>
          </div>
        </div>
      </section>

      {/* Note: Aurora removed since we now use the hero image */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#d4a843]/20 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#c9952c]/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Formal Foundations */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 border border-[#d4a843]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#d4a843]" />
            </div>
            <span className="text-xs font-mono text-[#d4a843]/80 uppercase tracking-wider">Formal Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Built on Ontological Foundations</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            VOW doesn't guess — it reasons. Every construct is formally classified, every composition rule is provably consistent, and every permission gate is mathematically separate from execution.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#d4a843]/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-[#d4a843]" />
                <h3 className="text-lg font-bold text-white">Continuant / Occurrent</h3>
              </div>
              <p className="text-sm text-[#718096] leading-relaxed">
                Every system construct is classified as either a persistent entity (continuant) or a temporal event (occurrent). This prevents category errors — the root cause of most concurrency bugs and state corruption in AI systems.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#d4a843]/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Workflow className="w-6 h-6 text-[#d4a843]" />
                <h3 className="text-lg font-bold text-white">Mereology (Part-Whole)</h3>
              </div>
              <p className="text-sm text-[#718096] leading-relaxed">
                Formal part-whole reasoning ensures composition integrity. If a pure computation contains sub-computations, category consistency is enforced transitively — no hidden side effects buried in "safe" code.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#d4a843]/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6 text-[#d4a843]" />
                <h3 className="text-lg font-bold text-white">Subsumption Logic</h3>
              </div>
              <p className="text-sm text-[#718096] leading-relaxed">
                Type relationships are verified through necessary and sufficient conditions — not surface resemblance. When VOW claims a component satisfies a contract, it proves it formally at compile time.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#d4a843]/20 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-[#d4a843]" />
                <h3 className="text-lg font-bold text-white">Deontic Logic</h3>
              </div>
              <p className="text-sm text-[#718096] leading-relaxed">
                Permission, obligation, and prohibition are first-class concepts. Actions are gated by capability — what an agent is <em>allowed</em> to do is mathematically separate from what it <em>actually</em> does. This is the foundation for safe AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EU AI Act Compliance */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-xs font-mono text-green-400/80 uppercase tracking-wider">Regulatory Compliance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">EU AI Act Compliance by Design</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            The EU AI Act requires transparency, auditability, and human oversight for high-risk AI systems. VOW's architecture was built to satisfy these requirements at the language level — not bolted on after the fact.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-green-500/10 bg-green-500/[0.02]">
              <Eye className="w-6 h-6 text-green-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Transparent Decision Trails</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Every AI decision produces a formal audit trail. The Continuant/Occurrent distinction ensures you can always trace what persisted vs. what happened — and why.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-green-500/10 bg-green-500/[0.02]">
              <Lock className="w-6 h-6 text-green-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Permission-Gated Actions</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Deontic logic enforces that AI agents can only perform actions they are explicitly permitted to perform. Forbidden actions fail at compile time, not at runtime.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-green-500/10 bg-green-500/[0.02]">
              <Shield className="w-6 h-6 text-green-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Dry-Run Simulation</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Evaluate what an AI system would do without executing it. Permission checks fire in both actual and simulated modes — risk assessment before deployment, built into the language.
              </p>
            </div>
          </div>

          {/* Compliance Mapping */}
          <div className="mt-12 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="text-white font-semibold mb-6">How VOW Maps to EU AI Act Requirements</h3>
            <div className="space-y-4">
              {[
                { requirement: "Article 9 — Risk Management", solution: "Dry-run mode evaluates risk before execution; deontic gates prevent unauthorized actions" },
                { requirement: "Article 11 — Technical Documentation", solution: "Formal ontological classification auto-generates decision documentation" },
                { requirement: "Article 13 — Transparency", solution: "Continuant/Occurrent audit trails show exactly what happened and why" },
                { requirement: "Article 14 — Human Oversight", solution: "Capability gating ensures human-defined permission boundaries are never violated" },
                { requirement: "Article 15 — Accuracy & Robustness", solution: "Subsumption logic proves type safety; mereology prevents hidden side effects" },
              ].map((item) => (
                <div key={item.requirement} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-3 border-b border-white/5 last:border-0">
                  <span className="text-sm font-mono text-green-400 shrink-0 sm:w-64">{item.requirement}</span>
                  <span className="text-sm text-[#A0AEC0]">{item.solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Powers Jcee Labs Products */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 border border-[#d4a843]/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#d4a843]" />
            </div>
            <span className="text-xs font-mono text-[#d4a843]/80 uppercase tracking-wider">In Production</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">The Brain Behind Our Multi-Agent Systems</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            VOW isn't theoretical — it's the runtime architecture powering our autonomous AI products today. Each multi-agent system leverages VOW's formal reasoning for its decision-making.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/truerpm">
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors cursor-pointer group">
                <h3 className="text-white font-semibold mb-2 group-hover:text-orange-400 transition-colors">TrueRPM</h3>
                <p className="text-xs text-orange-400/60 font-mono mb-3">Revenue Per Mile</p>
                <p className="text-sm text-[#718096] leading-relaxed">
                  VOW's subsumption logic validates load combinations against weight/route constraints. Deontic gates enforce DOT compliance. Scar memory learns from rejected loads.
                </p>
              </div>
            </Link>

            <Link href="/flocraft">
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/20 transition-colors cursor-pointer group">
                <h3 className="text-white font-semibold mb-2 group-hover:text-cyan-400 transition-colors">FloCraft</h3>
                <p className="text-xs text-cyan-400/60 font-mono mb-3">Supply Chain Intelligence</p>
                <p className="text-sm text-[#718096] leading-relaxed">
                  VOW's intelligent brain solves supply chain problems in real time — alternate routes and corrective solutions that directly improve ROI.
                </p>
              </div>
            </Link>

            <Link href="/rooh">
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-pink-500/20 transition-colors cursor-pointer group">
                <h3 className="text-white font-semibold mb-2 group-hover:text-pink-400 transition-colors">Baus Time Media</h3>
                <p className="text-xs text-pink-400/60 font-mono mb-3">Autonomous Marketing</p>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Multi-agent marketing team powered by VOW. Each agent focused on its niche, learning from what works, with human-in-the-loop when you want it.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Scar Memory */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Scar Memory</h2>
              <p className="text-[#718096] mb-6 leading-relaxed">
                VOW systems don't just fail — they learn. Scar Memory is a continuant that accumulates traces of every failure, near-miss, and unexpected outcome. Future decisions reference these scars to avoid repeating mistakes.
              </p>
              <p className="text-[#718096] leading-relaxed">
                This isn't traditional machine learning. It's formal record-keeping with ontological classification — each scar is categorized, its causal chain preserved, and its lessons made available to every downstream decision without retraining.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-[#d4a843]/10 bg-[#d4a843]/[0.02] font-mono text-sm">
              <div className="text-[#d4a843]/60 mb-2">// VOW Scar Memory — simplified</div>
              <div className="text-[#A0AEC0] space-y-1">
                <div><span className="text-[#d4a843]">continuant</span> ScarMemory {"{"}</div>
                <div className="pl-4"><span className="text-[#e8c56d]">accumulates</span>: Trace[]</div>
                <div className="pl-4"><span className="text-[#e8c56d]">classifies</span>: OntologyCategory</div>
                <div className="pl-4"><span className="text-[#e8c56d]">preserves</span>: CausalChain</div>
                <div>{"}"}</div>
                <div className="mt-3"><span className="text-[#d4a843]">occurrent</span> FailureEvent {"{"}</div>
                <div className="pl-4"><span className="text-[#e8c56d]">triggers</span>: ScarWrite</div>
                <div className="pl-4"><span className="text-[#e8c56d]">requires</span>: TemporalOrdering</div>
                <div>{"}"}</div>
                <div className="mt-3 text-green-400/60">// Category error caught at compile time:</div>
                <div className="text-red-400/80">// Cannot mutate continuant without sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Build Compliant AI Systems</h2>
          <p className="text-[#718096] text-lg max-w-xl mx-auto">
            Whether you're navigating the EU AI Act, building autonomous agents, or need provably safe AI infrastructure — VOW gives you the formal foundation to build with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services#contact">
              <Button className="rounded-xl bg-gradient-to-r from-[#c9952c] to-[#d4a843] hover:from-[#d4a843] hover:to-[#e8c56d] text-[#0d0b14] font-semibold shadow-lg shadow-[#d4a843]/20 active:scale-97 transition-all">
                Talk to Our Team <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services#newsletter">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium">
                Get Notified at Launch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
