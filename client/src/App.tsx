import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense, useEffect } from "react";

const FAQ = lazy(() => import("./pages/FAQ"));
const Charter = lazy(() => import("./pages/Charter"));
const ResearchEvidence = lazy(() => import("./pages/ResearchEvidence"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Mirrored = lazy(() => import("./pages/Mirrored"));
const VowPage = lazy(() => import("./pages/VowPage"));
const QcsPage = lazy(() => import("./pages/QcsPage"));
const TrueRPMPage = lazy(() => import("./pages/TrueRPMPage"));
const NicheFloPage = lazy(() => import("./pages/NicheFloPage"));
const FloCraftPage = lazy(() => import("./pages/FloCraftPage"));
const RoohPage = lazy(() => import("./pages/RoohPage"));
const RevelPage = lazy(() => import("./pages/RevelPage"));
const SOPForgePage = lazy(() => import("./pages/SOPForgePage"));
const BabodiePage = lazy(() => import("./pages/BabodiePage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PricingAdmin = lazy(() => import("./pages/PricingAdmin"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));

function Router() {
  const [location] = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090514]" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/faq" component={FAQ} />
        <Route path="/charter" component={Charter} />
        <Route path="/research-evidence" component={ResearchEvidence} />
        <Route path="/research/jrp-000" component={Jrp000} />
        <Route path="/vow" component={VowPage} />
        <Route path="/qcs" component={QcsPage} />
        <Route path="/mirrored" component={Mirrored} />
        <Route path="/truerpm" component={TrueRPMPage} />
        <Route path="/nicheflo" component={NicheFloPage} />
        <Route path="/flocraft" component={FloCraftPage} />
        <Route path="/rooh" component={RoohPage} />
        <Route path="/revel" component={RevelPage} />
        <Route path="/sopforge" component={SOPForgePage} />
        <Route path="/babodie" component={BabodiePage} />
        <Route path="/team" component={TeamPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/pricing" component={PricingAdmin} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
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
