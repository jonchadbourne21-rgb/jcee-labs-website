import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getAllLeads, insertLead } from "./db";
import { systemRouter } from "./_core/systemRouter";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Lead capture — public endpoint
  leads: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), source: z.string().optional() }))
      .mutation(async ({ input }) => {
        const result = await insertLead(input.email, input.source ?? "homepage");
        if (result.duplicate) {
          return { success: false, message: "You're already on the list!" };
        }
        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not save your email. Please try again." });
        }
        // Notify owner of new lead
        await notifyOwner({
          title: "New Jcee Labs Lead",
          content: `New priority queue signup: ${input.email} (source: ${input.source ?? "homepage"})`,
        });
        return { success: true, message: "You're in the queue!" };
      }),

    // Admin-only: list all leads
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
      }
      return getAllLeads();
    }),
  }),

  // Mirrored AI reflection chat — public (no login required to try the demo)
  mirrored: router({
    reflect: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Mirror, the AI reflection engine inside the Mirrored app by Jcee Labs. 
Your role is to be a thoughtful, empathetic, and insightful personal development companion. 
When a user shares a thought, feeling, or situation:
1. Acknowledge what they shared with warmth and without judgment.
2. Reflect it back with a deeper observation or pattern you notice.
3. Ask one powerful, open-ended question to help them explore further.
Keep responses concise (2-4 sentences max), conversational, and emotionally intelligent.
Never give generic advice. Always personalize to what they actually said.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...(input.history ?? []).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "I'm here with you. Tell me more.";
        return { reply: content };
      }),
  }),
});

export type AppRouter = typeof appRouter;
