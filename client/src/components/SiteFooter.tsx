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
    <footer className="border-t border-white/5 bg-[#05030c] py-12 relative z-10 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">

          {/* Column 1 — Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/manus-storage/jcee-labs-logo_d242d7a5.png"
                alt="Jcee Labs Logo"
                className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/25 object-contain"
              />
              <span className="font-display font-bold text-base tracking-wider text-white">
                JCEE LABS
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Jcee Labs is the d.b.a. of{" "}
              <strong className="text-white">HOWM HOLDINGS LLC</strong>. We
              build AI-optimized applications that enhance creativity and
              professional efficiency.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/jceelabs"
                target="_blank"
                rel="noopener noreferrer"
                title="@jceelabs on Instagram"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-pink-400 transition-colors text-xs font-mono group"
              >
                <InstagramIcon className="w-4 h-4" />
                <span className="group-hover:text-pink-400">@jceelabs</span>
              </a>
              <span className="text-white/15">·</span>
              <a
                href="https://www.instagram.com/vow._.wow"
                target="_blank"
                rel="noopener noreferrer"
                title="@vow._.wow on Instagram"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-pink-400 transition-colors text-xs font-mono group"
              >
                <InstagramIcon className="w-4 h-4" />
                <span className="group-hover:text-pink-400">@vow._.wow</span>
              </a>
            </div>

            {/* Contact email */}
            <a
              href="mailto:jonathan@jceelabs.com"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-mono"
            >
              <Mail className="w-3.5 h-3.5" />
              jonathan@jceelabs.com
            </a>
          </div>

          {/* Column 2 — Products */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Products
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/vow">
                  <a className="hover:text-[#d4a843] transition-colors">VOW</a>
                </Link>
              </li>
              <li>
                <Link href="/mirrored">
                  <a className="hover:text-teal-300 transition-colors">Mirrored</a>
                </Link>
              </li>
              <li>
                <Link href="/truerpm">
                  <a className="hover:text-orange-300 transition-colors">TrueRPM</a>
                </Link>
              </li>
              <li>
                <Link href="/nicheflo">
                  <a className="hover:text-cyan-300 transition-colors">NicheFlo</a>
                </Link>
              </li>
              <li>
                <Link href="/flocraft">
                  <a className="hover:text-teal-300 transition-colors">FloCraft</a>
                </Link>
              </li>
              <li>
                <Link href="/rooh">
                  <a className="hover:text-amber-300 transition-colors">Rooh</a>
                </Link>
              </li>
              <li>
                <Link href="/revel">
                  <a className="hover:text-teal-300 transition-colors">Revel Industries</a>
                </Link>
              </li>
              <li>
                <Link href="/sopforge">
                  <a className="hover:text-indigo-300 transition-colors">SOPForge</a>
                </Link>
              </li>
              <li>
                <Link href="/babodie">
                  <a className="hover:text-purple-300 transition-colors">Babodie</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Company
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/team">
                  <a className="hover:text-white transition-colors">Team</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="hover:text-white transition-colors">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="hover:text-white transition-colors">Services</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Legal
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">
                  <a className="hover:text-white transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-white transition-colors">Terms of Service</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Jcee Labs. All rights reserved.
            HOWM HOLDINGS LLC.
          </p>
          <p className="flex items-center gap-1">
            Built with <Zap className="w-3 h-3 text-purple-400" /> AI
            Orchestration
          </p>
        </div>
      </div>
    </footer>
  );
}
