import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  chefKnowledge,
  cookingSessions,
  foodLensScans,
  ingredientScans,
  mealFeedback,
  palateProfiles,
  palateSignals,
  recipes,
  semanticMemoryEdges,
  semanticMemories,
  type InsertUser,
  users,
} from "../drizzle/schema";
import type { FoodLensAnalysis, FoodLensItem, IngredientDetection, NutritionValues, SemanticMemoryResult, SensoryProfile, StructuredRecipe } from "../shared/product";
import { ENV } from "./_core/env";
import { CHEF_KNOWLEDGE_SEED } from "./product/knowledge";
import { cosineSimilarity } from "./product/memory";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPalateProfile(userId: number) {
  const db = await requireDb();
  const [profile] = await db.select().from(palateProfiles).where(eq(palateProfiles.userId, userId)).limit(1);
  return profile;
}

export async function savePalateProfile(input: {
  userId: number;
  displayName: string;
  dimensions: SensoryProfile;
  confidence: SensoryProfile;
  dislikedIngredients: string[];
  dietaryRestrictions: string[];
  equipment: string[];
  calibrationComplete: boolean;
  mealsLearnedFrom?: number;
}) {
  const db = await requireDb();
  await db
    .insert(palateProfiles)
    .values({ ...input, mealsLearnedFrom: input.mealsLearnedFrom ?? 0 })
    .onDuplicateKeyUpdate({
      set: {
        displayName: input.displayName,
        dimensions: input.dimensions,
        confidence: input.confidence,
        dislikedIngredients: input.dislikedIngredients,
        dietaryRestrictions: input.dietaryRestrictions,
        equipment: input.equipment,
        calibrationComplete: input.calibrationComplete,
        ...(input.mealsLearnedFrom === undefined ? {} : { mealsLearnedFrom: input.mealsLearnedFrom }),
      },
    });
  return getPalateProfile(input.userId);
}

export async function addPalateSignals(
  userId: number,
  signals: Array<{
    dimension: string;
    direction: number;
    weight: number;
    valueBefore: number;
    valueAfter: number;
    confidenceBefore: number;
    confidenceAfter: number;
  }>,
  source: "calibration" | "meal_feedback" | "explicit_edit",
  recipeId?: number,
  feedbackId?: number
) {
  if (!signals.length) return;
  const db = await requireDb();
  await db.insert(palateSignals).values(
    signals.map(signal => ({
      userId,
      recipeId,
      feedbackId,
      source,
      ...signal,
    }))
  );
}

export async function listPalateSignals(userId: number) {
  const db = await requireDb();
  return db.select().from(palateSignals).where(eq(palateSignals.userId, userId)).orderBy(desc(palateSignals.createdAt)).limit(40);
}

export async function deleteCulinaryData(userId: number) {
  const db = await requireDb();
  await db.delete(analyticsEvents).where(eq(analyticsEvents.userId, userId));
  await db.delete(semanticMemoryEdges).where(eq(semanticMemoryEdges.userId, userId));
  await db.delete(semanticMemories).where(eq(semanticMemories.userId, userId));
  await db.delete(mealFeedback).where(eq(mealFeedback.userId, userId));
  await db.delete(palateSignals).where(eq(palateSignals.userId, userId));
  await db.delete(cookingSessions).where(eq(cookingSessions.userId, userId));
  await db.delete(recipes).where(eq(recipes.userId, userId));
  await db.delete(foodLensScans).where(eq(foodLensScans.userId, userId));
  await db.delete(ingredientScans).where(eq(ingredientScans.userId, userId));
  await db.delete(palateProfiles).where(eq(palateProfiles.userId, userId));
  return { deleted: true as const };
}

export async function createIngredientScan(input: {
  userId: number;
  source: "photo" | "description" | "craving";
  imageKey?: string;
  imageUrl?: string;
  originalInput?: string;
  ingredients: IngredientDetection[];
}) {
  const db = await requireDb();
  const [result] = await db.insert(ingredientScans).values(input).$returningId();
  return result.id;
}

export async function confirmIngredientScan(scanId: number, userId: number, ingredients: IngredientDetection[], corrected: boolean) {
  const db = await requireDb();
  await db
    .update(ingredientScans)
    .set({ ingredients, status: corrected ? "corrected" : "confirmed" })
    .where(and(eq(ingredientScans.id, scanId), eq(ingredientScans.userId, userId)));
  return getIngredientScan(scanId, userId);
}

export async function getIngredientScan(scanId: number, userId: number) {
  const db = await requireDb();
  const [scan] = await db
    .select()
    .from(ingredientScans)
    .where(and(eq(ingredientScans.id, scanId), eq(ingredientScans.userId, userId)))
    .limit(1);
  return scan;
}

export async function createFoodLensScan(input: {
  userId: number;
  imageKey?: string;
  imageUrl?: string;
  analysis: FoodLensAnalysis;
}) {
  const db = await requireDb();
  const [result] = await db
    .insert(foodLensScans)
    .values({
      userId: input.userId,
      imageKey: input.imageKey,
      imageUrl: input.imageUrl,
      dishGuess: input.analysis.dishGuess,
      overallConfidence: input.analysis.overallConfidence,
      portionConfidence: input.analysis.portionConfidence,
      uncertaintySummary: input.analysis.uncertaintySummary,
      measurementNote: input.analysis.measurementNote,
      estimateDisclosure: input.analysis.estimateDisclosure,
      items: input.analysis.items,
      totalNutrition: input.analysis.totalNutrition,
      generationMode: input.analysis.generationMode,
    })
    .$returningId();
  return result.id;
}

export async function getFoodLensScan(scanId: number, userId: number) {
  const db = await requireDb();
  const [scan] = await db
    .select()
    .from(foodLensScans)
    .where(and(eq(foodLensScans.id, scanId), eq(foodLensScans.userId, userId)))
    .limit(1);
  return scan;
}

export async function listFoodLensScans(userId: number) {
  const db = await requireDb();
  return db.select().from(foodLensScans).where(eq(foodLensScans.userId, userId)).orderBy(desc(foodLensScans.updatedAt)).limit(20);
}

export async function updateFoodLensScan(input: {
  scanId: number;
  userId: number;
  items: FoodLensItem[];
  totalNutrition: NutritionValues;
  measurementNote: string;
}) {
  const db = await requireDb();
  await db
    .update(foodLensScans)
    .set({ items: input.items, totalNutrition: input.totalNutrition, measurementNote: input.measurementNote })
    .where(and(eq(foodLensScans.id, input.scanId), eq(foodLensScans.userId, input.userId)));
  return getFoodLensScan(input.scanId, input.userId);
}

export async function upsertSemanticMemory(input: {
  userId: number;
  kind: "food_lens" | "recipe" | "meal_feedback" | "preference";
  sourceId?: number;
  title: string;
  content: string;
  vector: number[];
  metadata: Record<string, unknown>;
}) {
  const db = await requireDb();
  const existing = input.sourceId === undefined
    ? undefined
    : (await db
        .select()
        .from(semanticMemories)
        .where(and(eq(semanticMemories.userId, input.userId), eq(semanticMemories.kind, input.kind), eq(semanticMemories.sourceId, input.sourceId)))
        .limit(1))[0];
  if (existing) {
    await db
      .update(semanticMemories)
      .set({ title: input.title, content: input.content, vector: input.vector, metadata: input.metadata })
      .where(eq(semanticMemories.id, existing.id));
    return { ...existing, ...input, id: existing.id };
  }
  const [result] = await db.insert(semanticMemories).values(input).$returningId();
  const [created] = await db.select().from(semanticMemories).where(eq(semanticMemories.id, result.id)).limit(1);
  return created;
}

export async function refreshSemanticEdges(userId: number, fromMemoryId: number, vector: number[]) {
  const db = await requireDb();
  const memories = await db.select().from(semanticMemories).where(eq(semanticMemories.userId, userId));
  const candidates = memories
    .filter(memory => memory.id !== fromMemoryId)
    .map(memory => ({ memory, score: cosineSimilarity(vector, memory.vector as number[]) }))
    .filter(candidate => candidate.score >= 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  await db
    .delete(semanticMemoryEdges)
    .where(and(eq(semanticMemoryEdges.userId, userId), eq(semanticMemoryEdges.fromMemoryId, fromMemoryId)));
  if (candidates.length) {
    await db.insert(semanticMemoryEdges).values(
      candidates.map(candidate => ({
        userId,
        fromMemoryId,
        toMemoryId: candidate.memory.id,
        relation: "similar_to" as const,
        weight: Math.round(candidate.score * 100),
      }))
    );
  }
  return candidates.map(candidate => ({ id: candidate.memory.id, title: candidate.memory.title, similarity: Number(candidate.score.toFixed(3)) }));
}

export async function searchSemanticMemories(userId: number, vector: number[], limit = 4): Promise<SemanticMemoryResult[]> {
  const db = await requireDb();
  const memories = await db.select().from(semanticMemories).where(eq(semanticMemories.userId, userId));
  return memories
    .map(memory => ({
      id: memory.id,
      kind: memory.kind,
      title: memory.title,
      content: memory.content,
      metadata: memory.metadata as Record<string, unknown>,
      similarity: Number(cosineSimilarity(vector, memory.vector as number[]).toFixed(3)),
    }))
    .filter(memory => memory.similarity >= 0.18)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function saveRecipe(input: {
  userId: number;
  scanId?: number;
  optionImageUrl?: string;
  sourceIngredients: string[];
  recipe: StructuredRecipe;
}) {
  const db = await requireDb();
  const [result] = await db
    .insert(recipes)
    .values({
      userId: input.userId,
      scanId: input.scanId,
      title: input.recipe.title,
      summary: input.recipe.summary,
      rationale: input.recipe.rationale,
      imageUrl: input.optionImageUrl,
      sourceIngredients: input.sourceIngredients,
      ingredients: input.recipe.ingredients,
      equipment: input.recipe.equipment,
      miseEnPlace: input.recipe.miseEnPlace,
      steps: input.recipe.steps,
      sensoryProfile: input.recipe.sensoryProfile,
      substitutions: input.recipe.substitutions,
      safetyRules: input.recipe.safetyRules,
      platingNotes: input.recipe.platingNotes,
      activeMinutes: input.recipe.activeMinutes,
      totalMinutes: input.recipe.totalMinutes,
      difficulty: input.recipe.difficulty,
      tags: [],
      generationMode: input.recipe.generationMode,
    })
    .$returningId();
  return result.id;
}

export async function getRecipe(recipeId: number, userId: number) {
  const db = await requireDb();
  const [recipe] = await db.select().from(recipes).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId))).limit(1);
  return recipe;
}

export async function listRecipes(userId: number) {
  const db = await requireDb();
  return db.select().from(recipes).where(eq(recipes.userId, userId)).orderBy(desc(recipes.updatedAt)).limit(50);
}

export async function setFavorite(recipeId: number, userId: number, favorite: boolean) {
  const db = await requireDb();
  await db.update(recipes).set({ favorite }).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));
  return { recipeId, favorite };
}

export async function setRecipeTags(recipeId: number, userId: number, tags: string[]) {
  const db = await requireDb();
  await db.update(recipes).set({ tags }).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));
  return { recipeId, tags };
}

export async function startCookingSession(recipeId: number, userId: number) {
  const db = await requireDb();
  const [existing] = await db
    .select()
    .from(cookingSessions)
    .where(and(eq(cookingSessions.recipeId, recipeId), eq(cookingSessions.userId, userId), eq(cookingSessions.status, "active")))
    .limit(1);
  if (existing) return existing;
  const [result] = await db.insert(cookingSessions).values({ userId, recipeId, recoveryLog: [] }).$returningId();
  const [created] = await db.select().from(cookingSessions).where(eq(cookingSessions.id, result.id)).limit(1);
  return created;
}

export async function getCookingSession(sessionId: number, userId: number) {
  const db = await requireDb();
  const [session] = await db
    .select()
    .from(cookingSessions)
    .where(and(eq(cookingSessions.id, sessionId), eq(cookingSessions.userId, userId)))
    .limit(1);
  return session;
}

export async function updateCookingSession(input: {
  sessionId: number;
  userId: number;
  currentStep?: number;
  status?: "active" | "completed" | "abandoned";
  recoveryLog?: unknown[];
}) {
  const db = await requireDb();
  await db
    .update(cookingSessions)
    .set({
      ...(input.currentStep === undefined ? {} : { currentStep: input.currentStep }),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.recoveryLog === undefined ? {} : { recoveryLog: input.recoveryLog }),
      ...(input.status === "completed" ? { completedAt: new Date() } : {}),
    })
    .where(and(eq(cookingSessions.id, input.sessionId), eq(cookingSessions.userId, input.userId)));
  const [session] = await db.select().from(cookingSessions).where(eq(cookingSessions.id, input.sessionId)).limit(1);
  return session;
}

export async function addMealFeedback(input: {
  userId: number;
  recipeId: number;
  sessionId?: number;
  rating: "loved" | "good" | "okay" | "not_for_me";
  adjustments: string[];
  note?: string;
}) {
  const db = await requireDb();
  const [result] = await db.insert(mealFeedback).values(input).$returningId();
  return result.id;
}

export async function trackEvent(userId: number | undefined, eventName: string, properties: Record<string, unknown> = {}) {
  const db = await requireDb();
  await db.insert(analyticsEvents).values({ userId, eventName, properties });
}

export async function ensureChefKnowledge() {
  const db = await requireDb();
  const [first] = await db.select({ id: chefKnowledge.id }).from(chefKnowledge).limit(1);
  if (!first) {
    await db.insert(chefKnowledge).values(CHEF_KNOWLEDGE_SEED);
  }
  return db.select().from(chefKnowledge).orderBy(chefKnowledge.type, chefKnowledge.title);
}

export async function listChefKnowledge() {
  return ensureChefKnowledge();
}

export async function updateChefKnowledge(input: {
  id: number;
  title: string;
  summary: string;
  content: Record<string, unknown>;
  reviewStatus: "draft" | "chef_reviewed" | "authoritative";
  updatedBy: string;
}) {
  const db = await requireDb();
  await db
    .update(chefKnowledge)
    .set({ title: input.title, summary: input.summary, content: input.content, reviewStatus: input.reviewStatus, updatedBy: input.updatedBy })
    .where(and(eq(chefKnowledge.id, input.id), eq(chefKnowledge.editable, true)));
  const [record] = await db.select().from(chefKnowledge).where(eq(chefKnowledge.id, input.id)).limit(1);
  return record;
}
