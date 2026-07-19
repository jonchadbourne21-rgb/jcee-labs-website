import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Shield, Cpu, Zap } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] relative overflow-hidden flex flex-col">
      {/* Background Orbs — GPU-composited */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#8ba4d8]/8 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#2a3a5a]/20 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />

      <SiteNav />

      {/* Main Content */}
      <main className="container max-w-4xl pt-32 pb-16 md:pb-24 flex-grow">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.2)] text-[#d4a843] text-xs font-mono mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ & Information Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-[#d4a843] to-[#e8c56d] bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Jcee Labs, VOW, and our suite of nine AI products.
          </p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#2a3a5a]/50 relative">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                What is Jcee Labs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Jcee Labs is an AI product studio and the registered d.b.a. of HOWM HOLDINGS LLC, founded in March 2026. We build formally-verified AI systems on VOW — our proprietary programming language where every agent action compiles to auditable Python and leaves a causal trail. One studio, one language, nine products.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                What is VOW?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                <strong>VOW</strong> is our formally-grounded programming language built around quests, proofs, and scar memory. Code that learns from failure — remembers what hurt, knows why, and never repeats the same failing path. It compiles to auditable Python and is designed for regulatory transparency before the EU AI Act makes it mandatory. VOW powers seven of our nine products.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                What is the relationship with HOWM HOLDINGS LLC?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                HOWM HOLDINGS LLC is the parent legal entity. Jcee Labs operates as the registered d.b.a. (Doing Business As) and creative arm — managing product design, software engineering, and AI architecture for all products launched under the holding company.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                What products does Jcee Labs build?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                We currently have nine products: <strong>VOW</strong> (our programming language), <strong>Mirrored</strong> (AI higher self / personal development), <strong>TrueRPM</strong> (Revenue Per Mile for owner-operators), <strong>NicheFlo</strong> (GPU arbitrage & DeFi yield optimization), <strong>FloCraft</strong> (supply chain intelligence), <strong>Baus Time Media</strong> (autonomous multi-agent marketing), <strong>Bourne Aire Industries</strong> (industrial equipment bid management for HVAC), <strong>SOPForge</strong> (autonomous SOP platform), and <strong>Babodie</strong> (autonomous Neuro-OS).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                What is "Mirrored"?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                <strong>Mirrored</strong> is your AI higher self — a voice-to-voice personal development app with daily check-ins, profound AI reflections, and memory systems that create a deeply personalized experience. It helps you toward self-actualization through guided programs and pattern recognition. Visit <a href="https://mirroredapp.com" className="text-[#8ba4d8] hover:underline" target="_blank" rel="noopener noreferrer">mirroredapp.com</a> to learn more.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                Are these products available to the public?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Products are at various stages. Some are in beta (VOW, NicheFlo, FloCraft, Baus Time Media, SOPForge), some are actively building (Mirrored, TrueRPM, Bourne Aire Industries), and Babodie is in beta with a waitlist. You can reach out to jonathan@jceelabs.com for early access or partnership inquiries.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                Who is behind Jcee Labs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Jcee Labs was founded by <strong>Jonathan Chadbourne</strong> — a first-principles thinker who built VOW and all nine products without a CS degree. The studio proves that formally-verified AI doesn't need Fortune 500 budgets. George Taylor serves as advisor.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                How can I get in touch?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Email us at <a href="mailto:jonathan@jceelabs.com" className="text-[#d4a843] hover:underline">jonathan@jceelabs.com</a>. You can also find us on Instagram at <a href="https://instagram.com/jceelabs" className="text-[#d4a843] hover:underline" target="_blank" rel="noopener noreferrer">@jceelabs</a> and <a href="https://instagram.com/vow._.wow" className="text-[#d4a843] hover:underline" target="_blank" rel="noopener noreferrer">@vow._.wow</a>.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="glass-panel p-6 rounded-xl border border-[#2a3a5a]/50">
            <Cpu className="w-8 h-8 text-[#d4a843] mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">VOW-Powered</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every system we build compiles to auditable Python with formal proofs, scar memory, and causal trails built into the architecture.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-[#2a3a5a]/50">
            <Zap className="w-8 h-8 text-[#8ba4d8] mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">Self-Improving</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our systems learn from failure without retraining. Each experience is structured into permanent knowledge that compounds over time.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-[#2a3a5a]/50">
            <Shield className="w-8 h-8 text-[#c0c8d8] mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">Compliance-Ready</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Built for EU AI Act requirements landing in 2026. Decision trails, human oversight, and risk management generated by design.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
