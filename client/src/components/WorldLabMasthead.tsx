import type { ReactNode } from "react";

/** Shared presentation for product and partnership introductions. */
export default function WorldLabMasthead({
  children,
  className = "",
  artwork = "technology",
}: {
  children: ReactNode;
  className?: string;
  artwork?: "technology" | "research" | "company";
}) {
  return (
    <section id="page-content" tabIndex={-1} className={`program-masthead worldlab-masthead ${className}`}>
      <div className="worldlab-masthead-copy">{children}</div>
      <img
        className="worldlab-masthead-art"
        src={`${import.meta.env.BASE_URL}visuals/worldlab-${artwork}-v1.webp`}
        alt=""
        width={1536}
        height={1024}
        decoding="async"
      />
    </section>
  );
}
