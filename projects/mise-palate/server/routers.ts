import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { barcodeRouter } from "./routers/barcode";
import { cookRouter } from "./routers/cook";
import { foodLensRouter } from "./routers/food-lens";
import { knowledgeRouter } from "./routers/knowledge";
import { nutritionRouter } from "./routers/nutrition";
import { palateRouter } from "./routers/palate";
import { recipesRouter } from "./routers/recipes";
import { scansRouter } from "./routers/scans";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  palate: palateRouter,
  scans: scansRouter,
  recipes: recipesRouter,
  cook: cookRouter,
  barcode: barcodeRouter,
  foodLens: foodLensRouter,
  knowledge: knowledgeRouter,
  nutrition: nutritionRouter,
});

export type AppRouter = typeof appRouter;
