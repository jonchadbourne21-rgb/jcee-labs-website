import { Link } from "wouter";
import { ArrowRight, Truck, BarChart3, MapPin, DollarSign, TrendingUp, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function TrueRPMPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5">
            <span className="text-sm text-orange-400 font-mono">Revenue Per Mile Optimization</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">TrueRPM</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
            Know your true Revenue Per Mile. TrueRPM is the load intelligence platform built exclusively for owner-operators who refuse to leave money on the table.
          </p>
          <p className="text-[#718096] mb-8 max-w-2xl leading-relaxed">
            Multi-stacking load optimization, real-time RPM analysis, and route intelligence — so every mile you drive earns what it should.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/services#newsletter">
              <Button className="rounded-xl bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-semibold shadow-lg shadow-orange-500/20 active:scale-97 transition-all">
                Join Waitlist <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services#contact">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* What is RPM Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs font-mono text-orange-400/80 uppercase tracking-wider">The Metric That Matters</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Revenue Per Mile. Not Rate Per Mile.</h2>
          <p className="text-[#718096] mb-8 max-w-2xl leading-relaxed">
            Most load boards show you rate per mile. But that number lies — it doesn't account for deadhead, fuel variance, detention, or the load you could have stacked on top. TrueRPM calculates what you actually earn per mile driven, including empty miles. That's the number that builds wealth.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-orange-500/10 bg-orange-500/[0.02] text-center">
              <p className="text-3xl font-bold text-orange-400 mb-1">$2.85</p>
              <p className="text-xs text-[#718096] font-mono">Advertised Rate/Mile</p>
            </div>
            <div className="p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] text-center">
              <p className="text-3xl font-bold text-red-400 mb-1">$1.92</p>
              <p className="text-xs text-[#718096] font-mono">Actual RPM (with deadhead)</p>
            </div>
            <div className="p-5 rounded-2xl border border-green-500/10 bg-green-500/[0.02] text-center">
              <p className="text-3xl font-bold text-green-400 mb-1">$2.64</p>
              <p className="text-xs text-[#718096] font-mono">TrueRPM Optimized</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12">Why Owner-Operators Choose TrueRPM</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <Gauge className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">True RPM Dashboard</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">See your real revenue per mile after all costs — deadhead, fuel, detention, tolls. No more guessing what you actually earned.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Multi-Stack Intelligence</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">AI-powered load stacking that finds complementary loads along your route. Turn one-load trips into two-load paydays.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <MapPin className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Deadhead Killer</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Route optimization that minimizes empty miles. Every mile you drive should be a mile that pays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Owner-Operators */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Built for the One-Truck Operation</h2>
          <p className="text-[#718096] mb-8 max-w-2xl leading-relaxed">
            Mega-carriers have dispatch teams, route planners, and data analysts. You have yourself and your truck. TrueRPM gives you the same intelligence — without the overhead.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <BarChart3 className="w-6 h-6 text-orange-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Lane Analysis</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Know which lanes actually make money after all costs. Stop chasing high-rate loads that leave you stranded in dead zones.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Truck className="w-6 h-6 text-orange-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Load Compatibility</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Automatic weight, dimension, and timing validation for multi-stack loads. DOT-compliant stacking suggestions you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Stop Guessing. Start Earning.</h2>
          <p className="text-muted-foreground text-lg">Join owner-operators who know their true revenue per mile — and are growing because of it.</p>
          <Link href="/services#newsletter">
            <Button className="rounded-xl bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-semibold shadow-lg shadow-orange-500/20 active:scale-97 transition-all">
              Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
