import type { Express } from "express";

const publicImages: Record<string, string> = {
  "01-signature-hero-exposed_8b945d8c.webp": "01-signature-hero-exposed.webp",
  "01-signature-hero-exposed-mobile_1b03fe3f.webp": "01-signature-hero-exposed-mobile.webp",
  "02-vow-receipt_372bf105.webp": "02-vow-receipt.webp",
  "02-vow-receipt_742d4ab7.webp": "02-vow-receipt.webp",
  "03-qcs-causal-rail_731e5c1a.webp": "03-qcs-causal-rail.webp",
  "01-hero-boundary_f53560ae.webp": "01-signature-hero-exposed.webp",
  "jcee-hero-cubes_002df7db.png": "worldlab-company-v1.webp",
};

/** Legacy public image aliases. Never sign caller-supplied storage keys. */
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    const image = Object.hasOwn(publicImages, key) ? publicImages[key] : undefined;
    if (!image) { res.status(404).end(); return; }
    res.redirect(302, `/visuals/${image}`);
  });
}
