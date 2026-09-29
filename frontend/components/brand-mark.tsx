import { ShieldCheck } from "lucide-react";

type BrandMarkProps = { compact?: boolean; inverse?: boolean; className?: string };

export function BrandMark({ compact = false, inverse = false, className = "" }: BrandMarkProps) {
  const text = inverse ? "text-white" : "text-ink";
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="AEGIS ClaimOS">
      <span className={`grid h-9 w-9 shrink-0 place-items-center ${inverse ? "bg-cyan text-ink" : "bg-ink text-cyan"}`} aria-hidden="true">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.7} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={`block text-sm font-extrabold tracking-tight ${text}`}>AEGIS <span className={inverse ? "text-cyan" : "text-cyan"}>ClaimOS</span></span>
          <span className={`mt-1 block text-[9px] font-bold uppercase tracking-[0.15em] ${inverse ? "text-slate-300" : "text-slate-500"}`}>Evidence-to-authorization</span>
        </span>
      )}
    </div>
  );
}

export function ViewSignature({ label }: { label: string }) {
  return <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><BrandMark compact className="scale-75 origin-left" /> <span>{label}</span></div>;
}
