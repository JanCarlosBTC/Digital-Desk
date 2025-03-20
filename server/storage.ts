import {
  User, InsertUser,
  BrainDump, InsertBrainDump,
  ProblemTree, InsertProblemTree,
  DraftedPlan, InsertDraftedPlan,
  ClarityLab, InsertClarityLab,
  WeeklyReflection, InsertWeeklyReflection,
  MonthlyCheckIn, InsertMonthlyCheckIn,
  Priority, InsertPriority,
  Decision, InsertDecision,
  Offer, InsertOffer,
  OfferNote, InsertOfferNote
} from "../shared/prisma-schema.js";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;

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
  deleteDraftedPlan(id: number): Promise<boolean>;

  // Clarity Lab methods
  getClarityLabs(userId: number, category?: string): Promise<ClarityLab[]>;
  getClarityLab(id: number): Promise<ClarityLab | undefined>;
  createClarityLab(clarityLab: InsertClarityLab): Promise<ClarityLab>;
  updateClarityLab(id: number, clarityLab: Partial<InsertClarityLab>): Promise<ClarityLab | undefined>;
  deleteClarityLab(id: number): Promise<boolean>;

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
  deleteDecision(id: number): Promise<boolean>;

  // Offer methods
  getOffers(userId: number): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;

  // Offer Notes methods
  getOfferNotesByUserId(userId: number): Promise<OfferNote[]>;
  createOfferNote(offerNote: InsertOfferNote): Promise<OfferNote>;
  updateOfferNote(id: number, content: string): Promise<OfferNote | undefined>;
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

  private nextId: number;

  // No-op implementation of logActivity (deprecated method)
  private async logActivity(params: { 
    userId: number, 
    type: string, 
    entityType: string, 
    entityName: string, 
    metadata: Record<string, any> 
  }): Promise<void> {
    // This method is intentionally empty as the activity tracking feature is being removed
    return;
  }

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

    this.nextId = 1;

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
    const id = this.nextId++;
    // Ensure plan is explicitly null if not defined
    const user: User = { 
      ...insertUser, 
      id
      // Prisma handles createdAt and updatedAt fields automatically
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Brain Dump methods
  async getBrainDumpByUserId(userId: number): Promise<BrainDump | undefined> {
    return Array.from(this.brainDumps.values()).find(dump => dump.userId === userId);
  }

  async createBrainDump(data: InsertBrainDump): Promise<BrainDump> {
    const brainDump: BrainDump = {
      id: this.nextId++,
      userId: data.userId,
      content: data.content ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.brainDumps.set(brainDump.id, brainDump);

    return brainDump;
  }

  async updateBrainDump(id: number, content: string): Promise<BrainDump | undefined> {
    const brainDump = this.brainDumps.get(id);
    if (!brainDump) return undefined;

    const updated: BrainDump = { 
      ...brainDump, 
      content: content ?? null, 
      updatedAt: new Date() 
    };
    this.brainDumps.set(id, updated);

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
    const id = this.nextId++;
    const now = new Date();
    const problemTree: ProblemTree = { 
      ...insertProblemTree, 
      id, 
      subProblems: Array.isArray(insertProblemTree.subProblems) ? insertProblemTree.subProblems as string[] : [],
      rootCauses: Array.isArray(insertProblemTree.rootCauses) ? insertProblemTree.rootCauses as string[] : [],
      potentialSolutions: Array.isArray(insertProblemTree.potentialSolutions) ? insertProblemTree.potentialSolutions as string[] : [],
      nextActions: Array.isArray(insertProblemTree.nextActions) ? insertProblemTree.nextActions as string[] : [],
      createdAt: now, 
      updatedAt: now 
    };
    this.problemTrees.set(id, problemTree);

    return problemTree;
  }

  async updateProblemTree(id: number, data: Partial<InsertProblemTree>): Promise<ProblemTree | undefined> {
    const existing = this.problemTrees.get(id);
    if (!existing) return undefined;

    const updated: ProblemTree = { 
      ...existing, 
      ...data, 
      subProblems: Array.isArray(data.subProblems) ? data.subProblems as string[] : existing.subProblems,
      rootCauses: Array.isArray(data.rootCauses) ? data.rootCauses as string[] : existing.rootCauses,
      potentialSolutions: Array.isArray(data.potentialSolutions) ? data.potentialSolutions as string[] : existing.potentialSolutions,
      nextActions: Array.isArray(data.nextActions) ? data.nextActions as string[] : existing.nextActions,
      updatedAt: new Date() 
    };
    this.problemTrees.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "ProblemTree",
      entityName: updated.title,
      metadata: {
        // Use safe property access
        content: updated.mainProblem || undefined,
      }
    });

    return updated;
  }

  async deleteProblemTree(id: number): Promise<boolean> {
    const existing = this.problemTrees.get(id);
    if (!existing) return false;

    const deleted = this.problemTrees.delete(id);

    if (deleted) {
      await this.logActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Problem Tree",
        entityName: existing.title,
        metadata: {}
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
    const id = this.nextId++;
    const now = new Date();
    const draftedPlan: DraftedPlan = { 
      ...insertDraftedPlan, 
      id, 
      status: insertDraftedPlan.status || "draft", // Ensure status has a value
      components: Array.isArray(insertDraftedPlan.components) ? insertDraftedPlan.components as string[] : [],
      resourcesNeeded: Array.isArray(insertDraftedPlan.resourcesNeeded) ? insertDraftedPlan.resourcesNeeded as string[] : [],
      expectedOutcomes: Array.isArray(insertDraftedPlan.expectedOutcomes) ? insertDraftedPlan.expectedOutcomes as string[] : [],
      comments: insertDraftedPlan.comments || 0,
      attachments: insertDraftedPlan.attachments || 0,
      createdAt: now, 
      updatedAt: now 
    };
    this.draftedPlans.set(id, draftedPlan);

    return draftedPlan;
  }

  async updateDraftedPlan(id: number, data: Partial<InsertDraftedPlan>): Promise<DraftedPlan | undefined> {
    const existing = this.draftedPlans.get(id);
    if (!existing) return undefined;

    const updated: DraftedPlan = { 
      ...existing, 
      ...data, 
      status: data.status || existing.status,
      components: Array.isArray(data.components) ? data.components as string[] : existing.components,
      resourcesNeeded: Array.isArray(data.resourcesNeeded) ? data.resourcesNeeded as string[] : existing.resourcesNeeded,
      expectedOutcomes: Array.isArray(data.expectedOutcomes) ? data.expectedOutcomes as string[] : existing.expectedOutcomes,
      comments: data.comments ?? existing.comments,
      attachments: data.attachments ?? existing.attachments,
      updatedAt: new Date() 
    };
    this.draftedPlans.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "DraftedPlan",
      entityName: updated.title,
      metadata: {
        status: updated.status,
      }
    });

    return updated;
  }

  async deleteDraftedPlan(id: number): Promise<boolean> {
    const existing = this.draftedPlans.get(id);
    if (!existing) return false;

    const deleted = this.draftedPlans.delete(id);

    if (deleted) {
      await this.logActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Drafted Plan",
        entityName: existing.title,
        metadata: {}
      });
    }

    return deleted;
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
    const id = this.nextId++;
    const now = new Date();
    const clarityLab: ClarityLab = { 
      ...insertClarityLab, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.clarityLabs.set(id, clarityLab);

    return clarityLab;
  }

  async updateClarityLab(id: number, data: Partial<InsertClarityLab>): Promise<ClarityLab | undefined> {
    const existing = this.clarityLabs.get(id);
    if (!existing) return undefined;

    const updated: ClarityLab = { 
      ...existing, 
      ...data, 
      updatedAt: new Date() 
    };
    this.clarityLabs.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "ClarityLab",
      entityName: updated.title,
      metadata: {
        category: updated.category,
      }
    });

    return updated;
  }

  async deleteClarityLab(id: number): Promise<boolean> {
    const existing = this.clarityLabs.get(id);
    if (!existing) return false;

    const deleted = this.clarityLabs.delete(id);

    if (deleted) {
      await this.logActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Clarity Lab",
        entityName: existing.title,
        metadata: {}
      });
    }

    return deleted;
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

  async createWeeklyReflection(data: InsertWeeklyReflection): Promise<WeeklyReflection> {
    const reflection: WeeklyReflection = {
      id: this.nextId++,
      userId: data.userId,
      weekDate: data.weekDate,
      wentWell: data.wentWell ?? null,
      challenges: data.challenges ?? null,
      learnings: data.learnings ?? null,
      nextWeekFocus: data.nextWeekFocus ?? null,
      isDraft: data.isDraft ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.weeklyReflections.set(reflection.id, reflection);
    await this.logActivity({
      userId: data.userId,
      type: "create",
      entityType: "WeeklyReflection",
      entityName: `Weekly Reflection ${reflection.id}`,
      metadata: {
        weekDate: reflection.weekDate,
        isDraft: reflection.isDraft,
      },
    });
    return reflection;
  }

  async updateWeeklyReflection(id: number, data: Partial<InsertWeeklyReflection>): Promise<WeeklyReflection | undefined> {
    const existing = this.weeklyReflections.get(id);
    if (!existing) return undefined;

    const updated: WeeklyReflection = { 
      ...existing, 
      ...data, 
      wentWell: data.wentWell || existing.wentWell,
      challenges: data.challenges || existing.challenges,
      learnings: data.learnings || existing.learnings,
      nextWeekFocus: data.nextWeekFocus || existing.nextWeekFocus,
      updatedAt: new Date() 
    };
    this.weeklyReflections.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "WeeklyReflection",
      entityName: updated.weekDate.toISOString(),
      metadata: {
        isDraft: updated.isDraft,
      }
    });

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

  async createMonthlyCheckIn(data: InsertMonthlyCheckIn): Promise<MonthlyCheckIn> {
    const checkIn: MonthlyCheckIn = {
      id: this.nextId++,
      userId: data.userId,
      month: data.month,
      year: data.year,
      completedOn: data.completedOn ?? null,
      achievements: Array.isArray(data.achievements) ? data.achievements as string[] : [],
      challenges: Array.isArray(data.challenges) ? data.challenges as string[] : [],
      goalProgress: Array.isArray(data.goalProgress) ? data.goalProgress as {goal: string, progress: number}[] : [],
      nextMonthPriorities: Array.isArray(data.nextMonthPriorities) ? data.nextMonthPriorities as string[] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.monthlyCheckIns.set(checkIn.id, checkIn);
    await this.logActivity({
      userId: data.userId,
      type: "create",
      entityType: "MonthlyCheckIn",
      entityName: `${checkIn.month}/${checkIn.year}`,
      metadata: {
        month: checkIn.month,
        year: checkIn.year,
        completedOn: checkIn.completedOn instanceof Date ? checkIn.completedOn : undefined,
      },
    });
    return checkIn;
  }

  async updateMonthlyCheckIn(id: number, data: Partial<InsertMonthlyCheckIn>): Promise<MonthlyCheckIn | undefined> {
    const existing = this.monthlyCheckIns.get(id);
    if (!existing) return undefined;

    const updated: MonthlyCheckIn = { 
      ...existing, 
      ...data, 
      completedOn: data.completedOn !== undefined ? data.completedOn : existing.completedOn,
      goalProgress: Array.isArray(data.goalProgress) ? data.goalProgress as {goal: string, progress: number}[] : existing.goalProgress,
      challenges: Array.isArray(data.challenges) ? data.challenges as string[] : existing.challenges,
      achievements: Array.isArray(data.achievements) ? data.achievements as string[] : existing.achievements,
      nextMonthPriorities: Array.isArray(data.nextMonthPriorities) ? data.nextMonthPriorities as string[] : existing.nextMonthPriorities,
      updatedAt: new Date() 
    };
    this.monthlyCheckIns.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "MonthlyCheckIn",
      entityName: `${updated.month}/${updated.year}`,
      metadata: {
        completedOn: updated.completedOn instanceof Date ? updated.completedOn : undefined,
      }
    });

    return updated;
  }

  // Priorities methods
  async getPriorities(userId: number): Promise<Priority[]> {
    return Array.from(this.priorities.values())
      .filter(priority => priority.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createPriority(insertPriority: InsertPriority): Promise<Priority> {
    const id = this.nextId++;
    const now = new Date();
    const priority: Priority = { 
      ...insertPriority, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.priorities.set(id, priority);

    return priority;
  }

  async updatePriority(id: number, data: Partial<InsertPriority>): Promise<Priority | undefined> {
    const existing = this.priorities.get(id);
    if (!existing) return undefined;

    const updated: Priority = { 
      ...existing, 
      ...data, 
      updatedAt: new Date() 
    };
    this.priorities.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "Priority",
      entityName: updated.priority,
      metadata: {
        order: updated.order,
      }
    });

    return updated;
  }

  async deletePriority(id: number): Promise<boolean> {
    const existing = this.priorities.get(id);
    if (!existing) return false;

    const deleted = this.priorities.delete(id);

    if (deleted) {
      await this.logActivity({
        userId: existing.userId,
        type: "delete",
        entityType: "Priority",
        entityName: existing.priority,
        metadata: {}
      });
    }

    return deleted;
  }

  // Decision methods
  async getDecisions(userId: number): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .filter(decision => decision.userId === userId)
      .sort((a, b) => {
        // Sort by date descending (newest first)
        if (a.decisionDate !== b.decisionDate) {
          return new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime();
        }
        // If dates are the same, sort by id (newest ID first as they're auto-incremented)
        return b.id - a.id;
      });
  }

  async getDecision(id: number): Promise<Decision | undefined> {
    return this.decisions.get(id);
  }

  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const id = this.nextId++;
    const now = new Date();
    const decision: Decision = { 
      ...insertDecision, 
      id, 
      status: insertDecision.status ?? "Pending",
      alternatives: insertDecision.alternatives ?? null,
      expectedOutcome: insertDecision.expectedOutcome ?? null,
      followUpDate: insertDecision.followUpDate ?? null,
      whatDifferent: insertDecision.whatDifferent ?? null,
      createdAt: now, 
      updatedAt: now 
    };
    this.decisions.set(id, decision);

    await this.logActivity({
      userId: insertDecision.userId,
      type: "create",
      entityType: "Decision",
      entityName: decision.title,
      metadata: {
        decisionDate: decision.decisionDate,
        status: decision.status,
      }
    });

    return decision;
  }

  async updateDecision(id: number, data: Partial<InsertDecision>): Promise<Decision | undefined> {
    const existing = this.decisions.get(id);
    if (!existing) return undefined;

    const updated: Decision = { 
      ...existing, 
      ...data, 
      alternatives: data.alternatives || existing.alternatives,
      expectedOutcome: data.expectedOutcome || existing.expectedOutcome,
      followUpDate: data.followUpDate || existing.followUpDate,
      whatDifferent: data.whatDifferent || existing.whatDifferent,
      updatedAt: new Date() 
    };
    this.decisions.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "Decision",
      entityName: updated.title,
      metadata: {
        decisionDate: updated.decisionDate,
        status: updated.status
      }
    });

    return updated;
  }

  async deleteDecision(id: number): Promise<boolean> {
    const decision = this.decisions.get(id);
    if (!decision) return false;

    await this.logActivity({
      userId: decision.userId,
      type: "delete",
      entityType: "Decision",
      entityName: decision.title,
      metadata: {}
    });

    return this.decisions.delete(id);
  }

  // Offer methods
  async getOffers(userId: number): Promise<Offer[]> {
    return Array.from(this.offers.values())
      .filter(offer => offer.userId === userId)
      .sort((a, b) => {
        // First sort by status (active first, then sold, then archived)
        const statusOrder = { active: 0, sold: 1, archived: 2 };
        if (a.status !== b.status) {
          return statusOrder[a.status as 'active' | 'sold' | 'archived'] - 
                 statusOrder[b.status as 'active' | 'sold' | 'archived'];
        }
        // If status is the same, sort by recently created (newest first)
        return b.id - a.id;
      });
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(data: InsertOffer): Promise<Offer> {
    const offer: Offer = {
      id: this.nextId++,
      userId: data.userId,
      title: data.title,
      description: data.description,
      status: data.status || 'active',
      price: data.price,
      category: data.category || 'Service',
      duration: data.duration || null,
      format: data.format || null,
      clientCount: data.clientCount || null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.offers.set(offer.id, offer);

    await this.logActivity({
      userId: data.userId,
      type: "create",
      entityType: "Offer",
      entityName: offer.title,
      metadata: {
        price: offer.price,
        status: offer.status,
        category: offer.category
      }
    });

    return offer;
  }

  async updateOffer(id: number, data: Partial<InsertOffer>): Promise<Offer | undefined> {
    const existing = this.offers.get(id);
    if (!existing) return undefined;

    const updated: Offer = { 
      ...existing, 
      ...data, 
      status: data.status || existing.status,
      price: data.price !== undefined ? data.price : existing.price,
      duration: data.duration !== undefined ? data.duration : existing.duration,
      format: data.format !== undefined ? data.format : existing.format,
      clientCount: data.clientCount !== undefined ? data.clientCount : existing.clientCount,
      updatedAt: new Date() 
    };
    this.offers.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "Offer",
      entityName: updated.title,
      metadata: {
        price: updated.price,
        status: updated.status,
        category: updated.category
      }
    });

    return updated;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const offer = this.offers.get(id);
    if (!offer) return false;

    await this.logActivity({
      userId: offer.userId,
      type: "delete",
      entityType: "Offer",
      entityName: offer.title,
      metadata: {}
    });

    return this.offers.delete(id);
  }

  // Offer Notes methods
  async getOfferNotesByUserId(userId: number): Promise<OfferNote[]> {
    return Array.from(this.offerNotes.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createOfferNote(insertOfferNote: InsertOfferNote): Promise<OfferNote> {
    const id = this.nextId++;
    const now = new Date();
    // Ensure content is a string, never null
    const content = insertOfferNote.content !== null && insertOfferNote.content !== undefined 
      ? insertOfferNote.content 
      : "";
      
    const offerNote: OfferNote = { 
      ...insertOfferNote, 
      id,
      content,
      createdAt: now, 
      updatedAt: now 
    };
    this.offerNotes.set(id, offerNote);

    await this.logActivity({
      userId: insertOfferNote.userId,
      type: "create",
      entityType: "OfferNote",
      entityName: `Offer Notes ${offerNote.id}`,
      metadata: {
        content: offerNote.content && offerNote.content.length > 50 
          ? `${offerNote.content.substring(0, 50)}...` 
          : offerNote.content
      }
    });

    return offerNote;
  }

  async updateOfferNote(id: number, content: string): Promise<OfferNote | undefined> {
    const existing = this.offerNotes.get(id);
    if (!existing) return undefined;

    const updated: OfferNote = { 
      ...existing, 
      content, 
      updatedAt: new Date() 
    };
    this.offerNotes.set(id, updated);

    await this.logActivity({
      userId: existing.userId,
      type: "update",
      entityType: "OfferNote",
      entityName: `Offer Notes ${updated.id}`,
      metadata: {
        content: updated.content && updated.content.length > 50 
          ? `${updated.content.substring(0, 50)}...` 
          : updated.content
      }
    });

    return updated;
  }
}

let storageImpl: IStorage = new MemStorage();

export const storage: IStorage = storageImpl;