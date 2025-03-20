import { Prisma } from "@prisma/client";
import { z } from "zod";

// Base types from Prisma
type BasePrismaUser = Prisma.UserGetPayload<{}>;
type BasePrismaBrainDump = Prisma.BrainDumpGetPayload<{}>;
type BasePrismaProblemTree = Prisma.ProblemTreeGetPayload<{}>;
type BasePrismaDraftedPlan = Prisma.DraftedPlanGetPayload<{}>;
type BasePrismaClarityLab = Prisma.ClarityLabGetPayload<{}>;
type BasePrismaWeeklyReflection = Prisma.WeeklyReflectionGetPayload<{}>;
type BasePrismaMonthlyCheckIn = Prisma.MonthlyCheckInGetPayload<{}>;
type BasePrismaPriority = Prisma.PriorityGetPayload<{}>;
type BasePrismaDecision = Prisma.DecisionGetPayload<{}>;
type BasePrismaOffer = Prisma.OfferGetPayload<{}>;
type BasePrismaOfferNote = Prisma.OfferNoteGetPayload<{}>;
type BasePrismaActivity = Prisma.ActivityGetPayload<{}>;

// Extended types to match existing code
export type User = BasePrismaUser;
export type BrainDump = BasePrismaBrainDump;
export type ProblemTree = BasePrismaProblemTree & {
  userId: number;
};
export type DraftedPlan = BasePrismaDraftedPlan & {
  userId: number;
  comments: number;
  attachments: number;
};
export type ClarityLab = BasePrismaClarityLab & {
  userId: number;
};
export type WeeklyReflection = BasePrismaWeeklyReflection & {
  userId: number;
};
export type MonthlyCheckIn = BasePrismaMonthlyCheckIn & {
  userId: number;
  completedOn: Date | null;
};
export type Priority = BasePrismaPriority & {
  userId: number;
};
export type Decision = BasePrismaDecision & {
  userId: number;
};
export type Offer = BasePrismaOffer & {
  userId: number;
};
export type OfferNote = BasePrismaOfferNote & {
  userId: number;
};
export type Activity = BasePrismaActivity & {
  userId: number;
};

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  name: z.string(),
  plan: z.string().default("Free"),
  initials: z.string(),
});

export const insertBrainDumpSchema = z.object({
  userId: z.number(),
  content: z.string().optional(),
});

export const insertProblemTreeSchema = z.object({
  userId: z.number(),
  title: z.string(),
  mainProblem: z.string(),
  subProblems: z.array(z.string()),
  rootCauses: z.array(z.string()),
  potentialSolutions: z.array(z.string()),
  nextActions: z.array(z.string()),
});

export const insertDraftedPlanSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  status: z.string().default("Draft"),
  components: z.array(z.string()),
  resourcesNeeded: z.array(z.string()),
  expectedOutcomes: z.array(z.string()),
  comments: z.number().default(0),
  attachments: z.number().default(0),
});

export const insertClarityLabSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
});

export const insertWeeklyReflectionSchema = z.object({
  userId: z.number(),
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

export const insertMonthlyCheckInSchema = z.object({
  userId: z.number(),
  month: z.number(),
  year: z.number(),
  completedOn: z.preprocess(
    (val) => (val === null || val === undefined ? null : typeof val === 'string' ? new Date(val) : val),
    z.date({
      invalid_type_error: "Completed date must be a valid date",
    }).nullable()
  ),
  achievements: z.array(z.string()),
  challenges: z.array(z.string()),
  goalProgress: z.record(z.any()),
  nextMonthPriorities: z.array(z.string()),
});

export const insertPrioritySchema = z.object({
  userId: z.number(),
  priority: z.string(),
  order: z.number(),
});

export const insertDecisionSchema = z.object({
  userId: z.number(),
  title: z.string(),
  category: z.string(),
  decisionDate: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date({
      required_error: "Decision date is required",
      invalid_type_error: "Decision date must be a valid date",
    })
  ),
  why: z.string(),
  alternatives: z.string().optional(),
  expectedOutcome: z.string().optional(),
  followUpDate: z.preprocess(
    (val) => (val === null || val === undefined ? null : typeof val === 'string' ? new Date(val) : val),
    z.date({
      invalid_type_error: "Follow-up date must be a valid date",
    }).nullable()
  ),
  status: z.string().default("Pending"),
  whatDifferent: z.string().optional(),
});

export const insertOfferSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  status: z.string().default("Active"),
  price: z.string(),
  category: z.string().default("Service"),
  duration: z.string().optional(),
  format: z.string().optional(),
  clientCount: z.number().default(0),
  archivedAt: z.preprocess(
    (val) => (val === null || val === undefined ? null : typeof val === 'string' ? new Date(val) : val),
    z.date({
      invalid_type_error: "Archived date must be a valid date",
    }).nullable()
  ),
});

export const insertOfferNoteSchema = z.object({
  userId: z.number(),
  content: z.string(),
});

// Insert types using Zod schemas
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
export type InsertActivity = {
  userId: number;
  type: string;
  entityType: string;
  entityName: string;
  metadata: Record<string, any>;
};

export type ActivityMetadata = Record<string, any>; 