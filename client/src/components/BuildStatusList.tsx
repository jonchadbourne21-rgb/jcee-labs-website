import { entries } from "@/content/registryEntries";

export default function BuildStatusList({ ids }: { ids: string[] }) {
  return (
    <div className="build-status-list">
      {ids.map(id => {
        const entry = entries.find(item => item.id === id);
        if (!entry) return null;
        const registryHref = `${import.meta.env.BASE_URL}registry#${id}`;
        return (
          <article key={id}>
            <p className="editorial-kicker">{entry.statusLabel}</p>
            <h3>
              <a href={registryHref}>{entry.name}</a>
            </h3>
            <p>{entry.supports}</p>
            <p className="build-boundary">{entry.boundary}</p>
            <a className="editorial-text-link" href={registryHref}>
              Full record →
            </a>
          </article>
        );
      })}
    </div>
  );
}
