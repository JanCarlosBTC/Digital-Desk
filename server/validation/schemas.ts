import { z } from "zod";

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