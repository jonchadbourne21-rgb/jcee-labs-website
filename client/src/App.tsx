import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense, useEffect } from "react";

const AssurancePage = lazy(() => import("./pages/AssurancePage"));
const CareerPortfolio = lazy(() => import("./pages/CareerPortfolio"));
const CharterV11 = lazy(() => import("./pages/CharterV11"));
const CharterV10 = lazy(() => import("./pages/Charter"));
const PublicRegistry = lazy(() => import("./pages/PublicRegistry"));
const Jrp000 = lazy(() => import("./pages/Jrp000"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VowPage = lazy(() => import("./pages/VowPage"));
const QcsPage = lazy(() => import("./pages/QcsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PricingAdmin = lazy(() => import("./pages/PricingAdmin"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const EnterprisePartnersPage = lazy(
  () => import("./pages/EnterprisePartnersPage")
);
const ResearchPartnersPage = lazy(() => import("./pages/ResearchPartnersPage"));

const DistributionPage = lazy(() => import("./pages/DistributionPage"));
const OperatingCloudPage = lazy(() => import("./pages/OperatingCloudPage"));
const TechnologyPage = lazy(() => import("./pages/TechnologyPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const ResearchFieldsPage = lazy(() => import("./pages/ResearchFieldsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const PublicationPage = lazy(() => import("./pages/PublicationPage"));
const BB84PaperPage = lazy(() => import("./pages/BB84PaperPage"));

function RouteShimmer() {
  return (
    <div className="route-shimmer-container">
      <div className="route-shimmer-bar" />
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timeout: number | undefined;

    const clearObserver = () => {
      observer?.disconnect();
      observer = null;
      if (timeout !== undefined) window.clearTimeout(timeout);
      timeout = undefined;
    };

    const scrollToHashTarget = () => {
      const fragment = window.location.hash.slice(1);
      if (!fragment) {
        clearObserver();
        window.scrollTo(0, 0);
        return;
      }

      let targetId = fragment;
      try {
        targetId = decodeURIComponent(fragment);
      } catch {
        // Keep the literal fragment when it cannot be decoded.
      }

      const target = document.getElementById(targetId);
      if (target) {
        clearObserver();
        target.scrollIntoView({ block: "start" });
        return;
      }

      // Lazy route content may not have mounted when the pathname changes.
      if (!observer) {
        observer = new MutationObserver(() => {
          if (document.getElementById(targetId)) scrollToHashTarget();
        });
        observer.observe(document.getElementById("root") ?? document.body, {
          childList: true,
          subtree: true,
        });
        timeout = window.setTimeout(clearObserver, 10000);
      }
    };

    const frame = window.requestAnimationFrame(scrollToHashTarget);
    window.addEventListener("hashchange", scrollToHashTarget);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHashTarget);
      clearObserver();
    };
  }, [location]);

  return (
    <Suspense fallback={<RouteShimmer />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/solutions/distribution" component={DistributionPage} />
        <Route path="/operating-cloud" component={OperatingCloudPage} />
        <Route
          path="/blog/what-is-an-evidence-boundary"
          component={PublicationPage}
        />
        <Route path="/blog/the-work-nobody-sees" component={PublicationPage} />
        <Route path="/blog/after-an-ai-says-done" component={PublicationPage} />
        <Route
          path="/blog/a-research-result-needs-a-boundary"
          component={PublicationPage}
        />
        <Route path="/research/bb84-communication" component={BB84PaperPage} />
        <Route
          path="/blog/a-confident-model-still-needs-permission"
          component={PublicationPage}
        />
        <Route
          path="/research/crucible-composition-tax"
          component={PublicationPage}
        />
        <Route path="/technology" component={TechnologyPage} />
        <Route path="/research/fields" component={ResearchFieldsPage} />
        <Route path="/research" component={ResearchPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/company" component={CompanyPage} />
        <Route
          path="/blog/start-with-the-workflow"
          component={PublicationPage}
        />
        <Route
          path="/blog/distribution-first-dry-run"
          component={PublicationPage}
        />
        <Route
          path="/research/qcs-frozen-specification-reproduction"
          component={PublicationPage}
        />
        <Route
          path="/research/crucible-semantic-kernel"
          component={PublicationPage}
        />
        <Route path="/portfolio" component={CareerPortfolio} />
        <Route path="/charter/archive/v1.0" component={CharterV10} />
        <Route path="/charter" component={CharterV11} />
        <Route path="/registry" component={PublicRegistry} />
        <Route path="/research-evidence" component={PublicRegistry} />
        <Route path="/assurance" component={AssurancePage} />
        <Route path="/research/jrp-000" component={Jrp000} />
        <Route path="/vow" component={VowPage} />
        <Route path="/qcs" component={QcsPage} />
        <Route path="/partners/enterprise" component={EnterprisePartnersPage} />
        <Route path="/partners/research" component={ResearchPartnersPage} />
        <Route path="/partners" component={PartnersPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/pricing" component={PricingAdmin} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    document.getElementById("root")?.setAttribute("data-client-ready", "true");
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
