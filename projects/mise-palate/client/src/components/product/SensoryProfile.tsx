import { SENSORY_DIMENSIONS, type SensoryDimension, type SensoryProfile } from "@shared/product";

const labels: Record<SensoryDimension, string> = {
  sweetness: "Sweet",
  acidity: "Bright",
  salt: "Salty",
  spice: "Heat",
  richness: "Rich",
  bitterness: "Bitter",
  herbaceous: "Herbal",
  crunch: "Crunch",
  tenderness: "Tender",
  doneness: "Doneness",
  sauce: "Sauce",
  smokiness: "Smoky",
};

export function SensoryProfileView({ profile, compact = false, limit }: { profile: SensoryProfile; compact?: boolean; limit?: number }) {
  const dimensions = [...SENSORY_DIMENSIONS]
    .sort((a, b) => profile[b] - profile[a])
    .slice(0, limit ?? SENSORY_DIMENSIONS.length);
  return (
    <div className={`grid ${compact ? "gap-2" : "gap-3"}`}>
      {dimensions.map(dimension => (
        <div key={dimension} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3">
          <span className="text-xs font-semibold text-muted-ink">{labels[dimension]}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
            <div className="h-full rounded-full bg-copper transition-[width] duration-500" style={{ width: `${profile[dimension]}%` }} />
          </div>
          <span className="font-mono text-[0.65rem] text-muted-ink">{profile[dimension]}</span>
        </div>
      ))}
    </div>
  );
}

export function ForecastDelta({ dimension, delta }: { dimension: SensoryDimension; delta: number }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${delta > 0 ? "bg-sage/16 text-sage-deep" : "bg-copper/20 text-copper-deep"}`}>
      {labels[dimension]} {delta > 0 ? `+${delta}` : delta}
    </span>
  );
}
