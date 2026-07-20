import { Link } from "wouter";
import { Zap, Mail } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#2a3a5a]/50 bg-[#060a14] py-8 md:py-12 relative z-10 mt-auto">
      <div className="container max-w-[1100px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 md:gap-8 mb-8 md:mb-10">

          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-5 space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/manus-storage/jcee-labs-new-logo_cd2cbbaa.jpg"
                alt="Jcee Labs Logo"
                className="w-8 h-8 rounded-lg shadow-lg shadow-[#8ba4d8]/15 object-contain"
              />
              <span className="font-display font-bold text-base tracking-wider text-[#e8ecf4]">
                JCEE LABS
              </span>
            </div>
            <p className="text-[#7a8aaa] text-sm leading-relaxed max-w-sm">
              Jcee Labs is the d.b.a. of{" "}
              <strong className="text-[#e8ecf4]">HOWM HOLDINGS LLC</strong>. We
              build formally-verified AI systems on VOW. One studio, one language, 6+ products.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/jceelabs"
                target="_blank"
                rel="noopener noreferrer"
                title="@jceelabs on Instagram"
                className="flex items-center gap-1.5 text-[#7a8aaa] hover:text-[#c0c8d8] transition-colors text-xs font-mono group"
              >
                <InstagramIcon className="w-4 h-4" />
                <span className="group-hover:text-[#c0c8d8]">@jceelabs</span>
              </a>
              <span className="text-[#2a3a5a]">·</span>
              <a
                href="https://www.instagram.com/vow._.wow"
                target="_blank"
                rel="noopener noreferrer"
                title="@vow._.wow on Instagram"
                className="flex items-center gap-1.5 text-[#7a8aaa] hover:text-[#c0c8d8] transition-colors text-xs font-mono group"
              >
                <InstagramIcon className="w-4 h-4" />
                <span className="group-hover:text-[#c0c8d8]">@vow._.wow</span>
              </a>
            </div>

            {/* Contact email */}
            <a
              href="mailto:jonathan@jceelabs.com"
              className="inline-flex items-center gap-2 text-[#7a8aaa] hover:text-[#e8ecf4] transition-colors text-xs font-mono"
            >
              <Mail className="w-3.5 h-3.5" />
              jonathan@jceelabs.com
            </a>
          </div>

          {/* Column 2 — Products */}
          <div className="col-span-1 md:col-span-3 space-y-2 md:space-y-3">
            <h5 className="font-display font-bold text-sm text-[#c0c8d8] tracking-wider uppercase">
              Products
            </h5>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-[#7a8aaa]">
              <li><Link href="/vow" className="hover:text-[#d4a843] transition-colors">VOW</Link></li>
              <li><Link href="/mirrored" className="hover:text-[#c0c8d8] transition-colors">Mirrored</Link></li>
              <li><Link href="/truerpm" className="hover:text-[#c0c8d8] transition-colors">TrueRPM</Link></li>

              <li><Link href="/flocraft" className="hover:text-[#c0c8d8] transition-colors">FloCraft</Link></li>
              <li><Link href="/blog" className="hover:text-[#c0c8d8] transition-colors">Blog</Link></li>
              <li><Link href="/revel" className="hover:text-[#c0c8d8] transition-colors">Bourne Aire Industries</Link></li>
              <li><Link href="/sopforge" className="hover:text-[#c0c8d8] transition-colors">SOPForge</Link></li>

            </ul>
          </div>

          {/* Column 3 — Company */}
          <div className="col-span-1 md:col-span-2 space-y-2 md:space-y-3">
            <h5 className="font-display font-bold text-sm text-[#c0c8d8] tracking-wider uppercase">
              Company
            </h5>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-[#7a8aaa]">
              <li><Link href="/team" className="hover:text-[#e8ecf4] transition-colors">Team</Link></li>
              <li><Link href="/faq" className="hover:text-[#e8ecf4] transition-colors">FAQ</Link></li>
              <li><Link href="/services" className="hover:text-[#e8ecf4] transition-colors">Services</Link></li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="col-span-2 md:col-span-2 space-y-2 md:space-y-3">
            <h5 className="font-display font-bold text-sm text-[#c0c8d8] tracking-wider uppercase">
              Legal
            </h5>
            <ul className="space-y-2 text-sm text-[#7a8aaa]">
              <li><Link href="/privacy" className="hover:text-[#e8ecf4] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#e8ecf4] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-[#2a3a5a]/50 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-[10px] md:text-xs text-[#7a8aaa]">
          <p>
            &copy; {new Date().getFullYear()} Jcee Labs. All rights reserved.
            HOWM HOLDINGS LLC.
          </p>
          <p className="flex items-center gap-1">
            Built with <Zap className="w-3 h-3 text-[#8ba4d8]" /> AI
            Orchestration
          </p>
        </div>
      </div>
    </footer>
  );
}
