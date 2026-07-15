import { Link } from "wouter";
import { Users, MapPin, Lightbulb, Rocket } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] text-[#E2E8F0] flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mx-auto">
            <Users className="w-3.5 h-3.5" /> Leadership
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold">
            The <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Team</span> Behind Jcee Labs
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            A small, focused team building intelligent software that empowers businesses to operate smarter.
          </p>
        </div>

        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] opacity-30" style={{ transform: 'translateZ(0)' }} />
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">

          {/* Jonathan Chadbourne */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 hover:border-purple-500/20 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <img
                src="/manus-storage/jonathan-photo_8a631582.png"
                alt="Jonathan Chadbourne"
                className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover object-center shrink-0 shadow-lg shadow-purple-500/20 border border-white/10 mx-auto md:mx-0"
              />
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Jonathan Chadbourne</h2>
                  <p className="text-purple-300 font-mono text-sm">Founder, CEO & Lead Architect</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Dallas, Texas</span>
                  <span className="text-white/20">|</span>
                  <span>Age 34</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Jonathan founded Jcee Labs with a clear vision: to build software that levels the playing field for small businesses and independent operators. With a deep background in systems architecture and a relentless drive to solve real-world problems through technology, he leads the company's product strategy, engineering direction, and AI integration efforts.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  His vision for Jcee Labs is to create an ecosystem of intelligent, accessible tools that give everyday entrepreneurs the same technological advantages as large enterprises — from AI-powered personal development to automated business operations. Every product at Jcee Labs is designed to be practical, revenue-generating, and built for people who work hard and think big.
                </p>
              </div>
            </div>
          </div>

          {/* George Taylor */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 hover:border-teal-500/20 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-display font-bold shrink-0 shadow-lg shadow-teal-500/20">
                GT
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">George Taylor</h2>
                  <p className="text-teal-300 font-mono text-sm">Partner & Chief Strategy Officer</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> Joined June 2025</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  George was brought on to help take Jcee Labs to the next level. With deep expertise in sales, marketing, and a creative approach to business strategy, his ability to identify niche opportunities and develop unconventional go-to-market strategies made him a natural fit for the team.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  As CSO, George drives the company's growth initiatives, partnership development, and market positioning. His knack for spotting untapped markets and crafting compelling narratives around technical products ensures that Jcee Labs' innovations reach the people who need them most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Vision */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mx-auto">
            <Lightbulb className="w-3.5 h-3.5" /> Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
            Building for the <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Underdog</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Jcee Labs exists to give small businesses, independent operators, and ambitious individuals access to the same intelligent tools that billion-dollar companies take for granted. We build practical, revenue-focused software — not vaporware.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-purple-400 mb-2">5+</div>
              <p className="text-sm text-muted-foreground">Products in Development</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-teal-400 mb-2">2025</div>
              <p className="text-sm text-muted-foreground">Founded</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
              <div className="text-3xl font-display font-bold text-indigo-400 mb-2">AI-First</div>
              <p className="text-sm text-muted-foreground">Development Approach</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
