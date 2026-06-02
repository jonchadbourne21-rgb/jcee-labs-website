import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  Cpu,
  TrendingUp,
  ChevronRight,
  Zap,
  BrainCircuit,
  Workflow,
  Bot,
  Lock,
  Send,
  Loader2,
  HardHat,
  Wrench,
  Flame,
  Droplets,
  Building2,
  RotateCcw,
} from "lucide-react";

// ─── BidIndustrial Industry Presets ──────────────────────────────────────────
const INDUSTRY_PRESETS = [
  { id: "hvac", label: "HVAC", icon: Flame, cost: 18500, overhead: 14, profit: 20 },
  { id: "electrical", label: "Electrical", icon: Zap, cost: 12000, overhead: 12, profit: 18 },
  { id: "plumbing", label: "Plumbing", icon: Droplets, cost: 9500, overhead: 11, profit: 17 },
  { id: "general", label: "General Contracting", icon: HardHat, cost: 42000, overhead: 16, profit: 22 },
  { id: "mechanical", label: "Mechanical", icon: Wrench, cost: 24000, overhead: 13, profit: 19 },
  { id: "commercial", label: "Commercial Build-Out", icon: Building2, cost: 85000, overhead: 18, profit: 24 },
];

// ─── Mirrored Chat Types ──────────────────────────────────────────────────────
type ChatMessage = { role: "user" | "assistant"; content: string };

const MIRROR_STARTERS = [
  "I've been feeling overwhelmed lately...",
  "I want to grow but I don't know where to start.",
  "Something happened today that I can't stop thinking about.",
  "I feel like I'm not living up to my potential.",
];

export default function Home() {
  // ── UI State ──────────────────────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"mirrored" | "bidindustrial">("mirrored");

  // ── Lead Capture State ────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  // ── Mirrored Chat State ───────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey, I'm Mirror 👋 — your personal AI reflection companion. Share something on your mind and I'll reflect it back with clarity and depth." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reflectMutation = trpc.mirrored.reflect.useMutation({
    onSuccess: (data) => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "I'm here with you. Something went wrong on my end — try again?" }]);
    },
  });

  // ── BidIndustrial State ───────────────────────────────────────────────────
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState(14250);
  const [overheadPercent, setOverheadPercent] = useState(12);
  const [profitPercent, setProfitPercent] = useState(18);

  const overhead = Math.round(bidValue * (overheadPercent / 100));
  const profit = Math.round(bidValue * (profitPercent / 100));
  const totalEstimate = bidValue + overhead + profit;

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter a valid email address."); return; }
    subscribeMutation.mutate({ email, source: "homepage" });
    setEmail("");
  };

  const handleSendChat = () => {
    const msg = chatInput.trim();
    if (!msg || reflectMutation.isPending) return;
    const history = chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    reflectMutation.mutate({ message: msg, history });
  };

  const handleStarterClick = (starter: string) => {
    setChatInput(starter);
  };

  const handlePresetSelect = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setActivePreset(preset.id);
    setBidValue(preset.cost);
    setOverheadPercent(preset.overhead);
    setProfitPercent(preset.profit);
  };

  const handleResetPreset = () => {
    setActivePreset(null);
    setBidValue(14250);
    setOverheadPercent(12);
    setProfitPercent(18);
  };

  const handleDemoAction = (productName: string) => {
    toast.info(`${productName} beta coming soon!`, {
      description: "You will be notified as soon as access opens up.",
    });
  };

  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-x-hidden flex flex-col justify-between">

      {/* BACKGROUND AURORAS — static, GPU-composited, no animation */}
      <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/4 blur-[90px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-500/6 blur-[80px] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />

      {/* STICKY HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/5 bg-[#090514]/80 backdrop-blur-xl py-4" : "bg-transparent py-6"
      }`}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <img
              src="/manus-storage/jcee-labs-logo_f25acfb0.png"
              alt="Jcee Labs Logo"
              className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider group-hover:text-purple-300 transition-colors">
                JCEE LABS
              </span>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                by HOWM HOLDINGS LLC
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#lab" className="text-muted-foreground hover:text-foreground transition-colors">The Lab</a>
            <a href="#products" className="text-muted-foreground hover:text-foreground transition-colors">Our Suite</a>
            <a href="#pipeline" className="text-muted-foreground hover:text-foreground transition-colors">AI Orchestration</a>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href="#newsletter">
              <Button size="sm" className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                <span className="relative z-10 flex items-center gap-1">
                  Enter Lab <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="container pt-32 pb-20 md:pt-44 md:pb-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Introducing the Jcee Labs Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
              Crafting the <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Future</span> of Intelligent <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Software</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl">
              Jcee Labs is the innovation and creation playground of <strong className="text-white">HOWM HOLDINGS LLC</strong>. We design, engineer, and deploy high-performance applications driven by advanced AI agents to streamline your workflow and keep you ahead of the game.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#products">
                <Button size="lg" className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-slate-200 font-semibold shadow-xl shadow-white/5 active:scale-97 transition-all">
                  Explore Products
                </Button>
              </a>
              <a href="#pipeline">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                  How We Build
                </Button>
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-lg">
              <div>
                <div className="font-display font-bold text-2xl md:text-3xl text-purple-400">1st</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Ecosystem Launch</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl md:text-3xl text-teal-400">2+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Core Platforms</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl md:text-3xl text-indigo-400">100%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">AI-Optimized</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="absolute inset-0 bg-purple-500/15 rounded-full blur-[70px] pointer-events-none scale-75" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
            <div className="relative w-full max-w-[450px] aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 group">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663398434536/PGyQHKFdSR7kZkQyzRA9uW/jcee-labs-hero-bzba5vWMjZJYVUUoxCyc5g.webp"
                alt="Jcee Labs AI Core"
                width="450"
                height="450"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-teal-300 uppercase tracking-wider">Lab Status</div>
                  <div className="text-sm font-bold text-white">Ecosystem Engine Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE LAB / MISSION */}
      <section id="lab" className="cv-auto border-t border-white/5 bg-white/[0.01] py-20 relative z-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">
              Our <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Vision</span> & Philosophy
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Jcee Labs is built to explore the boundaries of digital intelligence. Under the stewardship of HOWM HOLDINGS LLC, we create products that don't just solve problems—they reshape how we interact with technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, color: "purple", title: "Creativity Unleashed", desc: "We build tools that augment human creativity, turning abstract thoughts into structured realities. Our designs are bespoke, fluid, and visually stunning.", label: "CREATIVE PIPELINE" },
              { icon: Layers, color: "teal", title: "Modern Architecture", desc: "All applications are scaffolded on lightweight, lightning-fast technology stacks. High-performance rendering and micro-interactions come standard.", label: "ENGINEERING STANDARDS" },
              { icon: Cpu, color: "indigo", title: "AI-First Streamlining", desc: "We integrate advanced autonomous agents to orchestrate operations. This reduces engineering time, automates testing, and speeds up product delivery.", label: "AGENT ORCHESTRATION" },
            ].map(({ icon: Icon, color, title, desc, label }) => (
              <div key={title} className={`bg-white/[0.02] p-8 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-${color}-500/30 transition-colors duration-300`}>
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <div className={`pt-6 font-mono text-xs text-${color}-300 tracking-wider`}>{label} →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS SHOWCASE */}
      <section id="products" className="cv-auto py-24 relative z-10 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                <Layers className="w-3.5 h-3.5" /> Product Suite v1.0
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold">
                The <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Inventions</span> of Jcee Labs
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore our debut tools designed to optimize personal introspection and professional business estimating.
              </p>
            </div>
            <div className="flex gap-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-xl self-start md:self-auto">
              <button
                onClick={() => setActiveTab("mirrored")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "mirrored" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-muted-foreground hover:text-[#E2E8F0]"}`}
              >
                Mirrored
              </button>
              <button
                onClick={() => setActiveTab("bidindustrial")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "bidindustrial" ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "text-muted-foreground hover:text-[#E2E8F0]"}`}
              >
                BidIndustrial
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className={`absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none transition-colors duration-500 ${activeTab === "mirrored" ? "bg-purple-500/12" : "bg-teal-500/12"}`} style={{ willChange: 'transform', transform: 'translateZ(0)' }} />

            {/* ── MIRRORED TAB ── */}
            {activeTab === "mirrored" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                    <Sparkles className="w-3 h-3" /> Debut Release
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-white">Mirrored</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your digital self, reflected and optimized. Mirrored is an AI-powered personal development and self-reflection application — an interactive digital mirror for journaling, pattern tracking, and personalized intelligent insights.
                  </p>
                  <div className="space-y-3">
                    {["Cognitive journaling with semantic pattern mapping", "AI-guided reflection feedback & personal coach synthesis", "Goal structuring and alignment visualizations"].map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-[#E2E8F0]">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Button onClick={() => handleDemoAction("Mirrored")} className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-97 transition-all">
                      Request Early Beta
                    </Button>
                    <Link href="/faq">
                      <Button variant="ghost" className="rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/5">
                        Read FAQ
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* ── MIRRORED LIVE CHAT DEMO ── */}
                <div className="lg:col-span-7">
                  <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-purple-500/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                      <div>
                        <div className="text-sm font-bold text-white">Mirror AI</div>
                        <div className="text-xs text-purple-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Live Demo — Try it now
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-br-sm"
                              : "bg-white/[0.06] text-[#E2E8F0] border border-white/5 rounded-bl-sm"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {reflectMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-white/[0.06] border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                            <span className="text-xs text-muted-foreground">Mirror is reflecting...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Starter prompts (only shown at start) */}
                    {chatMessages.length === 1 && (
                      <div className="px-4 pb-2 flex gap-2 flex-wrap">
                        {MIRROR_STARTERS.slice(0, 2).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStarterClick(s)}
                            className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input */}
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Share what's on your mind..."
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                      <button
                        onClick={handleSendChat}
                        disabled={!chatInput.trim() || reflectMutation.isPending}
                        className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center text-white transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── BIDINDUSTRIAL TAB ── */}
            {activeTab === "bidindustrial" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                    <TrendingUp className="w-3 h-3" /> B2B Intelligence
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-white">BidIndustrial</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The intelligent bidding estimator. Designed for commercial operators and contractors who need hyper-accurate bids at lightning speed. Smart calculations and historical models streamline your bidding pipeline and maximize win rates.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Button onClick={() => handleDemoAction("BidIndustrial")} className="rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                      Schedule BidIndustrial Pilot
                    </Button>
                    <Link href="/faq">
                      <Button variant="ghost" className="rounded-xl text-teal-300 hover:text-teal-200 hover:bg-teal-500/5">
                        Read FAQ
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* ── BIDINDUSTRIAL LIVE ESTIMATOR ── */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Industry Preset Buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-teal-300 uppercase tracking-wider">Industry Presets</span>
                      {activePreset && (
                        <button onClick={handleResetPreset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#E2E8F0] transition-colors">
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {INDUSTRY_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                              activePreset === preset.id
                                ? "bg-teal-600/20 border-teal-500/50 text-teal-300"
                                : "bg-white/[0.02] border-white/5 text-muted-foreground hover:border-teal-500/30 hover:text-[#E2E8F0]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Estimator Widget */}
                  <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-teal-300">LIVE INTERACTIVE ESTIMATOR</span>
                      <span className="text-muted-foreground">BidIndustrial v1</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Direct Materials & Labor:</span>
                        <span className="font-bold text-white">${bidValue.toLocaleString()}</span>
                      </div>
                      <input
                        type="range" min="1000" max="200000" step="500"
                        value={bidValue}
                        onChange={(e) => { setActivePreset(null); setBidValue(Number(e.target.value)); }}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Overhead</span><span>{overheadPercent}%</span>
                        </div>
                        <input
                          type="range" min="5" max="30" step="1"
                          value={overheadPercent}
                          onChange={(e) => { setActivePreset(null); setOverheadPercent(Number(e.target.value)); }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400"
                        />
                        <div className="text-sm font-semibold text-white">${overhead.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target Profit</span><span>{profitPercent}%</span>
                        </div>
                        <input
                          type="range" min="5" max="40" step="1"
                          value={profitPercent}
                          onChange={(e) => { setActivePreset(null); setProfitPercent(Number(e.target.value)); }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <div className="text-sm font-semibold text-white">${profit.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-sm font-display font-bold text-teal-300">Total Bid Estimate:</span>
                      <span className="text-2xl font-display font-extrabold text-white">${totalEstimate.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI AGENT PIPELINE */}
      <section id="pipeline" className="cv-auto py-20 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                <Workflow className="w-3.5 h-3.5" /> AI Orchestration
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-white">
                Streamlined by <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">AI Agents</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                At Jcee Labs, we don't build software the old way. We orchestrate advanced autonomous AI agents (like Manus) to streamline our research, code generation, and deployment pipelines — giving us a compounding advantage in speed and quality.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  { icon: Bot, color: "purple", title: "Autonomous Coding", desc: "Agents write, test, and lint clean React + Tailwind components on the fly." },
                  { icon: BrainCircuit, color: "teal", title: "Predictive Estimating", desc: "Deep integration of custom LLMs for estimating pricing, bid matching, and risk." },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{title}</h4>
                      <p className="text-muted-foreground text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white/[0.01] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">AGENT PIPELINE SIMULATOR</span>
                  </div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Manus Orchestrated</span>
                </div>
                <div className="space-y-4">
                  {[
                    { num: "01", color: "purple", title: "Idea Ingestion & Strategy", desc: "AI agents parse requirements and draft domain blueprints.", status: "Success", statusColor: "emerald" },
                    { num: "02", color: "teal", title: "Rapid Frontend Synthesis", desc: "Ethereal layouts and components are written with Tailwind 4.", status: "Active", statusColor: "emerald" },
                    { num: "03", color: "indigo", title: "Intelligent Optimization", desc: "Custom models evaluate and streamline UI/UX and calculation logic.", status: "Queued", statusColor: "purple" },
                  ].map(({ num, color, title, desc, status, statusColor }) => (
                    <div key={num} className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-${color}-500/20 transition-colors`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center font-mono text-xs font-bold text-${color}-300`}>{num}</div>
                        <div>
                          <div className="text-sm font-bold text-white">{title}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono text-${statusColor}-400 bg-${statusColor}-500/10 px-2 py-0.5 rounded`}>{status}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Current Speed: <strong className="text-white">10x Industry Average</strong></span>
                  <span>Build Cycle: <strong className="text-white">Autonomous</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="cv-auto py-20 border-t border-white/5 relative z-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              The Jcee Labs <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Roadmap</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We are constantly incubating. Here is a glimpse of where Jcee Labs is heading next under the HOWM HOLDINGS LLC umbrella.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { phase: "Phase 1", color: "purple", period: "Q2 2026", title: "Mirrored Beta", desc: "Launching our personalized AI journaling and reflection beta for early priority queue users." },
              { phase: "Phase 2", color: "teal", period: "Q3 2026", title: "BidIndustrial Launch", desc: "Releasing the intelligent bidding estimator to selected contractor pilot cohorts." },
              { phase: "Phase 3", color: "indigo", period: "Q4 2026", title: "AI Agent Hub", desc: "Introducing a streamlined interface to manage custom autonomous AI agents for small businesses." },
              { phase: "Phase 4", color: "fuchsia", period: "Q1 2027", title: "Ecosystem API", desc: "Opening Jcee Labs' custom AI intelligence layers via public APIs for developers." },
            ].map(({ phase, color, period, title, desc }) => (
              <div key={phase} className={`bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative group hover:border-${color}-500/20 transition-all duration-300`}>
                <div className={`absolute top-4 right-4 text-xs font-mono text-${color}-400 bg-${color}-500/10 px-2 py-0.5 rounded-full`}>{phase}</div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{period}</div>
                <h4 className="font-display font-bold text-lg text-white mb-2">{title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER / CTA */}
      <section id="newsletter" className="py-24 border-t border-white/5 bg-gradient-to-t from-purple-950/10 to-transparent relative z-10">
        <div className="container max-w-4xl">
          <div className="bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden text-center space-y-6">
            <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mx-auto">
              <Sparkles className="w-3.5 h-3.5" /> Secure Your Spot
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white">
              Enter the <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Jcee Labs</span> Queue
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Be the first to know when private betas for <strong className="text-white">Mirrored</strong>, <strong className="text-white">BidIndustrial</strong>, and other upcoming HOWM HOLDINGS LLC innovations go live.
            </p>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 max-w-md mx-auto">
                <p className="text-purple-300 font-bold mb-1">Queue Registration Confirmed!</p>
                <p className="text-muted-foreground text-sm">We have saved your spot. Check your inbox soon for laboratory updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
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
                  {subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Priority Queue"}
                </Button>
              </form>
            )}

            <div className="pt-4 flex justify-center items-center gap-6 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Zero Spam</span>
              <span>&bull;</span>
              <span>Administered by HOWM HOLDINGS LLC</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#05030c] py-12 relative z-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
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
                Jcee Labs is the d.b.a. of <strong className="text-white">HOWM HOLDINGS LLC</strong>, dedicated to building streamlined, AI-optimized applications that enhance creativity and professional efficiency.
              </p>
            </div>
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Incubator Products</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => { setActiveTab("mirrored"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-purple-300 transition-colors">Mirrored App</button></li>
                <li><button onClick={() => { setActiveTab("bidindustrial"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-teal-300 transition-colors">BidIndustrial Estimator</button></li>
                <li className="text-white/30">More coming soon...</li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-purple-300 transition-colors">FAQ Hub</Link></li>
                <li><a href="#lab" className="hover:text-purple-300 transition-colors">Lab Vision</a></li>
                <li><a href="#pipeline" className="hover:text-purple-300 transition-colors">AI Pipeline</a></li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-default">HOWM HOLDINGS LLC</span></li>
                <li><span className="cursor-default text-xs text-white/40">Registered d.b.a: Jcee Labs</span></li>
                <li><span className="text-white/20">Privacy Policy</span></li>
                <li><span className="text-white/20">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Jcee Labs. All rights reserved. Under HOWM HOLDINGS LLC.</p>
            <p className="flex items-center gap-1">
              Built with <Zap className="w-3 h-3 text-purple-400" /> & AI Orchestration
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
