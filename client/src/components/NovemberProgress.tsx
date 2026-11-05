import { november2026Registry } from "@/content/november2026Registry";

export default function NovemberProgress({ ids, title, id }: { ids: string[]; title: string; id: string }) {
  return (
    <section className="editorial-section" aria-labelledby={id}>
      <p className="editorial-kicker">RESEARCH UPDATE / THROUGH NOVEMBER 4, 2026</p>
      <h2 id={id}>{title}</h2>
      <div className="resource-grid">
        {ids.map(entryId => {
          const entry = november2026Registry.find(item => item.id === entryId)!;
          return (
            <article className="resource-card" key={entry.id}>
              <p className="editorial-kicker">{entry.statusLabel}</p>
              <h3>{entry.name}</h3>
              <p>{entry.summary}</p>
              <p>{entry.boundary}</p>
              <a className="editorial-text-link" href={`/registry#${entry.id}`}>Recorded support and next gate →</a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
