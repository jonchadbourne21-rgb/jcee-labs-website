import { Link } from "wouter";
import { ArrowRight, Sparkles, MessageCircle, Brain } from "lucide-react";

export default function Mirrored() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#090514]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                JL
              </div>
              <span>Jcee Labs</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="text-sm text-gray-400 hover:text-white transition">Back to Home</a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5">
            <span className="text-sm text-cyan-400">AI Reflection Chat</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mirrored</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Your AI reflection partner. Mirrored listens, understands, and reflects back insights that help you think deeper, decide faster, and grow stronger.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Download on App Store <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-lg font-semibold hover:border-gray-400 transition">
                Learn More
              </a>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Why Mirrored?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <MessageCircle className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conversational AI</h3>
              <p className="text-gray-400">Natural dialogue that feels like talking to someone who truly understands you.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Brain className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deep Insights</h3>
              <p className="text-gray-400">Get actionable reflections that help you see situations from new angles.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Always Available</h3>
              <p className="text-gray-400">Your AI partner is ready whenever you need to think through something.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Reflect?</h2>
          <p className="text-gray-400 mb-8">Mirrored launches on the App Store in June 2026.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">
              Explore Other Products <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container max-w-4xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2026 Jcee Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
