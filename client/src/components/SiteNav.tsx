import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const PRODUCTS = [
  { name: "Mirrored", href: "/mirrored", color: "text-purple-300" },
  { name: "Trucker$Dream", href: "/truckers-dream", color: "text-orange-300" },
  { name: "VOW", href: "/vow", color: "text-pink-300" },
  { name: "BidIndustrial", href: "/bidindustrial", color: "text-teal-300" },
  { name: "NicheFlow", href: "/nicheflo", color: "text-indigo-300" },
  { name: "APEX Media", href: "/apex", color: "text-amber-300" },
  { name: "SupplyChain", href: "/supplychain", color: "text-cyan-300" },
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "border-b border-white/5 bg-[#090514]/80 backdrop-blur-xl py-3" : "bg-transparent py-5"
    }`}>
      <div className="container flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-3 group">
            <img
              src="/manus-storage/jcee-labs-logo_f25acfb0.png"
              alt="Jcee Labs Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-wider text-white group-hover:text-purple-300 transition-colors">
                JCEE LABS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                by HOWM HOLDINGS LLC
              </span>
            </div>
          </a>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/"><a className="text-muted-foreground hover:text-white transition-colors">Home</a></Link>
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
            >
              Products <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 py-2 rounded-xl border border-white/10 bg-[#0d0820]/95 backdrop-blur-xl shadow-xl shadow-black/40">
                {PRODUCTS.map((product) => (
                  <Link key={product.href} href={product.href}>
                    <a
                      onClick={() => setProductsOpen(false)}
                      className={`block px-4 py-2 text-sm text-muted-foreground hover:${product.color} hover:bg-white/5 transition-colors`}
                    >
                      {product.name}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/team"><a className="text-muted-foreground hover:text-white transition-colors">Team</a></Link>
          <Link href="/faq"><a className="text-muted-foreground hover:text-white transition-colors">FAQ</a></Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/#contact">
            <Button size="sm" className="hidden sm:flex rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
              <span className="flex items-center gap-1">
                Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#090514]/95 backdrop-blur-xl px-6 py-4 space-y-1">
          <Link href="/"><a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">Home</a></Link>
          <div className="py-2">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Products</span>
            <div className="mt-1 pl-3 space-y-1 border-l border-white/10">
              {PRODUCTS.map((product) => (
                <Link key={product.href} href={product.href}>
                  <a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-1.5">
                    {product.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/team"><a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">Team</a></Link>
          <Link href="/faq"><a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">FAQ</a></Link>
        </div>
      )}
    </header>
  );
}
