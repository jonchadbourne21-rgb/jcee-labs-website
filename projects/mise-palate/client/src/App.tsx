import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const CookMode = lazy(() => import("./pages/CookMode"));
const Discover = lazy(() => import("./pages/Discover"));
const Knowledge = lazy(() => import("@/pages/Knowledge"));
const FoodLens = lazy(() => import("@/pages/FoodLens"));
const Me = lazy(() => import("./pages/Me"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Recipe = lazy(() => import("./pages/Recipe"));
const Saved = lazy(() => import("./pages/Saved"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/discover" component={Discover} />
      <Route path="/recipe/:id" component={Recipe} />
      <Route path="/cook/:id" component={CookMode} />
      <Route path="/cook" component={CookMode} />
      <Route path="/saved" component={Saved} />
      <Route path="/me" component={Me} />
      <Route path={"/knowledge"} component={Knowledge} />
      <Route path={"/lens"} component={FoodLens} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Suspense fallback={<div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-muted-ink">Preparing your station…</div>}>
            <Router />
          </Suspense>
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
