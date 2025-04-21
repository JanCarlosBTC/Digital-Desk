import React from 'react';
import { 
  DashboardPanel 
} from '../../../../shared/components/organisms/dashboard-panel.js';
import { Button } from '../../../../shared/components/atoms/button.js';
import { 
  BrainIcon, 
  LightbulbIcon, 
  ListChecksIcon, 
  BarChart3Icon, 
  PlusIcon,
  CalendarIcon,
  BuildingIcon
} from 'lucide-react';

import { DecisionCard } from '../../decision-log/components/decision-card.js';
import { MonthlyCheckInCard } from '../../personal-clarity/components/monthly-check-in-card.js';

/**
 * Dashboard Integration Example
 * 
 * This component demonstrates how to integrate various components
 * from different feature domains into a unified dashboard experience.
 */
export function DashboardIntegration() {
  // Sample data for different components
  const sampleDecision = {
    id: 1,
    title: "Select Technology Stack",
    context: "Evaluating options for frontend technology choices for the new project.",
    outcome: "Selected React with TypeScript and Tailwind CSS for the project.",
    reasoning: "The team has strong React experience, and TypeScript provides type safety. Tailwind CSS enables rapid UI development.",
    stakeholders: ["Engineering Team", "Product", "Design"],
    confidence: 4,
    createdAt: "2025-04-18"
  };
  
  const sampleMonthlyCheckIn = {
    id: 1,
    month: 4,
    year: 2025,
    reflections: "This month was productive with significant progress on key projects.",
    achievements: [
      "Completed the API integration phase ahead of schedule",
      "Presented architecture proposal to leadership",
      "Resolved 15 critical bugs in production"
    ],
    challenges: [
      "Team capacity constraints due to vacations",
      "Third-party API reliability issues"
    ],
    goalProgress: [
      { goal: "Complete Backend Refactoring", progress: 70 },
      { goal: "Reduce Technical Debt", progress: 45 },
      { goal: "Document Core Architecture", progress: 90 }
    ],
    focusAreas: ["System Architecture", "Code Quality", "Technical Documentation"]
  };
  
  // Mock event handlers
  const handleEditDecision = (id: number) => console.log('Editing decision:', id);
  const handleDeleteDecision = (id: number) => console.log('Deleting decision:', id);
  const handleEditCheckIn = (id: number) => console.log('Editing check-in:', id);
  const handleViewCheckInDetails = (id: number) => console.log('Viewing check-in details:', id);
  
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Integrated view of your productivity tools</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thinking Desk Panel */}
        <DashboardPanel
          title="Thinking Desk"
          description="Capture and organize your thoughts"
          icon={<BrainIcon size={20} />}
          domain="thinking-desk"
          actions={
            <Button 
              size="sm" 
              domain="thinking-desk"
              leadingIcon={<PlusIcon size={16} />}
            >
              New
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded-md border border-thinking-desk-primary/20 bg-thinking-desk-secondary/10">
              <div>
                <h3 className="font-medium">Brain Dump</h3>
                <p className="text-sm text-muted-foreground">Capture unfiltered thoughts</p>
              </div>
              <BuildingIcon className="text-thinking-desk-primary" size={18} />
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border border-thinking-desk-primary/20 bg-thinking-desk-secondary/10">
              <div>
                <h3 className="font-medium">Problem Trees</h3>
                <p className="text-sm text-muted-foreground">Break down complex problems</p>
              </div>
              <LightbulbIcon className="text-thinking-desk-primary" size={18} />
            </div>
          </div>
        </DashboardPanel>
        
        {/* Decision Log Panel */}
        <DashboardPanel
          title="Decision Log"
          description="Track important decisions and reasoning"
          icon={<ListChecksIcon size={20} />}
          domain="decision-log"
          actions={
            <Button 
              size="sm" 
              domain="decision-log"
              leadingIcon={<PlusIcon size={16} />}
            >
              Log Decision
            </Button>
          }
        >
          <DecisionCard 
            decision={sampleDecision}
            onEdit={handleEditDecision}
            onDelete={handleDeleteDecision}
          />
        </DashboardPanel>
        
        {/* Personal Clarity Panel */}
        <DashboardPanel
          title="Monthly Check-Ins"
          description="Reflect and plan your professional growth"
          icon={<CalendarIcon size={20} />}
          domain="personal-clarity"
          actions={
            <Button 
              size="sm" 
              domain="personal-clarity"
              leadingIcon={<PlusIcon size={16} />}
            >
              New Check-In
            </Button>
          }
        >
          <MonthlyCheckInCard 
            checkIn={sampleMonthlyCheckIn}
            onEdit={handleEditCheckIn}
            onViewDetails={handleViewCheckInDetails}
          />
        </DashboardPanel>
        
        {/* Offer Vault Panel */}
        <DashboardPanel
          title="Offer Vault"
          description="Manage and compare job offers"
          icon={<BarChart3Icon size={20} />}
          domain="offer-vault"
          actions={
            <Button 
              size="sm" 
              domain="offer-vault"
              leadingIcon={<PlusIcon size={16} />}
            >
              Add Offer
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-md border border-offer-vault-primary/20 bg-offer-vault-secondary/10">
              <div>
                <h3 className="font-medium">Senior Developer at TechCorp</h3>
                <p className="text-sm text-muted-foreground">$150,000 | Remote</p>
              </div>
              <span className="text-sm px-2 py-1 rounded-full bg-offer-vault-primary/20 text-offer-vault-primary">
                Active
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border border-offer-vault-primary/20 bg-offer-vault-secondary/10">
              <div>
                <h3 className="font-medium">Lead Engineer at StartupX</h3>
                <p className="text-sm text-muted-foreground">$142,000 | Hybrid</p>
              </div>
              <span className="text-sm px-2 py-1 rounded-full bg-muted text-muted-foreground">
                Pending
              </span>
            </div>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}