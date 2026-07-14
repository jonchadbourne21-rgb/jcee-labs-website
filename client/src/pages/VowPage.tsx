import { Link } from "wouter";
import { ArrowRight, Code, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function VowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/5">
            <span className="text-sm text-purple-400 font-mono">Next-Gen PaaS & Language</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">VOW</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            A revolutionary PaaS and new coding language designed to eliminate complexity and accelerate development. VOW will be open-sourced, empowering developers worldwide to build the future faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/#newsletter">
              <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold shadow-lg shadow-purple-500/20 active:scale-97 transition-all">
                Get Notified <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium cursor-default opacity-60">
              GitHub (Coming Soon)
            </Button>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12">The VOW Philosophy</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-purple-500/20 transition-colors">
              <Code className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Elegant Syntax</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Intuitive, expressive language design that reduces cognitive load and accelerates development velocity.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-purple-500/20 transition-colors">
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Performance First</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Built for speed and efficiency, VOW delivers exceptional runtime performance out of the box.</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-purple-500/20 transition-colors">
              <Globe className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Open Source</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Community-driven development. VOW will be open-sourced to empower developers everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">The Future of Development</h2>
          <p className="text-muted-foreground text-lg">VOW is in active development. Be part of the revolution in how we build software.</p>
          <Link href="/#newsletter">
            <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold shadow-lg shadow-purple-500/20 active:scale-97 transition-all">
              Get Notified at Launch <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
