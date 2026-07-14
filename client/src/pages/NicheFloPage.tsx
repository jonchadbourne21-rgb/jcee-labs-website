import { Link } from "wouter";
import { ArrowRight, Workflow, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function NicheFloPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5">
            <span className="text-sm text-indigo-400 font-mono">SOP Generator</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">NicheFlow</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Auto-generates industry-specific standard operating procedures for small businesses. Systemize operations, save time and money, and compete with enterprises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/#newsletter">
              <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-97 transition-all">
                Join Waitlist <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12">Built for Niche Industries</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-colors">
              <Workflow className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Auto-Generated SOPs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Describe your process and NicheFlow builds the complete SOP for HVAC, electrical, plumbing, and more.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-colors">
              <Users className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Share SOPs with your team and track real-time execution and compliance.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-colors">
              <Zap className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Scale Without Hiring</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Automate operations without expensive consultants. Level the playing field against enterprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Ready to Systemize?</h2>
          <p className="text-muted-foreground text-lg">Stop reinventing the wheel. Let NicheFlow build your SOPs.</p>
          <Link href="/#newsletter">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-97 transition-all">
              Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
