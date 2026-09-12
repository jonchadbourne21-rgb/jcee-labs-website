export type KnowledgeSeed = {
  slug: string;
  type: "technique" | "ingredient" | "cut" | "error" | "recovery" | "sensory_transformation" | "safety";
  title: string;
  summary: string;
  content: Record<string, unknown>;
  sourceLabel?: string;
  sourceUrl?: string;
  reviewStatus: "draft" | "chef_reviewed" | "authoritative";
  editable: boolean;
};

export const CHEF_KNOWLEDGE_SEED: KnowledgeSeed[] = [
  {
    slug: "dry-surface-browning",
    type: "technique",
    title: "Dry surface before browning",
    summary: "Surface water spends heat on evaporation and delays browning.",
    content: {
      principle: "Pat proteins and high-moisture vegetables dry before high-heat cooking.",
      cues: ["The pan should sizzle immediately", "The food should release once a crust forms"],
      failureModes: ["Crowding traps steam", "Moving food too early tears the surface"],
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "fond-deglaze-emulsify",
    type: "technique",
    title: "Fond, deglaze, emulsify",
    summary: "Browned pan residue is concentrated flavor; dissolve it before finishing the sauce.",
    content: {
      sequence: ["Build fond", "Lower heat", "Add liquid", "Scrape", "Reduce", "Emulsify fat off heat"],
      cues: ["Fond is deep brown, not black", "Finished sauce coats the back of a spoon"],
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "chicken-thigh-crispness",
    type: "ingredient",
    title: "Chicken-thigh crispness",
    summary: "Rendering and evaporation create crisp skin; wet sauce reverses it.",
    content: {
      bestPractices: ["Dry thoroughly", "Start skin-side down", "Maintain full contact", "Sauce around, not over, the skin"],
      sensoryTradeoff: "Longer rendering raises crispness and roasted flavor but can reduce juiciness if the meat remains over heat after 165°F.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "julienne",
    type: "cut",
    title: "Julienne",
    summary: "Uniform matchsticks for even cooking and clean presentation.",
    content: {
      targetDimensionsMm: [3, 3, 50],
      safety: ["Create a flat base before slicing", "Use a stable board and dry handle", "Keep fingertips curled behind the knuckles"],
      geometry: "Square the ingredient, cut even planks, stack a small number, then cut lengthwise into matchsticks.",
      assetPolicy: "Use only chef-reviewed diagrams; never generate hand-and-blade contact imagery.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "brunoise",
    type: "cut",
    title: "Brunoise",
    summary: "Fine uniform dice built from julienne strips.",
    content: {
      targetDimensionsMm: [3, 3, 3],
      safety: ["Stabilize the ingredient first", "Work in small stacks", "Keep the guiding hand behind the blade path"],
      geometry: "Make a 3 mm julienne, rotate the bundle 90 degrees, then cut into 3 mm cubes.",
      assetPolicy: "Use only chef-reviewed diagrams; never generate hand-and-blade contact imagery.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "sauce-too-thin",
    type: "error",
    title: "Sauce is too thin",
    summary: "Diagnose whether the issue is excess water, insufficient reduction, or a broken emulsion.",
    content: {
      checks: ["Does it steam aggressively?", "Does it coat a spoon?", "Is fat separating?"],
      recoveries: ["Simmer uncovered to reduce", "Remove solids before reducing", "Whisk in cold butter off heat for body"],
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "browning-too-fast",
    type: "recovery",
    title: "Browning too quickly",
    summary: "Reduce radiant heat before the exterior burns while the center remains underdone.",
    content: {
      actions: ["Lower the burner", "Move the pan briefly off heat", "Flip or shield the darkest area", "Finish in gentler oven heat if needed"],
      avoid: "Do not add water to hot oil; it can spatter violently.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "lemon-sensory-change",
    type: "sensory_transformation",
    title: "Adding lemon",
    summary: "Lemon raises acidity and aroma, lowers perceived richness, and can make existing salt taste more vivid.",
    content: {
      deltas: { acidity: 18, freshness: 14, richness: -9, saltPerception: 4 },
      timing: { early: "rounder, integrated acidity", late: "brighter aroma and sharper contrast" },
      caution: "Add incrementally; acid cannot be removed once incorporated.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
  {
    slug: "extended-roasting",
    type: "sensory_transformation",
    title: "Roasting longer",
    summary: "More time can deepen browning and crispness while reducing moisture.",
    content: {
      deltas: { smokiness: 5, sweetness: 7, crunch: 12, tenderness: -5 },
      cues: ["Edges deepen from gold toward chestnut", "Surface moisture disappears", "Aromas become nuttier"],
      safety: "Time never substitutes for thermometer verification where an authoritative minimum applies.",
    },
    reviewStatus: "chef_reviewed",
    editable: true,
  },
];
