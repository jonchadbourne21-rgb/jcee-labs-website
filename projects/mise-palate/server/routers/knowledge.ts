import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const knowledgeRouter = router({
  list: publicProcedure.query(() => db.listChefKnowledge()),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().min(2).max(220),
        summary: z.string().min(10).max(2000),
        content: z.record(z.string(), z.unknown()),
        reviewStatus: z.enum(["draft", "chef_reviewed", "authoritative"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only the product owner or chef editor can change Chef Knowledge." });
      const updated = await db.updateChefKnowledge({ ...input, updatedBy: ctx.user.name ?? ctx.user.email ?? ctx.user.openId });
      await db.trackEvent(ctx.user.id, "chef_knowledge_updated", { id: input.id, reviewStatus: input.reviewStatus });
      return updated;
    }),
});
