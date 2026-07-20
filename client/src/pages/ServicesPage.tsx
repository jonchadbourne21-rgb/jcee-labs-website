import { Link } from "wouter";
import {
  Bot,
  Landmark,
  Brain,
  Sparkles,
  Zap,
  Dna,
  Scale,
  Crosshair,
  Shield,
  ClipboardList,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const CORE_SERVICES = [
  {
    icon: Bot,
    tag: "VOW-Native",
    name: "Agentic AI Applications",
    description:
      "Autonomous systems with goals, proofs, and persistent memory built into the architecture. Not black-box AI. Systems that remember what hurt, know why, and never try the same failing path twice.",
  },
  {
    icon: Landmark,
    tag: "Compliance-First",
    name: "Formal Architecture & Compliance Infrastructure",
    description:
      "Formal modeling, decision trail generation, and built-in guardrails. Built for EU AI Act requirements already landing in 2026. Structural errors caught at build time, not in production.",
  },
  {
    icon: Brain,
    tag: "Self-Improving",
    name: "Self-Improving Automation",
    description:
      "Automation pipelines that don't just execute. They learn. Each failure is structured into permanent organizational knowledge, its lessons propagated to every downstream decision without retraining.",
  },
  {
    icon: Sparkles,
    tag: "Bounded",
    name: "Formally-Bounded LLM Systems",
    description:
      "Large language models integrated through formal structure, not prompt engineering. Chatbots, document analysis, and smart search that reason within defined boundaries and explain their decisions.",
  },
  {
    icon: Zap,
    tag: "Quest-Driven",
    name: "Quest-Oriented Rapid Prototyping",
    description:
      "From concept to working prototype in days. We model your domain formally, define agent objectives with verifiable constraints, and validate before you commit. Move fast without sacrificing safety.",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Domain Formalization",
    description:
      "We model your business domain in formal structure. Entities, relationships, constraints, and failure modes defined before a single line of agent code is written.",
  },
  {
    number: "02",
    title: "Agent Definition",
    description:
      "Goals, proofs, and guardrails compiled to readable Python. Every action is traceable. Every decision is explainable. The system knows what it's allowed to do and what it must never attempt.",
  },
  {
    number: "03",
    title: "Memory Training",
    description:
      "The system learns from edge cases and failures without retraining. Each experience is structured into permanent knowledge, its lessons propagated to every downstream decision automatically.",
  },
  {
    number: "04",
    title: "Compliance Validation",
    description:
      "Decision trails verified against regulatory requirements. Formal verification that your AI system operates within defined boundaries and satisfies scrutiny before deployment.",
  },
];

const VOW_DIFFERENCE = [
  {
    icon: Dna,
    title: "Structured Failure Memory",
    description:
      "Not logs. Not RLHF. VOW structures every failure into queryable, permanent organizational knowledge. Categorized, traced, and propagated without model retraining. This is not debugging. It's institutional memory that compounds.",
  },
  {
    icon: Scale,
    title: "Formal Verification at Build Time",
    description:
      "VOW's formal structure catches structural mismatches, temporal violations, and causal inconsistencies before runtime. Errors that would be invisible bugs in traditional code are prevented at the source.",
  },
  {
    icon: Crosshair,
    title: "Objectives as First-Class Constructs",
    description:
      "Goals and constraints built into the system's foundation, not bolted on as frameworks. An agent's purpose is declared, verified, and traced. Not inferred from prompt engineering or reward hacking.",
  },
];

const WHY_VOW = [
  {
    icon: Shield,
    title: "Provable Safety",
    description:
      "Every agent decision leaves a causal trail. Formal proofs that can be audited, verified, and presented to regulators.",
  },
  {
    icon: ClipboardList,
    title: "Regulatory Pre-Compliance",
    description:
      "Built for 2026 EU AI Act requirements. High-risk AI systems need audit trails, human oversight, and risk management. VOW generates this by design, not as an afterthought.",
  },
  {
    icon: RefreshCw,
    title: "Self-Improving Systems",
    description:
      "Structured memory means failures teach, not break. The system accumulates knowledge, classifies errors, and avoids repeating them without model retraining or downtime.",
  },
  {
    icon: CheckCircle,
    title: "Formal Verification",
    description:
      "Structural errors caught at build time, not runtime. The formal foundation enforces constraints that would be invisible bugs in traditional code: ontological mismatches, temporal violations, causal loops.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 text-center">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="inline-block text-[11px] md:text-[12px] font-semibold tracking-[0.1em] uppercase px-4 md:px-5 py-1.5 md:py-2 rounded-3xl border border-[#2a3a5a] text-[#d4a843] mb-4 md:mb-6">
            Autonomous Systems Built on VOW
          </div>
          <h2 className="text-2xl md:text-[36px] lg:text-[48px] font-extrabold leading-[1.2] tracking-[-0.02em] mb-3 md:mb-4">
            Autonomous Systems{" "}
            <span className="bg-gradient-to-r from-[#d4a843] to-[#e8c56d] bg-clip-text text-transparent">
              Built on VOW
            </span>
          </h2>
          <p className="text-sm md:text-[17px] lg:text-[19px] text-[#7a8aaa] max-w-[600px] lg:max-w-[760px] mx-auto leading-[1.7]">
            We architect systems that learn from failure, leave a full decision trail, and comply before the law requires it.
          </p>
        </div>
      </section>

      {/* Core Services */}
      <section className="pb-4">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="pt-12 pb-6 lg:flex lg:items-end lg:justify-between">
            <div>
              <h3 className="text-[28px] lg:text-[34px] font-bold mb-3 text-[#e8ecf4]">
                Core Services
              </h3>
              <p className="text-[15px] lg:text-[17px] text-[#7a8aaa] leading-[1.6] max-w-[560px]">
                Every system starts from first principles. Every decision is traceable. Every failure makes the system smarter.
              </p>
            </div>
          </div>

          {/* Mobile: stacked | Desktop: 2-col grid, last card full-width if odd */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {CORE_SERVICES.map((service, i) => {
              const Icon = service.icon;
              const isLastOdd = CORE_SERVICES.length % 2 !== 0 && i === CORE_SERVICES.length - 1;
              return (
                <div
                  key={service.name}
                  className={`bg-[#0d1424] border border-[#2a3a5a]/50 rounded-xl lg:rounded-[20px] p-5 lg:p-8 relative overflow-hidden group hover:border-[#8ba4d8]/30 hover:-translate-y-0.5 transition-all duration-300${isLastOdd ? " lg:col-span-2" : ""}`}
                >
                  {/* Top gradient line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d4a843] to-[#e8c56d] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-3 lg:gap-5 mb-3 lg:mb-4">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[16px] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.15)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 lg:w-6 lg:h-6 text-[#d4a843]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] lg:text-[11px] font-bold tracking-[0.12em] text-[#d4a843] uppercase block mb-1">
                        {service.tag}
                      </span>
                      <h4 className="text-base lg:text-[20px] font-bold text-[#e8ecf4]">
                        {service.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[13px] lg:text-[15px] text-[#7a8aaa] leading-[1.6] lg:leading-[1.75] pl-0 lg:pl-[76px]">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-4">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] lg:text-[34px] font-bold mb-3 text-[#e8ecf4]">
              How It Works
            </h3>
            <p className="text-[15px] lg:text-[17px] text-[#7a8aaa] leading-[1.6]">
              The VOW engagement process. Formal from day one.
            </p>
          </div>

          {/* Mobile: stacked | Desktop: 2-col grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-xl lg:rounded-[20px] p-5 lg:p-8 flex gap-4 lg:gap-6 items-start hover:border-[#8ba4d8]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[16px] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center flex-shrink-0 text-[14px] lg:text-[18px] font-bold font-mono text-[#d4a843]">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-base lg:text-[20px] font-bold text-[#e8ecf4] mb-1.5 lg:mb-2">
                    {step.title}
                  </h4>
                  <p className="text-[13px] lg:text-[15px] text-[#7a8aaa] leading-[1.6] lg:leading-[1.75]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The VOW Difference */}
      <section className="pb-4">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] lg:text-[34px] font-bold mb-3 text-[#e8ecf4]">
              The VOW Difference
            </h3>
            <p className="text-[15px] lg:text-[17px] text-[#7a8aaa] leading-[1.6]">
              What exists nowhere else.
            </p>
          </div>

          {/* Mobile: stacked | Desktop: 3-col grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {VOW_DIFFERENCE.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-xl lg:rounded-[20px] p-5 lg:p-8 hover:border-[#8ba4d8]/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[16px] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.15)] flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 lg:w-6 lg:h-6 text-[#d4a843]" />
                  </div>
                  <h4 className="text-base lg:text-[20px] font-bold text-[#e8ecf4] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-[13px] lg:text-[15px] text-[#7a8aaa] leading-[1.6] lg:leading-[1.75]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why VOW */}
      <section className="pb-4">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] lg:text-[34px] font-bold mb-3 text-[#e8ecf4]">
              Why VOW
            </h3>
            <p className="text-[15px] lg:text-[17px] text-[#7a8aaa] leading-[1.6]">
              What traditional agencies can't offer.
            </p>
          </div>

          {/* Mobile: stacked | Desktop: 2-col grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {WHY_VOW.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-xl lg:rounded-[20px] p-5 lg:p-8 hover:border-[#8ba4d8]/30 transition-all duration-300 flex gap-5 items-start"
                >
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[16px] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.15)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 lg:w-6 lg:h-6 text-[#d4a843]" />
                  </div>
                  <div>
                    <h4 className="text-base lg:text-[20px] font-bold text-[#e8ecf4] mb-2">
                      {item.title}
                    </h4>
                    <p className="text-[13px] lg:text-[15px] text-[#7a8aaa] leading-[1.6] lg:leading-[1.75]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Also Available */}
      <section className="pb-4">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.1)] rounded-[20px] p-7 lg:p-10 my-12 text-center lg:text-left lg:flex lg:items-center lg:gap-10">
            <div className="lg:flex-1">
              <span className="text-[10px] lg:text-[11px] font-bold tracking-[0.12em] text-[#fbbf24] uppercase block mb-3">
                Also Available
              </span>
              <h4 className="text-[20px] lg:text-[26px] font-bold text-[#e8ecf4] mb-2">
                Traditional Development, VOW Standards
              </h4>
              <p className="text-[15px] lg:text-[16px] text-[#7a8aaa] leading-[1.7]">
                Full-stack web applications, APIs, and automation built with the same formal rigor. React, Next.js, Node.js, tRPC. Responsive, accessible, production-ready. This is our foundation while the VOW ecosystem scales.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:flex-shrink-0">
              <a
                href="mailto:jonathan@jceelabs.com?subject=Web%20Development%20Inquiry"
                className="inline-block text-[14px] lg:text-[15px] text-[#7a8aaa] border border-[#2a3a5a] px-6 py-3 rounded-full hover:border-[#8ba4d8]/50 hover:text-[#c0c8d8] hover:bg-[#8ba4d8]/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="pb-16 text-center">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:jonathan@jceelabs.com?subject=VOW%20Audit%20Request"
            className="inline-block bg-gradient-to-r from-[#d4a843] to-[#c9952c] text-white text-[16px] font-semibold px-8 py-4 rounded-full hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,67,0.35)] active:scale-97 transition-all duration-200"
          >
            Request a VOW Audit &rarr;
          </a>
          <a
            href="mailto:jonathan@jceelabs.com?subject=Enterprise%20Access%20Inquiry"
            className="inline-block text-[14px] text-[#7a8aaa] border border-[#2a3a5a] px-6 py-3 rounded-full hover:border-[#8ba4d8]/50 hover:text-[#c0c8d8] hover:bg-[#8ba4d8]/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8ba4d8]/10 active:scale-97 transition-all duration-200"
          >
            Explore Enterprise Access
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
