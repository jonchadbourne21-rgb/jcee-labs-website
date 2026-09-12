import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const palateProfiles = mysqlTable("palate_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  dimensions: json("dimensions").notNull(),
  confidence: json("confidence").notNull(),
  dislikedIngredients: json("dislikedIngredients").notNull(),
  dietaryRestrictions: json("dietaryRestrictions").notNull(),
  equipment: json("equipment").notNull(),
  calibrationComplete: boolean("calibrationComplete").default(false).notNull(),
  mealsLearnedFrom: int("mealsLearnedFrom").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ingredientScans = mysqlTable(
  "ingredient_scans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    source: mysqlEnum("source", ["photo", "description", "craving"]).notNull(),
    imageKey: varchar("imageKey", { length: 512 }),
    imageUrl: text("imageUrl"),
    originalInput: text("originalInput"),
    ingredients: json("ingredients").notNull(),
    status: mysqlEnum("status", ["detected", "confirmed", "corrected"]).default("detected").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("ingredient_scans_user_idx").on(table.userId)]
);

export const foodLensScans = mysqlTable(
  "food_lens_scans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    imageKey: varchar("imageKey", { length: 512 }),
    imageUrl: text("imageUrl"),
    dishGuess: varchar("dishGuess", { length: 220 }).notNull(),
    overallConfidence: int("overallConfidence").notNull(),
    portionConfidence: int("portionConfidence").notNull(),
    uncertaintySummary: text("uncertaintySummary").notNull(),
    measurementNote: text("measurementNote").notNull(),
    estimateDisclosure: text("estimateDisclosure").notNull(),
    items: json("items").notNull(),
    totalNutrition: json("totalNutrition").notNull(),
    generationMode: mysqlEnum("generationMode", ["live_ai", "safe_fallback"]).default("live_ai").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("food_lens_scans_user_idx").on(table.userId), index("food_lens_scans_user_created_idx").on(table.userId, table.createdAt)]
);

export const nutritionGoals = mysqlTable(
  "nutrition_goals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    mode: mysqlEnum("mode", ["balanced", "high_protein", "lower_carb", "custom"]).default("balanced").notNull(),
    caloriesTarget: int("caloriesTarget").default(2000).notNull(),
    proteinGTarget: int("proteinGTarget").default(100).notNull(),
    carbsGTarget: int("carbsGTarget").default(250).notNull(),
    fatGTarget: int("fatGTarget").default(70).notNull(),
    fiberGTarget: int("fiberGTarget").default(28).notNull(),
    sodiumMgLimit: int("sodiumMgLimit").default(2300).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("nutrition_goals_user_unique").on(table.userId)]
);

export const nutritionLogs = mysqlTable(
  "nutrition_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    foodLensScanId: int("foodLensScanId").notNull(),
    mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("dinner").notNull(),
    nutritionSnapshot: json("nutritionSnapshot").notNull(),
    eatenAt: timestamp("eatenAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("nutrition_logs_user_scan_unique").on(table.userId, table.foodLensScanId),
    index("nutrition_logs_user_eaten_idx").on(table.userId, table.eatenAt),
  ]
);

export const packagedFoodProducts = mysqlTable(
  "packaged_food_products",
  {
    id: int("id").autoincrement().primaryKey(),
    barcode: varchar("barcode", { length: 32 }).notNull(),
    productName: varchar("productName", { length: 320 }).notNull(),
    brands: varchar("brands", { length: 320 }),
    servingSize: varchar("servingSize", { length: 120 }),
    ingredientsText: text("ingredientsText"),
    allergens: json("allergens").notNull(),
    nutritionPerServing: json("nutritionPerServing").notNull(),
    nutritionPer100g: json("nutritionPer100g"),
    nutrimentsRaw: json("nutrimentsRaw").notNull(),
    sourceUrl: text("sourceUrl").notNull(),
    sourceCompleteness: int("sourceCompleteness"),
    imageUrl: text("imageUrl"),
    sourceUpdatedAt: timestamp("sourceUpdatedAt"),
    fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("packaged_food_products_barcode_unique").on(table.barcode)]
);

export const packagedFoodLogs = mysqlTable(
  "packaged_food_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    packagedFoodProductId: int("packagedFoodProductId").notNull(),
    mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("snack").notNull(),
    servings: decimal("servings", { precision: 6, scale: 2 }).default("1.00").notNull(),
    nutritionSnapshot: json("nutritionSnapshot").notNull(),
    eatenAt: timestamp("eatenAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("packaged_food_logs_user_eaten_idx").on(table.userId, table.eatenAt),
    index("packaged_food_logs_user_product_idx").on(table.userId, table.packagedFoodProductId),
  ]
);

export const customFoodLabels = mysqlTable(
  "custom_food_labels",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    barcode: varchar("barcode", { length: 32 }),
    productName: varchar("productName", { length: 320 }).notNull(),
    brand: varchar("brand", { length: 320 }),
    servingSize: varchar("servingSize", { length: 120 }).notNull(),
    ingredientsText: text("ingredientsText"),
    allergens: json("allergens").notNull(),
    nutritionPerServing: json("nutritionPerServing").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("custom_food_labels_user_idx").on(table.userId), index("custom_food_labels_user_barcode_idx").on(table.userId, table.barcode)]
);

export const customFoodLogs = mysqlTable(
  "custom_food_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    customFoodLabelId: int("customFoodLabelId").notNull(),
    mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("snack").notNull(),
    servings: decimal("servings", { precision: 6, scale: 2 }).default("1.00").notNull(),
    nutritionSnapshot: json("nutritionSnapshot").notNull(),
    eatenAt: timestamp("eatenAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("custom_food_logs_user_eaten_idx").on(table.userId, table.eatenAt),
    index("custom_food_logs_user_label_idx").on(table.userId, table.customFoodLabelId),
  ]
);

export const barcodeDeviceDiagnostics = mysqlTable(
  "barcode_device_diagnostics",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    deviceLabel: varchar("deviceLabel", { length: 180 }).notNull(),
    platform: varchar("platform", { length: 160 }).notNull(),
    browser: varchar("browser", { length: 160 }).notNull(),
    engine: mysqlEnum("engine", ["native", "zxing", "unavailable"]).notNull(),
    cameraStartMs: int("cameraStartMs"),
    firstDetectionMs: int("firstDetectionMs"),
    trialCount: int("trialCount").default(0).notNull(),
    successfulTrials: int("successfulTrials").default(0).notNull(),
    medianDetectionMs: int("medianDetectionMs"),
    focusSupported: boolean("focusSupported").default(false).notNull(),
    continuousFocusSupported: boolean("continuousFocusSupported").default(false).notNull(),
    torchSupported: boolean("torchSupported").default(false).notNull(),
    rearCameraSelected: boolean("rearCameraSelected").default(false).notNull(),
    videoWidth: int("videoWidth"),
    videoHeight: int("videoHeight"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("barcode_device_diagnostics_user_created_idx").on(table.userId, table.createdAt)]
);

export const semanticMemories = mysqlTable(
  "semantic_memories",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    kind: mysqlEnum("kind", ["food_lens", "recipe", "meal_feedback", "preference"]).notNull(),
    sourceId: int("sourceId"),
    title: varchar("title", { length: 220 }).notNull(),
    content: text("content").notNull(),
    vector: json("vector").notNull(),
    metadata: json("metadata").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("semantic_memories_user_idx").on(table.userId), index("semantic_memories_user_kind_idx").on(table.userId, table.kind), index("semantic_memories_source_idx").on(table.userId, table.kind, table.sourceId)]
);

export const semanticMemoryEdges = mysqlTable(
  "semantic_memory_edges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fromMemoryId: int("fromMemoryId").notNull(),
    toMemoryId: int("toMemoryId").notNull(),
    relation: mysqlEnum("relation", ["similar_to", "derived_from", "reinforces"]).notNull(),
    weight: int("weight").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("semantic_memory_edges_user_idx").on(table.userId), index("semantic_memory_edges_from_idx").on(table.fromMemoryId)]
);

export const recipes = mysqlTable(
  "recipes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    scanId: int("scanId"),
    foodLensScanId: int("foodLensScanId"),
    parentRecipeId: int("parentRecipeId"),
    version: int("version").default(1).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    summary: text("summary").notNull(),
    rationale: text("rationale").notNull(),
    imageUrl: text("imageUrl"),
    sourceIngredients: json("sourceIngredients").notNull(),
    ingredients: json("ingredients").notNull(),
    equipment: json("equipment").notNull(),
    miseEnPlace: json("miseEnPlace").notNull(),
    steps: json("steps").notNull(),
    sensoryProfile: json("sensoryProfile").notNull(),
    substitutions: json("substitutions").notNull(),
    safetyRules: json("safetyRules").notNull(),
    platingNotes: text("platingNotes").notNull(),
    activeMinutes: int("activeMinutes").notNull(),
    totalMinutes: int("totalMinutes").notNull(),
    difficulty: mysqlEnum("difficulty", ["easy", "moderate", "ambitious"]).default("moderate").notNull(),
    favorite: boolean("favorite").default(false).notNull(),
    tags: json("tags").notNull(),
    generationMode: mysqlEnum("generationMode", ["live_ai", "safe_fallback"]).default("live_ai").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("recipes_user_idx").on(table.userId), index("recipes_scan_idx").on(table.scanId), index("recipes_food_lens_scan_idx").on(table.foodLensScanId), index("recipes_user_favorite_idx").on(table.userId, table.favorite)]
);

export const cookingSessions = mysqlTable(
  "cooking_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    recipeId: int("recipeId").notNull(),
    status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
    currentStep: int("currentStep").default(0).notNull(),
    recoveryLog: json("recoveryLog").notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [index("cooking_sessions_user_idx").on(table.userId), index("cooking_sessions_recipe_idx").on(table.recipeId)]
);

export const mealFeedback = mysqlTable(
  "meal_feedback",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    recipeId: int("recipeId").notNull(),
    sessionId: int("sessionId"),
    rating: mysqlEnum("rating", ["loved", "good", "okay", "not_for_me"]).notNull(),
    adjustments: json("adjustments").notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("meal_feedback_user_idx").on(table.userId), index("meal_feedback_recipe_idx").on(table.recipeId)]
);

export const palateSignals = mysqlTable(
  "palate_signals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    recipeId: int("recipeId"),
    feedbackId: int("feedbackId"),
    dimension: varchar("dimension", { length: 80 }).notNull(),
    direction: int("direction").notNull(),
    weight: int("weight").notNull(),
    valueBefore: int("valueBefore").notNull(),
    valueAfter: int("valueAfter").notNull(),
    confidenceBefore: int("confidenceBefore").notNull(),
    confidenceAfter: int("confidenceAfter").notNull(),
    source: mysqlEnum("source", ["calibration", "meal_feedback", "explicit_edit"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("palate_signals_user_idx").on(table.userId)]
);

export const chefKnowledge = mysqlTable("chef_knowledge", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  type: mysqlEnum("type", [
    "technique",
    "ingredient",
    "cut",
    "error",
    "recovery",
    "sensory_transformation",
    "safety",
  ]).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  summary: text("summary").notNull(),
  content: json("content").notNull(),
  sourceLabel: varchar("sourceLabel", { length: 220 }),
  sourceUrl: text("sourceUrl"),
  reviewStatus: mysqlEnum("reviewStatus", ["draft", "chef_reviewed", "authoritative"]).default("draft").notNull(),
  editable: boolean("editable").default(true).notNull(),
  updatedBy: varchar("updatedBy", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const analyticsEvents = mysqlTable(
  "analytics_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    eventName: varchar("eventName", { length: 120 }).notNull(),
    properties: json("properties").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("analytics_events_user_idx").on(table.userId), index("analytics_events_name_idx").on(table.eventName)]
);
