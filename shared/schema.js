import { z } from "zod";

// User schema with email field
export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3),
  password: z.string(),
  email: z.string().email().optional(),
  name: z.string(),
  initials: z.string(),
  plan: z.string(),
  stripeCustomerId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Brain Dump schema
export const brainDumpSchema = z.object({
  id: z.number(),
  userId: z.number(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertBrainDumpSchema = brainDumpSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BrainDump = z.infer<typeof brainDumpSchema>;
export type InsertBrainDump = z.infer<typeof insertBrainDumpSchema>;

// Problem Tree schema
export const problemTreeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  mainProblem: z.string(),
  subProblems: z.array(z.string()),
  rootCauses: z.array(z.string()),
  potentialSolutions: z.array(z.string()),
  nextActions: z.array(z.string()).optional(),
  complexity: z.number().optional(),
  impact: z.number().optional(),
  status: z.enum(["inProgress", "completed", "archived"]).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertProblemTreeSchema = problemTreeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProblemTree = z.infer<typeof problemTreeSchema>;
export type InsertProblemTree = z.infer<typeof insertProblemTreeSchema>;

// Drafted Plan schema
export const draftedPlanSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  goal: z.string(),
  steps: z.array(z.string()),
  timeline: z.string().optional(),
  resources: z.array(z.string()).optional(),
  status: z.enum(["draft", "inProgress", "completed", "abandoned"]).optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertDraftedPlanSchema = draftedPlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DraftedPlan = z.infer<typeof draftedPlanSchema>;
export type InsertDraftedPlan = z.infer<typeof insertDraftedPlanSchema>;

// Clarity Lab schema
export const clarityLabSchema = z.object({
  id: z.number(),
  userId: z.number(),
  category: z.string(),
  question: z.string(),
  answer: z.string(),
  insights: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertClarityLabSchema = clarityLabSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClarityLab = z.infer<typeof clarityLabSchema>;
export type InsertClarityLab = z.infer<typeof insertClarityLabSchema>;

// Weekly Reflection schema
export const weeklyReflectionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  weekNumber: z.number(),
  year: z.number(),
  wins: z.array(z.string()),
  challenges: z.array(z.string()),
  learnings: z.array(z.string()),
  nextWeekPriorities: z.array(z.string()),
  energyLevel: z.number().nullable().optional(),
  productivityLevel: z.number().nullable().optional(),
  completedOn: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertWeeklyReflectionSchema = weeklyReflectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WeeklyReflection = z.infer<typeof weeklyReflectionSchema>;
export type InsertWeeklyReflection = z.infer<typeof insertWeeklyReflectionSchema>;

// Monthly Check-In schema
export const monthlyCheckInSchema = z.object({
  id: z.number(),
  userId: z.number(),
  month: z.number(),
  year: z.number(),
  accomplishments: z.array(z.string()),
  challenges: z.array(z.string()),
  insights: z.array(z.string()),
  focusAreas: z.array(z.string()),
  satisfaction: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMonthlyCheckInSchema = monthlyCheckInSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MonthlyCheckIn = z.infer<typeof monthlyCheckInSchema>;
export type InsertMonthlyCheckIn = z.infer<typeof insertMonthlyCheckInSchema>;

// Priorities schema
export const prioritySchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  deadline: z.date().nullable().optional(),
  category: z.string().optional(),
  isCompleted: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPrioritySchema = prioritySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Priority = z.infer<typeof prioritySchema>;
export type InsertPriority = z.infer<typeof insertPrioritySchema>;

// Decision schema
export const decisionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  options: z.array(
    z.object({
      name: z.string(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
    })
  ),
  decision: z.string().optional(),
  rationale: z.string().optional(),
  outcome: z.string().optional(),
  status: z.enum(["pending", "decided", "implemented", "evaluated"]).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertDecisionSchema = decisionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Decision = z.infer<typeof decisionSchema>;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

// Offer schema
export const offerSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  status: z.enum(["active", "sold", "archived"]),
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOfferSchema = offerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Offer = z.infer<typeof offerSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

// Offer Notes schema (for the user's private notes about offers)
export const offerNoteSchema = z.object({
  id: z.number(),
  userId: z.number(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOfferNoteSchema = offerNoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OfferNote = z.infer<typeof offerNoteSchema>;
export type InsertOfferNote = z.infer<typeof insertOfferNoteSchema>; 