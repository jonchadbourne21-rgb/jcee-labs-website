type CoreHeaderProps = {
  current?: "jcee" | "vow" | "research" | "qcs" | "mirrored";
};

const links = [
  { id: "jcee", label: "JCEE LABS", href: "/#company" },
  { id: "vow", label: "VOW", href: "/#vow" },
  { id: "research", label: "RESEARCH", href: "/research-evidence" },
  { id: "qcs", label: "QCS", href: "/qcs" },
  { id: "mirrored", label: "MIRRORED", href: "/#mirrored" },
] as const;

export default function CoreHeader({ current }: CoreHeaderProps) {
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="JCEE Labs home">
        <img className="wordmark-mark" src="/brand/jcee-labs-mark.png" alt="" aria-hidden="true" />
        <span>JCEE LABS</span>
      </a>

      <nav aria-label="Main navigation">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-current={current === link.id ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a className="header-contact" href="mailto:support@jceelabs.com">
        CONTACT <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
