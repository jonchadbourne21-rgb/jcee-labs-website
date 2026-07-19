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
            ? "border-b border-[#2a3a5a]/50 bg-[#080c18]/80 backdrop-blur-xl py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/manus-storage/jcee-labs-new-logo_cd2cbbaa.jpg"
                alt="Jcee Labs Logo"
                className="w-9 h-9 rounded-xl shadow-lg shadow-[#8ba4d8]/15 group-hover:scale-105 transition-transform duration-300 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-base tracking-wider text-[#e8ecf4] group-hover:text-[#c0c8d8] transition-colors">
                  JCEE LABS
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#7a8aaa] uppercase">
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
          <div className="md:hidden border-t border-[#2a3a5a]/50 bg-[#080c18]/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <Link href="/products">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors py-2"
              >
                Products
              </a>
            </Link>
            <Link href="/services">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors py-2"
              >
                Services
              </a>
            </Link>
            <Link href="/team">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors py-2"
              >
                Team
              </a>
            </Link>
            <Link href="/faq">
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors py-2"
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
            src="/manus-storage/jcee-labs-new-logo_cd2cbbaa.jpg"
            alt=""
            className="w-[500px] md:w-[650px] lg:w-[750px] opacity-20 mr-[-5%] md:mr-[2%] select-none"
            style={{ filter: "brightness(1.2) contrast(1.1)" }}
          />
          {/* Gradient overlay to blend logo edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c18] via-[#080c18]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-transparent to-[#080c18]/50" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ba4d8]/10 border border-[#8ba4d8]/20 text-[#8ba4d8] text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> SaaS, PaaS, Venture Architecture
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
              <span className="text-[#8ba4d8]">One studio.</span>{" "}
              <span className="text-[#d4a843]">
                One language.
              </span>{" "}
              <span className="text-[#8ba4d8]">
                Nine products.
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-[#f0f4fa]">
              Jcee Labs builds AI products on{" "}
              <Link href="/vow" className="text-[#d4a843] hover:text-[#e8c56d] underline underline-offset-2 decoration-[#d4a843]/40 font-semibold">VOW</Link>
              {" "}— our formally-grounded language where every agent action compiles to auditable Python and leaves a causal trail, not a black box. Built for regulatory transparency before the EU AI Act makes it mandatory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAGLINE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 border-t border-[#2a3a5a]/50">
        <div className="container text-center max-w-2xl mx-auto space-y-3">
          <p className="text-sm text-[#7a8aaa] tracking-wide">
            Jcee Labs is the d.b.a. of HOWM HOLDINGS LLC.
          </p>
          <p className="text-lg text-[#c0c8d8] font-medium">
            We architect formally-verified AI systems. Everyone else is just shipping software.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 border-t border-[#2a3a5a]/50">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-[#c0c8d8] mb-2">9+</div>
              <p className="text-sm text-[#7a8aaa]">Products Live & Building</p>
            </div>
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-[#8ba4d8] mb-2">March 2026</div>
              <p className="text-sm text-[#7a8aaa]">Founded</p>
            </div>
            <div className="bg-[#0d1424] border border-[#2a3a5a]/50 rounded-2xl p-6 text-center">
              <div className="text-lg md:text-xl font-display font-bold text-[#c0c8d8] mb-2 leading-tight">Human-Creative Architecture,<br/>Agentic AI-Driven</div>
              <p className="text-sm text-[#7a8aaa]">Development Approach</p>
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
