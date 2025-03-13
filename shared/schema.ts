import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  plan: text("plan").default("Free"),
  initials: text("initials").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  plan: true,
  initials: true,
});

// Brain Dump schema
export const brainDumps = pgTable("brain_dumps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrainDumpSchema = createInsertSchema(brainDumps).pick({
  userId: true,
  content: true,
});

// Problem Tree schema
export const problemTrees = pgTable("problem_trees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  mainProblem: text("main_problem").notNull(),
  subProblems: json("sub_problems").$type<string[]>().notNull(),
  rootCauses: json("root_causes").$type<string[]>().notNull(),
  potentialSolutions: json("potential_solutions").$type<string[]>().notNull(),
  nextActions: json("next_actions").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProblemTreeSchema = createInsertSchema(problemTrees).pick({
  userId: true,
  title: true,
  mainProblem: true,
  subProblems: true,
  rootCauses: true,
  potentialSolutions: true,
  nextActions: true,
});

// Drafted Plans schema
export const draftedPlans = pgTable("drafted_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("Draft").notNull(),
  components: json("components").$type<string[]>().notNull(),
  resourcesNeeded: json("resources_needed").$type<string[]>().notNull(),
  expectedOutcomes: json("expected_outcomes").$type<string[]>().notNull(),
  comments: integer("comments").default(0).notNull(),
  attachments: integer("attachments").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDraftedPlanSchema = createInsertSchema(draftedPlans).pick({
  userId: true,
  title: true,
  description: true,
  status: true,
  components: true,
  resourcesNeeded: true,
  expectedOutcomes: true,
  comments: true,
  attachments: true,
});

// Clarity Lab schema
export const clarityLabs = pgTable("clarity_labs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClarityLabSchema = createInsertSchema(clarityLabs).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
});

// Weekly Reflections schema
export const weeklyReflections = pgTable("weekly_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  weekDate: timestamp("week_date").notNull(),
  wentWell: text("went_well"),
  challenges: text("challenges"),
  learnings: text("learnings"),
  nextWeekFocus: text("next_week_focus"),
  isDraft: boolean("is_draft").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schema and modify it to accept ISO string for weekDate
export const insertWeeklyReflectionSchema = createInsertSchema(weeklyReflections)
  .omit({
    weekDate: true,
  })
  .pick({
    userId: true,
    wentWell: true,
    challenges: true,
    learnings: true,
    nextWeekFocus: true,
    isDraft: true,
  })
  .extend({
    // Define weekDate to accept string and properly transform it
    weekDate: z.preprocess(
      (val) => (typeof val === 'string' ? new Date(val) : val),
      z.date({
        required_error: "Week date is required",
        invalid_type_error: "Week date must be a valid date",
      })
    ),
  });

// Monthly Check-ins schema
export const monthlyCheckIns = pgTable("monthly_check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  completedOn: timestamp("completed_on"),
  achievements: json("achievements").$type<string[]>(),
  challenges: json("challenges").$type<string[]>(),
  goalProgress: json("goal_progress").$type<{ goal: string, progress: number }[]>(),
  nextMonthPriorities: json("next_month_priorities").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMonthlyCheckInSchema = createInsertSchema(monthlyCheckIns)
  .omit({
    completedOn: true,
  })
  .pick({
    userId: true,
    month: true,
    year: true,
    achievements: true,
    challenges: true,
    goalProgress: true,
    nextMonthPriorities: true,
  })
  .extend({
    // Use preprocess for better date handling
    completedOn: z.preprocess(
      (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
      z.date({
        invalid_type_error: "Completed date must be a valid date",
      }).optional()
    ),
  });

// Priorities schema
export const priorities = pgTable("priorities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  priority: text("priority").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPrioritySchema = createInsertSchema(priorities).pick({
  userId: true,
  priority: true,
  order: true,
});

// Decision Log schema
export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  decisionDate: timestamp("decision_date").notNull(),
  why: text("why").notNull(),
  alternatives: text("alternatives"),
  expectedOutcome: text("expected_outcome"),
  followUpDate: timestamp("follow_up_date"),
  status: text("status").default("Pending").notNull(),
  whatDifferent: text("what_different"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDecisionSchema = createInsertSchema(decisions)
  .omit({
    decisionDate: true,
    followUpDate: true,
  })
  .pick({
    userId: true,
    title: true,
    category: true,
    why: true,
    alternatives: true,
    expectedOutcome: true,
    status: true,
    whatDifferent: true,
  })
  .extend({
    // Use preprocess for better date handling
    decisionDate: z.preprocess(
      (val) => (typeof val === 'string' ? new Date(val) : val),
      z.date({
        required_error: "Decision date is required",
        invalid_type_error: "Decision date must be a valid date",
      })
    ),
    followUpDate: z.preprocess(
      (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
      z.date({
        invalid_type_error: "Follow-up date must be a valid date",
      }).optional()
    ),
  });

// Offer Vault schema
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("Active").notNull(),
  price: text("price").notNull(),
  duration: text("duration"),
  format: text("format"),
  clientCount: integer("client_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offers)
  .omit({
    archivedAt: true,
  })
  .pick({
    userId: true,
    title: true,
    description: true,
    status: true,
    price: true,
    duration: true,
    format: true,
    clientCount: true,
  })
  .extend({
    // Use preprocess for better date handling
    archivedAt: z.preprocess(
      (val) => (val === null || val === undefined ? undefined : typeof val === 'string' ? new Date(val) : val),
      z.date({
        invalid_type_error: "Archived date must be a valid date",
      }).optional()
    ),
  });

// Offer Notes schema
export const offerNotes = pgTable("offer_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOfferNoteSchema = createInsertSchema(offerNotes).pick({
  userId: true,
  content: true,
});

// Activities schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  entityType: text("entity_type").notNull(),
  entityName: text("entity_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  entityType: true,
  entityName: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BrainDump = typeof brainDumps.$inferSelect;
export type InsertBrainDump = z.infer<typeof insertBrainDumpSchema>;

export type ProblemTree = typeof problemTrees.$inferSelect;
export type InsertProblemTree = z.infer<typeof insertProblemTreeSchema>;

export type DraftedPlan = typeof draftedPlans.$inferSelect;
export type InsertDraftedPlan = z.infer<typeof insertDraftedPlanSchema>;

export type ClarityLab = typeof clarityLabs.$inferSelect;
export type InsertClarityLab = z.infer<typeof insertClarityLabSchema>;

export type WeeklyReflection = typeof weeklyReflections.$inferSelect;
export type InsertWeeklyReflection = z.infer<typeof insertWeeklyReflectionSchema>;

export type MonthlyCheckIn = typeof monthlyCheckIns.$inferSelect;
export type InsertMonthlyCheckIn = z.infer<typeof insertMonthlyCheckInSchema>;

export type Priority = typeof priorities.$inferSelect;
export type InsertPriority = z.infer<typeof insertPrioritySchema>;

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type OfferNote = typeof offerNotes.$inferSelect;
export type InsertOfferNote = z.infer<typeof insertOfferNoteSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
