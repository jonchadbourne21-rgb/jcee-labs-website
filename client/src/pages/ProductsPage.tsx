import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  Brain,
  Truck,
  Code2,
  Cpu,
  Ship,
  Bot,
  Factory,
  FileText,
  Orbit,
} from "lucide-react";

// ─── Product Cards Data ─────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "VOW",
    tagline: "Domain-specific language",
    description:
      "Programming language built around quests, proofs, and scar memory. Code that learns from failure — remembers what hurt, knows why, and never repeats the same failing path.",
    color: "purple",
    icon: Code2,
    href: "/vow",
    status: "BETA",
    poweredByVow: true,
    meta: "Domain-specific language",
  },
  {
    name: "Mirrored — Your AI Higher Self",
    tagline: "AI Higher Self",
    description:
      "Everyone talks to themselves. Mirrored makes that conversation useful. It's an AI self-reflection companion you can actually talk to — voice-to-voice, no typing required — that remembers your journey and reflects it back with honesty. Not a chatbot. Not a coach, not a therapist. Your Higher Self, on demand.\n\nDaily check-ins, guided growth programs, journaling, profound AI reflections to help you to self-actualization and memory systems to make the user get a personalized experience.\n\nUnder the hood: a custom persona architecture, emotional voice intelligence, and a proprietary memory system.",
    color: "teal",
    icon: Brain,
    href: "/mirrored",
    status: "BUILDING",
    poweredByVow: false,
    meta: "App Store launch within a month",
  },
  {
    name: "TrueRPM",
    tagline: "True Revenue Per Mile",
    description:
      "AI-powered multi-load stacking board for owner-operators. Optimizes routes to simplify workflow and eliminate deadhead miles, with in-app navigation via Google Maps, live diesel prices, and a built-in ledger — three apps replaced by one, driven by multi-agent intelligence. (True Revenue Per Mile — the app and brand say TrueRPM.)",
    color: "orange",
    icon: Truck,
    href: "/truerpm",
    status: "BUILDING",
    poweredByVow: true,
    meta: "Releases August 1",
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
    name: "FloCraft",
    tagline: "Supply chain optimization",
    description:
      "Supply chain intelligence, powered by VOW. FloCraft uses VOW's intelligent brain to solve supply chain problems in real time — alternate routes and corrective solutions that directly improve ROI.",
    color: "teal",
    icon: Ship,
    href: "/flocraft",
    status: "BETA",
    poweredByVow: true,
    meta: "Supply chain optimization",
  },
  {
    name: "Rooh",
    tagline: "Autonomous marketing",
    description:
      "An autonomous multi-agent marketing team working asynchronously every day, each agent focused on its own niche. It studies strategies and learns from what works, tracks daily news in your industry, drafts content on a posting schedule, and pings your phone when a blog or social post is ready to send — with a human in the loop whenever you want one.",
    color: "amber",
    icon: Bot,
    href: "/rooh",
    status: "BETA",
    poweredByVow: true,
    meta: "Autonomous marketing",
  },
  {
    name: "Revel Industries",
    tagline: "Industrial workflow automation",
    description:
      "Industrial equipment bid management built specifically for HVAC wholesalers and resellers. Automates the entire workflow — from receiving a bid request (PDF spec sheet or email) to sending RFQs to vendors and comparing quotes.",
    color: "teal",
    icon: Factory,
    href: "/revel",
    status: "BUILDING",
    poweredByVow: true,
    meta: "Industrial workflow automation",
  },
  {
    name: "SOPForge",
    tagline: "SOP automation",
    description:
      "Autonomous AI platform for standard operating procedures.",
    color: "indigo",
    icon: FileText,
    href: "/sopforge",
    status: "BETA",
    poweredByVow: true,
    meta: "SOP automation",
  },
  {
    name: "Babodie",
    tagline: "Neuro-OS",
    description:
      "The world's first autonomous Neuro-OS. Powered by VOW v1.0. Run Quests. Build Beliefs. Persist Memory.",
    color: "purple",
    icon: Orbit,
    href: "/babodie",
    status: "BETA — WAITLIST",
    poweredByVow: true,
    meta: "Neuro-OS",
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#e8e4f0] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pt-32 pb-8 text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="inline-block text-[12px] font-semibold tracking-[0.1em] uppercase px-5 py-2 rounded-3xl border border-[#d4a843]/20 text-[#d4a843] mb-6">
            9 Products — Built on VOW
          </div>
          <h2 className="text-[36px] font-extrabold leading-[1.2] tracking-[-0.02em] mb-4">
            Products
          </h2>
          <p className="text-[17px] text-[#9a94b0] max-w-[600px] mx-auto leading-[1.7]">
            Built on VOW. Auditable by design. Every product in our portfolio
            compiles to readable Python and leaves a decision trail.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="pb-20">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="flex flex-col gap-4">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Link key={product.name} href={product.href}>
                  <a
                    className={`block bg-[#161326] border border-white/[0.06] rounded-2xl p-7 group hover:border-[rgba(212,168,67,0.2)] hover:-translate-y-px transition-all duration-300 relative overflow-hidden${
                      product.name === "VOW"
                        ? " border-[rgba(212,168,67,0.15)] bg-gradient-to-b from-[rgba(212,168,67,0.04)] to-[#161326] hover:border-[rgba(212,168,67,0.3)]"
                        : ""
                    }`}
                  >
                    {/* Header: name + status badge */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex-1 min-w-0">
                        {product.poweredByVow && product.name !== "VOW" && (
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#d4a843] uppercase mb-1 block">
                            POWERED BY VOW
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-[#e8e4f0] tracking-[-0.01em]">
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
                    <p className="text-[15px] text-[#9a94b0] leading-[1.7] mb-4 whitespace-pre-line">
                      {product.description}
                    </p>

                    {/* Meta line */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4a843] flex-shrink-0" />
                      <span className="text-[13px] text-[#6b6580]">
                        {product.meta}
                      </span>
                    </div>
                  </a>
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
