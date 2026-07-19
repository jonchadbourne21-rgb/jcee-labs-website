import { Link } from "wouter";
import { ArrowLeft, Mic, Calendar, Route, TrendingUp, BookOpen, ExternalLink } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Mirrored() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#e8e4f0] flex flex-col">
      <SiteNav />

      {/* Hero with background image */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('/manus-storage/mirrored-hero_29be35fb.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b14]/60 via-transparent to-[#0d0b14]" />

        <div className="relative max-w-[720px] mx-auto px-6">
          <Link href="/products">
            <a className="inline-flex items-center gap-2 text-sm text-[#9a94b0] hover:text-[#67e8f9] transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </a>
          </Link>

          <div className="inline-block text-[10px] font-bold tracking-[0.12em] uppercase px-4 py-1.5 rounded-full bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)] mb-4">
            BUILDING
          </div>

          <h1 className="text-[42px] font-extrabold leading-[1.15] tracking-[-0.02em] mb-6">
            Meet the mirror that{" "}
            <span className="bg-gradient-to-r from-[#67e8f9] to-[#a78bfa] bg-clip-text text-transparent">
              talks back.
            </span>
          </h1>

          <p className="text-[18px] text-[#c4bfd6] leading-[1.8] mb-8">
            Mirrored is an AI self-reflection companion that helps you hear your own thinking — clearly, honestly, and out loud. Talk to it by voice like you'd talk to yourself on a long drive. It remembers, it reflects, and it never judges.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="flex flex-col gap-5">
            <div className="bg-[#161326] border border-white/[0.06] rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(103,232,249,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 text-[#67e8f9]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#e8e4f0] mb-1.5">Check in daily.</h3>
                  <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                    One minute each morning turns into an insight built around your actual day.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#161326] border border-white/[0.06] rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mic className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#e8e4f0] mb-1.5">Talk to Mirror.</h3>
                  <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                    Voice-to-voice conversation with an AI that knows your story — no scripts, no canned responses.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#161326] border border-white/[0.06] rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(103,232,249,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Route className="w-5 h-5 text-[#67e8f9]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#e8e4f0] mb-1.5">Follow guided programs.</h3>
                  <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                    Multi-day paths like The Stoic Path and The Present Moment Challenge turn reflection into practice.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#161326] border border-white/[0.06] rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#e8e4f0] mb-1.5">Watch yourself change.</h3>
                  <p className="text-[15px] text-[#9a94b0] leading-[1.7]">
                    Journaling, habit streaks, and Echo memory reflections make growth visible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section className="pb-20">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="bg-[#161326] border border-[rgba(167,139,250,0.15)] rounded-2xl p-8 bg-gradient-to-b from-[rgba(167,139,250,0.04)] to-[#161326]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-[#a78bfa]" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#e8e4f0] mb-3">Under the Hood</h3>
                <p className="text-[15px] text-[#9a94b0] leading-[1.8]">
                  Most AI apps answer questions. Mirrored asks better ones. It's built on a custom persona architecture with emotional voice intelligence and a proprietary memory system — so instead of a generic assistant, you get something closer to the wisest version of yourself. And it's safe by design: crisis support protocols are built into its foundation, and your reflections stay private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <h2 className="text-[28px] font-extrabold tracking-[-0.02em] mb-3">
            Be first in line.
          </h2>
          <p className="text-[16px] text-[#9a94b0] mb-8">
            Launching on the App Store within a month.
          </p>
          <a
            href="https://mirroredapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#67e8f9] to-[#a78bfa] text-[#0d0b14] font-bold text-[15px] hover:opacity-90 transition-opacity"
          >
            Mirroredapp.com
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
