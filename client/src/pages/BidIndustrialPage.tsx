import { Link } from "wouter";
import {
  ArrowRight,
  Calculator,
  Zap,
  BarChart3,
  Wrench,
  Flame,
  Droplets,
  Building2,
  Cog,
  HardHat,
  FileText,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const INDUSTRY_PRESETS = [
  {
    name: "HVAC",
    icon: Flame,
    description: "Heating, ventilation, and air conditioning systems — ductwork, units, controls, and refrigerant piping.",
    examples: ["Rooftop unit installations", "Duct fabrication & install", "VRF system bids", "Chiller replacements"],
  },
  {
    name: "Electrical",
    icon: Zap,
    description: "Power distribution, lighting, low-voltage, fire alarm, and generator systems.",
    examples: ["Panel upgrades", "Conduit & wire pulls", "Lighting retrofits", "Emergency power systems"],
  },
  {
    name: "Plumbing",
    icon: Droplets,
    description: "Domestic water, sanitary waste, storm drainage, and gas piping systems.",
    examples: ["Fixture rough-ins", "Med gas piping", "Backflow prevention", "Grease trap installs"],
  },
  {
    name: "General Contracting",
    icon: HardHat,
    description: "Full-scope project management with subcontractor coordination and material procurement.",
    examples: ["Tenant build-outs", "Ground-up construction", "Renovation projects", "Multi-trade coordination"],
  },
  {
    name: "Mechanical",
    icon: Cog,
    description: "Industrial mechanical systems — boilers, steam, compressed air, and process piping.",
    examples: ["Boiler replacements", "Steam trap surveys", "Compressed air systems", "Process piping"],
  },
  {
    name: "Commercial Build-Out",
    icon: Building2,
    description: "Complete commercial interior construction from shell to finished space.",
    examples: ["Office build-outs", "Retail spaces", "Restaurant kitchens", "Medical offices"],
  },
];

const FEATURES = [
  {
    icon: Calculator,
    title: "AI-Powered Estimation",
    description: "Machine learning models trained on real bid data to generate accurate material quantities and labor hours based on project scope.",
  },
  {
    icon: Database,
    title: "Live Pricing Data",
    description: "Connected to industry pricing databases for real-time material costs. No more outdated spreadsheets or manual price lookups.",
  },
  {
    icon: Clock,
    title: "Minutes, Not Hours",
    description: "What used to take a senior estimator 4-8 hours now takes 15 minutes. Generate professional bid packages at lightning speed.",
  },
  {
    icon: FileText,
    title: "Professional Output",
    description: "Export bid packages as branded PDFs with itemized breakdowns, scope narratives, and exclusion lists ready for submission.",
  },
  {
    icon: DollarSign,
    title: "Margin Optimization",
    description: "Built-in markup calculators with regional labor rate adjustments. Hit your target margins while staying competitive.",
  },
  {
    icon: Shield,
    title: "Accuracy Safeguards",
    description: "Cross-references quantities against industry standards and flags anomalies before you submit — catching errors humans miss.",
  },
  {
    icon: TrendingUp,
    title: "Win Rate Analytics",
    description: "Track which bids you win and lose. BidIndustrial learns your competitive position and suggests pricing adjustments.",
  },
  {
    icon: Wrench,
    title: "Takeoff Integration",
    description: "Upload blueprints and spec sheets. BidIndustrial extracts quantities, identifies manufacturers, and maps to your pricing database.",
  },
];

export default function BidIndustrialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5">
            <span className="text-sm text-teal-400 font-mono">Intelligent Bidding for Contractors</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">BidIndustrial</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
            AI-powered bid estimation for HVAC, electrical, plumbing, mechanical, and general contracting. Get accurate, competitive bids in minutes — not hours.
          </p>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl">
            Built by contractors, for contractors. BidIndustrial connects to live pricing data, understands your trade, and generates professional bid packages that win work.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/#contact">
              <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                Request Early Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Industry Presets Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Industry Presets</h2>
            <p className="text-muted-foreground max-w-2xl">
              Pre-configured estimation models for six major trades. Each preset includes trade-specific material databases, labor rate tables, and scope templates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRY_PRESETS.map((preset) => (
              <div
                key={preset.name}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors group"
              >
                <preset.icon className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">{preset.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{preset.description}</p>
                <div className="space-y-1.5">
                  {preset.examples.map((example) => (
                    <div key={example} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1 h-1 rounded-full bg-teal-500/60" />
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Feature Breakdown</h2>
            <p className="text-muted-foreground max-w-2xl">
              Everything you need to estimate faster, bid smarter, and win more work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-teal-500/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12">How It Works</h2>

          <div className="space-y-8">
            {[
              { step: "01", title: "Upload Your Scope", description: "Drop in blueprints, spec sheets, or describe the project. BidIndustrial extracts what matters." },
              { step: "02", title: "Select Your Trade", description: "Choose from 6 industry presets or customize. The system loads trade-specific pricing and labor data." },
              { step: "03", title: "Review & Adjust", description: "AI generates quantities and costs. Review line items, adjust margins, and add your markups." },
              { step: "04", title: "Export & Submit", description: "Generate a professional bid package — branded PDF with itemized breakdown, scope, and exclusions." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <span className="text-teal-400 font-mono font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Data Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.03] p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Database className="w-8 h-8 text-teal-400 shrink-0" />
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Connected to Real Pricing Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  BidIndustrial connects to industry pricing databases for real-time material costs. Prices update automatically so your bids reflect current market conditions — no more guessing or using last year's numbers.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-teal-400">6</p>
                <p className="text-xs text-muted-foreground mt-1">Trade Presets</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-teal-400">Real-Time</p>
                <p className="text-xs text-muted-foreground mt-1">Pricing Updates</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-teal-400">PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Professional Export</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-white">Ready to Bid Smarter?</h2>
          <p className="text-muted-foreground text-lg">
            Join contractors who are winning more work with faster, more accurate estimates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact">
              <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
                Request Early Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/#newsletter">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[#E2E8F0] font-medium active:scale-97 transition-all">
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
