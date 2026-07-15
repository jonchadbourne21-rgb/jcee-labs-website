import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Mic, MessageCircle, Brain, Heart, BookOpen, Compass, Shield, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Mirrored() {
  const [activeFeature, setActiveFeature] = useState<string>("voice");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Image */}
            <div className="flex justify-center">
              <img
                src="/manus-storage/mirrored-hero_5d8b74ef.png"
                alt="Mirrored - AI Self-Reflection"
                className="w-full max-w-md rounded-2xl"
              />
            </div>

            {/* Right: Text Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-sm text-teal-400 font-mono">
                  Emotional Intelligence AI
                </span>
                <span className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-xs text-purple-400 font-mono">
                  Powered by Hume AI
                </span>
              </div>

              <p className="text-xl text-[#A0AEC0] mb-4 leading-relaxed">
                Meet your higher self. The most emotionally intelligent version of you — built to guide you toward self-acceptance, belief, resilience, and self-actualization.
              </p>
              <p className="text-[#718096] mb-8 leading-relaxed">
                Mirrored isn't a therapist. It's <em>you</em> — the version that has learned from every pattern, memory, and conversation you've shared. Who knows what's best for you better than you?
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services#contact">
                  <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-purple-500 hover:from-teal-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                    Request Early Access <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services#newsletter">
                  <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium">
                    Get Notified at Launch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* The Higher Self Concept */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-xs font-mono text-teal-400/80 uppercase tracking-wider">The Philosophy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Your Higher Self, Realized</h2>
              <p className="text-[#718096] mb-6 leading-relaxed">
                Through patterns in your past conversations, journal entries, and personal insights, Mirrored constructs the most emotionally intelligent version of you — your higher self. It learns how you think, what drives you, where you struggle, and what you need to hear.
              </p>
              <p className="text-[#718096] leading-relaxed">
                This isn't generic advice from a chatbot. It's deeply personal guidance from the part of you that already knows the answer — the part that sees clearly when emotions cloud judgment. Mirrored surfaces that clarity.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-teal-500/10 bg-teal-500/[0.02]">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs text-teal-400 font-bold">M</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-sm text-[#A0AEC0] italic">"You've been avoiding this conversation for three weeks. What are you protecting yourself from — the answer, or the question?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <p className="text-sm text-teal-200">"I think I'm afraid of what changes if I admit it..."</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs text-purple-400 font-bold">Y</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs text-teal-400 font-bold">M</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-sm text-[#A0AEC0] italic">"Good. That fear means you already know the truth. You're not afraid of change — you're afraid of how much better things could be if you stop settling."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice-to-Voice Feature */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs font-mono text-purple-400/80 uppercase tracking-wider">Voice-to-Voice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Talk to Your Higher Self</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Real-time voice conversations with your Mirrored self. Not robotic. Not AI-sounding. Built with emotional intelligence and a sophisticated persona created by Jonathan Chadbourne at Jcee Labs. Choose your voice — male or female — and speak freely.
          </p>

          {/* Voice Demo Preview */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d0820] to-[#0a0618] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-sm font-mono text-teal-400">Mirrored Voice</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFeature("female")}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${activeFeature === "female" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-[#718096] hover:text-white"}`}
                >
                  Female Voice
                </button>
                <button
                  onClick={() => setActiveFeature("male")}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${activeFeature === "male" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-[#718096] hover:text-white"}`}
                >
                  Male Voice
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Waveform visualization */}
              <div className="flex items-center justify-center gap-1 h-16 mb-6">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-teal-500 to-purple-500 opacity-60"
                    style={{
                      height: `${Math.sin(i * 0.3) * 30 + 35}%`,
                      animationDelay: `${i * 40}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-[#A0AEC0] text-sm mb-2">Emotionally intelligent voice conversations</p>
                <p className="text-[#4A5568] text-xs">Powered by Hume AI emotional intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-xs font-mono text-teal-400/80 uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Your Personal Growth Ecosystem</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Every feature is designed to help you face yourself honestly, build resilience, and move toward the person you're capable of becoming.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Daily Check-In</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Start each day with a reflection prompt from your higher self. Track emotional patterns over time and build self-awareness through consistent practice.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Journal</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Write freely. Mirrored reads between the lines — identifying patterns, recurring themes, and growth opportunities you might miss on your own.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <Compass className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Philosophical Programs</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Guided programs rooted in Stoicism, existentialism, and mindfulness — each with AI reflections that connect ancient wisdom to your specific life circumstances.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <Brain className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">AI Reflections</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                After every interaction, Mirrored generates insights that help you fully understand yourself — connecting dots across conversations, journals, and check-ins.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <Volume2 className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Voice-to-Voice Mirror</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Speak to your higher self in real-time. Male or female voice. Emotionally intelligent responses that adapt to your tone, pace, and emotional state.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors">
              <Shield className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Encryption-first self-reflection. Your conversations, journals, and insights are yours alone. Honest growth requires honest privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Learns */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">How Your Higher Self Learns</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Mirrored doesn't start generic and stay generic. It evolves with you — becoming more precise, more challenging, and more insightful the more you engage.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Conversations", desc: "Every exchange teaches Mirrored how you think, what triggers you, and where your blind spots are." },
              { step: "02", title: "Journals", desc: "Written reflections reveal patterns you don't see in the moment — recurring fears, hidden strengths, growth edges." },
              { step: "03", title: "Insights", desc: "AI-generated reflections accumulate over time, building a map of your psychological landscape." },
              { step: "04", title: "Evolution", desc: "Your higher self becomes sharper. Questions get harder. Guidance gets more precise. Growth accelerates." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-mono text-white">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-[#718096] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl border border-teal-500/10 bg-teal-500/[0.02]">
            <h3 className="text-white font-semibold mb-4">The First Jcee Labs Project</h3>
            <p className="text-[#718096] leading-relaxed mb-4">
              Mirrored was the first project ever started at Jcee Labs. Before VOW, before multi-agent systems, before enterprise infrastructure — there was a simple belief: the best guidance comes from within.
            </p>
            <p className="text-[#718096] leading-relaxed">
              The sophisticated persona behind Mirrored was created by Jonathan Chadbourne — designed not to be a therapist, not to be a friend, but to be the version of you that sees clearly. One of the only Jcee Labs products that doesn't integrate VOW, because Mirrored's intelligence is its own kind of architecture — emotional, not ontological.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Face Yourself. Become Yourself.</h2>
          <p className="text-[#718096] text-lg max-w-xl mx-auto">
            Your higher self is waiting. Start the conversation that changes everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services#contact">
              <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-purple-500 hover:from-teal-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                Request Early Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto mt-6">
            Mirrored is for personal growth and self-reflection. It is not a replacement for professional medical advice, diagnosis, or treatment. If you are in crisis, please contact a professional helpline.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
