import { Link } from "wouter";
import { ArrowRight, Ship, Route, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function FloCraftPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-sm text-teal-400 font-mono">
              Beta
            </span>
            <span className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-xs text-purple-400 font-mono">
              Powered by VOW
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
            Flo<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Craft</span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto mb-4 leading-relaxed">
            Supply chain intelligence, powered by VOW.
          </p>
          <p className="text-[#718096] max-w-2xl mx-auto mb-8 leading-relaxed">
            FloCraft uses VOW's intelligent brain to solve supply chain problems in real time — alternate routes and corrective solutions that directly improve ROI.
          </p>
          <Link href="/services#contact">
            <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
              Request Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Brain className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">VOW-Powered Intelligence</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Built on VOW's ontological reasoning engine for supply chain decisions that are auditable and explainable.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Route className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Alternate Routes</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Real-time rerouting when disruptions hit. Corrective solutions that keep goods moving and margins intact.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Ship className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">ROI-Driven</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Every decision optimized for direct ROI improvement. Not just visibility — actionable intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
