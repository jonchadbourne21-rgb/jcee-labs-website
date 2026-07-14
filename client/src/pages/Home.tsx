import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import BusinessInquiryForm from "@/components/BusinessInquiryForm";
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  ChevronRight,
  Lock,
  Loader2,
  Brain,
  Truck,
  Code2,
  TrendingUp,
  Workflow,
  Users,
  Eye,
} from "lucide-react";

// ─── Product Cards Data ─────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "Mirrored",
    tagline: "AI Reflection Partner",
    description: "Personal development through AI-powered journaling, pattern tracking, and intelligent insights.",
    color: "purple",
    icon: Brain,
    href: "/mirrored",
    status: "Beta",
  },
  {
    name: "Trucker$Dream",
    tagline: "Load Optimization",
    description: "Multi-stacking load optimization for owner-operators. Maximize revenue per mile.",
    color: "orange",
    icon: Truck,
    href: "/truckers-dream",
    status: "Coming Soon",
  },
  {
    name: "VOW",
    tagline: "PaaS & Language",
    description: "A revolutionary platform and coding language designed to eliminate complexity. Open-source soon.",
    color: "purple",
    icon: Code2,
    href: "/vow",
    status: "In Development",
  },
  {
    name: "BidIndustrial",
    tagline: "Intelligent Bidding",
    description: "Smart bid estimation for contractors. Hyper-accurate calculations at lightning speed.",
    color: "teal",
    icon: TrendingUp,
    href: "/bidindustrial",
    status: "Coming Soon",
  },
  {
    name: "APEX Media",
    tagline: "Autonomous Content Engine",
    description: "Multi-agent system that watches your market, creates content, and adapts to what drives results.",
    color: "amber",
    icon: Eye,
    href: "/apex",
    status: "In Development",
  },
  {
    name: "NicheFlow",
    tagline: "SOP Generator",
    description: "Auto-generates industry-specific standard operating procedures for small businesses.",
    color: "indigo",
    icon: Workflow,
    href: "/nicheflo",
    status: "Coming Soon",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subscribeMutation = trpc.leads.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSubmitted(true);
        toast.success("You're in the queue!", {
          description: "We'll notify you the moment private betas go live.",
        });
      } else {
        toast.info(data.message ?? "Already registered!");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter a valid email address."); return; }
    subscribeMutation.mutate({ email, source: "homepage" });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-x-hidden flex flex-col">

      {/* BACKGROUND AURORAS */}
      <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/4 blur-[90px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />

      {/* ═══════════════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
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
            <a href="#products" className="text-muted-foreground hover:text-white transition-colors">Products</a>
            <a href="#services" className="text-muted-foreground hover:text-white transition-colors">Services</a>
            <Link href="/team"><a className="text-muted-foreground hover:text-white transition-colors">Team</a></Link>
            <Link href="/faq"><a className="text-muted-foreground hover:text-white transition-colors">FAQ</a></Link>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contact">
              <Button size="sm" className="hidden sm:flex rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                <span className="flex items-center gap-1">
                  Get in Touch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </a>
            {/* Mobile menu toggle */}
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#090514]/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">Products</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">Services</a>
            <Link href="/team"><a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">Team</a></Link>
            <Link href="/faq"><a onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white transition-colors py-2">FAQ</a></Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="container pt-32 pb-20 md:pt-40 md:pb-24 relative z-10">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Software Studio
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
            Crafting the <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Future</span> of Intelligent <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Software</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl">
            Jcee Labs is the innovation studio of <strong className="text-white">HOWM HOLDINGS LLC</strong>. We design, engineer, and deploy AI-driven applications that help businesses operate smarter, faster, and more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a href="#products">
              <Button size="lg" className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-slate-200 font-semibold shadow-xl shadow-white/5 active:scale-97 transition-all">
                Explore Products
              </Button>
            </a>
            <Link href="/team">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Meet the Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRODUCTS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="products" className="py-24 relative z-10 border-t border-white/5">
        <div className="container">
          <div className="max-w-2xl space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Layers className="w-3.5 h-3.5" /> Our Products
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              The Jcee Labs Suite
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tools designed to empower small businesses and individuals through intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Link key={product.name} href={product.href}>
                  <a className="block bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-purple-500/20 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-lg bg-${product.color}-500/10 border border-${product.color}-500/20 flex items-center justify-center text-${product.color}-400 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-${product.color}-500/10 border border-${product.color}-500/20 text-${product.color}-300`}>
                        {product.status}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mb-1">{product.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mb-3">{product.tagline}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.description}</p>
                    <div className="flex items-center gap-1 text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
                      Learn more <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SERVICES (B2B)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-teal-950/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" /> Custom Development
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              B2B Website Builds & Automation
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              From concept to deployment, we build enterprise-grade web applications and automation systems at speed and quality that traditional agencies cannot match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Zap, title: "Fast Delivery", desc: "AI-accelerated development cuts timelines significantly. From requirements to production in weeks." },
              { icon: Sparkles, title: "Quality First", desc: "Every project is tested, optimized, and production-ready. We ship clean, maintainable code." },
              { icon: Cpu, title: "AI-Powered", desc: "We leverage autonomous AI agents to handle code generation, testing, and deployment pipelines." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="#contact">
              <Button size="lg" className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                Start Your Project <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONTACT / INQUIRY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 relative z-10 border-t border-white/5">
        <div className="container max-w-2xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              Let's <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Build Together</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Tell us about your project and we'll get back to you within 24 hours.
            </p>
          </div>
          <BusinessInquiryForm />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          NEWSLETTER / CTA
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="newsletter" className="py-24 border-t border-white/5 bg-gradient-to-t from-purple-950/10 to-transparent relative z-10">
        <div className="container max-w-3xl">
          <div className="bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden text-center space-y-6">
            <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mx-auto relative z-10">
              <Sparkles className="w-3.5 h-3.5" /> Stay Updated
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white relative z-10">
              Join the <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Priority Queue</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto relative z-10">
              Be the first to know when our products launch. Get early access and exclusive updates.
            </p>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 max-w-md mx-auto relative z-10">
                <p className="text-purple-300 font-bold mb-1">You're on the list!</p>
                <p className="text-muted-foreground text-sm">We'll notify you as soon as access opens up.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2 relative z-10">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-muted-foreground h-11 focus-visible:ring-purple-500"
                />
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 h-11 shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  {subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Queue"}
                </Button>
              </form>
            )}

            <div className="pt-4 flex justify-center items-center gap-6 text-xs text-muted-foreground font-mono relative z-10">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No spam, ever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-[#05030c] py-12 relative z-10 mt-auto">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/manus-storage/jcee-labs-logo_f25acfb0.png"
                  alt="Jcee Labs Logo"
                  className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/25 object-contain"
                />
                <span className="font-display font-bold text-base tracking-wider text-white">JCEE LABS</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Jcee Labs is the d.b.a. of <strong className="text-white">HOWM HOLDINGS LLC</strong>. We build AI-optimized applications that enhance creativity and professional efficiency.
              </p>
            </div>
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Products</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mirrored"><a className="hover:text-purple-300 transition-colors">Mirrored</a></Link></li>
                <li><Link href="/truckers-dream"><a className="hover:text-orange-300 transition-colors">Trucker$Dream</a></Link></li>
                <li><Link href="/vow"><a className="hover:text-purple-300 transition-colors">VOW</a></Link></li>
                <li><Link href="/bidindustrial"><a className="hover:text-teal-300 transition-colors">BidIndustrial</a></Link></li>
                <li><Link href="/nicheflo"><a className="hover:text-indigo-300 transition-colors">NicheFlow</a></Link></li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/team"><a className="hover:text-white transition-colors">Team</a></Link></li>
                <li><Link href="/faq"><a className="hover:text-white transition-colors">FAQ</a></Link></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-default">HOWM HOLDINGS LLC</span></li>
                <li><span className="text-white/40 text-xs">d.b.a: Jcee Labs</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Jcee Labs. All rights reserved. HOWM HOLDINGS LLC.</p>
            <p className="flex items-center gap-1">
              Built with <Zap className="w-3 h-3 text-purple-400" /> AI Orchestration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
