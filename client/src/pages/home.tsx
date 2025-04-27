import React from "react";
import ToolCard from "@/components/tool-card";
import { BrainIcon, ClipboardCheckIcon, ListChecksIcon, ArchiveIcon, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <section className="p-6 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to your Digital Desk</h1>
          <p className="text-gray-600 mt-2">Select a tool to get started with your productivity journey</p>
        </div>
        
        {!isLoading && !isAuthenticated && (
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href="/api/login">
              <LogInIcon className="w-4 h-4" />
              <span>Log In</span>
            </Link>
          </Button>
        )}
        
        {!isLoading && isAuthenticated && user && (
          <div className="text-sm text-gray-600">
            <span>Welcome back, </span>
            <span className="font-semibold">{user.username}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <ToolCard
          title="Thinking Desk"
          subtext="Organize your thoughts and ideas"
          description="A structured space for capturing ideas, solving problems, and planning initiatives."
          icon={BrainIcon}
          href="/thinking-desk"
          stats={{
            sections: 4,
            updatedText: "Updated 2h ago"
          }}
          color="primary"
        />

        <ToolCard
          title="Personal Clarity System"
          subtext="Track your progress and reflections"
          description="Review your journey with weekly reflections, monthly check-ins, and priority tracking."
          icon={ClipboardCheckIcon}
          href="/personal-clarity-system"
          stats={{
            sections: 3,
            updatedText: "Updated 1d ago"
          }}
          color="secondary"
        />

        <ToolCard
          title="Decision Log"
          subtext="Record and learn from your decisions"
          description="Document what you decided, why you made that choice, and what you'd do differently."
          icon={ListChecksIcon}
          href="/decision-log"
          stats={{
            entries: 12,
            updatedText: "Updated 3d ago"
          }}
          color="success"
        />

        <ToolCard
          title="Offer Vault"
          subtext="Refine your products and services"
          description="Store and iterate on your pricing, positioning, and product offerings over time."
          icon={ArchiveIcon}
          href="/offer-vault"
          stats={{
            entries: 5,
            updatedText: "Updated 1w ago"
          }}
          color="warning"
        />
      </div>
    </section>
  );
};

export default Home;
