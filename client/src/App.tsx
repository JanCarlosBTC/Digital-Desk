import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Home from "@/pages/home";
import ThinkingDesk from "@/pages/thinking-desk"; // Using the original Thinking Desk implementation
import PersonalClaritySystem from "@/pages/personal-clarity-system";
import DecisionLog from "@/pages/decision-log";
import OfferVault from "@/pages/offer-vault";
import SubscriptionPlans from "@/pages/subscription-plans";
import SubscriptionSuccess from "@/pages/subscription-success";
import Login from "@/pages/login";
import { PageTransition } from "@/components/transitions/simple-page-transition";
import { UserProvider } from "@/context/user-context";

// Enhanced router with page transitions
function Router() {
  const [location] = useLocation();
  
  // Don't use AppLayout for authentication pages
  if (location === "/login") {
    return (
      <Switch location={location}>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }
  
  return (
    <AppLayout>
      <PageTransition motionKey={location}>
        <Switch location={location}>
          <Route path="/" component={Home} />
          <Route path="/thinking-desk" component={ThinkingDesk} />
          <Route path="/personal-clarity-system" component={PersonalClaritySystem} />
          <Route path="/decision-log" component={DecisionLog} />
          <Route path="/offer-vault" component={OfferVault} />
          <Route path="/subscription-plans" component={SubscriptionPlans} />
          <Route path="/subscription-success" component={SubscriptionSuccess} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
