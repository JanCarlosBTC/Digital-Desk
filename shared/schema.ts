import { z } from "zod";
import type { User, BrainDump, ProblemTree, DraftedPlan, ClarityLab, WeeklyReflection, MonthlyCheckIn, Priority, Decision, Offer, OfferNote, Activity } from "@prisma/client";

// User schema
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  plan: z.string().default("Free"),
  initials: z.string().min(1, "Initials are required"),
});

// Brain Dump schema
export const insertBrainDumpSchema = z.object({
  userId: z.number().int().positive(),
  content: z.string().optional(),
});

// Problem Tree schema
export const insertProblemTreeSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  mainProblem: z.string().min(1, "Main problem is required"),
  subProblems: z.array(z.string()),
  rootCauses: z.array(z.string()),
  potentialSolutions: z.array(z.string()),
  nextActions: z.array(z.string()),
});

// Drafted Plans schema
export const insertDraftedPlanSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("Draft"),
  components: z.array(z.string()),
  resourcesNeeded: z.array(z.string()),
  expectedOutcomes: z.array(z.string()),
  comments: z.number().int().nonnegative().default(0),
  attachments: z.number().int().nonnegative().default(0),
});

// Clarity Lab schema
export const insertClarityLabSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
});

// Weekly Reflections schema
export const insertWeeklyReflectionSchema = z.object({
  userId: z.number().int().positive(),
  weekDate: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date({
      required_error: "Week date is required",
      invalid_type_error: "Week date must be a valid date",
    })
  ),
  wentWell: z.string().optional(),
  challenges: z.string().optional(),
  learnings: z.string().optional(),
  nextWeekFocus: z.string().optional(),
  isDraft: z.boolean().default(true),
});

// Monthly Check-ins schema
export const insertMonthlyCheckInSchema = z.object({
  userId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  completedOn: z.preprocess(
    (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
    z.date().optional()
  ),
  achievements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  goalProgress: z.array(
    z.object({
      goal: z.string(),
      progress: z.number().min(0).max(100)
    })
  ).optional(),
  nextMonthPriorities: z.array(z.string()).optional(),
});

// Priorities schema
export const insertPrioritySchema = z.object({
  userId: z.number().int().positive(),
  priority: z.string().min(1, "Priority is required"),
  order: z.number().int().nonnegative(),
});

// Decision Log schema
export const insertDecisionSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  decisionDate: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date({
      required_error: "Decision date is required",
      invalid_type_error: "Decision date must be a valid date",
    })
  ),
  why: z.string().min(1, "Reason is required"),
  alternatives: z.string().optional(),
  expectedOutcome: z.string().optional(),
  followUpDate: z.preprocess(
    (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
    z.date().optional()
  ),
  status: z.string().default("Pending"),
  whatDifferent: z.string().optional(),
});

// Offer Vault schema
export const insertOfferSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("Active"),
  price: z.string().min(1, "Price is required"),
  category: z.string().default("Service"),
  duration: z.string().optional(),
  format: z.string().optional(),
  clientCount: z.number().int().nonnegative().default(0),
  archivedAt: z.preprocess(
    (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
    z.date().optional()
  ),
});

// Offer Notes schema
export const insertOfferNoteSchema = z.object({
  userId: z.number().int().positive(),
  content: z.string(),
});

// Activity schema
export const insertActivitySchema = z.object({
  userId: z.number().int().positive(),
  type: z.string().min(1, "Activity type is required"),
  entityType: z.string().min(1, "Entity type is required"),
  entityName: z.string().min(1, "Entity name is required"),
  metadata: z.record(z.any()),
});

// Export types from Prisma Client
export type { User, BrainDump, ProblemTree, DraftedPlan, ClarityLab, WeeklyReflection, MonthlyCheckIn, Priority, Decision, Offer, OfferNote, Activity };

// Export insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBrainDump = z.infer<typeof insertBrainDumpSchema>;
export type InsertProblemTree = z.infer<typeof insertProblemTreeSchema>;
export type InsertDraftedPlan = z.infer<typeof insertDraftedPlanSchema>;
export type InsertClarityLab = z.infer<typeof insertClarityLabSchema>;
export type InsertWeeklyReflection = z.infer<typeof insertWeeklyReflectionSchema>;
export type InsertMonthlyCheckIn = z.infer<typeof insertMonthlyCheckInSchema>;
export type InsertPriority = z.infer<typeof insertPrioritySchema>;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type InsertOfferNote = z.infer<typeof insertOfferNoteSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
