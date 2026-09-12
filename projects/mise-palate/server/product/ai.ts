import { invokeLLM, listLLMModels } from "../_core/llm";
import {
  DEFAULT_PALATE,
  DISH_IMAGES,
  SENSORY_DIMENSIONS,
  type IngredientDetection,
  type RecipeOption,
  type SensoryDimension,
  type SensoryProfile,
  type StructuredRecipe,
  type TasteForecast,
} from "../../shared/product";
import { enforceSafetyText, relevantSafetyRules } from "./safety";

const sensoryProperties = Object.fromEntries(
  SENSORY_DIMENSIONS.map(dimension => [dimension, { type: "integer", minimum: 0, maximum: 100 }])
);
const sensorySchema = {
  type: "object",
  properties: sensoryProperties,
  required: [...SENSORY_DIMENSIONS],
  additionalProperties: false,
};

async function availableModels() {
  try {
    const { data } = await listLLMModels();
    return new Set(data.map(model => model.id));
  } catch {
    return new Set<string>();
  }
}

async function pickModel(preferred: string, fallback: string) {
  const models = await availableModels();
  if (models.has(preferred)) return preferred;
  if (models.has(fallback)) return fallback;
  return undefined;
}

function contentOf(response: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Model returned no structured content");
  return JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
}

function imageForTitle(title: string) {
  const normalized = title.toLowerCase();
  if (/korean|gochujang|sesame/.test(normalized)) return DISH_IMAGES.korean;
  if (/tuscan|creamy/.test(normalized)) return DISH_IMAGES.tuscan;
  return DISH_IMAGES.lemon;
}

export async function analyzeFoodImage(dataUrl: string, context = "") {
  const model = await pickModel("gpt-5-mini", "gemini-3-flash-preview");
  if (!model) return fallbackDetection(context);
  try {
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are the vision layer of a cooking product. Identify only ingredients or prepared food visibly supported by the image. Never silently resolve uncertainty. Confidence is 0-100. Set needsConfirmation true below 82 or when identity/quantity is ambiguous. Use ordinary ingredient names. Output strict JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this food image. User context: ${context || "none"}` },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "food_image_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              dishGuess: { type: "string" },
              overallConfidence: { type: "integer", minimum: 0, maximum: 100 },
              uncertaintySummary: { type: "string" },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    confidence: { type: "integer", minimum: 0, maximum: 100 },
                    quantityHint: { type: "string" },
                    needsConfirmation: { type: "boolean" },
                  },
                  required: ["name", "confidence", "quantityHint", "needsConfirmation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["dishGuess", "overallConfidence", "uncertaintySummary", "ingredients"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    return { ...contentOf(response), generationMode: "live_ai" as const };
  } catch (error) {
    console.warn("[Vision] Live analysis failed, using safe fallback", error);
    return fallbackDetection(context);
  }
}

function fallbackDetection(context: string) {
  const named = context
    .split(/,|\band\b/i)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 10);
  const defaults = ["chicken thighs", "broccoli", "lemon", "garlic", "Parmesan"];
  return {
    dishGuess: "Ingredients ready to cook",
    overallConfidence: named.length ? 72 : 48,
    uncertaintySummary: "Vision was unavailable, so every item needs your confirmation before cooking guidance is created.",
    ingredients: (named.length ? named : defaults).map(name => ({
      name,
      confidence: named.length ? 72 : 48,
      quantityHint: "confirm amount",
      needsConfirmation: true,
    })) as IngredientDetection[],
    generationMode: "safe_fallback" as const,
  };
}

export async function generateRecipeOptions(params: {
  ingredients: string[];
  palate: SensoryProfile;
  equipment: string[];
  timeMinutes: number;
  difficulty: "easy" | "moderate" | "ambitious";
  dietaryRestrictions: string[];
  craving?: string;
}) {
  const model = await pickModel("gpt-5-mini", "gemini-3-flash-preview");
  if (!model) return fallbackOptions(params.ingredients, params.palate);
  try {
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a chef creating four meaningfully different cooking directions, not four cosmetic recipe variants. Respect restrictions and available equipment. Explain why each direction fits the user's sensory profile. Output strict JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(params),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_options",
          strict: true,
          schema: {
            type: "object",
            properties: {
              options: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    whyForYou: { type: "string" },
                    cuisine: { type: "string" },
                    activeMinutes: { type: "integer" },
                    totalMinutes: { type: "integer" },
                    difficulty: { type: "string", enum: ["easy", "moderate", "ambitious"] },
                    sensoryProfile: sensorySchema,
                  },
                  required: [
                    "id",
                    "title",
                    "description",
                    "whyForYou",
                    "cuisine",
                    "activeMinutes",
                    "totalMinutes",
                    "difficulty",
                    "sensoryProfile",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["options"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    const data = contentOf(response) as { options: Omit<RecipeOption, "imageUrl">[] };
    return {
      generationMode: "live_ai" as const,
      options: data.options.map(option => ({ ...option, imageUrl: imageForTitle(option.title) })),
    };
  } catch (error) {
    console.warn("[Options] Live generation failed, using chef fallback", error);
    return fallbackOptions(params.ingredients, params.palate);
  }
}

function fallbackOptions(ingredients: string[], palate: SensoryProfile) {
  const source = ingredients.join(", ");
  const base = [
    {
      id: "crispy-lemon-parmesan",
      title: "Crispy lemon-Parmesan chicken",
      description: `High-heat chicken and roasted vegetables with garlic, lemon and a crisp Parmesan finish using ${source}.`,
      whyForYou: `Built for your ${palate.acidity}% acidity and ${palate.crunch}% crunch preferences.`,
      cuisine: "Modern Italian",
      activeMinutes: 20,
      totalMinutes: 42,
      difficulty: "moderate" as const,
      sensoryProfile: { ...DEFAULT_PALATE, acidity: 82, crunch: 86, richness: 58, spice: 28 },
      imageUrl: DISH_IMAGES.lemon,
    },
    {
      id: "spicy-korean-bowls",
      title: "Spicy Korean-style chicken bowls",
      description: "Lacquered savory-spicy chicken, charred broccoli, rice and quick lemon pickles.",
      whyForYou: `A bolder route calibrated to ${palate.spice}% spice with crisp edges preserved.`,
      cuisine: "Korean-inspired",
      activeMinutes: 25,
      totalMinutes: 40,
      difficulty: "moderate" as const,
      sensoryProfile: { ...DEFAULT_PALATE, spice: 78, sweetness: 58, crunch: 70, richness: 60 },
      imageUrl: DISH_IMAGES.korean,
    },
    {
      id: "creamy-tuscan",
      title: "Creamy Tuscan chicken",
      description: "Golden chicken in a glossy garlic-Parmesan pan sauce with broccoli folded through at the end.",
      whyForYou: "A rounder, sauce-forward route that keeps lemon available to cut the richness.",
      cuisine: "Italian-American",
      activeMinutes: 22,
      totalMinutes: 38,
      difficulty: "easy" as const,
      sensoryProfile: { ...DEFAULT_PALATE, richness: 82, sauce: 88, acidity: 52, crunch: 45 },
      imageUrl: DISH_IMAGES.tuscan,
    },
    {
      id: "chef-choice",
      title: "Let the chef choose",
      description: "A balanced plan chosen from your strongest palate signals, time, and the ingredient condition.",
      whyForYou: "Uses your Palate Twin as the decision rule rather than defaulting to a generic popular recipe.",
      cuisine: "Chef's choice",
      activeMinutes: 20,
      totalMinutes: 40,
      difficulty: "moderate" as const,
      sensoryProfile: { ...palate },
      imageUrl: DISH_IMAGES.lemon,
    },
  ];
  return { generationMode: "safe_fallback" as const, options: base };
}

export async function generateStructuredRecipe(params: {
  option: RecipeOption;
  ingredients: string[];
  palate: SensoryProfile;
  dietaryRestrictions: string[];
  equipment: string[];
  chefKnowledge: Array<{ slug: string; title: string; summary: string; content: unknown }>;
}) {
  const safetyRules = relevantSafetyRules(params.ingredients, params.option.title);
  const model = await pickModel("gpt-5", "gpt-5-mini");
  if (!model) return fallbackRecipe(params, safetyRules);
  try {
    const response = await invokeLLM({
      model,
      reasoning: { effort: "low" },
      messages: [
        {
          role: "system",
          content:
            "You are the generative reasoning layer of a chef-guided cooking product. Use the supplied reviewed Chef Knowledge; do not invent authoritative safety temperatures. Every instruction must include the reason, sensory cues, a likely mistake, and a recovery. Time is guidance; cues decide doneness. Output strict JSON only. Return no safety prose beyond known safety rule IDs supplied by the user payload.",
        },
        { role: "user", content: JSON.stringify({ ...params, safetyRules }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_recipe",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              rationale: { type: "string" },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "number" },
                    unit: { type: "string" },
                    preparation: { type: "string" },
                    optional: { type: "boolean" },
                    allergens: { type: "array", items: { type: "string" } },
                  },
                  required: ["name", "amount", "unit", "preparation", "optional", "allergens"],
                  additionalProperties: false,
                },
              },
              equipment: { type: "array", items: { type: "string" } },
              miseEnPlace: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    order: { type: "integer" },
                    task: { type: "string" },
                    reason: { type: "string" },
                    canParallelize: { type: "boolean" },
                  },
                  required: ["order", "task", "reason", "canParallelize"],
                  additionalProperties: false,
                },
              },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    instruction: { type: "string" },
                    why: { type: "string" },
                    minutes: { type: "integer" },
                    temperatureF: { type: "integer" },
                    visualCue: { type: "string" },
                    smellCue: { type: "string" },
                    textureCue: { type: "string" },
                    commonMistake: { type: "string" },
                    recovery: { type: "string" },
                    techniqueSlug: { type: "string" },
                    parallelGroup: { type: "string" },
                    safetyRuleIds: { type: "array", items: { type: "string" } },
                  },
                  required: ["id", "title", "instruction", "why", "minutes", "temperatureF", "visualCue", "smellCue", "textureCue", "commonMistake", "recovery", "techniqueSlug", "parallelGroup", "safetyRuleIds"],
                  additionalProperties: false,
                },
              },
              sensoryProfile: sensorySchema,
              substitutions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ingredient: { type: "string" },
                    substitute: { type: "string" },
                    ratio: { type: "string" },
                    sensoryTradeoff: { type: "string" },
                    methodChange: { type: "string" },
                  },
                  required: ["ingredient", "substitute", "ratio", "sensoryTradeoff", "methodChange"],
                  additionalProperties: false,
                },
              },
              platingNotes: { type: "string" },
              activeMinutes: { type: "integer" },
              totalMinutes: { type: "integer" },
              difficulty: { type: "string", enum: ["easy", "moderate", "ambitious"] },
            },
            required: ["title", "summary", "rationale", "ingredients", "equipment", "miseEnPlace", "steps", "sensoryProfile", "substitutions", "platingNotes", "activeMinutes", "totalMinutes", "difficulty"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    const data = contentOf(response) as Omit<StructuredRecipe, "safetyRules" | "generationMode">;
    const validSafetyIds = new Set(safetyRules.map(rule => rule.id));
    return {
      ...data,
      steps: data.steps.map(step => ({
        ...step,
        safetyRuleIds: step.safetyRuleIds.filter(id => validSafetyIds.has(id)),
      })),
      safetyRules,
      generationMode: "live_ai" as const,
    };
  } catch (error) {
    console.warn("[Recipe] Live generation failed, using reviewed fallback", error);
    return fallbackRecipe(params, safetyRules);
  }
}

function fallbackRecipe(
  params: {
    option: RecipeOption;
    ingredients: string[];
    palate: SensoryProfile;
    equipment: string[];
  },
  safetyRules: ReturnType<typeof relevantSafetyRules>
): StructuredRecipe {
  const poultryRule = safetyRules.find(rule => rule.id === "poultry-165");
  return {
    title: params.option.title,
    summary: "Crisp-skinned chicken thighs with deeply roasted broccoli, garlic, charred lemon and a Parmesan finish.",
    rationale: `The method protects crispness while using late lemon to match your ${params.palate.acidity}% acidity preference.`,
    ingredients: [
      { name: "chicken thighs", amount: 4, unit: "pieces", preparation: "patted very dry", optional: false, allergens: [] },
      { name: "broccoli", amount: 1, unit: "large head", preparation: "cut into even florets", optional: false, allergens: [] },
      { name: "lemon", amount: 1, unit: "whole", preparation: "zested, halved", optional: false, allergens: [] },
      { name: "garlic", amount: 4, unit: "cloves", preparation: "lightly crushed", optional: false, allergens: [] },
      { name: "Parmesan", amount: 45, unit: "g", preparation: "finely grated", optional: false, allergens: ["milk"] },
      { name: "olive oil", amount: 2, unit: "tbsp", preparation: "divided", optional: false, allergens: [] },
      { name: "kosher salt", amount: 1.5, unit: "tsp", preparation: "divided", optional: false, allergens: [] },
    ],
    equipment: ["oven-safe skillet or sheet pan", "food thermometer", "fine grater", "chef's knife", "cutting board"],
    miseEnPlace: [
      { order: 1, task: "Heat oven to 425°F and place the rack in the upper middle.", reason: "A fully heated oven starts evaporation and browning immediately.", canParallelize: true },
      { order: 2, task: "Pat the chicken very dry and season it.", reason: "Surface moisture delays crispness.", canParallelize: false },
      { order: 3, task: "Cut broccoli evenly; crush garlic; zest and halve the lemon.", reason: "Uniform pieces reach the same texture together.", canParallelize: true },
    ],
    steps: [
      {
        id: "step-1",
        title: "Start the skin",
        instruction: "Set the chicken skin-side down in a dry, cool oven-safe skillet. Turn to medium heat and let the fat render until the skin is deep gold and releases easily; 8 minutes is a guide.",
        why: "A gradual start renders fat before the exterior burns, creating a thinner, crisper skin.",
        minutes: 8,
        temperatureF: 0,
        visualCue: "The skin is evenly golden with small active bubbles at the edges.",
        smellCue: "Clean roasted-chicken aroma, never acrid smoke.",
        textureCue: "The chicken lifts without sticking when the crust is ready.",
        commonMistake: "Moving the chicken before the crust sets.",
        recovery: "Wait 60–90 seconds and try again; lower the heat if any patch turns dark brown.",
        techniqueSlug: "dry-surface-browning",
        parallelGroup: "broccoli-prep",
        safetyRuleIds: ["cross-contamination"],
      },
      {
        id: "step-2",
        title: "Roast to crisp",
        instruction: "Turn the chicken skin-side up. Add broccoli and garlic around it with oil and salt. Roast until the broccoli edges are charred and the chicken reaches the authoritative safe temperature.",
        why: "Keeping the skin above the pan juices preserves crispness while the oven cooks evenly.",
        minutes: 18,
        temperatureF: 425,
        visualCue: "Broccoli edges are nearly black in spots; chicken skin looks taut and crisp.",
        smellCue: "Nutty broccoli and sweet roasted garlic.",
        textureCue: "Chicken juices run clear, but temperature—not juice color—is the safety decision.",
        commonMistake: "Pouring liquid over the skin.",
        recovery: "Move sauce or juices around the chicken and return it to the oven for 2–3 minutes.",
        techniqueSlug: "chicken-thigh-crispness",
        parallelGroup: "roast",
        safetyRuleIds: poultryRule ? [poultryRule.id] : [],
      },
      {
        id: "step-3",
        title: "Finish bright",
        instruction: "Rest the chicken briefly. Toss the broccoli with lemon zest, half the juice and Parmesan. Taste before adding the remaining juice; spoon any pan juices around, not over, the crisp skin.",
        why: "Late lemon preserves volatile aroma and lets you control brightness without softening the skin.",
        minutes: 4,
        temperatureF: 0,
        visualCue: "Parmesan lightly clings rather than forming a wet paste.",
        smellCue: "Fresh lemon should arrive before the richer roasted aroma.",
        textureCue: "Crisp skin, tender chicken, and broccoli with a firm stem.",
        commonMistake: "Adding all the lemon without tasting.",
        recovery: "If too sharp, add a spoon of pan juices or olive oil; if dull, add the remaining juice a teaspoon at a time.",
        techniqueSlug: "lemon-sensory-change",
        parallelGroup: "finish",
        safetyRuleIds: [],
      },
    ],
    sensoryProfile: params.option.sensoryProfile,
    substitutions: [
      { ingredient: "Parmesan", substitute: "toasted breadcrumbs plus nutritional yeast", ratio: "2 tbsp + 1 tbsp", sensoryTradeoff: "Less dairy richness; more dry crunch and toastiness.", methodChange: "Toast separately and add only after roasting." },
      { ingredient: "broccoli", substitute: "cauliflower florets", ratio: "1:1 by volume", sensoryTradeoff: "Sweeter and softer with slightly less bitterness.", methodChange: "Cut smaller and begin checking 3 minutes earlier." },
      { ingredient: "heavy cream", substitute: "not required in this crisp preparation", ratio: "omit", sensoryTradeoff: "Keeps the dish brighter and the skin crisp.", methodChange: "Use pan juices and olive oil for body instead." },
    ],
    safetyRules,
    platingNotes: "Set broccoli first, lean the chicken against it with the skin fully exposed, and finish with lemon zest at the table.",
    activeMinutes: 20,
    totalMinutes: 42,
    difficulty: params.option.difficulty,
    generationMode: "safe_fallback",
  };
}

export async function getSubstitution(recipe: StructuredRecipe, missingIngredient: string, userContext = "") {
  const model = await pickModel("gpt-5-mini", "gemini-3-flash-preview");
  const known = recipe.substitutions.find(item => item.ingredient.toLowerCase().includes(missingIngredient.toLowerCase()));
  if (!model) return known ?? { ingredient: missingIngredient, substitute: "omit if non-structural", ratio: "n/a", sensoryTradeoff: "The result may be less complete.", methodChange: "Taste and adjust at the end." };
  try {
    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "Recommend one technically sound cooking substitution. Do not weaken food-safety rules or claim allergen safety. Output strict JSON only." },
        { role: "user", content: JSON.stringify({ recipe, missingIngredient, userContext }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ingredient_substitution",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ingredient: { type: "string" },
              substitute: { type: "string" },
              ratio: { type: "string" },
              sensoryTradeoff: { type: "string" },
              methodChange: { type: "string" },
            },
            required: ["ingredient", "substitute", "ratio", "sensoryTradeoff", "methodChange"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    return contentOf(response);
  } catch {
    return known ?? { ingredient: missingIngredient, substitute: "omit if non-structural", ratio: "n/a", sensoryTradeoff: "Flavor intensity will decrease.", methodChange: "Taste and rebalance near the end." };
  }
}

export async function forecastTaste(recipe: StructuredRecipe, requestedChange: string): Promise<TasteForecast> {
  const model = await pickModel("gpt-5-mini", "gemini-3-flash-preview");
  if (!model) return fallbackForecast(requestedChange);
  try {
    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "Predict plausible sensory consequences of a recipe modification. Be directional, bounded, and honest about uncertainty. Never modify or contradict authoritative safety facts. Delta values range from -30 to 30. Output strict JSON only." },
        { role: "user", content: JSON.stringify({ recipe: { title: recipe.title, ingredients: recipe.ingredients, sensoryProfile: recipe.sensoryProfile }, requestedChange }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "taste_forecast",
          strict: true,
          schema: {
            type: "object",
            properties: {
              interpretation: { type: "string" },
              confidence: { type: "string", enum: ["high", "medium", "low"] },
              changes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    dimension: { type: "string", enum: [...SENSORY_DIMENSIONS] },
                    delta: { type: "integer", minimum: -30, maximum: 30 },
                    explanation: { type: "string" },
                  },
                  required: ["dimension", "delta", "explanation"],
                  additionalProperties: false,
                },
              },
              culinaryActions: { type: "array", items: { type: "string" } },
              watchOuts: { type: "array", items: { type: "string" } },
            },
            required: ["interpretation", "confidence", "changes", "culinaryActions", "watchOuts"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    return contentOf(response) as TasteForecast;
  } catch {
    return fallbackForecast(requestedChange);
  }
}

function fallbackForecast(requestedChange: string): TasteForecast {
  const lemon = /lemon|acid|bright/i.test(requestedChange);
  const longer = /longer|minutes|roast/i.test(requestedChange);
  const changes: TasteForecast["changes"] = lemon
    ? [
        { dimension: "acidity", delta: 18, explanation: "Citric acid creates immediate brightness." },
        { dimension: "richness", delta: -9, explanation: "Acid lowers the perception of fat and heaviness." },
        { dimension: "salt", delta: 4, explanation: "Acidity can make existing seasoning seem more vivid." },
      ]
    : longer
      ? [
          { dimension: "crunch", delta: 12, explanation: "More surface moisture evaporates and browning deepens." },
          { dimension: "sweetness", delta: 7, explanation: "More browning concentrates natural sweetness." },
          { dimension: "tenderness", delta: -6, explanation: "Continued heat drives out moisture." },
        ]
      : [{ dimension: "herbaceous", delta: 5, explanation: "The change is likely to alter aroma more than core taste." }];
  return {
    interpretation: lemon ? "A brighter, leaner-tasting finish" : longer ? "More browned and crisp, with a moisture tradeoff" : "A modest sensory shift",
    confidence: lemon || longer ? "high" : "low",
    changes,
    culinaryActions: [lemon ? "Add half first, taste, then add more by teaspoon." : "Make the change in a small increment and evaluate using visual and texture cues."],
    watchOuts: [longer ? "Do not use extra time as a substitute for checking the authoritative safe temperature." : "You can add more, but you cannot remove it once incorporated."],
  };
}

export async function recoverCook(recipe: StructuredRecipe, problem: string, currentStep: number) {
  const rules = recipe.safetyRules;
  const model = await pickModel("gpt-5-mini", "gemini-3-flash-preview");
  if (!model) {
    const text = /heavy cream/i.test(problem)
      ? "You can continue without heavy cream. Use a little starchy water or pan juice, reduce until it coats a spoon, then finish with olive oil or butter off heat. The result will be brighter and less rich."
      : "Lower the heat, compare the food with the visual cue, and make one small correction at a time.";
    return { answer: enforceSafetyText(text, rules), immediateActions: ["Pause and assess the visual cue", "Lower heat if browning is accelerating"], why: "Recovery should preserve the current progress rather than restart the recipe.", safetyNote: rules.map(rule => rule.requirement).join(" ") };
  }
  try {
    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "You are a calm chef helping recover an in-progress cook. Never tell the user to restart unless the food is unsafe. Do not contradict the supplied authoritative safety rules. Output strict JSON only." },
        { role: "user", content: JSON.stringify({ recipe, problem, currentStep, authoritativeSafetyRules: rules }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cook_recovery",
          strict: true,
          schema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              immediateActions: { type: "array", items: { type: "string" } },
              why: { type: "string" },
              safetyNote: { type: "string" },
            },
            required: ["answer", "immediateActions", "why", "safetyNote"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    const data = contentOf(response);
    data.answer = enforceSafetyText(data.answer, rules);
    return data;
  } catch {
    return { answer: "Lower the heat, use the recipe's visual cue, and make one small correction at a time.", immediateActions: ["Pause", "Lower heat", "Check temperature if cooking protein"], why: "This protects both the food and your progress.", safetyNote: rules.map(rule => rule.requirement).join(" ") };
  }
}

export function mergePalates(primary: SensoryProfile, secondary: SensoryProfile) {
  const shared = { ...DEFAULT_PALATE };
  const tensions: Array<{ dimension: SensoryDimension; gap: number; strategy: string }> = [];
  for (const dimension of SENSORY_DIMENSIONS) {
    const gap = Math.abs(primary[dimension] - secondary[dimension]);
    shared[dimension] = Math.round((primary[dimension] + secondary[dimension]) / 2);
    if (gap >= 25) {
      tensions.push({
        dimension,
        gap,
        strategy:
          dimension === "spice"
            ? "Cook the shared base mild; add chile crisp or hot sauce at the table."
            : dimension === "acidity"
              ? "Finish individual portions with lemon rather than acidifying the shared pan."
              : dimension === "crunch"
                ? "Keep the crisp garnish separate so each diner controls texture."
                : "Keep the shared base moderate and provide a finishing adjustment per plate.",
      });
    }
  }
  return { shared, tensions };
}
