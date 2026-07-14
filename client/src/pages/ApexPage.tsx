import { Link } from "wouter";
import { ArrowRight, Eye, Brain, Repeat, BarChart3, PenTool, Globe } from "lucide-react";
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
            <span className="text-sm text-amber-400">Multi-Agent Autonomous Content System</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">APEX</span> Media
          </h1>

          <p className="text-xl text-gray-300 mb-4 max-w-2xl">
            An autonomous multi-agent system that watches your market, analyzes competitors, and creates content that actually works — then learns and adapts from every post.
          </p>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl">
            APEX doesn't just create content. It strategizes, observes, reports, and evolves. It's your always-on marketing team that never sleeps, constantly learning what resonates with your audience and doubling down on what drives results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/#contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition">
                Get APEX for Your Business <ArrowRight className="w-4 h-4" />
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

      {/* How It Works Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">How APEX Media Works</h2>
          <p className="text-gray-400 mb-12 max-w-2xl">
            Four specialized AI agents working in concert — each with a distinct role in your content strategy lifecycle.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">The Observer</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Constantly monitors your niche industry — tracking competitor moves, trending topics, audience sentiment, and market shifts in real time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">The Strategist</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Analyzes what's working across your industry, identifies content gaps, and builds a strategy that positions your brand where attention is flowing.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">The Creator</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Produces blog posts, social media content, and marketing copy tailored to your brand voice — optimized for the platforms where your audience lives.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">The Optimizer</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tracks performance of every piece of content, learns what resonates, and continuously adapts the strategy — doubling down on winners and cutting losers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes APEX Different */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Why APEX Media</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <BarChart3 className="w-8 h-8 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Always Learning</h3>
              <p className="text-gray-400 text-sm">
                Every post, every engagement metric, every competitor move feeds back into the system. APEX gets smarter with every cycle.
              </p>
            </div>

            <div className="space-y-3">
              <Globe className="w-8 h-8 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Niche-Specific</h3>
              <p className="text-gray-400 text-sm">
                Not generic marketing AI. APEX is trained on your specific industry, your competitors, and your audience's language.
              </p>
            </div>

            <div className="space-y-3">
              <Repeat className="w-8 h-8 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Fully Autonomous</h3>
              <p className="text-gray-400 text-sm">
                Set it up, define your brand voice and goals, and APEX runs 24/7 — strategizing, creating, posting, and optimizing without manual intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Built For</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-gray-300 font-medium">Small businesses that can't afford a full marketing team</p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-gray-300 font-medium">Niche industries where generic content doesn't convert</p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-gray-300 font-medium">Companies that need consistent content but lack bandwidth</p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-gray-300 font-medium">Brands that want data-driven content, not guesswork</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Put APEX to Work</h2>
          <p className="text-muted-foreground text-lg">
            Stop guessing what content to post. Let APEX watch your market, learn what works, and autonomously grow your brand's presence.
          </p>
          <Link href="/#contact">
            <Button className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-97 transition-all">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
