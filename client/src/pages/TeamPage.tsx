import { Link } from "wouter";
import { Users, MapPin, Lightbulb, Rocket, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] via-[#0a1020] to-[#080c18] text-[#e8ecf4] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ba4d8]/10 border border-[#8ba4d8]/20 text-[#8ba4d8] text-xs font-mono mx-auto">
            <Users className="w-3.5 h-3.5" /> Leadership
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold">
            The <span className="text-[#c0c8d8]">Team</span> Behind Jcee Labs
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            A small, focused team building intelligent software that empowers businesses to operate smarter.
          </p>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8ba4d8]/10 rounded-full blur-[120px] opacity-30" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">

          {/* Jonathan Chadbourne */}
          <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-3xl p-8 md:p-10 hover:border-[#8ba4d8]/30 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <img
                  src="/manus-storage/jonathan-photo_8a631582.png"
                  alt="Jonathan Chadbourne"
                  className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover object-center shadow-lg shadow-[#8ba4d8]/15 border border-[#2a3a5a]"
                />
                <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">Connect with me</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.linkedin.com/in/jonathan-chadbourne-153561410"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-400 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-white transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://instagram.com/jonchadbourne"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-pink-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:Jonathan@jceelabs.com"
                    className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border border-[#2a3a5a] text-[#7a8aaa] hover:text-[#e8ecf4] hover:border-[#8ba4d8]/40 transition-colors"
                    aria-label="Email Me"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Me
                  </a>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Jonathan Chadbourne</h2>
                  <p className="text-[#8ba4d8] font-mono text-sm">Founder, CEO & Lead Architect</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Dallas, Texas</span>
                  <span className="text-white/20">|</span>
                  <span>Age 34</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Jonathan doesn't think like most people in tech. He doesn't have a CS degree, a decade in Big Tech, or a pedigree from Stanford or MIT. What he has is a mind that refuses to accept "this is just how it's done" and the stubbornness to build something better when the existing answers don't fit the question.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  VOW wasn't born in a research lab. It was born from watching AI systems fail, lie, and leave no trace, then hearing the industry say "that's just how AI works." Jonathan asked a question most engineers never ask: <em className="text-[#c0c8d8]">What if the language itself could enforce accountability? What if goals, proofs, and memory weren't features you add later, but foundations you start with?</em>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  He started building with no formal training, just a belief that anything is possible if you refuse to quit. Manus was the tool. VOW was the vision. The scar memory, the formal ontology, the compile-time enforcement: these aren't academic concepts he borrowed. They're solutions he arrived at by thinking from first principles, refusing to accept that small teams can't build what enterprises claim only they can.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At 33, Jonathan experienced a fundamental shift. A self-actualization that changed everything: <em className="text-slate-200">life doesn't happen to you, it happens for you. There is no failure, only lessons.</em> This wasn't motivational poster talk. It was a complete restructuring of how he saw himself and the world. He developed new philosophical frameworks, internal systems for facing the hard questions most people spend their lives avoiding. <em className="text-slate-200">"As within, so without"</em>. The belief that how you see yourself internally is the way reality will reflect back to you was something he put into practice, and once the results started showing the sky was the limit. A new mind frame and unstoppable belief in himself took him to a new level of living and thinking.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Mirrored, his first app, came from that place. Not from a product roadmap, but from a genuine need to help others do what he had done: face themselves. He built an AI that doesn't just respond, but reflects. Profound, intellectual, unflinching. The kind of mirror that shows you what you need to see, not what you want to see. Creative prompting became philosophical architecture. The app became a tool for self-confrontation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The result is nine products that prove formally-verified AI doesn't require a Fortune 500 budget. TrueRPM serves owner-operators because Jonathan believes the people who keep the economy moving deserve the same technological advantages as the people who profit from it. Every product is built for the underdog.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Jonathan leads Jcee Labs with one rule: question everything, especially your own assumptions. The confidence comes from knowing he's built something real. The humility comes from knowing he's still building.
                </p>
              </div>
            </div>
          </div>

          {/* George Taylor */}
          <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-3xl p-8 md:p-10 hover:border-[#8ba4d8]/30 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8ba4d8] to-[#5a7ab8] flex items-center justify-center text-white text-3xl font-display font-bold shrink-0 shadow-lg shadow-[#8ba4d8]/20">
                GT
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">George Taylor</h2>
                  <p className="text-[#8ba4d8] font-mono text-sm">Partner & Chief Strategy Officer</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> Joined June 2026</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  George was brought on to help take Jcee Labs to the next level. With deep expertise in sales, marketing, and a creative approach to business strategy, his ability to identify niche opportunities and develop unconventional go-to-market strategies made him a natural fit for the team.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  As CSO, George drives the company's growth initiatives, partnership development, and market positioning. His knack for spotting untapped markets and crafting compelling narratives around technical products ensures that Jcee Labs' innovations reach the people who need them most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 px-4 border-t border-[#2a3a5a]/50">
        <div className="container max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ba4d8]/10 border border-[#8ba4d8]/20 text-[#8ba4d8] text-xs font-mono mx-auto">
              <Lightbulb className="w-3.5 h-3.5" /> What Makes Us Different
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              Our <span className="text-[#c0c8d8]">Mission</span>
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/[0.02] border border-[#2a3a5a]/50 rounded-xl p-4 hover:border-[#8ba4d8]/30 transition-colors">
              <span className="text-[#8ba4d8] mt-1">•</span>
              <div>
                <p className="text-muted-foreground leading-relaxed">We build for operators, not demo days.</p>
                <p className="text-sm text-white/40 mt-1">Every product solves a specific pain point for real people running real businesses — truckers, HVAC contractors, marketers, founders.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/[0.02] border border-[#2a3a5a]/50 rounded-xl p-4 hover:border-[#8ba4d8]/30 transition-colors">
              <span className="text-[#8ba4d8] mt-1">•</span>
              <div>
                <p className="text-muted-foreground leading-relaxed">We try what others dismiss. The results speak.</p>
                <p className="text-sm text-white/40 mt-1">Nine products, one language, no VC runway — built from first principles by a team that refuses to accept "impossible."</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/[0.02] border border-[#2a3a5a]/50 rounded-xl p-4 hover:border-[#8ba4d8]/30 transition-colors">
              <span className="text-[#8ba4d8] mt-1">•</span>
              <div>
                <p className="text-muted-foreground leading-relaxed">No sacred cows. Every decision starts from first principles.</p>
                <p className="text-sm text-white/40 mt-1">No legacy assumptions, no "we've always done it this way" — if the reasoning doesn't hold, the approach changes.</p>
              </div>
            </div>

          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-[#c0c8d8] mb-2">9+</div>
              <p className="text-sm text-muted-foreground">Products Live & Building</p>
            </div>
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-[#8ba4d8] mb-2">March 2026</div>
              <p className="text-sm text-muted-foreground">Founded</p>
            </div>
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-lg md:text-xl font-display font-bold text-[#c0c8d8] mb-2 leading-tight">Human-Creative Architecture,<br/>Agentic AI-Driven</div>
              <p className="text-sm text-muted-foreground">Development Approach</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
