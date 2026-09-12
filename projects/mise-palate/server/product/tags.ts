export function normalizeRecipeTags(input: string[]) {
  return Array.from(
    new Set(
      input
        .map(tag => tag.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  ).slice(0, 8);
}
