import { invokeLLM, listLLMModels } from "../_core/llm";
import type { FoodLensAnalysis } from "../../shared/product";
import { FOOD_LENS_DISCLOSURE, hydrateFoodLensItem, lookupUSDAReference, scaleNutrition, totalFoodLensNutrition, USDA_SOURCE } from "./nutrition";

async function pickFoodLensModel() {
  try {
    const { data } = await listLLMModels();
    const ids = new Set(data.map(item => item.id));
    if (ids.has("gpt-5-mini")) return "gpt-5-mini";
    if (ids.has("gemini-3-flash-preview")) return "gemini-3-flash-preview";
    return undefined;
  } catch {
    return undefined;
  }
}

function parseContent(response: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Food Lens model returned no structured content");
  return JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
}

type VisionCandidate = {
  id: string;
  name: string;
  confidence: number;
  estimatedGrams: number;
  portionConfidence: number;
  needsConfirmation: boolean;
};

export async function analyzeFoodLens(dataUrl: string, context = ""): Promise<FoodLensAnalysis> {
  const model = await pickFoodLensModel();
  if (!model) return fallbackFoodLens(context);
  try {
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are Food Lens, a cautious food-image recognition layer. Identify only visible foods, estimate edible grams only when visual scale makes that plausible, and state uncertainty plainly. Never claim exact calories, package-label values, medical guidance, allergens, or ingredients hidden by a sauce. Set needsConfirmation true when identity, cooking method, or portion is uncertain. Portion confidence is 0-100. Output strict JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this meal photo for food identity and estimated portion mass. Context from the user: ${context || "none"}` },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "food_lens_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              dishGuess: { type: "string" },
              overallConfidence: { type: "integer", minimum: 0, maximum: 100 },
              portionConfidence: { type: "integer", minimum: 0, maximum: 100 },
              uncertaintySummary: { type: "string" },
              measurementNote: { type: "string" },
              items: {
                type: "array",
                minItems: 1,
                maxItems: 12,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    confidence: { type: "integer", minimum: 0, maximum: 100 },
                    estimatedGrams: { type: "integer", minimum: 0, maximum: 2000 },
                    portionConfidence: { type: "integer", minimum: 0, maximum: 100 },
                    needsConfirmation: { type: "boolean" },
                  },
                  required: ["id", "name", "confidence", "estimatedGrams", "portionConfidence", "needsConfirmation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["dishGuess", "overallConfidence", "portionConfidence", "uncertaintySummary", "measurementNote", "items"],
            additionalProperties: false,
          },
        },
      },
    } as any);
    const data = parseContent(response) as Omit<FoodLensAnalysis, "items" | "totalNutrition" | "estimateDisclosure" | "generationMode"> & { items: VisionCandidate[] };
    const items = await Promise.all(
      data.items.map(async candidate => {
        const local = hydrateFoodLensItem(candidate);
        const usda = await lookupUSDAReference(candidate.name);
        if (!usda) return local;
        return {
          ...local,
          referenceStatus: "matched_reference" as const,
          sourceLabel: `${USDA_SOURCE.label}: ${usda.description}`,
          sourceUrl: `${USDA_SOURCE.url}food-details.html?fdcId=${usda.fdcId}`,
          nutritionPer100g: usda.values,
          nutritionForPortion: scaleNutrition(usda.values, candidate.estimatedGrams),
        };
      })
    );
    return {
      ...data,
      items,
      totalNutrition: totalFoodLensNutrition(items),
      estimateDisclosure: FOOD_LENS_DISCLOSURE,
      generationMode: "live_ai",
    };
  } catch (error) {
    console.warn("[Food Lens] Live analysis failed, using safe fallback", error);
    return fallbackFoodLens(context);
  }
}

export function fallbackFoodLens(context: string): FoodLensAnalysis {
  const names = context
    .split(/,|\band\b/i)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  const defaults = names.length ? names : ["chicken", "broccoli", "rice"];
  const items = defaults.map((name, index) =>
    hydrateFoodLensItem({
      id: `food-${index + 1}`,
      name,
      confidence: 45,
      estimatedGrams: 100,
      portionConfidence: 20,
      needsConfirmation: true,
    })
  );
  return {
    dishGuess: "Food awaiting confirmation",
    overallConfidence: 35,
    portionConfidence: 20,
    uncertaintySummary: "Food Lens was unable to verify this photo. Every food and portion needs your confirmation before nutrition can be useful.",
    measurementNote: "No reliable visual scale was available; each item begins at a 100 g placeholder.",
    items,
    totalNutrition: totalFoodLensNutrition(items),
    estimateDisclosure: FOOD_LENS_DISCLOSURE,
    generationMode: "safe_fallback",
  };
}
