import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Shield, Cpu, Zap } from "lucide-react";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#090514] text-[#E2E8F0] relative overflow-hidden flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-card/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center font-display font-bold text-white text-sm shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
                JL
              </div>
              <span className="font-display font-bold text-lg tracking-wider group-hover:text-purple-300 transition-colors">
                JCEE LABS
              </span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-16 md:py-24 flex-grow">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ & Information Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
            Frequently Asked <span className="text-gradient-purple">Questions</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Jcee Labs, HOWM HOLDINGS LLC, and our suite of intelligent applications.
          </p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 relative">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                What is Jcee Labs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Jcee Labs is an elite creative technology and innovation lab. It serves as the primary incubator, creator domain, and launchpad for a diverse suite of cutting-edge applications, SaaS tools, and AI-driven platforms designed to streamline operations and keep users ahead of the curve.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                What is the relationship with HOWM HOLDINGS LLC?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                HOWM HOLDINGS LLC is the parent legal entity and umbrella holding company. Jcee Labs operates as the registered d.b.a. (Doing Business As) and creative arm, managing the product design, software engineering, and AI integration for all apps launched under the holding company.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                What is "Mirrored"?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                <strong>Mirrored</strong> is Jcee Labs' debut application. It is a highly personalized, AI-powered self-reflection and personal development application designed to act as an interactive digital mirror, assisting users in analyzing patterns, setting clear intentions, and tracking personal growth with absolute clarity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                What is "Musaia"?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                <strong>Musaia</strong> is our intelligent bidding estimator tool. Designed for contractors, service providers, and business owners, Musaia leverages predictive intelligence to generate hyper-accurate cost estimates, analyze bid competitive dynamics, and dramatically reduce takeoff overhead.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                How does Jcee Labs leverage AI tools?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                We believe in autonomous and collaborative AI workflows. By orchestrating advanced AI agents (like Manus) and custom language models, we automate the entire lifecycle of software creation—from research and UI design to rapid prototyping and pipeline automation—enabling us to build production-ready systems at unprecedented speed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-b border-white/5">
              <AccordionTrigger className="text-left font-display font-semibold text-lg py-4 hover:text-purple-300 hover:no-underline transition-colors">
                Are these products available to the public?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                Yes, our applications roll out in phased launches. Mirrored is currently entering private beta, while Musaia is undergoing active industry pilot testing. You can register your interest or request early access directly on our homepage to secure your spot.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            <Cpu className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">AI-Driven</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every tool we incubate is built from the ground up to utilize autonomous intelligence and advanced automation.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            <Zap className="w-8 h-8 text-teal-400 mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">Streamlined</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We eliminate operational bloat, crafting clean interfaces and workflows that let you accomplish more with less effort.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            <Shield className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">Secure & Private</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              HOWM HOLDINGS LLC ensures that all user data and platform telemetry comply with the highest industry security standards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-card/10 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Jcee Labs. All rights reserved. Registered d.b.a. of HOWM HOLDINGS LLC.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-purple-300 transition-colors">Home</Link>
            <span className="text-white/10">|</span>
            <span className="text-muted-foreground">Privacy Policy</span>
            <span className="text-white/10">|</span>
            <span className="text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
