import type { SafetyRule } from "../../shared/product";

const FOOD_SAFETY_URL = "https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures";
const USDA_BASICS_URL = "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe";
const FDA_ALLERGEN_URL = "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies";

export const SAFETY_RULES: SafetyRule[] = [
  {
    id: "poultry-165",
    title: "Poultry minimum internal temperature",
    requirement: "Cook all poultry, including thighs and ground poultry, to 165°F / 74°C measured with a food thermometer at the thickest part without touching bone.",
    sourceLabel: "FoodSafety.gov Safe Minimum Internal Temperatures",
    sourceUrl: FOOD_SAFETY_URL,
    authority: "authoritative",
  },
  {
    id: "ground-meat-160",
    title: "Ground meat minimum internal temperature",
    requirement: "Cook ground beef, pork, lamb, and veal to 160°F / 71°C measured with a food thermometer.",
    sourceLabel: "FoodSafety.gov Safe Minimum Internal Temperatures",
    sourceUrl: FOOD_SAFETY_URL,
    authority: "authoritative",
  },
  {
    id: "whole-cut-145-rest",
    title: "Whole cuts minimum temperature and rest",
    requirement: "Cook beef, pork, lamb, veal, bison, and goat steaks, roasts, and chops to 145°F / 63°C, then rest at least 3 minutes.",
    sourceLabel: "FoodSafety.gov Safe Minimum Internal Temperatures",
    sourceUrl: FOOD_SAFETY_URL,
    authority: "authoritative",
  },
  {
    id: "seafood-145",
    title: "Fish minimum internal temperature",
    requirement: "Cook fish to 145°F / 63°C or until the flesh is no longer translucent and separates easily with a fork; shellfish should be pearly or white and opaque.",
    sourceLabel: "FoodSafety.gov Safe Minimum Internal Temperatures",
    sourceUrl: FOOD_SAFETY_URL,
    authority: "authoritative",
  },
  {
    id: "leftovers-165",
    title: "Leftover reheating temperature",
    requirement: "Reheat leftovers to 165°F / 74°C. Refrigerate perishable food within 2 hours, or within 1 hour above 90°F / 32°C.",
    sourceLabel: "USDA FSIS Keep Food Safe",
    sourceUrl: USDA_BASICS_URL,
    authority: "authoritative",
  },
  {
    id: "cross-contamination",
    title: "Prevent cross-contamination",
    requirement: "Keep raw meat, poultry, fish, and their juices away from ready-to-eat food. Wash cutting boards, knives, counters, and hands with hot soapy water after contact.",
    sourceLabel: "USDA FSIS Keep Food Safe",
    sourceUrl: USDA_BASICS_URL,
    authority: "authoritative",
  },
  {
    id: "big-nine-allergens",
    title: "Nine major U.S. food allergens",
    requirement: "Check labels and cross-contact risks for milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans, and sesame. Generated substitutions are not an allergy guarantee.",
    sourceLabel: "U.S. Food and Drug Administration — Food Allergies",
    sourceUrl: FDA_ALLERGEN_URL,
    authority: "authoritative",
  },
];

export function relevantSafetyRules(ingredients: string[], context = "") {
  const haystack = `${ingredients.join(" ")} ${context}`.toLowerCase();
  const ids = new Set<string>(["cross-contamination", "big-nine-allergens"]);
  if (/chicken|turkey|poultry|duck/.test(haystack)) ids.add("poultry-165");
  if (/ground beef|ground pork|ground lamb|ground veal|sausage/.test(haystack)) ids.add("ground-meat-160");
  if (/steak|chop|roast|pork loin|beef|lamb|veal|bison|goat/.test(haystack) && !/ground/.test(haystack)) ids.add("whole-cut-145-rest");
  if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|lobster|crab|scallop|shellfish/.test(haystack)) ids.add("seafood-145");
  if (/leftover|reheat/.test(haystack)) ids.add("leftovers-165");
  return SAFETY_RULES.filter(rule => ids.has(rule.id));
}

export function enforceSafetyText(text: string, rules: SafetyRule[]) {
  const poultry = rules.find(rule => rule.id === "poultry-165");
  if (poultry && /\b1[45][0-9]\s*°?f\b/i.test(text)) {
    return `${text}\n\nSafety correction: ${poultry.requirement}`;
  }
  return text;
}
