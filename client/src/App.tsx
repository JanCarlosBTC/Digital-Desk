import React from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Home from "@/pages/home";
import ThinkingDesk from "@/pages/thinking-desk";
import PersonalClaritySystem from "@/pages/personal-clarity-system";
import DecisionLog from "@/pages/decision-log";
import OfferVault from "@/pages/offer-vault";
import SubscriptionPlans from "@/pages/subscription-plans";
import SubscriptionSuccess from "@/pages/subscription-success";
import Login from "@/pages/login";
import AccountSettings from "@/pages/account-settings";
import DemoPage from "@/pages/demo-page";
import { PageTransition } from "@/components/transitions/simple-page-transition";
import { UserProvider } from "@/context/user-context";
import { DemoStorageProvider } from "@/context/demo-storage-context";
import { useAuth } from "./hooks/useAuth";

// Protected route component that redirects to login if user is not authenticated
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // While checking authentication status, render nothing to avoid flashing content
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  // If authenticated, render the component, otherwise redirect to login
  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/login" />;
}

// Enhanced router with page transitions and authentication
function Router() {
  const [location] = useLocation();
  
  // Return different layouts based on route
  return (
    <>
      {location === "/login" ? (
        // Login page has its own layout
        <PageTransition motionKey={location}>
          <Login />
        </PageTransition>
      ) : (
        // All other pages use AppLayout
        <AppLayout>
          <PageTransition motionKey={location}>
            <Switch location={location}>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              
              {/* Protected routes that require authentication */}
              <Route path="/thinking-desk">
                <ProtectedRoute component={ThinkingDesk} />
              </Route>
              <Route path="/personal-clarity-system">
                <ProtectedRoute component={PersonalClaritySystem} />
              </Route>
              <Route path="/decision-log">
                <ProtectedRoute component={DecisionLog} />
              </Route>
              <Route path="/offer-vault">
                <ProtectedRoute component={OfferVault} />
              </Route>
              <Route path="/account-settings">
                <ProtectedRoute component={AccountSettings} />
              </Route>
              <Route path="/subscription-plans">
                <ProtectedRoute component={SubscriptionPlans} />
              </Route>
              <Route path="/subscription-success">
                <ProtectedRoute component={SubscriptionSuccess} />
              </Route>
              <Route path="/demo" component={DemoPage} />
              <Route component={NotFound} />
            </Switch>
          </PageTransition>
        </AppLayout>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <DemoStorageProvider>
          <Router />
          <Toaster />
        </DemoStorageProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
