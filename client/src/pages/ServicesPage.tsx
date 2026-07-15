import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BusinessInquiryForm from "@/components/BusinessInquiryForm";
import {
  Zap,
  Sparkles,
  Cpu,
  ArrowUpRight,
  Lock,
  Loader2,
  CheckCircle2,
  Clock,
  Code2,
  Globe,
  Bot,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: Globe,
    title: "Web Application Development",
    desc: "Full-stack web apps built with modern frameworks — React, Next.js, Node.js. Responsive, accessible, and production-ready.",
  },
  {
    icon: Bot,
    title: "AI Agent Integration",
    desc: "Embed autonomous AI agents into your workflows. Automate repetitive tasks, generate content, and make smarter decisions at scale.",
  },
  {
    icon: Code2,
    title: "API & Backend Systems",
    desc: "Robust REST and tRPC APIs, database design, and server infrastructure. Built to scale with your business.",
  },
  {
    icon: Zap,
    title: "Process Automation",
    desc: "Identify bottlenecks and replace them with intelligent automation pipelines that run 24/7 without human intervention.",
  },
  {
    icon: Cpu,
    title: "LLM-Powered Features",
    desc: "Integrate large language models directly into your product — chatbots, document analysis, smart search, and more.",
  },
  {
    icon: Sparkles,
    title: "Rapid Prototyping",
    desc: "From idea to working prototype in days. We move fast without sacrificing quality, so you can validate before you commit.",
  },
];

const WHY_US = [
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "AI-accelerated development cuts timelines significantly. From requirements to production in weeks, not months.",
  },
  {
    icon: Sparkles,
    title: "Quality First",
    desc: "Every project is tested, optimized, and production-ready. We ship clean, maintainable code that your team can own.",
  },
  {
    icon: Cpu,
    title: "AI-Powered",
    desc: "We leverage autonomous AI agents to handle code generation, testing, and deployment pipelines — passing the savings to you.",
  },
];

export default function ServicesPage() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = trpc.leads.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSubscribed(true);
        toast.success("You're in the queue!", {
          description: "We'll notify you the moment private betas go live.",
        });
      } else {
        toast.info(data.message ?? "Already registered!");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }
    subscribeMutation.mutate({ email, source: "services-page" });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-x-hidden flex flex-col">
      {/* BACKGROUND AURORAS */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-teal-600/6 blur-[80px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />
      <div
        className="absolute top-[50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/4 blur-[90px] pointer-events-none"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />

      <SiteNav />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative z-10">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" /> Custom Development & Automation
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold leading-[1.05] tracking-tight text-white">
              B2B Website Builds &{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                Automation
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-slate-300/90">
              From concept to deployment, we build enterprise-grade web
              applications and automation systems at speed and quality that
              traditional agencies cannot match.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#contact">
                <Button
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all"
                >
                  Start Your Project <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY JCEE LABS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 relative z-10 border-t border-white/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CAPABILITIES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 border-t border-white/5">
        <div className="container">
          <div className="max-w-2xl space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Code2 className="w-3.5 h-3.5" /> What We Build
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              Our Capabilities
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every engagement is tailored to your business needs. Here is what
              we bring to the table.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/15 transition-colors"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PROCESS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-teal-950/5">
        <div className="container max-w-3xl">
          <div className="space-y-4 mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" /> How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              From Brief to Launch
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Discovery Call",
                desc: "We learn about your business, goals, and technical requirements. No commitment required.",
              },
              {
                step: "02",
                title: "Proposal & Scope",
                desc: "We deliver a clear scope of work, timeline, and fixed-price quote within 48 hours.",
              },
              {
                step: "03",
                title: "Build & Iterate",
                desc: "Rapid development with weekly check-ins. You see progress every step of the way.",
              },
              {
                step: "04",
                title: "Launch & Handoff",
                desc: "We deploy, document, and hand off a production-ready system your team can maintain.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <span className="text-teal-400 text-xs font-mono font-bold">
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
                <CheckCircle2 className="shrink-0 w-4 h-4 text-teal-500/40 mt-1 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONTACT / INQUIRY FORM
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 relative z-10 border-t border-white/5">
        <div className="container max-w-2xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              Let's{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                Build Together
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Tell us about your project and we'll get back to you within 24
              hours.
            </p>
          </div>
          <BusinessInquiryForm />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          NEWSLETTER / PRIORITY QUEUE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="newsletter" className="py-20 border-t border-white/5 bg-gradient-to-t from-purple-950/10 to-transparent relative z-10">
        <div className="container max-w-3xl">
          <div className="bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden text-center space-y-6">
            <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mx-auto relative z-10">
              <Sparkles className="w-3.5 h-3.5" /> Stay Updated
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white relative z-10">
              Join the{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Priority Queue
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto relative z-10">
              Be the first to know when our products launch. Get early access and
              exclusive updates.
            </p>

            {isSubscribed ? (
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 max-w-md mx-auto relative z-10">
                <p className="text-purple-300 font-bold mb-1">
                  You're on the list!
                </p>
                <p className="text-muted-foreground text-sm">
                  We'll notify you as soon as access opens up.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2 relative z-10"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-muted-foreground h-11 focus-visible:ring-purple-500"
                />
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 h-11 shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Join Queue"
                  )}
                </Button>
              </form>
            )}

            <div className="pt-4 flex justify-center items-center gap-6 text-xs text-muted-foreground font-mono relative z-10">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> No spam, ever
              </span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
