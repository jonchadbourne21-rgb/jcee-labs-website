import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Sparkles,
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
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] relative overflow-x-hidden flex flex-col">

      {/* BACKGROUND AURORAS — navy/silver tones */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-[#8ba4d8]/8 blur-[80px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />
      <div
        className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#2a3a5a]/20 blur-[90px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-[#2a3a5a]/50 bg-[#080c18]/80 backdrop-blur-xl py-2 md:py-3"
            : "bg-transparent py-3 md:py-5"
        }`}
      >
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <img
                src="/manus-storage/jcee-labs-new-logo_cd2cbbaa.jpg"
                alt="Jcee Labs Logo"
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl shadow-lg shadow-[#8ba4d8]/15 group-hover:scale-105 transition-transform duration-300 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm md:text-base tracking-wider text-[#e8ecf4] group-hover:text-[#c0c8d8] transition-colors">
                  JCEE LABS
                </span>
                <span className="text-[8px] md:text-[9px] font-mono tracking-widest text-[#7a8aaa] uppercase">
                  by HOWM HOLDINGS LLC
                </span>
              </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/products" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Products</Link>
            <Link href="/services" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Services</Link>
            <Link href="/team" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Team</Link>
            <Link href="/faq" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/services">
              <Button
                size="sm"
                className="hidden sm:flex rounded-xl bg-[#e0e6f0] text-[#080c18] hover:bg-[#c0c8d8] hover:shadow-xl hover:shadow-[#8ba4d8]/20 hover:-translate-y-0.5 border-0 font-medium shadow-lg shadow-[#8ba4d8]/10 active:scale-95 transition-all duration-200"
              >
                <span className="flex items-center gap-1">
                  Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </Link>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#2a3a5a] text-[#e8ecf4]"
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
          <div className="md:hidden border-t border-[#2a3a5a]/50 bg-[#080c18]/95 backdrop-blur-xl px-6 py-4 space-y-1">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block text-base text-[#e8ecf4] hover:text-[#8ba4d8] transition-colors py-3 border-b border-[#2a3a5a]/30">
              Products
            </Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="block text-base text-[#e8ecf4] hover:text-[#8ba4d8] transition-colors py-3 border-b border-[#2a3a5a]/30">
              Services
            </Link>
            <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="block text-base text-[#e8ecf4] hover:text-[#8ba4d8] transition-colors py-3 border-b border-[#2a3a5a]/30">
              Team
            </Link>
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="block text-base text-[#e8ecf4] hover:text-[#8ba4d8] transition-colors py-3">
              FAQ
            </Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="block mt-3">
              <Button size="sm" className="w-full rounded-xl bg-[#e0e6f0] text-[#080c18] font-medium">
                <span className="flex items-center justify-center gap-1">
                  Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Full viewport, static, intriguing
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex-1 flex items-center justify-center min-h-screen z-10 overflow-hidden px-4 md:px-0">
        {/* Hero background image — different for mobile vs desktop */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Mobile background (quantum neural network) */}
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663398434536/PGyQHKFdSR7kZkQyzRA9uW/quantum-neural-bg-mobile-UNbHbew8qCTxmWrUfrMJAX.webp"
            alt=""
            className="md:hidden w-full h-full object-cover object-center opacity-30 select-none"
          />
          {/* Desktop background (widescreen light-ray version) */}
          <img
            src="/manus-storage/jcee-labs-hero-bg_104c4860.png"
            alt=""
            className="hidden md:block w-full h-full object-cover object-center opacity-40 select-none"
          />
          {/* Mobile-only dark overlay for text readability */}
          <div className="absolute inset-0 bg-[#080c18]/40 md:hidden" />
          {/* Gradient overlays to blend with content */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c18] via-[#080c18]/70 md:via-[#080c18]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-transparent to-[#080c18]/40" />
        </div>

        <div className="container relative z-10 pt-20 md:pt-0 max-w-[1100px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-3xl lg:max-w-[680px] space-y-5 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ba4d8]/10 border border-[#8ba4d8]/20 text-[#8ba4d8] text-[10px] md:text-xs font-mono">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> SaaS, PaaS, Venture Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] md:leading-[1.05] tracking-tight">
              <span className="text-[#8ba4d8]">One studio.</span>{" "}
              <span className="text-[#d4a843]">
                One language.
              </span>{" "}
              <span className="text-[#8ba4d8]">
                Nine products.
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl text-[#f0f4fa]">
              Jcee Labs builds AI products on{" "}
              <Link href="/vow" className="text-[#d4a843] hover:text-[#e8c56d] underline underline-offset-2 decoration-[#d4a843]/40 font-semibold">VOW</Link>
              , our formally-grounded language where every agent action compiles to auditable Python and leaves a causal trail, not a black box. Built for regulatory transparency before the EU AI Act makes it mandatory.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-[#e0e6f0] text-[#080c18] hover:bg-[#c0c8d8] hover:shadow-2xl hover:shadow-[#8ba4d8]/20 hover:-translate-y-0.5 font-semibold shadow-xl shadow-[#8ba4d8]/5 active:scale-97 transition-all duration-200"
                >
                  Explore Products
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-[#e0e6f0] text-[#080c18] hover:bg-[#c0c8d8] hover:shadow-2xl hover:shadow-[#8ba4d8]/20 hover:-translate-y-0.5 font-semibold shadow-xl shadow-[#8ba4d8]/5 active:scale-97 transition-all duration-200"
                >
                  Services
                </Button>
              </Link>
              <Link href="/team">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-[#e0e6f0] text-[#080c18] hover:bg-[#c0c8d8] hover:shadow-2xl hover:shadow-[#8ba4d8]/20 hover:-translate-y-0.5 font-semibold shadow-xl shadow-[#8ba4d8]/5 active:scale-97 transition-all duration-200"
                >
                  Meet the Team
                </Button>
              </Link>
            </div>
            <div className="pt-6 md:pt-8 text-center sm:text-left space-y-1">
              <p className="text-xs md:text-sm text-[#7a8aaa] tracking-wide">
                Jcee Labs is the d.b.a. of HOWM HOLDINGS LLC.
              </p>
              <p className="text-sm md:text-base text-[#c0c8d8] font-medium">
                We architect formally-verified AI systems. Everyone else is just shipping software.
              </p>
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
