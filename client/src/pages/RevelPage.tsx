import { Link } from "wouter";
import { ArrowRight, Factory, FileText, Mail, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function RevelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0a0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-sm text-teal-400 font-mono">
              Building
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Revel</span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto mb-8 leading-relaxed">
            Industrial equipment bid management built specifically for HVAC wholesalers and resellers. Automates the entire workflow — from receiving a bid request (PDF spec sheet or email) to sending RFQs to vendors and comparing quotes.
          </p>
          <Link href="/services#contact">
            <Button className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all">
              Get Notified <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] opacity-20" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <FileText className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">PDF Intake</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Receives bid requests via PDF spec sheets or email. Extracts requirements automatically.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Mail className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">RFQ Automation</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Sends RFQs to vendors automatically. No manual data entry or copy-pasting.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <BarChart3 className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Quote Comparison</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Compares vendor quotes side-by-side. Makes the best option obvious.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Factory className="w-6 h-6 text-teal-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">HVAC-First</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Built specifically for HVAC wholesalers and resellers. Understands your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
