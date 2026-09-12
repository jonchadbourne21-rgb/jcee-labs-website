import {
  DEFAULT_PALATE,
  EMPTY_CONFIDENCE,
  SENSORY_DIMENSIONS,
  type SensoryDimension,
  type SensoryProfile,
} from "../../shared/product";

export type CalibrationChoice = {
  id: string;
  deltas: Partial<Record<SensoryDimension, number>>;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const CALIBRATION_CHOICES: Record<string, CalibrationChoice> = {
  crispy_wings: { id: "crispy_wings", deltas: { crunch: 18, sauce: -8 } },
  glazed_wings: { id: "glazed_wings", deltas: { sauce: 16, sweetness: 9, crunch: -5 } },
  tomato_pasta: { id: "tomato_pasta", deltas: { acidity: 15, richness: -6 } },
  creamy_pasta: { id: "creamy_pasta", deltas: { richness: 18, sauce: 10 } },
  mild_curry: { id: "mild_curry", deltas: { spice: -18, richness: 6 } },
  spicy_curry: { id: "spicy_curry", deltas: { spice: 22 } },
  rare_steak: { id: "rare_steak", deltas: { doneness: -18, tenderness: 8 } },
  medium_steak: { id: "medium_steak", deltas: { doneness: 2 } },
  well_steak: { id: "well_steak", deltas: { doneness: 18 } },
  bright_vinaigrette: { id: "bright_vinaigrette", deltas: { acidity: 18, richness: -12 } },
  creamy_dressing: { id: "creamy_dressing", deltas: { richness: 17, acidity: -8 } },
  charred: { id: "charred", deltas: { smokiness: 18, bitterness: 7 } },
  delicate: { id: "delicate", deltas: { smokiness: -12, herbaceous: 10 } },
  herb_heavy: { id: "herb_heavy", deltas: { herbaceous: 20 } },
  savory_deep: { id: "savory_deep", deltas: { salt: 8, richness: 8 } },
  crunchy_veg: { id: "crunchy_veg", deltas: { crunch: 16, doneness: -8 } },
  soft_veg: { id: "soft_veg", deltas: { tenderness: 15, doneness: 12 } },
  sauce_on_side: { id: "sauce_on_side", deltas: { sauce: -18 } },
  extra_sauce: { id: "extra_sauce", deltas: { sauce: 20, richness: 5 } },
};

export function calibratePalate(choiceIds: string[]) {
  const dimensions = { ...DEFAULT_PALATE };
  const confidence = { ...EMPTY_CONFIDENCE };
  const signals: Array<{
    dimension: SensoryDimension;
    direction: number;
    weight: number;
    valueBefore: number;
    valueAfter: number;
    confidenceBefore: number;
    confidenceAfter: number;
  }> = [];

  for (const choiceId of choiceIds) {
    const choice = CALIBRATION_CHOICES[choiceId];
    if (!choice) continue;
    for (const [dimension, rawDelta] of Object.entries(choice.deltas)) {
      if (typeof rawDelta !== "number") continue;
      const key = dimension as SensoryDimension;
      const before = dimensions[key];
      const confidenceBefore = confidence[key];
      const after = clamp(before + rawDelta * 0.55);
      const confidenceAfter = clamp(confidenceBefore + 14);
      dimensions[key] = after;
      confidence[key] = confidenceAfter;
      signals.push({
        dimension: key,
        direction: Math.sign(rawDelta),
        weight: Math.abs(rawDelta),
        valueBefore: before,
        valueAfter: after,
        confidenceBefore,
        confidenceAfter,
      });
    }
  }
  return { dimensions, confidence, signals };
}

const FEEDBACK_DELTAS: Record<string, Partial<Record<SensoryDimension, number>>> = {
  crispier: { crunch: 8 },
  less_spicy: { spice: -8 },
  more_spicy: { spice: 8 },
  more_sauce: { sauce: 8 },
  less_rich: { richness: -7 },
  more_acid: { acidity: 8 },
  more_tender: { tenderness: 8, doneness: -2 },
};

export function learnFromMeal(
  current: SensoryProfile,
  currentConfidence: SensoryProfile,
  rating: "loved" | "good" | "okay" | "not_for_me",
  adjustments: string[]
) {
  const dimensions = { ...current };
  const confidence = { ...currentConfidence };
  const ratingWeight = rating === "loved" ? 1.25 : rating === "good" ? 1 : rating === "okay" ? 0.8 : 0.65;
  const signals: Array<{
    dimension: SensoryDimension;
    direction: number;
    weight: number;
    valueBefore: number;
    valueAfter: number;
    confidenceBefore: number;
    confidenceAfter: number;
  }> = [];

  for (const adjustment of adjustments) {
    const deltaMap = FEEDBACK_DELTAS[adjustment];
    if (!deltaMap) continue;
    for (const [dimension, delta] of Object.entries(deltaMap)) {
      if (typeof delta !== "number") continue;
      const key = dimension as SensoryDimension;
      const before = dimensions[key];
      const confidenceBefore = confidence[key];
      const applied = delta * ratingWeight * Math.max(0.35, 1 - confidenceBefore / 140);
      const after = clamp(before + applied);
      const confidenceAfter = clamp(confidenceBefore + 7);
      dimensions[key] = after;
      confidence[key] = confidenceAfter;
      signals.push({
        dimension: key,
        direction: Math.sign(delta),
        weight: Math.round(Math.abs(applied)),
        valueBefore: before,
        valueAfter: after,
        confidenceBefore,
        confidenceAfter,
      });
    }
  }
  return { dimensions, confidence, signals };
}

export function topPreferences(dimensions: SensoryProfile, count = 3) {
  return [...SENSORY_DIMENSIONS]
    .sort((a, b) => dimensions[b] - dimensions[a])
    .slice(0, count)
    .map(dimension => ({ dimension, value: dimensions[dimension] }));
}
