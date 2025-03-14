import {
  users, User, InsertUser,
  brainDumps, BrainDump, InsertBrainDump,
  problemTrees, ProblemTree, InsertProblemTree,
  draftedPlans, DraftedPlan, InsertDraftedPlan,
  clarityLabs, ClarityLab, InsertClarityLab,
  weeklyReflections, WeeklyReflection, InsertWeeklyReflection,
  monthlyCheckIns, MonthlyCheckIn, InsertMonthlyCheckIn,
  priorities, Priority, InsertPriority,
  decisions, Decision, InsertDecision,
  offers, Offer, InsertOffer,
  offerNotes, OfferNote, InsertOfferNote,
  activities, Activity, InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Brain Dump methods
  getBrainDumpByUserId(userId: number): Promise<BrainDump | undefined>;
  createBrainDump(brainDump: InsertBrainDump): Promise<BrainDump>;
  updateBrainDump(id: number, content: string): Promise<BrainDump | undefined>;
  
  // Problem Tree methods
  getProblemTrees(userId: number): Promise<ProblemTree[]>;
  getProblemTree(id: number): Promise<ProblemTree | undefined>;
  createProblemTree(problemTree: InsertProblemTree): Promise<ProblemTree>;
  updateProblemTree(id: number, problemTree: Partial<InsertProblemTree>): Promise<ProblemTree | undefined>;
  deleteProblemTree(id: number): Promise<boolean>;
  
  // Drafted Plans methods
  getDraftedPlans(userId: number): Promise<DraftedPlan[]>;
  getDraftedPlan(id: number): Promise<DraftedPlan | undefined>;
  createDraftedPlan(draftedPlan: InsertDraftedPlan): Promise<DraftedPlan>;
  updateDraftedPlan(id: number, draftedPlan: Partial<InsertDraftedPlan>): Promise<DraftedPlan | undefined>;
  
  // Clarity Lab methods
  getClarityLabs(userId: number, category?: string): Promise<ClarityLab[]>;
  getClarityLab(id: number): Promise<ClarityLab | undefined>;
  createClarityLab(clarityLab: InsertClarityLab): Promise<ClarityLab>;
  
  // Weekly Reflections methods
  getWeeklyReflections(userId: number): Promise<WeeklyReflection[]>;
  getWeeklyReflection(id: number): Promise<WeeklyReflection | undefined>;
  createWeeklyReflection(weeklyReflection: InsertWeeklyReflection): Promise<WeeklyReflection>;
  updateWeeklyReflection(id: number, weeklyReflection: Partial<InsertWeeklyReflection>): Promise<WeeklyReflection | undefined>;
  
  // Monthly Check-in methods
  getMonthlyCheckIns(userId: number): Promise<MonthlyCheckIn[]>;
  getMonthlyCheckInByMonthYear(userId: number, month: number, year: number): Promise<MonthlyCheckIn | undefined>;
  createMonthlyCheckIn(monthlyCheckIn: InsertMonthlyCheckIn): Promise<MonthlyCheckIn>;
  updateMonthlyCheckIn(id: number, monthlyCheckIn: Partial<InsertMonthlyCheckIn>): Promise<MonthlyCheckIn | undefined>;
  
  // Priorities methods
  getPriorities(userId: number): Promise<Priority[]>;
  createPriority(priority: InsertPriority): Promise<Priority>;
  updatePriority(id: number, priority: Partial<InsertPriority>): Promise<Priority | undefined>;
  deletePriority(id: number): Promise<boolean>;
  
  // Decision methods
  getDecisions(userId: number): Promise<Decision[]>;
  getDecision(id: number): Promise<Decision | undefined>;
  createDecision(decision: InsertDecision): Promise<Decision>;
  updateDecision(id: number, decision: Partial<InsertDecision>): Promise<Decision | undefined>;
  
  // Offer methods
  getOffers(userId: number): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined>;
  
  // Offer Notes methods
  getOfferNotesByUserId(userId: number): Promise<OfferNote | undefined>;
  createOfferNote(offerNote: InsertOfferNote): Promise<OfferNote>;
  updateOfferNote(id: number, content: string): Promise<OfferNote | undefined>;
  
  // Activity methods
  getRecentActivities(userId: number, limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private brainDumps: Map<number, BrainDump>;
  private problemTrees: Map<number, ProblemTree>;
  private draftedPlans: Map<number, DraftedPlan>;
  private clarityLabs: Map<number, ClarityLab>;
  private weeklyReflections: Map<number, WeeklyReflection>;
  private monthlyCheckIns: Map<number, MonthlyCheckIn>;
  private priorities: Map<number, Priority>;
  private decisions: Map<number, Decision>;
  private offers: Map<number, Offer>;
  private offerNotes: Map<number, OfferNote>;
  private activities: Map<number, Activity>;

  private userId = 1;
  private brainDumpId = 1;
  private problemTreeId = 1;
  private draftedPlanId = 1;
  private clarityLabId = 1;
  private weeklyReflectionId = 1;
  private monthlyCheckInId = 1;
  private priorityId = 1;
  private decisionId = 1;
  private offerId = 1;
  private offerNoteId = 1;
  private activityId = 1;

  constructor() {
    this.users = new Map();
    this.brainDumps = new Map();
    this.problemTrees = new Map();
    this.draftedPlans = new Map();
    this.clarityLabs = new Map();
    this.weeklyReflections = new Map();
    this.monthlyCheckIns = new Map();
    this.priorities = new Map();
    this.decisions = new Map();
    this.offers = new Map();
    this.offerNotes = new Map();
    this.activities = new Map();

    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      name: "John Doe",
      plan: "Premium",
      initials: "JD"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Brain Dump methods
  async getBrainDumpByUserId(userId: number): Promise<BrainDump | undefined> {
    return Array.from(this.brainDumps.values()).find(dump => dump.userId === userId);
  }

  async createBrainDump(insertBrainDump: InsertBrainDump): Promise<BrainDump> {
    const id = this.brainDumpId++;
    const now = new Date();
    const brainDump: BrainDump = { 
      ...insertBrainDump, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.brainDumps.set(id, brainDump);
    return brainDump;
  }

  async updateBrainDump(id: number, content: string): Promise<BrainDump | undefined> {
    const brainDump = this.brainDumps.get(id);
    if (!brainDump) return undefined;
    
    const updated: BrainDump = { 
      ...brainDump, 
      content, 
      updatedAt: new Date() 
    };
    this.brainDumps.set(id, updated);
    
    // Create activity log
    await this.createActivity({
      userId: brainDump.userId,
      type: "update",
      entityType: "Brain Dump",
      entityName: "Brain Dump Entry"
    });
    
    return updated;
  }

  // Problem Tree methods
  async getProblemTrees(userId: number): Promise<ProblemTree[]> {
    return Array.from(this.problemTrees.values()).filter(tree => tree.userId === userId);
  }

  async getProblemTree(id: number): Promise<ProblemTree | undefined> {
    return this.problemTrees.get(id);
  }

  async createProblemTree(insertProblemTree: InsertProblemTree): Promise<ProblemTree> {
    const id = this.problemTreeId++;
    const now = new Date();
    const problemTree: ProblemTree = { 
      ...insertProblemTree, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.problemTrees.set(id, problemTree);
    
    // Create activity
    await this.createActivity({
      userId: problemTree.userId,
      type: "add",
      entityType: "Problem Tree",
      entityName: problemTree.title
    });
    
    return problemTree;
  }

  async updateProblemTree(id: number, problemTree: Partial<InsertProblemTree>): Promise<ProblemTree | undefined> {
    const existing = this.problemTrees.get(id);
    if (!existing) return undefined;
    
    const updated: ProblemTree = { 
      ...existing, 
      ...problemTree, 
      updatedAt: new Date() 
    };
    this.problemTrees.set(id, updated);
    
    // Create activity
    await this.createActivity({
      userId: existing.userId,
      type: "edit",
      entityType: "Problem Tree",
      entityName: updated.title
    });
    
    return updated;
  }

  async deleteProblemTree(id: number): Promise<boolean> {
    const existing = this.problemTrees.get(id);
    if (!existing) return false;
    
    const deleted = this.problemTrees.delete(id);
    
    if (deleted) {
      // Create activity
      await this.createActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Problem Tree",
        entityName: existing.title
      });
    }
    
    return deleted;
  }

  // Drafted Plans methods
  async getDraftedPlans(userId: number): Promise<DraftedPlan[]> {
    return Array.from(this.draftedPlans.values()).filter(plan => plan.userId === userId);
  }

  async getDraftedPlan(id: number): Promise<DraftedPlan | undefined> {
    return this.draftedPlans.get(id);
  }

  async createDraftedPlan(insertDraftedPlan: InsertDraftedPlan): Promise<DraftedPlan> {
    const id = this.draftedPlanId++;
    const now = new Date();
    const draftedPlan: DraftedPlan = { 
      ...insertDraftedPlan, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.draftedPlans.set(id, draftedPlan);
    
    // Create activity
    await this.createActivity({
      userId: draftedPlan.userId,
      type: "add",
      entityType: "Drafted Plan",
      entityName: draftedPlan.title
    });
    
    return draftedPlan;
  }

  async updateDraftedPlan(id: number, draftedPlan: Partial<InsertDraftedPlan>): Promise<DraftedPlan | undefined> {
    const existing = this.draftedPlans.get(id);
    if (!existing) return undefined;
    
    const updated: DraftedPlan = { 
      ...existing, 
      ...draftedPlan, 
      updatedAt: new Date() 
    };
    this.draftedPlans.set(id, updated);
    
    // Create activity
    await this.createActivity({
      userId: existing.userId,
      type: "edit",
      entityType: "Drafted Plan",
      entityName: updated.title
    });
    
    return updated;
  }

  // Clarity Lab methods
  async getClarityLabs(userId: number, category?: string): Promise<ClarityLab[]> {
    let labs = Array.from(this.clarityLabs.values()).filter(lab => lab.userId === userId);
    if (category) {
      labs = labs.filter(lab => lab.category === category);
    }
    return labs;
  }

  async getClarityLab(id: number): Promise<ClarityLab | undefined> {
    return this.clarityLabs.get(id);
  }

  async createClarityLab(insertClarityLab: InsertClarityLab): Promise<ClarityLab> {
    const id = this.clarityLabId++;
    const now = new Date();
    const clarityLab: ClarityLab = { 
      ...insertClarityLab, 
      id, 
      createdAt: now, 
    };
    this.clarityLabs.set(id, clarityLab);
    
    // Create activity
    await this.createActivity({
      userId: clarityLab.userId,
      type: "add",
      entityType: "Clarity Lab",
      entityName: clarityLab.title
    });
    
    return clarityLab;
  }

  // Weekly Reflections methods
  async getWeeklyReflections(userId: number): Promise<WeeklyReflection[]> {
    return Array.from(this.weeklyReflections.values())
      .filter(reflection => reflection.userId === userId)
      .sort((a, b) => new Date(b.weekDate).getTime() - new Date(a.weekDate).getTime());
  }

  async getWeeklyReflection(id: number): Promise<WeeklyReflection | undefined> {
    return this.weeklyReflections.get(id);
  }

  async createWeeklyReflection(insertWeeklyReflection: InsertWeeklyReflection): Promise<WeeklyReflection> {
    const id = this.weeklyReflectionId++;
    const now = new Date();
    const weeklyReflection: WeeklyReflection = { 
      ...insertWeeklyReflection, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.weeklyReflections.set(id, weeklyReflection);
    
    // Create activity if not a draft
    if (!weeklyReflection.isDraft) {
      await this.createActivity({
        userId: weeklyReflection.userId,
        type: "add",
        entityType: "Weekly Reflection",
        entityName: `Week of ${new Date(weeklyReflection.weekDate).toLocaleDateString()}`
      });
    }
    
    return weeklyReflection;
  }

  async updateWeeklyReflection(id: number, weeklyReflection: Partial<InsertWeeklyReflection>): Promise<WeeklyReflection | undefined> {
    const existing = this.weeklyReflections.get(id);
    if (!existing) return undefined;
    
    const updated: WeeklyReflection = { 
      ...existing, 
      ...weeklyReflection, 
      updatedAt: new Date() 
    };
    this.weeklyReflections.set(id, updated);
    
    // Create activity if completing a draft
    if (existing.isDraft && !updated.isDraft) {
      await this.createActivity({
        userId: updated.userId,
        type: "complete",
        entityType: "Weekly Reflection",
        entityName: `Week of ${new Date(updated.weekDate).toLocaleDateString()}`
      });
    } else if (!existing.isDraft) {
      await this.createActivity({
        userId: updated.userId,
        type: "edit",
        entityType: "Weekly Reflection",
        entityName: `Week of ${new Date(updated.weekDate).toLocaleDateString()}`
      });
    }
    
    return updated;
  }

  // Monthly Check-in methods
  async getMonthlyCheckIns(userId: number): Promise<MonthlyCheckIn[]> {
    return Array.from(this.monthlyCheckIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }

  async getMonthlyCheckInByMonthYear(userId: number, month: number, year: number): Promise<MonthlyCheckIn | undefined> {
    return Array.from(this.monthlyCheckIns.values()).find(
      checkIn => checkIn.userId === userId && checkIn.month === month && checkIn.year === year
    );
  }

  async createMonthlyCheckIn(insertMonthlyCheckIn: InsertMonthlyCheckIn): Promise<MonthlyCheckIn> {
    const id = this.monthlyCheckInId++;
    const now = new Date();
    const monthlyCheckIn: MonthlyCheckIn = { 
      ...insertMonthlyCheckIn, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.monthlyCheckIns.set(id, monthlyCheckIn);
    
    // Create activity if completed
    if (monthlyCheckIn.completedOn) {
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      await this.createActivity({
        userId: monthlyCheckIn.userId,
        type: "complete",
        entityType: "Monthly Check-in",
        entityName: `${monthNames[monthlyCheckIn.month - 1]} ${monthlyCheckIn.year}`
      });
    }
    
    return monthlyCheckIn;
  }

  async updateMonthlyCheckIn(id: number, monthlyCheckIn: Partial<InsertMonthlyCheckIn>): Promise<MonthlyCheckIn | undefined> {
    const existing = this.monthlyCheckIns.get(id);
    if (!existing) return undefined;
    
    const updated: MonthlyCheckIn = { 
      ...existing, 
      ...monthlyCheckIn, 
      updatedAt: new Date() 
    };
    this.monthlyCheckIns.set(id, updated);
    
    // Create activity if now completed
    if (!existing.completedOn && updated.completedOn) {
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      await this.createActivity({
        userId: updated.userId,
        type: "complete",
        entityType: "Monthly Check-in",
        entityName: `${monthNames[updated.month - 1]} ${updated.year}`
      });
    }
    
    return updated;
  }

  // Priorities methods
  async getPriorities(userId: number): Promise<Priority[]> {
    return Array.from(this.priorities.values())
      .filter(priority => priority.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createPriority(insertPriority: InsertPriority): Promise<Priority> {
    const id = this.priorityId++;
    const now = new Date();
    const priority: Priority = { 
      ...insertPriority, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.priorities.set(id, priority);
    
    // Create activity
    await this.createActivity({
      userId: priority.userId,
      type: "add",
      entityType: "Priority",
      entityName: priority.priority
    });
    
    return priority;
  }

  async updatePriority(id: number, priority: Partial<InsertPriority>): Promise<Priority | undefined> {
    const existing = this.priorities.get(id);
    if (!existing) return undefined;
    
    const updated: Priority = { 
      ...existing, 
      ...priority, 
      updatedAt: new Date() 
    };
    this.priorities.set(id, updated);
    
    return updated;
  }

  async deletePriority(id: number): Promise<boolean> {
    const existing = this.priorities.get(id);
    if (!existing) return false;
    
    const deleted = this.priorities.delete(id);
    
    if (deleted) {
      // Create activity
      await this.createActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Priority",
        entityName: existing.priority
      });
    }
    
    return deleted;
  }

  // Decision methods
  async getDecisions(userId: number): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .filter(decision => decision.userId === userId)
      .sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());
  }

  async getDecision(id: number): Promise<Decision | undefined> {
    return this.decisions.get(id);
  }

  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const id = this.decisionId++;
    const now = new Date();
    const decision: Decision = { 
      ...insertDecision, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.decisions.set(id, decision);
    
    // Create activity
    await this.createActivity({
      userId: decision.userId,
      type: "add",
      entityType: "Decision Log",
      entityName: decision.title
    });
    
    return decision;
  }

  async updateDecision(id: number, decision: Partial<InsertDecision>): Promise<Decision | undefined> {
    const existing = this.decisions.get(id);
    if (!existing) return undefined;
    
    const updated: Decision = { 
      ...existing, 
      ...decision, 
      updatedAt: new Date() 
    };
    this.decisions.set(id, updated);
    
    // Create activity if status changed
    if (decision.status && existing.status !== decision.status) {
      await this.createActivity({
        userId: existing.userId,
        type: "update",
        entityType: "Decision Log",
        entityName: existing.title
      });
    }
    
    return updated;
  }

  // Offer methods
  async getOffers(userId: number): Promise<Offer[]> {
    return Array.from(this.offers.values())
      .filter(offer => offer.userId === userId)
      .sort((a, b) => {
        // Sort by status first (Active first, then Coming Soon, then Archived)
        const statusOrder = { "Active": 0, "Coming Soon": 1, "Archived": 2 };
        const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
        if (statusDiff !== 0) return statusDiff;
        // Then sort by created date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerId++;
    const now = new Date();
    const offer: Offer = { 
      ...insertOffer, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.offers.set(id, offer);
    
    // Create activity
    await this.createActivity({
      userId: offer.userId,
      type: "add",
      entityType: "Offer",
      entityName: offer.title
    });
    
    return offer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined> {
    const existing = this.offers.get(id);
    if (!existing) return undefined;
    
    const updated: Offer = { 
      ...existing, 
      ...offer, 
      updatedAt: new Date() 
    };
    this.offers.set(id, updated);
    
    // Create activity if status changed
    if (offer.status && existing.status !== offer.status) {
      await this.createActivity({
        userId: existing.userId,
        type: "update",
        entityType: "Offer",
        entityName: existing.title
      });
    }
    
    return updated;
  }

  // Offer Notes methods
  async getOfferNotesByUserId(userId: number): Promise<OfferNote | undefined> {
    return Array.from(this.offerNotes.values()).find(note => note.userId === userId);
  }

  async createOfferNote(insertOfferNote: InsertOfferNote): Promise<OfferNote> {
    const id = this.offerNoteId++;
    const now = new Date();
    const offerNote: OfferNote = { 
      ...insertOfferNote, 
      id, 
      updatedAt: now 
    };
    this.offerNotes.set(id, offerNote);
    return offerNote;
  }

  async updateOfferNote(id: number, content: string): Promise<OfferNote | undefined> {
    const offerNote = this.offerNotes.get(id);
    if (!offerNote) return undefined;
    
    const updated: OfferNote = { 
      ...offerNote, 
      content, 
      updatedAt: new Date() 
    };
    this.offerNotes.set(id, updated);
    return updated;
  }

  // Activity methods
  async getRecentActivities(userId: number, limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: now 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
