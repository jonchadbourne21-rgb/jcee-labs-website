import { Link } from "wouter";
import { ArrowRight, Truck, BarChart3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function TruckersDreamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5">
            <span className="text-sm text-orange-400 font-mono">Owner-Operator Load Optimization</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Trucker$Dream</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Multi-stacking load optimization platform built for owner-operators. Maximize revenue per mile, optimize route efficiency, and stack loads intelligently to grow your trucking business.
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

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12">Why Owner-Operators Choose Trucker$Dream</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <BarChart3 className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Revenue Maximization</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Intelligent load stacking algorithms that maximize revenue per mile while minimizing empty miles.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <MapPin className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Route Optimization</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Real-time route planning that accounts for fuel costs, delivery windows, and load compatibility.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-colors">
              <Truck className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Multi-Stacking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Stack multiple loads efficiently to increase earnings and reduce operational costs per delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Grow Your Trucking Business</h2>
          <p className="text-muted-foreground text-lg">Join owner-operators who are earning more with smarter load optimization.</p>
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
