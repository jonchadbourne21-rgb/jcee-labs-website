import { Link } from "wouter";
import { ArrowRight, Target, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function ApexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5">
            <span className="text-sm text-amber-400">Marketing AI Strategist</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">APEX</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            The relentless AI strategist that refuses second place. No generic advice. No mediocre tactics. Only precision-engineered marketing that drives your brand to elite status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition">
                Ask APEX <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-lg font-semibold hover:border-gray-400 transition">
                Learn More
              </a>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">APEX Capabilities</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Target className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Strategy</h3>
              <p className="text-gray-400">Positioning, conversion, differentiation — executed with elite precision.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Zap className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              <p className="text-gray-400">Precision-engineered copy that converts and commands attention.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Optimization</h3>
              <p className="text-gray-400">Continuous refinement to maximize ROI and market dominance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What APEX Does */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">What Can You Ask APEX?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">What's my biggest positioning gap?</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Give me a 90-day growth plan</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Audit my current marketing stack</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Generate ad copy for my brand</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Analyze my competitors</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Design a sales funnel</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Ready to Dominate?</h2>
          <p className="text-muted-foreground text-lg">Ask APEX anything about your brand, strategy, content, ads, positioning — APEX delivers elite-level analysis and actionable recommendations.</p>
          <Link href="/#newsletter">
            <Button className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-97 transition-all">
              Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
