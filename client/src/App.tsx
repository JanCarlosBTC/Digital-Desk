import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Home from "@/pages/home";
import ThinkingDesk from "@/pages/thinking-desk-new"; // Using our completely new implementation
import PersonalClaritySystem from "@/pages/personal-clarity-system";
import DecisionLog from "@/pages/decision-log";
import OfferVault from "@/pages/offer-vault";
import { PageTransition } from "@/components/transitions/simple-page-transition";

// Enhanced router with page transitions
function Router() {
  const [location] = useLocation();
  
  return (
    <AppLayout>
      <PageTransition>
        <Switch location={location}>
          <Route path="/" component={Home} />
          <Route path="/thinking-desk" component={ThinkingDesk} />
          <Route path="/personal-clarity-system" component={PersonalClaritySystem} />
          <Route path="/decision-log" component={DecisionLog} />
          <Route path="/offer-vault" component={OfferVault} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
