import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  Zap,
  Mail,
  Brain,
  Truck,
  Code2,
  TrendingUp,
  Eye,
  Workflow,
  Ship,
  Cpu,
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
      "The first quest-oriented programming language: goals, proofs, and scar memory built into the syntax itself. Code that remembers what hurt, knows why, and never tries the same failing path twice.",
    color: "purple",
    icon: Code2,
    href: "/vow",
    status: "BETA",
    poweredByVow: true,
    meta: "Domain-specific language",
  },
  {
    name: "Mirrored — AI Higher Self",
    tagline: "AI Higher Self",
    description:
      "An AI self-reflection companion with emotional intelligence and a unique voice-to-voice experience. Not a chatbot — a sophisticated AI built with no script. Not a coach, not a therapist: your Higher Self, made possible by a custom persona prompt, EVI, and a proprietary RAG system. Our first app.",
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
    name: "Revel",
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

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-x-hidden flex flex-col">

      {/* BACKGROUND AURORAS */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-purple-600/8 blur-[80px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />
      <div
        className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/4 blur-[90px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/5 bg-[#090514]/80 backdrop-blur-xl py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3 group">
              <img
                src="/manus-storage/jcee-labs-logo_d242d7a5.png"
                alt="Jcee Labs Logo"
                className="w-9 h-9 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-base tracking-wider group-hover:text-purple-300 transition-colors">
                  JCEE LABS
                </span>
                <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                  by HOWM HOLDINGS LLC
                </span>
              </div>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#products"
              className="text-muted-foreground hover:text-white transition-colors"
            >
              Products
            </a>
            <Link href="/services">
              <a className="text-muted-foreground hover:text-white transition-colors">
                Services
              </a>
            </Link>
            <Link href="/team">
              <a className="text-muted-foreground hover:text-white transition-colors">
                Team
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-muted-foreground hover:text-white transition-colors">
                FAQ
              </a>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/services">
              <Button
                size="sm"
                className="hidden sm:flex rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1">
                  Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </Link>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#090514]/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-white transition-colors py-2"
            >
              Products
            </a>
            <Link href="/services">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                Services
              </a>
            </Link>
            <Link href="/team">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                Team
              </a>
            </Link>
            <Link href="/faq">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                FAQ
              </a>
            </Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 z-10 overflow-hidden">
        {/* Logo as background element */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <img
            src="/manus-storage/jcee-labs-logo_d242d7a5.png"
            alt=""
            className="w-[500px] md:w-[650px] lg:w-[750px] opacity-20 mr-[-5%] md:mr-[2%] select-none"
            style={{ filter: "brightness(1.2) contrast(1.1)" }}
          />
          {/* Gradient overlay to blend logo edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090514] via-[#090514]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-[#090514]/50" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> SaaS, PaaS, Venture Architecture
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
              One studio.{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                One language.
              </span>{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                Nine products
              </span>{" "}
              that prove it works.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-slate-300/90">
              Jcee Labs builds AI products on{" "}
              <Link href="/vow">
                <a className="text-purple-300 hover:text-purple-200 underline underline-offset-2 decoration-purple-500/40 font-semibold">VOW</a>
              </Link>
              . VOW is a domain-specific language that makes agentic AI systems auditable by design — every action an agent takes compiles to readable Python and leaves a trail, not a black box. It's built with regulatory transparency in mind, ahead of EU AI Act requirements already landing in 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-slate-200 font-semibold shadow-xl shadow-white/5 active:scale-97 transition-all"
                >
                  Explore Products
                </Button>
              </a>
              <Link href="/team">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all"
                >
                  Meet the Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRODUCTS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="products"
        className="py-12 pb-20 relative z-10 border-t border-white/5"
      >
        <div className="max-w-[720px] mx-auto px-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-[28px] font-display font-bold text-[#e8e4f0]">
              Products
            </h2>
            <p className="text-[15px] text-[#6b6580]">
              Built on VOW. Auditable by design.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              // Static class maps to avoid dynamic Tailwind interpolation issues
              const statusStyles = {
                BETA: {
                  badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
                  powered: "text-indigo-400",
                  hover: "hover:border-indigo-500/30",
                },
                BUILDING: {
                  badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                  powered: "text-amber-400",
                  hover: "hover:border-amber-500/30",
                },
                "BETA \u2014 WAITLIST": {
                  badge: "bg-pink-500/10 border-pink-500/30 text-pink-400",
                  powered: "text-pink-400",
                  hover: "hover:border-pink-500/30",
                },
              } as const;
              const styles = statusStyles[product.status as keyof typeof statusStyles] || statusStyles.BETA;
              return (
                <Link key={product.name} href={product.href}>
                  <a className={`block bg-[#161326] border border-white/[0.06] rounded-2xl p-7 group hover:border-[rgba(167,139,250,0.2)] hover:-translate-y-px transition-all duration-300 relative overflow-hidden${
                    product.name === "VOW" ? " border-[rgba(167,139,250,0.15)] bg-gradient-to-b from-[rgba(167,139,250,0.04)] to-[#161326]" : ""
                  }`}>
                    {/* Header: name + status badge */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex-1 min-w-0">
                        {product.poweredByVow && product.name !== "VOW" && (
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#a78bfa] uppercase mb-1 block">
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
                            : "bg-[rgba(167,139,250,0.12)] text-[#a78bfa] border-[rgba(167,139,250,0.2)]"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[15px] text-[#9a94b0] leading-[1.7] mb-4">
                      {product.description}
                    </p>

                    {/* Meta line */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] flex-shrink-0" />
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

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA STRIP — Services
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 border-t border-white/5 relative z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-display font-bold text-xl text-white">
                Need a custom AI solution?
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                We build enterprise-grade web applications and automation systems
                for businesses. From concept to production in weeks.
              </p>
            </div>
            <Link href="/services">
              <Button
                size="lg"
                className="shrink-0 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all"
              >
                View Services <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-[#05030c] py-12 relative z-10 mt-auto">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">

            {/* Column 1 — Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/manus-storage/jcee-labs-logo_d242d7a5.png"
                  alt="Jcee Labs Logo"
                  className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/25 object-contain"
                />
                <span className="font-display font-bold text-base tracking-wider text-white">
                  JCEE LABS
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Jcee Labs is the d.b.a. of{" "}
                <strong className="text-white">HOWM HOLDINGS LLC</strong>. We
                build AI-optimized applications that enhance creativity and
                professional efficiency.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.instagram.com/jceelabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="@jceelabs on Instagram"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-pink-400 transition-colors text-xs font-mono group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="group-hover:text-pink-400">@jceelabs</span>
                </a>
                <span className="text-white/15">·</span>
                <a
                  href="https://www.instagram.com/vow._.wow"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="@vow._.wow on Instagram"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-pink-400 transition-colors text-xs font-mono group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="group-hover:text-pink-400">@vow._.wow</span>
                </a>
              </div>
              {/* Contact email */}
              <a
                href="mailto:jonathan@jceelabs.com"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-mono"
              >
                <Mail className="w-3.5 h-3.5" />
                jonathan@jceelabs.com
              </a>
            </div>

            {/* Column 2 — Products */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
                Products
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/vow"><a className="hover:text-purple-300 transition-colors">VOW</a></Link></li>
                <li><Link href="/mirrored"><a className="hover:text-teal-300 transition-colors">Mirrored</a></Link></li>
                <li><Link href="/truerpm"><a className="hover:text-orange-300 transition-colors">TrueRPM</a></Link></li>
                <li><Link href="/nicheflo"><a className="hover:text-cyan-300 transition-colors">NicheFlo</a></Link></li>
                <li><Link href="/flocraft"><a className="hover:text-teal-300 transition-colors">FloCraft</a></Link></li>
                <li><Link href="/rooh"><a className="hover:text-amber-300 transition-colors">Rooh</a></Link></li>
                <li><Link href="/revel"><a className="hover:text-teal-300 transition-colors">Revel</a></Link></li>
                <li><Link href="/sopforge"><a className="hover:text-indigo-300 transition-colors">SOPForge</a></Link></li>
                <li><Link href="/babodie"><a className="hover:text-purple-300 transition-colors">Babodie</a></Link></li>
              </ul>
            </div>

            {/* Column 3 — Company */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
                Company
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/team"><a className="hover:text-white transition-colors">Team</a></Link></li>
                <li><Link href="/faq"><a className="hover:text-white transition-colors">FAQ</a></Link></li>
                <li><Link href="/services"><a className="hover:text-white transition-colors">Services</a></Link></li>
              </ul>
            </div>

            {/* Column 4 — Legal */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
                Legal
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Jcee Labs. All rights reserved.
              HOWM HOLDINGS LLC.
            </p>
            <p className="flex items-center gap-1">
              Built with <Zap className="w-3 h-3 text-purple-400" /> AI
              Orchestration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
