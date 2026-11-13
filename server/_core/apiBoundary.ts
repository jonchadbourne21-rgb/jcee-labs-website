import type { RequestHandler } from "express";

/** Marketing pages and browser examples do not require application APIs. */
export const websiteApiBoundary: RequestHandler = (_req, res, next) => {
  if (process.env.ENABLE_WEBSITE_LEGACY_API !== "true") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
};
