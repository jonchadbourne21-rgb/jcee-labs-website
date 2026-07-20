import { Link } from "wouter";
import { ArrowRight, FileText, Workflow, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function SOPForgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-sm text-indigo-400 font-mono">
              Beta
            </span>
            <span className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-xs text-purple-400 font-mono">
              Powered by VOW
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
            SOP<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Forge</span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto mb-8 leading-relaxed">
            Autonomous AI platform for standard operating procedures. Powered by VOW.
          </p>
          <Link href="/services#contact">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-97 transition-all">
              Request Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <FileText className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">SOP Generation</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Autonomously generates standard operating procedures tailored to your business processes.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Workflow className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Process Mapping</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Maps your workflows and identifies optimization opportunities automatically.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Brain className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">VOW Intelligence</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Leverages VOW's provable reasoning for SOPs that are auditable and compliant by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
