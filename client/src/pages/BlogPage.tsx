import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Bot, PenLine, Share2, CheckCircle2, Clock } from "lucide-react";

const BLOG_POSTS = [
  {
    title: "Why Formal Verification Matters for AI Safety",
    excerpt:
      "Most AI companies ship fast and fix later. We believe every agent action should be provably safe before it ever reaches production. Here's how VOW makes that possible.",
    date: "Jul 18, 2026",
    category: "Engineering",
    status: "published",
  },
  {
    title: "Scar Memory: How AI Learns from Failure Without Repeating It",
    excerpt:
      "Traditional AI forgets its mistakes. VOW's scar memory ensures every failure becomes a permanent lesson — encoded at the language level, not patched after the fact.",
    date: "Jul 14, 2026",
    category: "VOW Deep Dive",
    status: "published",
  },
  {
    title: "Building Eight Products as a Two-Person Studio",
    excerpt:
      "No VC runway. No 50-person engineering team. Just fundamental principles, relentless iteration, and a language that enforces accountability. Here's what we've learned.",
    date: "Jul 10, 2026",
    category: "Studio Life",
    status: "published",
  },
  {
    title: "The EU AI Act and Why We're Already Compliant",
    excerpt:
      "Regulatory transparency isn't a feature we'll add later. VOW was designed from day one to produce auditable, traceable agent behavior. The EU AI Act validates our approach.",
    date: "Jul 6, 2026",
    category: "Compliance",
    status: "published",
  },
  {
    title: "TrueRPM: Giving Owner-Operators the Tech Advantage",
    excerpt:
      "The people who keep the economy moving deserve the same technological advantages as Fortune 500 companies. TrueRPM is our answer.",
    date: "Jul 2, 2026",
    category: "Products",
    status: "published",
  },
  {
    title: "What Makes a Neuro-OS Different from a Chatbot",
    excerpt:
      "Babodie isn't another wrapper around an LLM. It's an autonomous operating system that runs quests, builds beliefs, and persists memory across sessions.",
    date: "Jun 28, 2026",
    category: "Products",
    status: "published",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#080c18] text-[#e8ecf4] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold tracking-wide">
              <Bot className="w-3.5 h-3.5" />
              Powered by Baus Time Media
            </div>
          </div>
          <h1 className="text-3xl md:text-[44px] lg:text-[52px] font-extrabold leading-[1.15] tracking-[-0.02em] mb-4">
            Blog & Social
          </h1>
          <p className="text-base md:text-lg text-[#7a8aaa] max-w-[700px] leading-relaxed mb-6">
            Our autonomous multi-agent marketing team drafts content, tracks industry news, and manages our social presence. Every post is human-reviewed before publishing.
          </p>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-[#2a3a5a]/50 bg-[#0d1424]">
              <PenLine className="w-5 h-5 text-[#8ba4d8] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#c0c8d8] mb-1">AI Drafts</p>
                <p className="text-xs text-[#7a8aaa] leading-relaxed">
                  Multiple agents research, write, and refine content autonomously on a posting schedule.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-[#2a3a5a]/50 bg-[#0d1424]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#c0c8d8] mb-1">Human Review</p>
                <p className="text-xs text-[#7a8aaa] leading-relaxed">
                  Nothing goes live without a human approving it. Quality and authenticity guaranteed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-[#2a3a5a]/50 bg-[#0d1424]">
              <Share2 className="w-5 h-5 text-[#d4a843] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#c0c8d8] mb-1">Multi-Channel</p>
                <p className="text-xs text-[#7a8aaa] leading-relaxed">
                  Blog posts, social media, and industry commentary — all from one orchestrated system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {BLOG_POSTS.map((post, i) => (
              <article
                key={i}
                className="group p-5 md:p-6 rounded-xl border border-[#2a3a5a]/50 bg-[#0d1424] hover:border-[#8ba4d8]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#d4a843] bg-[#d4a843]/10 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400/80">
                    <CheckCircle2 className="w-3 h-3" />
                    Reviewed
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#e8ecf4] mb-2 group-hover:text-[#8ba4d8] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-[#7a8aaa] leading-relaxed mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#5a6a8a]">
                  <Clock className="w-3 h-3" />
                  {post.date}
                </div>
              </article>
            ))}
          </div>

          {/* CTA for services */}
          <div className="mt-12 p-6 md:p-8 rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/[0.03] to-transparent text-center">
            <p className="text-[#c0c8d8] text-sm md:text-base mb-2">
              Like what you see? Baus Time Media can run your marketing too.
            </p>
            <p className="text-xs text-[#7a8aaa]">
              Reach out via our{" "}
              <a href="/services#contact" className="text-[#d4a843] hover:underline">
                Services page
              </a>{" "}
              if you're interested in autonomous AI marketing for your brand.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
