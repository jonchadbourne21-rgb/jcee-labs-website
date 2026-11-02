import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type CoreHeaderCurrent =
  | "jcee"
  | "vow"
  | "qcs"
  | "assurance"
  | "registry"
  | "charter"
  | "partners"
  | "research"
  | "mirrored"
  | "solutions"
  | "technology"
  | "resources"
  | "company";

type CoreHeaderProps = {
  current?: CoreHeaderCurrent;
  integrated?: boolean;
  contactLabel?: string;
  contactHref?: string;
};

export const publicNavigationLinks = [
  { id: "solutions", label: "Infrastructure", href: "/capabilities/infrastructure" },
  { id: "technology", label: "Technology", href: "/technology" },
  { id: "research", label: "Research", href: "/research" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "company", label: "Company", href: "/company" },
] as const;

export const getMobileMenuLabel = (menuOpen: boolean) =>
  menuOpen ? "Close navigation menu" : "Open navigation menu";

export const getMobileMenuState = (menuOpen: boolean) =>
  menuOpen ? "is-open" : "is-closed";

export default function CoreHeader({
  current,
  integrated = false,
  contactLabel = "Let’s talk",
  contactHref = `${import.meta.env.BASE_URL}consultation`,
}: CoreHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const companyMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    const close = (event: PointerEvent) => {
      if (!companyMenuRef.current?.contains(event.target as Node)) companyMenuRef.current?.removeAttribute("open");
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && companyMenuRef.current?.open) {
        companyMenuRef.current.removeAttribute("open");
        companyMenuRef.current.querySelector("summary")?.focus();
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [integrated]);

  const mobileMenuLabel = getMobileMenuLabel(menuOpen);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    mobileMenuToggleRef.current?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    firstMobileLinkRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const renderLinks = (mobile = false) =>
    publicNavigationLinks.filter(link => mobile || (link.id !== "resources" && link.id !== "company")).map((link, index) => (
      <a
        key={link.id}
        href={link.href}
        aria-current={
          current === link.id ||
          (link.id === "technology" &&
            ["vow", "qcs", "assurance"].includes(current ?? "")) ||
          (link.id === "resources" && current === "registry") ||
          (link.id === "company" &&
            ["jcee", "charter", "partners"].includes(current ?? ""))
            ? "page"
            : undefined
        }
        tabIndex={mobile && !menuOpen ? -1 : undefined}
        ref={mobile && index === 0 ? firstMobileLinkRef : undefined}
        onClick={mobile ? closeMobileMenu : undefined}
      >
        {link.label}
      </a>
    ));

  return (
    <header className={`site-header${integrated ? " integrated-header" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <a className="skip-link" href="#page-content">
        Skip to content
      </a>
      <a className="wordmark" href="/" aria-label="JCEE WorldLab home">
        <img
          className="wordmark-mark"
          src="/brand/jcee-labs-mark.png"
          alt=""
          aria-hidden="true"
        />
        <span>JCEE WorldLab</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {renderLinks()}
        {<details className="header-company-menu" ref={companyMenuRef}>
          <summary>Company <span aria-hidden="true">⌄</span></summary>
          <div className="header-company-links">
            <a href="/company">About JCEE WorldLab</a>
            <a href="/resources">Resources</a>
          </div>
        </details>}
      </nav>

      <div className="header-actions">
        <div className="mobile-menu" ref={mobileMenuRef}>
          <button
            ref={mobileMenuToggleRef}
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuLabel}
            title={mobileMenuLabel}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? (
              <X aria-hidden="true" size={17} />
            ) : (
              <Menu aria-hidden="true" size={17} />
            )}
          </button>
          <nav
            id="mobile-navigation"
            className={`mobile-nav ${getMobileMenuState(menuOpen)}`}
            aria-hidden={!menuOpen}
            aria-label="Mobile navigation"
          >
            {renderLinks(true)}
          </nav>
        </div>

        <a className="header-contact" href={contactHref}>
          <span className={contactLabel === "Discuss your workflow" ? "contact-label-full" : undefined}>{contactLabel}</span>
          {contactLabel === "Discuss your workflow" && <span className="contact-label-short">Let’s talk</span>}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
