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
} from "lucide-react";

// ─── Product Cards Data ─────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "Mirrored",
    tagline: "Your Higher Self",
    description:
      "Emotionally intelligent AI that becomes the best version of you — guiding self-acceptance, resilience, and self-actualization through voice and text.",
    color: "teal",
    icon: Brain,
    href: "/mirrored",
    status: "Beta",
  },
  {
    name: "Trucker$Dream",
    tagline: "Load Optimization",
    description:
      "Multi-stacking load optimization for owner-operators. Maximize revenue per mile.",
    color: "orange",
    icon: Truck,
    href: "/truckers-dream",
    status: "Coming Soon",
  },
  {
    name: "VOW",
    tagline: "Ontology-Driven PaaS & Language",
    description:
      "Formally-grounded AI infrastructure with built-in EU AI Act compliance. The brain behind every Jcee Labs product.",
    color: "purple",
    icon: Code2,
    href: "/vow",
    status: "In Development",
  },
  {
    name: "BidIndustrial",
    tagline: "Intelligent Bidding",
    description:
      "Smart bid estimation for contractors. Hyper-accurate calculations at lightning speed.",
    color: "teal",
    icon: TrendingUp,
    href: "/bidindustrial",
    status: "Coming Soon",
  },
  {
    name: "APEX Media",
    tagline: "Autonomous Content Engine",
    description:
      "Multi-agent system that watches your market, creates content, and adapts to what drives results.",
    color: "amber",
    icon: Eye,
    href: "/apex",
    status: "In Development",
  },
  {
    name: "NicheFlow",
    tagline: "SOP Generator",
    description:
      "Auto-generates industry-specific standard operating procedures for small businesses.",
    color: "indigo",
    icon: Workflow,
    href: "/nicheflo",
    status: "Coming Soon",
  },
  {
    name: "Zhipz",
    tagline: "Logistics Intelligence",
    description:
      "Multi-agent port monitoring and route optimization. Anticipate disruptions before they cost you.",
    color: "cyan",
    icon: Ship,
    href: "/zhipz",
    status: "In Development",
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
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Software Studio
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
              Crafting the{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Future
              </span>{" "}
              of Intelligent{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                Software
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-slate-300/90">
              Jcee Labs is the innovation studio of{" "}
              <strong className="text-white font-semibold">
                HOWM HOLDINGS LLC
              </strong>
              . We design, engineer, and deploy AI-driven applications that help
              businesses operate smarter, faster, and more efficiently.
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
        className="py-24 relative z-10 border-t border-white/5"
      >
        <div className="container">
          <div className="max-w-2xl space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Layers className="w-3.5 h-3.5" /> Our Products
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              The Jcee Labs Suite
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tools designed to empower small businesses and individuals through
              intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Link key={product.name} href={product.href}>
                  <a className="block bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-purple-500/20 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-lg bg-${product.color}-500/10 border border-${product.color}-500/20 flex items-center justify-center text-${product.color}-400 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-${product.color}-500/10 border border-${product.color}-500/20 text-${product.color}-300`}
                      >
                        {product.status}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground mb-3">
                      {product.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
                      Learn more{" "}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                <li><Link href="/mirrored"><a className="hover:text-purple-300 transition-colors">Mirrored</a></Link></li>
                <li><Link href="/truckers-dream"><a className="hover:text-orange-300 transition-colors">Trucker$Dream</a></Link></li>
                <li><Link href="/vow"><a className="hover:text-purple-300 transition-colors">VOW</a></Link></li>
                <li><Link href="/apex"><a className="hover:text-amber-300 transition-colors">APEX Media</a></Link></li>
                <li><Link href="/bidindustrial"><a className="hover:text-teal-300 transition-colors">BidIndustrial</a></Link></li>
                <li><Link href="/nicheflo"><a className="hover:text-indigo-300 transition-colors">NicheFlow</a></Link></li>
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
