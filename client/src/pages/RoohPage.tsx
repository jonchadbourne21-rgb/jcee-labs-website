import { Link } from "wouter";
import { ArrowRight, Bot, Newspaper, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function RoohPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5 text-sm text-amber-400 font-mono">
              Beta
            </span>
            <span className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-xs text-purple-400 font-mono">
              Powered by VOW
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Baus Time Media</span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto mb-8 leading-relaxed">
            An autonomous multi-agent marketing team working asynchronously every day, each agent focused on its own niche. It studies strategies and learns from what works, tracks daily news in your industry, drafts content on a posting schedule, and pings your phone when a blog or social post is ready to send — with a human in the loop whenever you want one.
          </p>
          <Link href="/services#contact">
            <Button className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-97 transition-all">
              Request Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Bot className="w-6 h-6 text-amber-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Multi-Agent Team</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Each agent focuses on its own niche — working asynchronously, learning independently.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Newspaper className="w-6 h-6 text-amber-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Industry Tracking</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Tracks daily news in your industry. Learns what works and adapts strategies accordingly.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Calendar className="w-6 h-6 text-amber-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Posting Schedule</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Drafts content on a consistent schedule. Blogs, social posts, and campaigns — all queued.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Bell className="w-6 h-6 text-amber-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Human in the Loop</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Pings your phone when content is ready. Approve, edit, or let it fly — your call.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
