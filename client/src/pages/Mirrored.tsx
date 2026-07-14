import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles, MessageCircle, Brain, CheckCircle, Zap, Target, Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    step: 1,
    title: "Welcome to Mirrored",
    description: "Your AI reflection partner for deeper thinking and personal growth.",
    icon: Sparkles,
    cta: "Let's Begin"
  },
  {
    step: 2,
    title: "How It Works",
    description: "Share your thoughts, and Mirrored reflects back insights to help you see situations from new angles.",
    icon: Brain,
    cta: "Next"
  },
  {
    step: 3,
    title: "Start Reflecting",
    description: "Try a sample reflection to experience the power of AI-guided introspection.",
    icon: MessageCircle,
    cta: "Try Demo"
  }
];

const MIRROR_STARTERS = [
  "I'm feeling overwhelmed with my current project...",
  "I want to improve my decision-making process...",
  "How can I be more productive?",
  "I'm struggling with work-life balance...",
];

const FEATURES = [
  {
    icon: Brain,
    title: "Cognitive Journaling",
    description: "Semantic pattern mapping that identifies themes and patterns in your thoughts over time."
  },
  {
    icon: Zap,
    title: "AI-Guided Reflection",
    description: "Real-time feedback and personalized coaching synthesized from your conversation patterns."
  },
  {
    icon: Target,
    title: "Goal Alignment",
    description: "Structure and visualize your goals with intelligent recommendations for achievement."
  },
  {
    icon: Lightbulb,
    title: "Personal Insights",
    description: "Discover blind spots and opportunities through deep semantic analysis of your reflections."
  }
];

export default function Mirrored() {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi there! I'm Mirrored, your AI reflection partner. What's on your mind today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reflectMutation = trpc.mirrored.reflect.useMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleReflect = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput;
    const newMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(newMessages);
    setUserInput("");

    try {
      const response = await reflectMutation.mutateAsync({
        message: userMessage,
        history: chatMessages
      });
      setChatMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble reflecting right now. Please try again." }]);
    }
  };

  const handleStarterPrompt = async (prompt: string) => {
    const newMessages = [...chatMessages, { role: "user" as const, content: prompt }];
    setChatMessages(newMessages);
    try {
      const response = await reflectMutation.mutateAsync({
        message: prompt,
        history: newMessages.slice(0, -1) as Array<{ role: "user" | "assistant"; content: string }>
      });
      setChatMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble reflecting right now. Please try again." }]);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] relative flex flex-col">
      <SiteNav />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 max-w-md w-full glass-panel space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-300">Step {onboardingStep + 1} of {ONBOARDING_STEPS.length}</span>
              <button
                onClick={handleSkipOnboarding}
                className="text-xs text-muted-foreground hover:text-white transition"
              >
                Skip
              </button>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              {(() => {
                const CurrentIcon = ONBOARDING_STEPS[onboardingStep].icon;
                return (
                  <>
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <CurrentIcon className="w-8 h-8 text-purple-300" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      {ONBOARDING_STEPS[onboardingStep].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {ONBOARDING_STEPS[onboardingStep].description}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* CTA */}
            <Button
              onClick={handleOnboardingNext}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-97 transition-all"
            >
              {ONBOARDING_STEPS[onboardingStep].cta}
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="space-y-8 mb-16">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3 h-3" /> AI Reflection Partner
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
                Your Digital <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">Mirror</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Mirrored is an AI-powered reflection partner that helps you think deeper, decide faster, and grow stronger through intelligent journaling and personalized insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setShowOnboarding(true)}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-97 transition-all"
              >
                Try Live Demo
              </Button>
              <Link href="/">
                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Live Chat Demo */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col glass-panel" style={{ height: "500px" }}>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-purple-500/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">M</div>
              <div>
                <div className="text-sm font-bold text-white">Mirror AI</div>
                <div className="text-xs text-purple-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Live Demo
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white/[0.06] text-[#E2E8F0] border border-white/5 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {reflectMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span className="text-xs text-muted-foreground">Mirror is reflecting...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Starter prompts (only shown at start) */}
            {chatMessages.length === 1 && (
              <div className="px-6 pb-3 flex gap-2 flex-wrap">
                {MIRROR_STARTERS.slice(0, 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStarterPrompt(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/5 p-4 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleReflect()}
                placeholder="Share your thoughts..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <Button
                onClick={handleReflect}
                disabled={reflectMutation.isPending || !userInput.trim()}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium active:scale-97 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" style={{ transform: "translateZ(0)" }} />
          <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" style={{ transform: "translateZ(0)" }} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 border-t border-white/5 relative z-10">
        <div className="container max-w-5xl mx-auto">
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Why Choose <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">Mirrored</span>?
              </h2>
              <p className="text-muted-foreground text-lg">
                Designed for deep thinking, personal growth, and actionable insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 glass-panel hover:border-purple-500/20 transition-colors group">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-300 mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 border-t border-white/5 relative z-10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-16">How Mirrored Works</h2>

          <div className="space-y-8">
            {[
              { num: "01", title: "Share Your Thoughts", desc: "Start a conversation by sharing what's on your mind, a challenge you're facing, or a decision you need to make." },
              { num: "02", title: "Receive AI Insights", desc: "Mirrored analyzes your input and provides thoughtful, personalized reflections that help you see new perspectives." },
              { num: "03", title: "Track Patterns", desc: "Over time, Mirrored identifies patterns in your thinking and offers deeper insights into your decision-making style." },
              { num: "04", title: "Grow & Improve", desc: "Use these insights to make better decisions, achieve your goals, and develop a deeper understanding of yourself." }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-white/5 bg-gradient-to-b from-transparent to-purple-950/10 relative z-10">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Ready to Start Reflecting?</h2>
            <p className="text-muted-foreground text-lg">
              Mirrored is launching soon. Join the waitlist to get early access and exclusive beta features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowOnboarding(true)}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 active:scale-97 transition-all"
            >
              Try Demo Now
            </Button>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Back to Home <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
