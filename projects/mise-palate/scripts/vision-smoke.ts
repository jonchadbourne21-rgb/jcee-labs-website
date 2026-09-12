import fs from "node:fs/promises";
import path from "node:path";
import { analyzeFoodImage } from "../server/product/ai";

async function dataUrl(file: string) {
  const bytes = await fs.readFile(file);
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

const clear = await analyzeFoodImage(await dataUrl("/home/ubuntu/webdev-static-assets/mise-ingredients.jpg"), "Ingredients on a home cook's counter");
const unclear = await analyzeFoodImage(await dataUrl("docs/test-evidence/unclear-ingredients.jpg"), "No additional context");
if (clear.ingredients.length < 3) throw new Error("Clear image did not produce a useful ingredient set");
if (!clear.ingredients.some(item => /chicken/i.test(item.name))) throw new Error("Clear image did not identify chicken");
if (!unclear.uncertaintySummary || !unclear.ingredients.some(item => item.needsConfirmation) && unclear.overallConfidence >= 82) {
  throw new Error("Ambiguous image did not surface uncertainty");
}
const result = {
  testedAt: new Date().toISOString(),
  clear: {
    generationMode: clear.generationMode,
    overallConfidence: clear.overallConfidence,
    ingredients: clear.ingredients,
  },
  unclear: {
    generationMode: unclear.generationMode,
    overallConfidence: unclear.overallConfidence,
    uncertaintySummary: unclear.uncertaintySummary,
    ingredients: unclear.ingredients,
  },
  passed: true,
};
await fs.writeFile(path.resolve("docs/test-evidence/vision-result.json"), JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result, null, 2));
process.exit(0);
