import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Shield, Cpu, Zap } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const FAQ_ITEMS = [
  {
    value: "item-1",
    question: "What is Jcee Labs?",
    answer: "Jcee Labs is an AI product studio and the registered d.b.a. of HOWM HOLDINGS LLC, founded in March 2026. We build formally-verified AI systems on VOW, a language for agentic AI with an intelligent execution runtime. One studio, one language, 6 products.",
  },
  {
    value: "item-2",
    question: "What is VOW?",
    answer: (
      <>
        <strong>VOW</strong> is a language for agentic AI where every capability—network, filesystem, shell, model calls—must be declared in source and is enforced at compile time. Runs are dry by default: effects are recorded, not executed. Every run emits a structured, exportable trace. VOW compiles to readable Python. The VOW Runtime is an intelligent execution engine that enables applications to adapt, optimize, and reason about their own behavior. It features adaptive execution, semantic optimization, persistent execution memory, and an AI-native architecture. VOW powers most of our products.
      </>
    ),
  },
  {
    value: "item-3",
    question: "What is the relationship with HOWM HOLDINGS LLC?",
    answer: "HOWM HOLDINGS LLC is the parent legal entity. Jcee Labs operates as the registered d.b.a. (Doing Business As) and creative arm, managing product design, software engineering, and AI architecture for all products launched under the holding company.",
  },
  {
    value: "item-4",
    question: "What products does Jcee Labs build?",
    answer: (
      <>
        We currently have 6 products: <strong>VOW</strong> (language + runtime for agentic AI), <strong>Mirrored</strong> (AI higher self / personal development, dropping Aug 7), <strong>TrueRPM</strong> (Revenue Per Mile for owner-operators), <strong>NicheFlo</strong> (GPU arbitrage &amp; DeFi yield optimization), <strong>FloCraft</strong> (supply chain intelligence), <strong>FORGEX</strong> (autonomous SOP platform in pilot testing), and <strong>Musaia</strong> (music streaming for artists).
      </>
    ),
  },
  {
    value: "item-5",
    question: "What is \"Mirrored\"?",
    answer: (
      <>
        <strong>Mirrored</strong> is your AI higher self. A voice-to-voice personal development app with daily check-ins, profound AI reflections, and memory systems that create a deeply personalized experience. It helps you toward self-actualization through guided programs and pattern recognition. Visit <a href="https://mirroredapp.com" className="text-[#8ba4d8] hover:underline" target="_blank" rel="noopener noreferrer">mirroredapp.com</a> to learn more.
      </>
    ),
  },
  {
    value: "item-6",
    question: "Are these products available to the public?",
    answer: "Products are at various stages. VOW, NicheFlo, and FloCraft are in beta. Mirrored drops August 1st. SOPForge is in pilot testing with 3 companies. Reach out to jonathan@jceelabs.com for early access or to see how SOPForge is already saving our pilot customers time and money.",
  },
  {
    value: "item-7",
    question: "Who is behind Jcee Labs?",
    answer: (
      <>
        Jcee Labs was founded by <strong>Jonathan Chadbourne</strong>, a first-principles thinker who built VOW and all 5 products without a CS degree. The studio proves that formally-verified AI doesn't need Fortune 500 budgets. George Taylor serves as advisor.
      </>
    ),
  },
  {
    value: "item-8",
    question: "How can I get in touch?",
    answer: (
      <>
        Email us at <a href="mailto:jonathan@jceelabs.com" className="text-[#d4a843] hover:underline">jonathan@jceelabs.com</a>. You can also find us on Instagram at <a href="https://instagram.com/jceelabs" className="text-[#d4a843] hover:underline" target="_blank" rel="noopener noreferrer">@jceelabs</a> and <a href="https://instagram.com/vow._.wow" className="text-[#d4a843] hover:underline" target="_blank" rel="noopener noreferrer">@vow._.wow</a>.
      </>
    ),
  },
];

const LEFT_COL = FAQ_ITEMS.slice(0, 4);
const RIGHT_COL = FAQ_ITEMS.slice(4);

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] relative overflow-hidden flex flex-col">
      {/* Background Orbs — GPU-composited */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#8ba4d8]/8 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#2a3a5a]/20 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />

      <SiteNav />

      {/* Main Content */}
      <main className="container max-w-[1100px] pt-24 md:pt-32 pb-12 md:pb-24 flex-grow px-4 md:px-6 lg:px-12">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.2)] text-[#d4a843] text-[10px] md:text-xs font-mono mb-3 md:mb-4">
            <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> FAQ &amp; Information Hub
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[52px] font-display font-extrabold mb-3 md:mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-[#d4a843] to-[#e8c56d] bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Everything you need to know about Jcee Labs, VOW, and our suite of nine AI products.
          </p>
        </div>

        {/* Mobile: single column accordion */}
        <div className="glass-panel p-4 md:p-8 rounded-xl md:rounded-2xl border border-[#2a3a5a]/50 relative lg:hidden">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value} className="border-b border-white/5">
                <AccordionTrigger className="text-left font-display font-semibold text-base md:text-lg py-3 md:py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop: 2-column accordion layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="glass-panel p-8 rounded-2xl border border-[#2a3a5a]/50">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {LEFT_COL.map((item) => (
                <AccordionItem key={item.value} value={item.value} className="border-b border-white/5">
                  <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-[15px]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="glass-panel p-8 rounded-2xl border border-[#2a3a5a]/50">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {RIGHT_COL.map((item) => (
                <AccordionItem key={item.value} value={item.value} className="border-b border-white/5">
                  <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-[#d4a843] hover:no-underline transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-[15px]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="glass-panel p-6 rounded-xl border border-[#2a3a5a]/50">
            <Cpu className="w-8 h-8 text-[#d4a843] mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">VOW-Powered</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every system we build is provably safe with formal proofs, scar memory, and causal trails built into the architecture.
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
