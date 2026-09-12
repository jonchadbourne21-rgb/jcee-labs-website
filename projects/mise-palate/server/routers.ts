import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { cookRouter } from "./routers/cook";
import { knowledgeRouter } from "./routers/knowledge";
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
  knowledge: knowledgeRouter,
});

export type AppRouter = typeof appRouter;
