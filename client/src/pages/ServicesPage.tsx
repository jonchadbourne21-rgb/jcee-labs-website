import { Link } from "wouter";
import { Dna, ShieldCheck, Crosshair } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const CORE_SERVICES = [
  {
    icon: "🤖",
    tag: "VOW-Native",
    name: "Agentic AI Applications",
    description:
      "Autonomous systems with goals, proofs, and scar memory built into the architecture. Not black-box AI — code that remembers what hurt, knows why, and never tries the same failing path twice.",
  },
  {
    icon: "🏛️",
    tag: "Compliance-First",
    name: "Formal Architecture & Compliance Infrastructure",
    description:
      "Ontological modeling, causal chain preservation, and decision trail generation. Built for EU AI Act requirements already landing in 2026. Category errors caught at compile time, not in production.",
  },
  {
    icon: "🧠",
    tag: "Self-Improving",
    name: "Self-Improving Automation with Scar Memory",
    description:
      "Automation pipelines that don't just execute — they learn. Each failure is categorized, its causal chain preserved, and its lessons made available to every downstream decision without retraining.",
  },
  {
    icon: "🔮",
    tag: "Grounded",
    name: "Ontologically-Grounded LLM Systems",
    description:
      "Large language models integrated through formal ontologies, not prompt engineering. Chatbots, document analysis, and smart search that reason within defined boundaries and explain their decisions.",
  },
  {
    icon: "⚡",
    tag: "Quest-Driven",
    name: "Quest-Oriented Rapid Prototyping",
    description:
      "From concept to working prototype in days. We model your domain in VOW, define agent quests with formal proofs, and validate before you commit. Move fast without sacrificing safety.",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Ontology Mapping",
    description:
      "We model your business domain in VOW's formal structure. Entities, relationships, constraints, and failure modes — defined before a single line of agent code is written.",
  },
  {
    number: "02",
    title: "Agent Definition",
    description:
      "Goals, proofs, and guardrails compiled to readable Python. Every action is traceable. Every decision is explainable. The system knows what it's allowed to do and what it must never attempt.",
  },
  {
    number: "03",
    title: "Scar Memory Training",
    description:
      "The system learns from edge cases and failures without retraining. Each scar is categorized, its causal chain preserved, and its lessons propagated to every downstream decision automatically.",
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
    icon: "dna",
    title: "Scar Memory — Formal Failure Ontology",
    description:
      "Not logs. Not RLHF. VOW's <code>continuant ScarMemory</code> categorizes every failure by ontology, preserves its causal chain, and propagates lessons to downstream decisions without retraining. This is not debugging — it's structured, queryable, permanent organizational knowledge.",
  },
  {
    icon: "shield",
    title: "Compile-Time Category Enforcement",
    description:
      "VOW's type system catches ontological mismatches, temporal violations, and causal loops before runtime. <code>// Cannot mutate continuant without sync</code> — this error is impossible in Python, JavaScript, or any traditional language.",
  },
  {
    icon: "crosshair",
    title: "Quests as First-Class Constructs",
    description:
      "Goals and proofs built into the syntax itself, not bolted on as frameworks. An agent's purpose is declared, verified, and traced — not inferred from prompt engineering or reward hacking.",
  },
];

const WHY_VOW = [
  {
    icon: "🛡️",
    title: "Provable Safety",
    description:
      "Every agent decision leaves a causal trail. Not logs — formal proofs that can be audited, verified, and presented to regulators.",
  },
  {
    icon: "📋",
    title: "Regulatory Pre-Compliance",
    description:
      "Built for 2026 EU AI Act requirements. High-risk AI systems need audit trails, human oversight, and risk management — VOW generates this by design, not as an afterthought.",
  },
  {
    icon: "🔄",
    title: "Self-Improving Systems",
    description:
      "Scar memory means failures teach, not break. The system accumulates knowledge, classifies errors by ontology, and avoids repeating them — without model retraining or downtime.",
  },
  {
    icon: "✓",
    title: "Formal Verification",
    description:
      "Category errors caught at compile time, not runtime. The type system enforces constraints that would be invisible bugs in traditional code — ontological mismatches, temporal violations, causal loops.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#e8e4f0] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pt-32 pb-8 text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="inline-block text-[12px] font-semibold tracking-[0.1em] uppercase px-5 py-2 rounded-3xl border border-white/[0.06] text-[#67e8f9] mb-6">
            ⚡ Autonomous Systems Built on VOW
          </div>
          <h2 className="text-[36px] font-extrabold leading-[1.2] tracking-[-0.02em] mb-4">
            Autonomous Systems{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#a78bfa] to-[#f472b6]">
              Built on VOW
            </span>
          </h2>
          <p className="text-[17px] text-[#9a94b0] max-w-[600px] mx-auto leading-[1.7]">
            We don't just build software. We architect formally-verified AI
            systems that learn from failure, leave audit trails, and comply with
            regulatory frameworks before they become law.
          </p>
        </div>
      </section>

      {/* Core Services */}
      <section>
        <div className="max-w-[720px] mx-auto px-6">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] font-bold mb-3 text-[#e8e4f0]">
              Core Services
            </h3>
            <p className="text-[15px] text-[#6b6580] leading-[1.6]">
              Everything we build compiles to auditable Python. Every decision
              leaves a trail.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {CORE_SERVICES.map((service) => (
              <div
                key={service.name}
                className="bg-[#161326] border border-white/[0.06] rounded-[20px] p-7 relative overflow-hidden group hover:border-[rgba(167,139,250,0.2)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Hover gradient top bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a78bfa] to-[#f472b6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.15)] flex items-center justify-center text-xl flex-shrink-0">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-[0.12em] block mb-1">
                      {service.tag}
                    </span>
                    <h4 className="text-lg font-bold text-[#e8e4f0]">
                      {service.name}
                    </h4>
                  </div>
                </div>
                <p className="text-[15px] text-[#9a94b0] leading-[1.7] pl-16 max-sm:pl-0 max-sm:mt-3">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="max-w-[720px] mx-auto px-6">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] font-bold mb-3 text-[#e8e4f0]">
              How It Works
            </h3>
            <p className="text-[15px] text-[#6b6580] leading-[1.6]">
              The VOW engagement process — formal from day one.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-[#161326] border border-white/[0.06] rounded-[20px] p-7 flex gap-5 items-start hover:border-[rgba(167,139,250,0.2)] transition-all duration-300 max-sm:flex-col"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[rgba(103,232,249,0.1)] border border-[rgba(103,232,249,0.2)] flex items-center justify-center text-base font-bold text-[#67e8f9] font-mono flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-[#e8e4f0]">
                    {step.title}
                  </h4>
                  <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The VOW Difference */}
      <section>
        <div className="max-w-[720px] mx-auto px-6">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] font-bold mb-3 text-[#e8e4f0]">
              The VOW Difference
            </h3>
            <p className="text-[15px] text-[#6b6580] leading-[1.6]">
              What exists nowhere else.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {VOW_DIFFERENCE.map((item) => {
              const IconComponent = item.icon === "dna" ? Dna : item.icon === "shield" ? ShieldCheck : Crosshair;
              return (
              <div
                key={item.title}
                className="bg-[#161326] border border-white/[0.06] rounded-[20px] p-7 hover:border-[rgba(167,139,250,0.2)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.15)] flex items-center justify-center mb-4">
                  <IconComponent className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <h4 className="text-lg font-bold mb-2 text-[#e8e4f0]">
                  {item.title}
                </h4>
                <p
                  className="text-[15px] text-[#9a94b0] leading-[1.7] [&>code]:bg-[rgba(167,139,250,0.1)] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-[13px] [&>code]:text-[#a78bfa]"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why VOW */}
      <section>
        <div className="max-w-[720px] mx-auto px-6">
          <div className="pt-12 pb-6">
            <h3 className="text-[28px] font-bold mb-3 text-[#e8e4f0]">
              Why VOW
            </h3>
            <p className="text-[15px] text-[#6b6580] leading-[1.6]">
              What traditional agencies can't offer.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {WHY_VOW.map((prop) => (
              <div
                key={prop.title}
                className="bg-[#161326] border border-white/[0.06] rounded-[20px] p-7 hover:border-[rgba(167,139,250,0.2)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.15)] flex items-center justify-center text-xl mb-4">
                  {prop.icon}
                </div>
                <h4 className="text-lg font-bold mb-2 text-[#e8e4f0]">
                  {prop.title}
                </h4>
                <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Side Note: Traditional Services */}
      <section>
        <div className="max-w-[720px] mx-auto px-6">
          <div className="bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.1)] rounded-[20px] p-7 my-12 text-center">
            <span className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-[0.12em] block mb-3">
              Also Available
            </span>
            <h4 className="text-xl font-bold mb-2 text-[#e8e4f0]">
              Custom Web Development
            </h4>
            <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
              Full-stack web applications, APIs, and traditional automation —
              built with the same quality standards. React, Next.js, Node.js,
              tRPC. Responsive, accessible, production-ready. This is our
              foundation while the VOW ecosystem scales.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="pt-12 pb-8 text-center">
        <div className="max-w-[720px] mx-auto px-6 flex flex-col items-center gap-4">
          <a
            href="mailto:jonathan@jceelabs.com"
            className="inline-block bg-gradient-to-br from-[#a78bfa] to-[#f472b6] text-white text-base font-semibold px-8 py-4 rounded-full hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,139,250,0.3)] transition-all duration-300"
          >
            Request a VOW Audit →
          </a>
          <Link href="/">
            <a className="inline-block text-sm text-[#6b6580] border border-white/[0.06] px-6 py-3 rounded-full hover:border-[rgba(167,139,250,0.2)] hover:text-[#9a94b0] transition-all duration-300">
              Explore Enterprise Access
            </a>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
