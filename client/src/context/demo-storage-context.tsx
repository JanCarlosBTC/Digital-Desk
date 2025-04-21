import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { demoStorage } from '@/services/demo-storage-service';
import { useToast } from '@/hooks/use-toast';

// Demo data types
export interface DemoInsight {
  id: number;
  title: string;
  description: string;
  source: string;
  tags: string[];
  impact: 'High' | 'Medium' | 'Low';
  status: 'New' | 'Applied' | 'Archived';
  appliedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoClarityLab {
  id: number;
  title: string;
  description: string;
  category: string[];
  status: 'Draft' | 'InProgress' | 'Completed';
  completedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoOffer {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Archived' | 'Draft';
  price: string;
  category: string;
  duration?: string;
  format?: string;
  clientCount: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoWeeklyReflection {
  id: number;
  weekDate: Date;
  wentWell: string;
  challenges: string;
  learnings: string;
  nextWeekFocus: string;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoDecision {
  id: number;
  title: string;
  category: string;
  decisionDate: Date;
  why: string;
  alternatives: string;
  expectedOutcome: string;
  followUpDate: Date | null;
  status: 'Pending' | 'Implemented' | 'Abandoned';
  whatDifferent: string;
  createdAt: Date;
  updatedAt: Date;
}

// Demo context type
interface DemoStorageContextType {
  // Insights
  insights: DemoInsight[];
  addInsight: (insight: Omit<DemoInsight, 'id' | 'createdAt' | 'updatedAt'>) => DemoInsight;
  updateInsight: (id: number, insight: Partial<DemoInsight>) => void;
  deleteInsight: (id: number) => void;
  getInsight: (id: number) => DemoInsight | undefined;
  
  // Clarity Labs
  clarityLabs: DemoClarityLab[];
  addClarityLab: (lab: Omit<DemoClarityLab, 'id' | 'createdAt' | 'updatedAt'>) => DemoClarityLab;
  updateClarityLab: (id: number, lab: Partial<DemoClarityLab>) => void;
  deleteClarityLab: (id: number) => void;
  getClarityLab: (id: number) => DemoClarityLab | undefined;
  
  // Offers
  offers: DemoOffer[];
  addOffer: (offer: Omit<DemoOffer, 'id' | 'createdAt' | 'updatedAt'>) => DemoOffer;
  updateOffer: (id: number, offer: Partial<DemoOffer>) => void;
  deleteOffer: (id: number) => void;
  getOffer: (id: number) => DemoOffer | undefined;
  
  // Decisions
  decisions: DemoDecision[];
  addDecision: (decision: Omit<DemoDecision, 'id' | 'createdAt' | 'updatedAt'>) => DemoDecision;
  updateDecision: (id: number, decision: Partial<DemoDecision>) => void;
  deleteDecision: (id: number) => void;
  getDecision: (id: number) => DemoDecision | undefined;
  
  // Weekly Reflections
  weeklyReflections: DemoWeeklyReflection[];
  addWeeklyReflection: (reflection: Omit<DemoWeeklyReflection, 'id' | 'createdAt' | 'updatedAt'>) => DemoWeeklyReflection;
  updateWeeklyReflection: (id: number, reflection: Partial<DemoWeeklyReflection>) => void;
  deleteWeeklyReflection: (id: number) => void;
  getWeeklyReflection: (id: number) => DemoWeeklyReflection | undefined;
  
  // General
  clearAllDemoData: () => void;
  timeRemaining: number;
  formattedTimeRemaining: string;
  resetExpirationTimer: () => void;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
}

// Create context
const DemoStorageContext = createContext<DemoStorageContextType | null>(null);

// Create provider
export const DemoStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Storage keys
  const INSIGHTS_KEY = 'insights';
  const CLARITY_LABS_KEY = 'clarity_labs';
  const OFFERS_KEY = 'offers';
  const DECISIONS_KEY = 'decisions';
  const WEEKLY_REFLECTIONS_KEY = 'weekly_reflections';
  const DEMO_MODE_KEY = 'demo_mode';
  
  // Load initial data from storage or use empty arrays
  const [insights, setInsights] = useState<DemoInsight[]>(() => {
    return demoStorage.getItem<DemoInsight[]>(INSIGHTS_KEY) || [];
  });
  
  const [clarityLabs, setClarityLabs] = useState<DemoClarityLab[]>(() => {
    return demoStorage.getItem<DemoClarityLab[]>(CLARITY_LABS_KEY) || [];
  });
  
  const [offers, setOffers] = useState<DemoOffer[]>(() => {
    return demoStorage.getItem<DemoOffer[]>(OFFERS_KEY) || [];
  });
  
  const [decisions, setDecisions] = useState<DemoDecision[]>(() => {
    return demoStorage.getItem<DemoDecision[]>(DECISIONS_KEY) || [];
  });
  
  const [weeklyReflections, setWeeklyReflections] = useState<DemoWeeklyReflection[]>(() => {
    return demoStorage.getItem<DemoWeeklyReflection[]>(WEEKLY_REFLECTIONS_KEY) || [];
  });
  
  // Demo mode toggle - whether to use demo storage or real API
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    return demoStorage.getItem<boolean>(DEMO_MODE_KEY) || false;
  });
  
  // Track time remaining
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    // Use the main collections for checking expiration
    return demoStorage.getTimeRemaining(INSIGHTS_KEY);
  });
  
  // Set demo mode
  const setDemoMode = useCallback((mode: boolean) => {
    setDemoModeState(mode);
    demoStorage.setItem(DEMO_MODE_KEY, mode);
    
    if (mode) {
      toast({
        title: 'Demo Mode Activated',
        description: 'Data will be stored locally and expire after 4 hours.',
      });
    } else {
      toast({
        title: 'Demo Mode Deactivated',
        description: 'Using normal API storage.',
      });
    }
  }, [toast]);
  
  // Update timeRemaining periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Check any of our collections for time remaining
      const remaining = demoStorage.getTimeRemaining(INSIGHTS_KEY);
      setTimeRemaining(remaining);
      
      // Show toast when 30 minutes remaining
      if (remaining > 0 && remaining <= 30 * 60 * 1000 && remaining > 29 * 60 * 1000) {
        toast({
          title: 'Demo Expiration Warning',
          description: 'Demo data will expire in about 30 minutes.',
          variant: 'warning',
        });
      }
      
      // Show toast when 5 minutes remaining
      if (remaining > 0 && remaining <= 5 * 60 * 1000 && remaining > 4 * 60 * 1000) {
        toast({
          title: 'Demo Expiration Warning',
          description: 'Demo data will expire in about 5 minutes.',
          variant: 'destructive',
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [toast]);
  
  // Format time remaining
  const formattedTimeRemaining = useMemo(() => {
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }, [timeRemaining]);
  
  // Reset expiration timer
  const resetExpirationTimer = useCallback(() => {
    // Resave all collections to reset their timestamps
    demoStorage.setItem(INSIGHTS_KEY, insights);
    demoStorage.setItem(CLARITY_LABS_KEY, clarityLabs);
    demoStorage.setItem(OFFERS_KEY, offers);
    demoStorage.setItem(DECISIONS_KEY, decisions);
    demoStorage.setItem(WEEKLY_REFLECTIONS_KEY, weeklyReflections);
    
    setTimeRemaining(4 * 60 * 60 * 1000); // Reset to 4 hours
    
    toast({
      title: 'Demo Timer Reset',
      description: 'Your demo data will now be available for another 4 hours.',
    });
  }, [insights, clarityLabs, offers, decisions, weeklyReflections, toast]);
  
  // CRUD operations for insights
  const addInsight = useCallback((insight: Omit<DemoInsight, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newInsight: DemoInsight = {
      ...insight,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    
    setInsights(prev => {
      const updated = [...prev, newInsight];
      demoStorage.setItem(INSIGHTS_KEY, updated);
      return updated;
    });
    
    return newInsight;
  }, []);
  
  const updateInsight = useCallback((id: number, insightData: Partial<DemoInsight>) => {
    setInsights(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...insightData,
        updatedAt: new Date(),
      };
      
      demoStorage.setItem(INSIGHTS_KEY, updated);
      return updated;
    });
  }, []);
  
  const deleteInsight = useCallback((id: number) => {
    setInsights(prev => {
      const updated = prev.filter(i => i.id !== id);
      demoStorage.setItem(INSIGHTS_KEY, updated);
      return updated;
    });
  }, []);
  
  const getInsight = useCallback((id: number) => {
    return insights.find(i => i.id === id);
  }, [insights]);
  
  // CRUD operations for clarity labs
  const addClarityLab = useCallback((lab: Omit<DemoClarityLab, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newLab: DemoClarityLab = {
      ...lab,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    
    setClarityLabs(prev => {
      const updated = [...prev, newLab];
      demoStorage.setItem(CLARITY_LABS_KEY, updated);
      return updated;
    });
    
    return newLab;
  }, []);
  
  const updateClarityLab = useCallback((id: number, labData: Partial<DemoClarityLab>) => {
    setClarityLabs(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...labData,
        updatedAt: new Date(),
      };
      
      demoStorage.setItem(CLARITY_LABS_KEY, updated);
      return updated;
    });
  }, []);
  
  const deleteClarityLab = useCallback((id: number) => {
    setClarityLabs(prev => {
      const updated = prev.filter(l => l.id !== id);
      demoStorage.setItem(CLARITY_LABS_KEY, updated);
      return updated;
    });
  }, []);
  
  const getClarityLab = useCallback((id: number) => {
    return clarityLabs.find(l => l.id === id);
  }, [clarityLabs]);
  
  // CRUD operations for offers
  const addOffer = useCallback((offer: Omit<DemoOffer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newOffer: DemoOffer = {
      ...offer,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    
    setOffers(prev => {
      const updated = [...prev, newOffer];
      demoStorage.setItem(OFFERS_KEY, updated);
      return updated;
    });
    
    return newOffer;
  }, []);
  
  const updateOffer = useCallback((id: number, offerData: Partial<DemoOffer>) => {
    setOffers(prev => {
      const index = prev.findIndex(o => o.id === id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...offerData,
        updatedAt: new Date(),
      };
      
      demoStorage.setItem(OFFERS_KEY, updated);
      return updated;
    });
  }, []);
  
  const deleteOffer = useCallback((id: number) => {
    setOffers(prev => {
      const updated = prev.filter(o => o.id !== id);
      demoStorage.setItem(OFFERS_KEY, updated);
      return updated;
    });
  }, []);
  
  const getOffer = useCallback((id: number) => {
    return offers.find(o => o.id === id);
  }, [offers]);
  
  // CRUD operations for decisions
  const addDecision = useCallback((decision: Omit<DemoDecision, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newDecision: DemoDecision = {
      ...decision,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    
    setDecisions(prev => {
      const updated = [...prev, newDecision];
      demoStorage.setItem(DECISIONS_KEY, updated);
      return updated;
    });
    
    return newDecision;
  }, []);
  
  const updateDecision = useCallback((id: number, decisionData: Partial<DemoDecision>) => {
    setDecisions(prev => {
      const index = prev.findIndex(d => d.id === id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...decisionData,
        updatedAt: new Date(),
      };
      
      demoStorage.setItem(DECISIONS_KEY, updated);
      return updated;
    });
  }, []);
  
  const deleteDecision = useCallback((id: number) => {
    setDecisions(prev => {
      const updated = prev.filter(d => d.id !== id);
      demoStorage.setItem(DECISIONS_KEY, updated);
      return updated;
    });
  }, []);
  
  const getDecision = useCallback((id: number) => {
    return decisions.find(d => d.id === id);
  }, [decisions]);
  
  // CRUD operations for weekly reflections
  const addWeeklyReflection = useCallback((reflection: Omit<DemoWeeklyReflection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newReflection: DemoWeeklyReflection = {
      ...reflection,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    
    setWeeklyReflections(prev => {
      const updated = [...prev, newReflection];
      demoStorage.setItem(WEEKLY_REFLECTIONS_KEY, updated);
      return updated;
    });
    
    return newReflection;
  }, []);
  
  const updateWeeklyReflection = useCallback((id: number, reflectionData: Partial<DemoWeeklyReflection>) => {
    setWeeklyReflections(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index === -1) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...reflectionData,
        updatedAt: new Date(),
      };
      
      demoStorage.setItem(WEEKLY_REFLECTIONS_KEY, updated);
      return updated;
    });
  }, []);
  
  const deleteWeeklyReflection = useCallback((id: number) => {
    setWeeklyReflections(prev => {
      const updated = prev.filter(r => r.id !== id);
      demoStorage.setItem(WEEKLY_REFLECTIONS_KEY, updated);
      return updated;
    });
  }, []);
  
  const getWeeklyReflection = useCallback((id: number) => {
    return weeklyReflections.find(r => r.id === id);
  }, [weeklyReflections]);
  
  // Clear all demo data
  const clearAllDemoData = useCallback(() => {
    demoStorage.clearAll();
    setInsights([]);
    setClarityLabs([]);
    setOffers([]);
    setDecisions([]);
    setWeeklyReflections([]);
    
    toast({
      title: 'Demo Data Cleared',
      description: 'All demo data has been removed.',
    });
  }, [toast]);
  
  // Value to provide
  const contextValue: DemoStorageContextType = {
    // Insights
    insights,
    addInsight,
    updateInsight,
    deleteInsight,
    getInsight,
    
    // Clarity Labs
    clarityLabs,
    addClarityLab,
    updateClarityLab,
    deleteClarityLab,
    getClarityLab,
    
    // Offers
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    getOffer,
    
    // Decisions
    decisions,
    addDecision,
    updateDecision,
    deleteDecision,
    getDecision,
    
    // Weekly Reflections
    weeklyReflections,
    addWeeklyReflection,
    updateWeeklyReflection,
    deleteWeeklyReflection,
    getWeeklyReflection,
    
    // General
    clearAllDemoData,
    timeRemaining,
    formattedTimeRemaining,
    resetExpirationTimer,
    demoMode,
    setDemoMode,
  };
  
  return (
    <DemoStorageContext.Provider value={contextValue}>
      {children}
    </DemoStorageContext.Provider>
  );
};

// Custom hook to use demo storage
export function useDemoStorage() {
  const context = useContext(DemoStorageContext);
  if (!context) {
    throw new Error('useDemoStorage must be used within a DemoStorageProvider');
  }
  return context;
}