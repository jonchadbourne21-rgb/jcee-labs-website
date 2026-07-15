import { Link } from "wouter";
import { Ship, Globe, Cloud, Route, Brain, Clock, AlertTriangle, BarChart3, Anchor, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function SupplyChainPage() {
  return (
    <div className="min-h-screen bg-[#090514] flex flex-col">
      <SiteNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/6 rounded-full blur-[70px]" />
        </div>

        <div className="container max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-mono tracking-wider uppercase">
              Multi-Agent Intelligence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
            SupplyChain
          </h1>
          <p className="text-xl text-[#A0AEC0] max-w-2xl mb-4">
            Autonomous port monitoring and route optimization for global logistics.
          </p>
          <p className="text-[#718096] max-w-2xl mb-10 leading-relaxed">
            A multi-agent system that monitors major ports every hour, analyzes weather patterns, 
            geopolitical disruptions, congestion data, and global shipping conditions — then orchestrates 
            the optimal alternative route before delays hit your bottom line.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/#contact">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium px-6 py-3 h-auto">
                Request Early Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 px-6 py-3 h-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">How It Works</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Every top of the hour, our agent swarm activates — scanning, analyzing, and strategizing 
            so your shipments never get caught off guard.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Clock,
                title: "Hourly Monitoring",
                desc: "Agents scan every major port worldwide for congestion, closures, weather events, and geopolitical disruptions.",
              },
              {
                step: "02",
                icon: Brain,
                title: "Multi-Agent Analysis",
                desc: "Specialized agents analyze weather patterns, vessel traffic, customs delays, labor actions, and political instability simultaneously.",
              },
              {
                step: "03",
                icon: Route,
                title: "Route Optimization",
                desc: "The strategist agent maps alternative routes factoring in fuel costs, transit time, port fees, and risk scores.",
              },
              {
                step: "04",
                icon: AlertTriangle,
                title: "Proactive Alerts",
                desc: "Logistics teams receive actionable recommendations before disruptions impact their normal shipping lanes.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-blue-500/20 transition-colors">
                <span className="text-xs font-mono text-blue-400/60 mb-3 block">{item.step}</span>
                <item.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent System */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">The Agent System</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Five specialized agents work in concert, each with a distinct role in protecting your supply chain.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Anchor,
                name: "Port Monitor",
                color: "blue",
                desc: "Continuously scans port status, vessel queues, berth availability, and throughput metrics across global shipping hubs.",
              },
              {
                icon: Cloud,
                name: "Weather Analyst",
                color: "cyan",
                desc: "Tracks storms, fog, wind patterns, and seasonal conditions that impact maritime routes and port operations.",
              },
              {
                icon: Globe,
                name: "Geopolitical Scanner",
                color: "purple",
                desc: "Monitors trade sanctions, labor strikes, political instability, canal closures, and regulatory changes worldwide.",
              },
              {
                icon: Route,
                name: "Route Strategist",
                color: "green",
                desc: "Calculates optimal alternative routes weighing transit time, fuel costs, port fees, risk scores, and vessel capacity.",
              },
              {
                icon: BarChart3,
                name: "Cost Optimizer",
                color: "orange",
                desc: "Evaluates financial impact of route changes — demurrage savings, fuel differentials, insurance adjustments, and deadline compliance.",
              },
            ].map((agent) => (
              <div key={agent.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-${agent.color}-500/10 border border-${agent.color}-500/20 flex items-center justify-center mb-4`}>
                  <agent.icon className={`w-5 h-5 text-${agent.color}-400`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{agent.name}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Data Inputs</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            The system ingests and cross-references dozens of data streams to build a complete picture of global shipping conditions.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Port congestion & vessel queues",
              "Real-time weather & storm tracking",
              "AIS vessel positioning data",
              "Customs & regulatory changes",
              "Labor action & strike alerts",
              "Canal & waterway status",
              "Fuel price fluctuations",
              "Geopolitical risk indices",
              "Historical transit time data",
              "Container availability",
              "Insurance & demurrage rates",
              "Seasonal shipping patterns",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span className="text-sm text-[#A0AEC0]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">Built For</h2>
          <p className="text-[#718096] mb-12 max-w-2xl">
            Any company shipping goods through major ports can benefit from proactive route intelligence.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Freight Forwarders",
                desc: "Get ahead of disruptions and offer clients alternative routing before competitors even know there's a problem.",
              },
              {
                title: "Logistics Companies",
                desc: "Reduce demurrage costs, avoid congestion delays, and maintain on-time delivery rates even during global disruptions.",
              },
              {
                title: "Import/Export Businesses",
                desc: "Protect your supply chain from surprise port closures, weather events, and geopolitical shifts that halt normal routes.",
              },
            ].map((uc) => (
              <div key={uc.title} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-white font-semibold mb-3">{uc.title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Stop Reacting. Start Anticipating.
          </h2>
          <p className="text-[#718096] mb-8 max-w-xl mx-auto">
            SupplyChain gives your logistics team the intelligence to reroute before disruptions cost you time and money.
          </p>
          <Link href="/#contact">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium px-8 py-3 h-auto">
              Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
