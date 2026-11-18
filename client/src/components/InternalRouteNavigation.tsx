/**
 * Keep same-origin links between the site's declared public routes in the
 * existing Wouter document. Native page loads briefly expose the hosting
 * fallback before a lazy route becomes ready on some publication surfaces.
 *
 * Ordinary anchors remain semantic and work with JS disabled. Download,
 * external, modified, same-page fragment, and non-public routes retain their
 * browser behavior. No new router, history store, or visual treatment.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import publicRoutes from "@/content/publicRoutes.json";

const clientRoutes = new Set<string>(publicRoutes);

export function resolveClientDestination(
  href: string | null,
  currentHref: string,
  knownRoutes: ReadonlySet<string> = clientRoutes,
): string | null {
  if (!href || href.startsWith("#") || href.startsWith("?") || href.startsWith("//")) {
    return null;
  }
  try {
    const current = new URL(currentHref);
    const destination = new URL(href, current);
    if (destination.origin !== current.origin || !["http:", "https:"].includes(destination.protocol)) {
      return null;
    }
    const route = destination.pathname.replace(/\/+$/, "") || "/";
    if (route === "/research-evidence" || !knownRoutes.has(route)) return null;
    // Let the browser handle native hash scrolling within the current page.
    if (route === (current.pathname.replace(/\/+$/, "") || "/") &&
        destination.search === current.search) {
      return null;
    }
    return route + destination.search + destination.hash;
  } catch {
    return null;
  }
}

export default function InternalRouteNavigation() {
  const [, navigate] = useLocation();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Preserve new-tab shortcuts, intentional event cancellation, and
      // non-left-click browser gestures.
      if (event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) ||
          anchor.hasAttribute("download") ||
          anchor.hasAttribute("data-native-navigation") ||
          (anchor.target && anchor.target !== "_self") ||
          anchor.relList.contains("external")) {
        return;
      }
      const destination = resolveClientDestination(
        anchor.getAttribute("href"),
        window.location.href,
      );
      if (destination === null) return;

      event.preventDefault();
      navigate(destination);
    }

    // Bubble after existing React handlers so links that intentionally
    // prevent default remain untouched (mobile menu state is also preserved).
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return null;
}
