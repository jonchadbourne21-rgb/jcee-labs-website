import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Sparkles,
  Zap,
  Mail,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

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
            <Link href="/products">
              <a className="text-muted-foreground hover:text-white transition-colors">
                Products
              </a>
            </Link>
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
            <Link href="/products">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                Products
              </a>
            </Link>
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
          HERO — Full viewport, static, intriguing
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex-1 flex items-center justify-center min-h-screen z-10 overflow-hidden">
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
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-slate-200 font-semibold shadow-xl shadow-white/5 active:scale-97 transition-all"
                >
                  Explore Products
                </Button>
              </Link>
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
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <SiteFooter />
    </div>
  );
}
