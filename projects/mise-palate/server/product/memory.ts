import type { NutritionValues } from "../../shared/product";

const VECTOR_SIZE = 64;

function hashToken(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalize(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return magnitude ? vector.map(value => value / magnitude) : vector;
}

export function semanticVector(text: string, nutrition?: NutritionValues) {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  for (const token of tokens) {
    const index = hashToken(token) % 48;
    vector[index] += 1;
  }
  if (nutrition) {
    const signals = [
      nutrition.calories / 100,
      nutrition.proteinG / 10,
      nutrition.carbsG / 10,
      nutrition.fatG / 10,
      nutrition.saturatedFatG / 5,
      nutrition.fiberG / 5,
      nutrition.sugarG / 10,
      nutrition.sodiumMg / 500,
    ];
    signals.forEach((value, index) => {
      vector[48 + index] = Math.min(5, Math.max(0, value));
    });
  }
  return normalize(vector).map(value => Number(value.toFixed(6)));
}

export function cosineSimilarity(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  if (!leftMagnitude || !rightMagnitude) return 0;
  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}
