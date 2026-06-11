import { Link } from "wouter";
import { ArrowRight, Calculator, Zap, BarChart3 } from "lucide-react";

export default function BidIndustrialPage() {
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
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5">
            <span className="text-sm text-orange-400">Industry Estimator</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">BidIndustrial</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Precision estimating for HVAC, electrical, plumbing, and general contracting. Get accurate bids in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition">
                Try Now <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-lg font-semibold hover:border-gray-400 transition">
                Learn More
              </a>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Powerful Estimating</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Calculator className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Calculations</h3>
              <p className="text-gray-400">Industry-standard formulas for accurate material and labor estimates.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Zap className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-gray-400">Generate professional bids in minutes, not hours or days.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <BarChart3 className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Competitive Edge</h3>
              <p className="text-gray-400">Win more bids with faster responses and consistent accuracy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Estimate Smarter?</h2>
          <p className="text-gray-400 mb-8">Join contractors who are saving hours every week with BidIndustrial.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition">
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
