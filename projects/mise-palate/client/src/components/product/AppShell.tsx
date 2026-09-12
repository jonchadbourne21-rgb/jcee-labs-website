import { BookHeart, Camera, ChefHat, Home, Sparkles, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/lens", label: "Lens", icon: Camera },
  { href: "/cook", label: "Cook", icon: ChefHat },
  { href: "/saved", label: "Saved", icon: BookHeart },
  { href: "/me", label: "Me", icon: UserRound },
];

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Mise home">
      <span className="grid size-9 place-items-center rounded-full bg-copper text-ink shadow-sm transition-transform group-active:scale-95">
        <Sparkles className="size-4" strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="font-display text-[1.75rem] leading-none tracking-[-0.02em] text-ink">Mise</span>
      )}
    </Link>
  );
}

export default function AppShell({ children, immersive = false }: { children: ReactNode; immersive?: boolean }) {
  const [location] = useLocation();
  if (immersive) return <>{children}</>;
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Wordmark />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map(item => {
              const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-ink text-canvas" : "text-muted-ink hover:bg-ink/6 hover:text-ink"}`}
                >
                  <Icon className="size-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden rounded-full border border-ink/10 bg-white/65 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-ink sm:block">
            Chef intelligence, personal by default
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.4rem] border border-white/70 bg-ink/95 p-1.5 text-white shadow-2xl shadow-ink/25 backdrop-blur-xl md:hidden" aria-label="Primary navigation">
        {navItems.map(item => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-semibold transition ${active ? "bg-copper text-ink" : "text-white/65 active:bg-white/10"}`}>
              <Icon className="size-[1.15rem]" strokeWidth={active ? 2.3 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
