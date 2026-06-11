import { Link } from "wouter";
import { ArrowRight, Microscope, Zap, Grid3x3 } from "lucide-react";

export default function CellularAutomataPage() {
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
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5">
            <span className="text-sm text-blue-400">Complexity Science Explorer</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Cellular Automata</span> Explorer
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Observe how simple rules create complex emergent patterns. Explore 1D and 2D cellular automata systems, discover Conway's Game of Life, and understand the mathematics of emergence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition">
                Explore <ArrowRight className="w-4 h-4" />
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
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] opacity-20 will-change-transform" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Explore Complexity</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Microscope className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">1D Systems</h3>
              <p className="text-gray-400">Discover Wolfram's 256 elementary cellular automata and their patterns.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Grid3x3 className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">2D Systems</h3>
              <p className="text-gray-400">Experience Conway's Game of Life and Von Neumann neighborhoods.</p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Zap className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-Time Evolution</h3>
              <p className="text-gray-400">Watch as simple rules generate intricate, unpredictable patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">What You Can Do</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Configure sweep parameters and discover unknown rules</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Run simulations with background Web Workers</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Export and analyze pattern data</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-gray-300">Explore 262K possible rules in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Discover Emergence?</h2>
          <p className="text-gray-400 mb-8">Explore the mathematics of complexity and see how simple rules create infinite patterns.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition">
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
