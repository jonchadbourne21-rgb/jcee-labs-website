import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export type CoreHeaderCurrent =
  | "jcee"
  | "vow"
  | "qcs"
  | "assurance"
  | "registry"
  | "charter"
  | "research"
  | "mirrored";

type CoreHeaderProps = {
  current?: CoreHeaderCurrent;
};

export const publicNavigationLinks = [
  { id: "jcee", label: "JCEE LABS", href: "/#company" },
  { id: "vow", label: "JCEE VOW", href: "/vow" },
  { id: "qcs", label: "QCS", href: "/qcs" },
  { id: "assurance", label: "ASSURANCE", href: "/assurance" },
  { id: "registry", label: "REGISTRY", href: "/registry" },
  { id: "charter", label: "CHARTER", href: "/charter" },
] as const;

export const getMobileMenuLabel = (menuOpen: boolean) =>
  menuOpen ? "Close navigation menu" : "Open navigation menu";

export const getMobileMenuState = (menuOpen: boolean) =>
  menuOpen ? "is-open" : "is-closed";

export default function CoreHeader({ current }: CoreHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

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
    publicNavigationLinks.map((link, index) => (
      <a
        key={link.id}
        href={link.href}
        aria-current={current === link.id ? "page" : undefined}
        tabIndex={mobile && !menuOpen ? -1 : undefined}
        ref={mobile && index === 0 ? firstMobileLinkRef : undefined}
        onClick={mobile ? closeMobileMenu : undefined}
      >
        {link.label}
      </a>
    ));

  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="JCEE Labs home">
        <img
          className="wordmark-mark"
          src="/brand/jcee-labs-mark.png"
          alt=""
          aria-hidden="true"
        />
        <span>JCEE LABS</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {renderLinks()}
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
            onClick={() => setMenuOpen((open) => !open)}
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

        <a className="header-contact" href="mailto:support@jceelabs.com">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => toggleTheme?.()}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={!isDark}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun aria-hidden="true" size={13} />
          ) : (
            <Moon aria-hidden="true" size={13} />
          )}
          <span>{isDark ? "LIGHT" : "DARK"}</span>
        </button>
      </div>
    </header>
  );
}
