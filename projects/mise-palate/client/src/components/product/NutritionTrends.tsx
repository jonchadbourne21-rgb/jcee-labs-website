import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { NutritionTrendBucket, NutritionValues } from "@shared/product";
import { Activity, Loader2, Package, Salad } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Metric = { key: keyof Pick<NutritionValues, "calories" | "proteinG" | "fiberG" | "sodiumMg">; label: string; unit: string };
const METRICS: Metric[] = [
  { key: "calories", label: "Energy", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

function buildLocalDays(count: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (count - 1 - index));
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return {
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      label: count === 7 ? start.toLocaleDateString(undefined, { weekday: "short" }) : start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      startMs: start.getTime(),
      endMs: end.getTime(),
    };
  });
}

function aggregateWeeks(buckets: NutritionTrendBucket[]) {
  return Array.from({ length: 4 }, (_, weekIndex) => {
    const slice = buckets.slice(weekIndex * 7, weekIndex * 7 + 7);
    const sum = (source: "fresh" | "packaged", metric: keyof NutritionValues) => Math.round(slice.reduce((total, day) => total + day[source][metric], 0) * 10) / 10;
    return {
      label: `Week ${weekIndex + 1}`,
      fresh: Object.fromEntries(Object.keys(slice[0]?.fresh ?? {}).map(key => [key, sum("fresh", key as keyof NutritionValues)])) as unknown as NutritionValues,
      packaged: Object.fromEntries(Object.keys(slice[0]?.packaged ?? {}).map(key => [key, sum("packaged", key as keyof NutritionValues)])) as unknown as NutritionValues,
    };
  });
}

export function NutritionTrends() {
  const [range, setRange] = useState<7 | 28>(7);
  const [metric, setMetric] = useState<Metric>(METRICS[0]);
  const days = useMemo(() => buildLocalDays(range), [range]);
  const trendsQuery = trpc.nutrition.trends.useQuery({ days });

  const chartData = useMemo(() => {
    const buckets = trendsQuery.data?.buckets ?? [];
    const rows = range === 7 ? buckets : aggregateWeeks(buckets);
    return rows.map(row => ({
      label: row.label,
      fresh: row.fresh[metric.key],
      packaged: row.packaged[metric.key],
    }));
  }, [trendsQuery.data, range, metric]);

  const summary = trendsQuery.data?.summary;
  const hasLogs = (summary?.loggedDays ?? 0) > 0;

  return (
    <section className="surface mt-10 overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2"><p className="eyebrow">Nutrition Trends</p><Activity className="size-4 text-copper-deep" /></div>
          <h2 className="mt-2 font-display text-3xl">Fresh and packaged, side by side.</h2>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-ink">Only foods you explicitly logged appear. Fresh uses Food Lens meal estimates; packaged combines database and private-label Nutrition Facts.</p>
        </div>
        <div className="flex rounded-xl bg-ink/5 p-1">
          <button type="button" onClick={() => setRange(7)} className={`rounded-lg px-3 py-2 text-xs font-bold ${range === 7 ? "bg-white text-ink shadow-sm" : "text-muted-ink"}`}>Daily · 7D</button>
          <button type="button" onClick={() => setRange(28)} className={`rounded-lg px-3 py-2 text-xs font-bold ${range === 28 ? "bg-white text-ink shadow-sm" : "text-muted-ink"}`}>Weekly · 4W</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {METRICS.map(item => <Button key={item.key} type="button" variant="outline" size="sm" onClick={() => setMetric(item)} className={`rounded-full text-xs ${metric.key === item.key ? "border-copper bg-copper/12 text-copper-deep" : "bg-white/45"}`}>{item.label}</Button>)}
      </div>

      {trendsQuery.isLoading ? (
        <div className="grid h-72 place-items-center"><Loader2 className="size-5 animate-spin text-copper-deep" /></div>
      ) : hasLogs ? (
        <>
          <div className="mt-6 h-72 w-full" aria-label={`${metric.label} trends for fresh and packaged foods`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,42,35,.10)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#77766e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#77766e" }} axisLine={false} tickLine={false} width={46} unit={metric.unit === "kcal" ? "" : metric.unit} />
                <Tooltip cursor={{ fill: "rgba(240,157,92,.08)" }} formatter={(value: number, name: string) => [`${Number(value).toLocaleString()} ${metric.unit}`, name === "fresh" ? "Fresh meals" : "Packaged foods"]} contentStyle={{ borderRadius: 14, borderColor: "rgba(35,42,35,.12)", fontSize: 12 }} />
                <Legend formatter={value => value === "fresh" ? "Fresh meals" : "Packaged foods"} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="fresh" stackId="sources" fill="#748b65" radius={[0, 0, 4, 4]} maxBarSize={42} />
                <Bar dataKey="packaged" stackId="sources" fill="#e89452" radius={[4, 4, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sage/12 p-4"><Salad className="size-4 text-sage-deep" /><p className="mt-2 text-2xl font-display">{summary?.freshSharePercent}%</p><p className="text-xs text-muted-ink">Energy from fresh logged meals</p></div>
            <div className="rounded-2xl bg-copper/12 p-4"><Package className="size-4 text-copper-deep" /><p className="mt-2 text-2xl font-display">{summary?.packagedSharePercent}%</p><p className="text-xs text-muted-ink">Energy from packaged logged foods</p></div>
            <div className="rounded-2xl bg-ink/5 p-4"><Activity className="size-4 text-ink" /><p className="mt-2 text-2xl font-display">{summary?.loggedDays}</p><p className="text-xs text-muted-ink">Days with explicit logs in range</p></div>
          </div>
        </>
      ) : (
        <div className="mt-6 grid min-h-60 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white/35 p-6 text-center">
          <div><Activity className="mx-auto size-7 text-copper-deep" /><p className="mt-3 font-display text-2xl">Your trend starts with a log.</p><p className="mt-1 text-xs leading-5 text-muted-ink">Log a Food Lens meal or packaged food. Mise never fills empty days with invented data.</p></div>
        </div>
      )}
    </section>
  );
}
