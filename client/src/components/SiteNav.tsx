import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const PRODUCTS = [
  { name: "VOW", href: "/vow", color: "text-[#d4a843]" },
  { name: "Mirrored", href: "/mirrored", color: "text-[#c0c8d8]" },
  { name: "TrueRPM", href: "/truerpm", color: "text-[#c0c8d8]" },
  { name: "FORGEX", href: "/forgex", color: "text-[#c0c8d8]" },

];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "border-b border-[#2a3a5a]/50 bg-[#080c18]/90 backdrop-blur-xl py-3"
          : "bg-transparent py-4 md:py-5"
      }`}>
        <div className="container flex items-center justify-between px-4 md:px-6 relative">
          {/* Spacer for mobile to balance hamburger on right */}
          <div className="w-11 md:hidden" aria-hidden="true" />

          {/* Logo — centered on mobile, left-aligned on desktop */}
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
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
            <Link href="/" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Home</Link>
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="flex items-center gap-1 text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors"
              >
                Products <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 py-2 rounded-xl border border-[#2a3a5a] bg-[#0d1424]/95 backdrop-blur-xl shadow-xl shadow-black/40">
                  {PRODUCTS.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      onClick={() => setProductsOpen(false)}
                      className={`block px-4 py-2 text-sm text-[#7a8aaa] hover:${product.color} hover:bg-[#2a3a5a]/30 transition-colors`}
                    >
                      {product.name}
                    </Link>
                  ))}
                  <div className="border-t border-[#2a3a5a] mt-1 pt-1">
                    <Link
                      href="/products"
                      onClick={() => setProductsOpen(false)}
                      className="block px-4 py-2 text-sm text-[#8ba4d8] hover:text-[#c0c8d8] hover:bg-[#2a3a5a]/30 transition-colors font-medium"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/services" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Services</Link>
            <Link href="/team" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Team</Link>
            <Link href="/blog" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">Blog</Link>
            <Link href="/faq" className="text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/services">
              <Button size="sm" className="hidden sm:flex rounded-xl bg-[#e0e6f0] text-[#080c18] hover:bg-[#c0c8d8] hover:shadow-xl hover:shadow-[#8ba4d8]/20 hover:-translate-y-0.5 border-0 font-medium shadow-lg shadow-[#8ba4d8]/10 active:scale-95 transition-all duration-200">
                <span className="flex items-center gap-1">
                  Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </Link>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl border border-[#c0c8d8]/30 bg-[#080c18]/60 backdrop-blur-sm text-white hover:bg-[#2a3a5a]/50 hover:border-[#c0c8d8]/50 active:scale-95 transition-all duration-150 relative shadow-sm shadow-black/20"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col items-center justify-center gap-[6px]">
                <span className={`block h-[2.5px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  mobileMenuOpen ? "rotate-45 translate-y-[8.5px]" : ""
                }`} style={{ width: "22px" }} />
                <span className={`block h-[2.5px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                }`} style={{ width: "22px" }} />
                <span className={`block h-[2.5px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-[8.5px]" : ""
                }`} style={{ width: "22px" }} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Mobile slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] max-w-[80vw] md:hidden border-l border-[#8ba4d8]/20 shadow-2xl shadow-[#8ba4d8]/10 transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionDuration: "400ms", background: "linear-gradient(180deg, #040810 0%, #080c18 40%, #0a1020 100%)" }}
      >
        {/* Subtle quantum glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#8ba4d8]/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-4 w-1 h-1 rounded-full bg-[#8ba4d8] opacity-40 animate-pulse" />
        <div className="absolute top-40 right-8 w-0.5 h-0.5 rounded-full bg-[#d4a843] opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-64 left-10 w-0.5 h-0.5 rounded-full bg-[#8ba4d8] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Panel header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#8ba4d8]/10">
          <span className="text-xs font-mono tracking-widest text-[#8ba4d8]/70 uppercase">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8ba4d8]/60 hover:text-[#e8ecf4] hover:bg-[#8ba4d8]/10 transition-all duration-150"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel content */}
        <nav className="relative px-5 py-4 overflow-y-auto h-[calc(100%-60px)]">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[15px] text-[#e8ecf4] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-[#8ba4d8]/10"
            >
              Home
            </Link>

            {/* Products section */}
            <div className="py-2">
              <span className="text-[10px] font-bold tracking-[0.12em] text-[#8ba4d8]/50 uppercase px-3 mb-1 block">
                Products
              </span>
              <div className="mt-1 space-y-0.5">
                {PRODUCTS.map((product, i) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-[14px] py-2.5 px-3 rounded-lg transition-all duration-200 hover:bg-[#8ba4d8]/10 ${
                      product.name === "VOW" ? "text-[#d4a843] font-medium" : "text-[#c0c8d8]/80 hover:text-[#e8ecf4]"
                    }`}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${(i + 1) * 40}ms` : "0ms",
                    }}
                  >
                    {product.name}
                  </Link>
                ))}
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[14px] text-[#8ba4d8] font-medium py-2.5 px-3 rounded-lg hover:bg-[#8ba4d8]/10 transition-colors mt-1 border-t border-[#8ba4d8]/10 pt-3"
                >
                  View All Products →
                </Link>
              </div>
            </div>

            {/* Other nav links */}
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[15px] text-[#e8ecf4] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-[#8ba4d8]/10"
            >
              Services
            </Link>
            <Link
              href="/team"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[15px] text-[#e8ecf4] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-[#8ba4d8]/10"
            >
              Team
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[15px] text-[#e8ecf4] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-[#8ba4d8]/10"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[15px] text-[#e8ecf4] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-[#8ba4d8]/10"
            >
              FAQ
            </Link>
          </div>

          {/* CTA at bottom of panel */}
          <div className="mt-6 pt-4 border-t border-[#8ba4d8]/10">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#8ba4d8]/15 text-[#e8ecf4] text-sm font-semibold border border-[#8ba4d8]/30 hover:bg-[#8ba4d8]/25 hover:border-[#8ba4d8]/50 hover:shadow-lg hover:shadow-[#8ba4d8]/10 active:scale-97 transition-all duration-200"
            >
              Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
