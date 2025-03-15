/**
 * Migration script to transfer data from Drizzle to Prisma
 * 
 * This script reads data from the existing database through Drizzle 
 * and writes it to the same database using Prisma.
 * 
 * Usage: 
 * 1. Ensure DATABASE_URL environment variable is set
 * 2. Run: npx ts-node scripts/migrate-to-prisma.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { PrismaClient } from '@prisma/client';

// Initialize Drizzle client
const migrationClient = postgres(process.env.DATABASE_URL!);

const drizzleDb = drizzle(migrationClient, { schema });

// Initialize Prisma client
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Migration from Drizzle to Prisma started...');
    
    // 1. Fetch all users from Drizzle
    console.log('Migrating users...');
    const users = await drizzleDb.select().from(schema.users);
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    // 2. Fetch and migrate brain dumps
    console.log('Migrating brain dumps...');
    const brainDumps = await drizzleDb.select().from(schema.brainDumps);
    
    for (const brainDump of brainDumps) {
      await prisma.brainDump.upsert({
        where: { id: brainDump.id },
        update: brainDump,
        create: brainDump
      });
    }
    
    // 3. Fetch and migrate problem trees
    console.log('Migrating problem trees...');
    const problemTrees = await drizzleDb.select().from(schema.problemTrees);
    
    for (const problemTree of problemTrees) {
      await prisma.problemTree.upsert({
        where: { id: problemTree.id },
        update: problemTree,
        create: problemTree
      });
    }
    
    // 4. Fetch and migrate drafted plans
    console.log('Migrating drafted plans...');
    const draftedPlans = await drizzleDb.select().from(schema.draftedPlans);
    
    for (const draftedPlan of draftedPlans) {
      await prisma.draftedPlan.upsert({
        where: { id: draftedPlan.id },
        update: draftedPlan,
        create: draftedPlan
      });
    }
    
    // 5. Fetch and migrate clarity labs
    console.log('Migrating clarity labs...');
    const clarityLabs = await drizzleDb.select().from(schema.clarityLabs);
    
    for (const clarityLab of clarityLabs) {
      await prisma.clarityLab.upsert({
        where: { id: clarityLab.id },
        update: clarityLab,
        create: clarityLab
      });
    }
    
    // 6. Fetch and migrate weekly reflections
    console.log('Migrating weekly reflections...');
    const weeklyReflections = await drizzleDb.select().from(schema.weeklyReflections);
    
    for (const weeklyReflection of weeklyReflections) {
      await prisma.weeklyReflection.upsert({
        where: { id: weeklyReflection.id },
        update: weeklyReflection,
        create: weeklyReflection
      });
    }
    
    // 7. Fetch and migrate monthly check-ins
    console.log('Migrating monthly check-ins...');
    const monthlyCheckIns = await drizzleDb.select().from(schema.monthlyCheckIns);
    
    for (const monthlyCheckIn of monthlyCheckIns) {
      await prisma.monthlyCheckIn.upsert({
        where: { id: monthlyCheckIn.id },
        update: monthlyCheckIn,
        create: monthlyCheckIn
      });
    }
    
    // 8. Fetch and migrate priorities
    console.log('Migrating priorities...');
    const priorities = await drizzleDb.select().from(schema.priorities);
    
    for (const priority of priorities) {
      await prisma.priority.upsert({
        where: { id: priority.id },
        update: priority,
        create: priority
      });
    }
    
    // 9. Fetch and migrate decisions
    console.log('Migrating decisions...');
    const decisions = await drizzleDb.select().from(schema.decisions);
    
    for (const decision of decisions) {
      await prisma.decision.upsert({
        where: { id: decision.id },
        update: decision,
        create: decision
      });
    }
    
    // 10. Fetch and migrate offers
    console.log('Migrating offers...');
    const offers = await drizzleDb.select().from(schema.offers);
    
    for (const offer of offers) {
      await prisma.offer.upsert({
        where: { id: offer.id },
        update: offer,
        create: offer
      });
    }
    
    // 11. Fetch and migrate offer notes
    console.log('Migrating offer notes...');
    const offerNotes = await drizzleDb.select().from(schema.offerNotes);
    
    for (const offerNote of offerNotes) {
      await prisma.offerNote.upsert({
        where: { id: offerNote.id },
        update: offerNote,
        create: offerNote
      });
    }
    
    // 12. Fetch and migrate activities
    console.log('Migrating activities...');
    const activities = await drizzleDb.select().from(schema.activities);
    
    for (const activity of activities) {
      await prisma.activity.upsert({
        where: { id: activity.id },
        update: activity,
        create: activity
      });
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    await migrationClient.end();
  }
}

// Run the migration
migrateData();