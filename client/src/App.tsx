import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";

const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090514]" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/faq" component={FAQ} />
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
