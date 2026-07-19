import { Link } from "wouter";
import { ArrowRight, Cpu, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function NicheFloPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-sm text-cyan-400 font-mono">
              Beta
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
            Niche<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">Flo</span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto mb-8 leading-relaxed">
            Autonomous GPU arbitrage intelligence and RWAiFi yield optimization. Real-time signals. AI-powered execution.
          </p>
          <Link href="/services#contact">
            <Button className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-cyan-500/20 active:scale-97 transition-all">
              Request Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Cpu className="w-6 h-6 text-cyan-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">GPU Arbitrage</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Autonomous detection of GPU pricing inefficiencies across markets. Execute before the window closes.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <TrendingUp className="w-6 h-6 text-cyan-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">RWAiFi Yield</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Optimize real-world asset yields with AI-powered signal processing and execution strategies.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Zap className="w-6 h-6 text-cyan-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Real-Time Signals</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Continuous market monitoring with AI-powered execution. No manual intervention required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
