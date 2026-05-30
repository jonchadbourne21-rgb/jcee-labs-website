import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  LineChart, 
  Scale, 
  Lock, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"mirrored" | "bidindustrial">("mirrored");
  const [bidValue, setBidValue] = useState(14250);
  const [overheadPercent, setOverheadPercent] = useState(12);
  const [profitPercent, setProfitPercent] = useState(18);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll to change header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Welcome to the lab! You've been added to our priority queue.", {
      description: "We'll keep you updated on private betas and lab releases.",
    });
    setEmail("");
  };

  const handleDemoAction = (productName: string) => {
    toast.info(`${productName} beta coming soon!`, {
      description: "You will be notified as soon as access opens up.",
    });
  };

  // Live calculation for BidIndustrial Bid Simulator
  const rawCost = bidValue;
  const overhead = Math.round(rawCost * (overheadPercent / 100));
  const profit = Math.round(rawCost * (profitPercent / 100));
  const totalEstimate = rawCost + overhead + profit;

  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-x-hidden flex flex-col justify-between">
      
      {/* OPTIMIZED BACKGROUND AURORAS (GPU Accelerated, non-animated for faster painting) */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/4 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/6 blur-[100px] pointer-events-none" />

      {/* STICKY HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/5 bg-[#090514]/80 backdrop-blur-xl py-4" : "bg-transparent py-6"
      }`}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center font-display font-extrabold text-white text-base shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
              JL
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider group-hover:text-purple-300 transition-colors">
                JCEE LABS
              </span>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                by HOWM HOLDINGS
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
              <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" /> Introducing the Jcee Labs Ecosystem
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
              Crafting the <span className="text-gradient-purple">Future</span> of Intelligent <span className="text-gradient-teal">Software</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl">
              Jcee Labs is the innovation and creation playground of <strong>HOWM HOLDINGS LLC</strong>. We design, engineer, and deploy high-performance applications driven by advanced AI agents to streamline your workflow and keep you ahead of the game.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#products">
                <Button size="lg" className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-slate-200 font-semibold shadow-xl shadow-white/5 active:scale-97 transition-all">
                  Explore Products
                </Button>
              </a>
              <a href="#pipeline">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 text-foreground font-medium active:scale-97 transition-all">
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
            {/* Glowing Aura Backlight */}
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none scale-75" />
            
            <div className="relative w-full max-w-[450px] aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 group">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663398434536/PGyQHKFdSR7kZkQyzRA9uW/jcee-labs-hero-bzba5vWMjZJYVUUoxCyc5g.webp" 
                alt="Jcee Labs AI Core" 
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent opacity-60" />
              
              {/* Floating tech pill */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Cpu className="w-5 h-5 animate-pulse" />
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
      <section id="lab" className="border-t border-white/5 bg-white/[0.01] py-20 relative z-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">
              Our <span className="text-gradient-purple">Vision</span> & Philosophy
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Jcee Labs is built to explore the boundaries of digital intelligence. Under the stewardship of HOWM HOLDINGS LLC, we create products that don't just solve problems—they reshape how we interact with technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-purple-500/30 transition-colors duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">Creativity Unleashed</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We build tools that augment human creativity, turning abstract thoughts into structured realities. Our designs are bespoke, fluid, and visually stunning.
                </p>
              </div>
              <div className="pt-6 font-mono text-xs text-purple-300 tracking-wider">CREATIVE PIPELINE &rarr;</div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-teal-500/30 transition-colors duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">Modern Architecture</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All applications are scaffolded on lightweight, lightning-fast technology stacks. High-performance rendering and micro-interactions come standard.
                </p>
              </div>
              <div className="pt-6 font-mono text-xs text-teal-300 tracking-wider">ENGINEERING STANDARDS &rarr;</div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">AI-First Streamlining</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We integrate advanced autonomous agents to orchestrate operations. This reduces engineering time, automates testing, and speeds up product delivery.
                </p>
              </div>
              <div className="pt-6 font-mono text-xs text-indigo-300 tracking-wider">AGENT ORCHESTRATION &rarr;</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SHOWCASE */}
      <section id="products" className="py-24 relative z-10 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                <Layers className="w-3.5 h-3.5" /> Product Suite v1.0
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold">
                The <span className="text-gradient-teal">Inventions</span> of Jcee Labs
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore our debut tools designed to optimize personal introspection and professional business estimating.
              </p>
            </div>

            {/* Product Switcher Tabs */}
            <div className="flex gap-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-xl self-start md:self-auto">
              <button 
                onClick={() => setActiveTab("mirrored")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "mirrored" 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mirrored
              </button>
              <button 
                onClick={() => setActiveTab("bidindustrial")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "bidindustrial" 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                BidIndustrial Estimator
              </button>
            </div>
          </div>

          {/* ACTIVE PRODUCT TAB CONTENT */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
            {/* Ambient Backlight depending on active tab */}
            <div className={`absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-all duration-500 ${
              activeTab === "mirrored" ? "bg-purple-500/15" : "bg-teal-500/15"
            }`} />

            {activeTab === "mirrored" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                    <Sparkles className="w-3 h-3" /> Debut Release
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold">
                    Mirrored
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Your digital self, reflected and optimized. Mirrored is an AI-powered personal development and self-reflection application. It serves as an interactive digital mirror, allowing you to journal, track patterns, and clarify your path with personalized intelligent insights.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium">Cognitive journaling with semantic pattern mapping</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium">AI-guided reflection feedback & personal coach synthesis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium">Goal structuring and alignment visualizations</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
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

                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/5 group">
                    <img 
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663398434536/PGyQHKFdSR7kZkQyzRA9uW/mirrored-app-AomURUF5vHfe36AGeXjP5J.webp" 
                      alt="Mirrored App Preview" 
                      className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent opacity-40" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                    <TrendingUp className="w-3 h-3" /> B2B Intelligence
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold">
                    BidIndustrial
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    The intelligent bidding estimator. BidIndustrial is designed for commercial operators and contractors who need to deliver hyper-accurate bids at lightning speed. Using smart calculations and historical models, BidIndustrial streamlines your bidding pipeline and maximizes win rates.
                  </p>
                  
                  {/* LIVE DEMO SLIDER WIDGET */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between text-xs font-mono text-teal-300">
                      <span>LIVE INTERACTIVE ESTIMATOR</span>
                      <span>MUSAIA V1</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Direct Materials & Labor:</span>
                        <span className="font-bold text-white">${bidValue.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5000" 
                        max="50000" 
                        step="500"
                        value={bidValue} 
                        onChange={(e) => setBidValue(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Overhead ({overheadPercent}%):</div>
                        <div className="font-semibold text-white">${overhead.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Target Profit ({profitPercent}%):</div>
                        <div className="font-semibold text-white">${profit.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-sm font-display font-bold text-teal-300">Total Bid Estimate:</span>
                      <span className="text-xl font-display font-extrabold text-white">${totalEstimate.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
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

                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-teal-500/5 group">
                    <img 
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663398434536/PGyQHKFdSR7kZkQyzRA9uW/bidindustrial-app-LKytJ2jgvAoUG3A6R2Fuzx.webp" 
                      alt="BidIndustrial Blueprint" 
                      className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent opacity-40" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI AGENT PIPELINE & STREAMLINING */}
      <section id="pipeline" className="py-20 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                <Workflow className="w-3.5 h-3.5" /> AI Orchestration
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold leading-tight">
                Streamlined by <span className="text-gradient-purple">AI Agents</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                At Jcee Labs, we don't build software the old way. We orchestrate advanced autonomous AI agents (like Manus) to streamline our research, code generation, and deployment pipelines. This gives us an unfair advantage—letting us build faster, iterate instantly, and pass those efficiencies directly to you.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Autonomous Coding</h4>
                    <p className="text-muted-foreground text-sm">Agents write, test, and lint clean React + Tailwind components on the fly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Predictive Estimating</h4>
                    <p className="text-muted-foreground text-sm">Deep integration of custom LLMs for estimating pricing, bid matching, and risk.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {/* INTERACTIVE AGENT PIPELINE VISUAL */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">AGENT PIPELINE SIMULATOR</span>
                  </div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Manus Orchestrated</span>
                </div>

                {/* Pipeline Flow Grid */}
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-purple-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center font-mono text-xs font-bold text-purple-300">01</div>
                      <div>
                        <div className="text-sm font-bold text-white">Idea Ingestion & Strategy</div>
                        <div className="text-xs text-muted-foreground">AI agents parse requirements and draft domain blueprints.</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Success</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-teal-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center font-mono text-xs font-bold text-teal-300">02</div>
                      <div>
                        <div className="text-sm font-bold text-white">Rapid Frontend Synthesis</div>
                        <div className="text-xs text-muted-foreground">Ethereal layouts and components are written with Tailwind 4.</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-indigo-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-mono text-xs font-bold text-indigo-300">03</div>
                      <div>
                        <div className="text-sm font-bold text-white">Intelligent Optimization</div>
                        <div className="text-xs text-muted-foreground">Custom models evaluate and streamline UI/UX and calculation logic.</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Queued</span>
                  </div>
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

      {/* ROADMAP / COMING SOON */}
      <section className="py-20 border-t border-white/5 relative z-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">
              The Jcee Labs <span className="text-gradient-purple">Roadmap</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We are constantly incubating. Here is a glimpse of where Jcee Labs is heading next under the HOWM HOLDINGS umbrella.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative group hover:border-purple-500/20 transition-all duration-300">
              <div className="absolute top-4 right-4 text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Phase 1</div>
              <div className="text-xs font-mono text-muted-foreground mb-2">Q2 2026</div>
              <h4 className="font-display font-bold text-lg text-white mb-2">Mirrored Beta</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Launching our personalized AI journaling and reflection beta for early priority queue users.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative group hover:border-teal-500/20 transition-all duration-300">
              <div className="absolute top-4 right-4 text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">Phase 2</div>
              <div className="text-xs font-mono text-muted-foreground mb-2">Q3 2026</div>
              <h4 className="font-display font-bold text-lg text-white mb-2">BidIndustrial Launch</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Releasing the intelligent bidding estimator to selected contractor pilot cohorts.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative group hover:border-indigo-500/20 transition-all duration-300">
              <div className="absolute top-4 right-4 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Phase 3</div>
              <div className="text-xs font-mono text-muted-foreground mb-2">Q4 2026</div>
              <h4 className="font-display font-bold text-lg text-white mb-2">AI Agent Hub</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Introducing a streamlined interface to manage custom autonomous AI agents for small businesses.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative group hover:border-fuchsia-500/20 transition-all duration-300">
              <div className="absolute top-4 right-4 text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded-full">Phase 4</div>
              <div className="text-xs font-mono text-muted-foreground mb-2">Q1 2027</div>
              <h4 className="font-display font-bold text-lg text-white mb-2">Ecosystem API</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Opening Jcee Labs' custom AI intelligence layers via public APIs for developers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / CTA */}
      <section id="newsletter" className="py-24 border-t border-white/5 bg-gradient-to-t from-purple-950/10 to-transparent relative z-10">
        <div className="container max-w-4xl">
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden text-center space-y-6">
            {/* Ambient Background Light */}
            <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mx-auto">
              <Sparkles className="w-3.5 h-3.5" /> Secure Your Spot
            </div>
            
            <h2 className="text-3xl md:text-5xl font-display font-extrabold">
              Enter the <span className="text-gradient-purple">Jcee Labs</span> Queue
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Be the first to know when private betas for <strong>Mirrored</strong>, <strong>BidIndustrial</strong>, and other upcoming HOWM HOLDINGS LLC innovations go live.
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
                <Button type="submit" className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 h-11 shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                  Join Priority Queue
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center font-display font-extrabold text-white text-xs shadow-lg shadow-purple-500/25">
                  JL
                </div>
                <span className="font-display font-bold text-base tracking-wider">
                  JCEE LABS
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Jcee Labs is the d.b.a. of <strong>HOWM HOLDINGS LLC</strong>, dedicated to building streamlined, AI-optimized applications that enhance creativity and professional efficiency.
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
