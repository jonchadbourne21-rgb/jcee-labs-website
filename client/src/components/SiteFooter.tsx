import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#05030c] py-12 relative z-10 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/manus-storage/jcee-labs-logo_d242d7a5.png"
                alt="Jcee Labs Logo"
                className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/25 object-contain"
              />
              <span className="font-display font-bold text-base tracking-wider text-white">JCEE LABS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Jcee Labs is the d.b.a. of <strong className="text-white">HOWM HOLDINGS LLC</strong>. We build AI-optimized applications that enhance creativity and professional efficiency.
            </p>
          </div>
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Products</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/mirrored"><a className="hover:text-purple-300 transition-colors">Mirrored</a></Link></li>
              <li><Link href="/truckers-dream"><a className="hover:text-orange-300 transition-colors">Trucker$Dream</a></Link></li>
              <li><Link href="/vow"><a className="hover:text-purple-300 transition-colors">VOW</a></Link></li>
              <li><Link href="/bidindustrial"><a className="hover:text-teal-300 transition-colors">BidIndustrial</a></Link></li>
              <li><Link href="/nicheflo"><a className="hover:text-indigo-300 transition-colors">NicheFlow</a></Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Company</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/team"><a className="hover:text-white transition-colors">Team</a></Link></li>
              <li><Link href="/faq"><a className="hover:text-white transition-colors">FAQ</a></Link></li>
              <li><Link href="/services"><a className="hover:text-white transition-colors">Services</a></Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">Legal</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
              <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jcee Labs. All rights reserved. HOWM HOLDINGS LLC.</p>
          <p className="flex items-center gap-1">
            Built with <Zap className="w-3 h-3 text-purple-400" /> AI Orchestration
          </p>
        </div>
      </div>
    </footer>
  );
}
