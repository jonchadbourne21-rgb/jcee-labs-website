"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, CircleDot, ClipboardList, Download, FileCheck2, HandCoins, LayoutDashboard, Menu, RefreshCw, ShieldCheck, UserRound, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import type { ApiHealth, Role, ViewName } from "@/lib/types";
import { ROLE_OPTIONS } from "@/lib/types";

type DeferredInstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const nav: Array<{ id: ViewName; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "claims", label: "Claims", icon: ClipboardList },
  { id: "my-work", label: "My Work", icon: BriefcaseBusiness },
  { id: "policyholder", label: "Policyholder", icon: UserRound },
  { id: "finance", label: "Finance", icon: HandCoins },
  { id: "assurance", label: "Assurance", icon: ShieldCheck },
];

type AppShellProps = {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  health: ApiHealth | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
  children: React.ReactNode;
};

export function AppShell({ activeView, onNavigate, role, onRoleChange, health, healthLoading, onRefreshHealth, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as DeferredInstallPrompt); };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);
  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  const healthLabel = healthLoading ? "Checking API" : health?.status === "ok" ? "API connected" : "API unavailable";
  const healthClass = healthLoading ? "bg-slate-100 text-slate-700" : health?.status === "ok" ? "bg-teal-50 text-teal-950" : "bg-orange-50 text-safety";
  const controls = <>
    <label className="sr-only" htmlFor="role-switcher">Demo role</label>
    <select id="role-switcher" className="role-switcher" value={role} onChange={(event) => onRoleChange(event.target.value as Role)}>
      {ROLE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
    <button type="button" onClick={onRefreshHealth} className={`health-pill ${healthClass}`} title={health?.service || healthLabel}>
      <CircleDot className={`h-3.5 w-3.5 ${healthLoading ? "animate-pulse" : ""}`} /> <span>{healthLabel}</span><RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin" : ""}`} aria-hidden="true" />
    </button>
    {installPrompt && <button type="button" onClick={install} className="install-button"><Download className="h-4 w-4" />Install</button>}
  </>;
  const navLinks = (mobile = false) => <nav aria-label={mobile ? "Mobile navigation" : "Primary navigation"} className={mobile ? "grid grid-cols-3 gap-1" : "space-y-1"}>
    {nav.map((item) => { const Icon = item.icon; const active = activeView === item.id; return <button key={item.id} type="button" onClick={() => { onNavigate(item.id); setMenuOpen(false); }} className={`nav-link ${mobile ? "justify-center text-center" : ""} ${active ? "nav-link-active" : ""}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4" /><span>{item.label}</span></button>; })}
  </nav>;

  return <div className="min-h-screen bg-paper text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-ink p-5 text-white lg:flex lg:flex-col">
      <BrandMark inverse />
      <div className="mt-8">{navLinks()}</div>
      <div className="mt-auto border-t border-slate-700 pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Demo operating mode</p><p className="mt-1 text-xs leading-5 text-slate-300">Role switching changes the workspace surface; backend authorization remains authoritative.</p></div>
    </aside>
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-64">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 lg:hidden"><BrandMark compact /><button type="button" className="icon-button" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}<span className="sr-only">Toggle navigation</span></button></div>
        <div className="hidden lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Property claims operations</p><p className="text-sm font-bold">{nav.find((item) => item.id === activeView)?.label}</p></div>
        <div className="ml-auto flex items-center gap-2">{controls}</div>
      </div>
      {menuOpen && <div id="mobile-menu" className="border-t border-slate-200 bg-white p-3 lg:hidden">{navLinks(true)}<div className="mt-3 grid gap-2 border-t border-slate-200 pt-3">{controls}</div></div>}
    </header>
    <main className="pb-20 lg:ml-64 lg:pb-8">{children}</main>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-1 backdrop-blur lg:hidden">{navLinks(true)}</div>
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 border-l-4 border-cyan bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan"><FileCheck2 className="h-3.5 w-3.5" />{eyebrow}</div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p></div>{action}</div>;
}
