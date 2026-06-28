import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense, useEffect } from "react";

const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Mirrored = lazy(() => import("./pages/Mirrored"));
const BidIndustrialPage = lazy(() => import("./pages/BidIndustrialPage"));
const NicheFloPage = lazy(() => import("./pages/NicheFloPage"));
const VowPage = lazy(() => import("./pages/VowPage"));
const TruckersDreamPage = lazy(() => import("./pages/TruckersDreamPage"));
const ApexPage = lazy(() => import("./pages/ApexPage"));
const CellularAutomataPage = lazy(() => import("./pages/CellularAutomataPage"));

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
        <Route path="/mirrored" component={Mirrored} />
        <Route path="/bidindustrial" component={BidIndustrialPage} />
        <Route path="/nicheflo" component={NicheFloPage} />
        <Route path="/vow" component={VowPage} />
        <Route path="/truckers-dream" component={TruckersDreamPage} />
        <Route path="/apex" component={ApexPage} />
        <Route path="/cellular-automata" component={CellularAutomataPage} />
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
