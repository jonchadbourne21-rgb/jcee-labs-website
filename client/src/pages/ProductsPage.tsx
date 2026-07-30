import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  Brain,
  Truck,
  Code2,
  Ship,
  Cpu,
  FileText,
  Music,
} from "lucide-react";

// ─── Product Cards Data ─────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "VOW",
    tagline: "Intelligent execution engine",
    description:
      "The VOW Runtime is an intelligent execution engine built for AI-native software. Rather than introducing another programming language, it provides a new execution model that enables applications to adapt, optimize, and reason about their own behavior. Designed to power software that evolves over time while remaining deterministic, scalable, and developer-controlled.",
    color: "purple",
    icon: Code2,
    href: "/vow",
    status: "BETA",
    poweredByVow: true,
    meta: "Execution engine for AI",
  },
  {
    name: "Mirrored",
    tagline: "AI Higher Self",
    description:
      "Everyone talks to themselves. Mirrored makes that conversation useful. It's an AI self-reflection companion you can actually talk to (voice-to-voice, no typing required) that remembers your journey and reflects it back with honesty. Not a chatbot. Not a coach, not a therapist. Your Higher Self, on demand.\n\nDaily check-ins, guided growth programs, journaling, profound AI reflections to help you to self-actualization and memory systems to make the user get a personalized experience.\n\nUnder the hood: a custom persona architecture, emotional voice intelligence, and a proprietary memory system.",
    color: "teal",
    icon: Brain,
    href: "/mirrored",
    status: "App Store August 1st",
    poweredByVow: false,
    meta: "Dropping August 1st",
  },
  {
    name: "TrueRPM",
    tagline: "True Revenue Per Mile",
    description:
      "AI-powered multi-load stacking board for owner-operators. Optimizes routes to simplify workflow and eliminate deadhead miles, with in-app navigation via Google Maps, live diesel prices, and a built-in ledger. Three apps replaced by one, driven by multi-agent intelligence.",
    color: "orange",
    icon: Truck,
    href: "/truerpm",
    status: "BUILDING",
    poweredByVow: true,
    meta: "Releases August 1",
  },

  {
    name: "FloCraft",
    tagline: "Supply chain optimization",
    description:
      "Supply chain intelligence, powered by VOW. FloCraft uses VOW's intelligent brain to solve supply chain problems in real time. Alternate routes and corrective solutions that directly improve ROI.",
    color: "teal",
    icon: Ship,
    href: "/flocraft",
    status: "BETA",
    poweredByVow: true,
    meta: "Supply chain optimization",
  },


  {
    name: "NicheFlo",
    tagline: "Financial intelligence",
    description:
      "Autonomous GPU arbitrage intelligence and DeFi yield optimization. Real-time signals. AI-powered execution.",
    color: "cyan",
    icon: Cpu,
    href: "/nicheflo",
    status: "BETA",
    poweredByVow: true,
    meta: "Financial intelligence",
  },
  {
    name: "SOPForge",
    tagline: "SOP automation",
    description:
      "Autonomous AI platform for standard operating procedures. Currently in pilot testing with 3 companies seeing real-world results. If you're interested, let us show you how it's already saving them time and money.",
    color: "indigo",
    icon: FileText,
    href: "/sopforge",
    status: "PILOTS & TESTING",
    poweredByVow: true,
    meta: "3 companies testing",
  },
  {
    name: "Musaia",
    tagline: "Music streaming & discovery",
    description:
      "Music streaming app integrated with Sonic DNA — designed to learn your style, flavor, and vibe. In two weeks you won't be skipping. You will be heard and listen like never before. Built for fans and artists. We have a contract where you keep 100% rights to your songs and music. We center our focus on underground and emerging artists. If you're an artist that wants an app that promotes, engages, and earns — Spotify on steroids. Ask about a demo.",
    color: "pink",
    icon: Music,
    href: "https://musaia.org",
    status: "BETA",
    poweredByVow: false,
    meta: "Music streaming",
  }

];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 text-center">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="inline-block text-[11px] md:text-[12px] font-semibold tracking-[0.1em] uppercase px-4 md:px-5 py-1.5 md:py-2 rounded-3xl border border-[#d4a843]/20 text-[#d4a843] mb-4 md:mb-6">
            6 Products Built on VOW
          </div>
          <h2 className="text-2xl md:text-[36px] lg:text-[48px] font-extrabold leading-[1.2] tracking-[-0.02em] mb-3 md:mb-4">
            Products
          </h2>
          <p className="text-sm md:text-[17px] lg:text-[19px] text-[#7a8aaa] max-w-[600px] lg:max-w-[760px] mx-auto leading-[1.7]">
            Every product learns from failure, explains every decision, and compiles to code you can actually read.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="pb-12 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Link key={product.name} href={product.href} className={`block bg-[#0d1424] border border-[#2a3a5a]/50 rounded-xl md:rounded-2xl p-5 md:p-7 lg:p-8 group hover:border-[#8ba4d8]/30 hover:-translate-y-px transition-all duration-300 relative overflow-hidden flex flex-col${
                      product.name === "VOW"
                        ? " border-[rgba(212,168,67,0.15)] bg-gradient-to-b from-[rgba(212,168,67,0.04)] to-[#0d1424] hover:border-[rgba(212,168,67,0.3)]"
                        : ""
                    }`}>
                    {/* Header: name + status badge */}
                    <div className="flex items-start justify-between gap-2 md:gap-3 mb-2.5 md:mb-3.5">
                      <div className="flex-1 min-w-0">
                        {product.poweredByVow && product.name !== "VOW" && (
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#d4a843] uppercase mb-1 block">
                            POWERED BY VOW
                          </span>
                        )}
                        <h3 className="text-base md:text-lg font-bold text-[#e8ecf4] tracking-[-0.01em]">
                          {product.name}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full border whitespace-nowrap flex-shrink-0 mt-0.5 ${
                          product.status === "BUILDING"
                            ? "bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]"
                            : product.status === "BETA \u2014 WAITLIST"
                            ? "bg-[rgba(244,114,182,0.12)] text-[#f472b6] border-[rgba(244,114,182,0.2)]"
                            : "bg-[rgba(52,211,153,0.12)] text-[#34d399] border-[rgba(52,211,153,0.2)]"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[13px] md:text-[15px] text-[#7a8aaa] leading-[1.6] md:leading-[1.7] mb-3 md:mb-4 whitespace-pre-line">
                      {product.description}
                    </p>

                    {/* Meta line */}
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${product.name === "VOW" ? "bg-[#d4a843]" : "bg-[#8ba4d8]"}`} />
                      <span className="text-[11px] md:text-[13px] text-[#7a8aaa]/70">
                        {product.meta}
                      </span>
                    </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
