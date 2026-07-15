import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getAllLeads, insertLead, insertBusinessInquiry, getAllBusinessInquiries, getAllMaterials, insertMaterial, updateMaterial, deleteMaterial, getAllLaborRates, insertLaborRate, updateLaborRate, deleteLaborRate } from "./db";
import { getPricing, getAvailableTrades } from "./pricingApi";
import { syncLeadToLoops, syncInquiryToLoops } from "./emailMarketing";
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
        // Sync to Loops email marketing (non-blocking)
        syncLeadToLoops(input.email, input.source ?? "homepage").catch(() => {});
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

  // Business inquiry form — public endpoint
  business: router({
    submitInquiry: publicProcedure
      .input(z.object({
        companyName: z.string().min(2).max(255),
        contactName: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().max(20).optional(),
        projectDescription: z.string().min(10).max(5000),
        budget: z.string().max(64).optional(),
        timeline: z.string().max(64).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await insertBusinessInquiry(input);
        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not submit inquiry. Please try again." });
        }
        // Notify owner of new business inquiry
        await notifyOwner({
          title: "New Business Inquiry",
          content: `Company: ${input.companyName}\nContact: ${input.contactName} (${input.email})\nPhone: ${input.phone || "Not provided"}\nProject: ${input.projectDescription}\nBudget: ${input.budget || "Not specified"}\nTimeline: ${input.timeline || "Not specified"}`,
        });
        // Sync to Loops email marketing (non-blocking)
        syncInquiryToLoops(input.email, input.contactName, input.companyName).catch(() => {});
        return { success: true, message: "Thank you! We'll be in touch shortly." };
      }),

    // Admin-only: list all inquiries
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
      }
      return getAllBusinessInquiries();
    }),
  }),

  // BidIndustrial pricing API
  bidIndustrial: router({
    getPricing: publicProcedure
      .input(z.object({ trade: z.string(), region: z.string().optional() }))
      .query(async ({ input }) => {
        return getPricing(input.trade, input.region);
      }),
    getTrades: publicProcedure.query(() => {
      return getAvailableTrades();
    }),

    // Admin: Materials CRUD
    listMaterials: protectedProcedure
      .input(z.object({ trade: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return getAllMaterials(input?.trade);
      }),
    addMaterial: protectedProcedure
      .input(z.object({
        trade: z.string(),
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(128),
        unit: z.string().min(1).max(64),
        unitPrice: z.string(), // decimal as string
        supplier: z.string().max(255).optional(),
        partNumber: z.string().max(128).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return insertMaterial(input);
      }),
    updateMaterial: protectedProcedure
      .input(z.object({
        id: z.number(),
        trade: z.string().optional(),
        name: z.string().min(1).max(255).optional(),
        category: z.string().min(1).max(128).optional(),
        unit: z.string().min(1).max(64).optional(),
        unitPrice: z.string().optional(),
        supplier: z.string().max(255).optional(),
        partNumber: z.string().max(128).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateMaterial(id, data);
      }),
    deleteMaterial: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteMaterial(input.id);
      }),

    // Admin: Labor Rates CRUD
    listLaborRates: protectedProcedure
      .input(z.object({ trade: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return getAllLaborRates(input?.trade);
      }),
    addLaborRate: protectedProcedure
      .input(z.object({
        trade: z.string(),
        role: z.string().min(1).max(128),
        hourlyRate: z.string(),
        overtimeRate: z.string(),
        region: z.string().max(128).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return insertLaborRate({ ...input, region: input.region ?? "National Avg" });
      }),
    updateLaborRate: protectedProcedure
      .input(z.object({
        id: z.number(),
        trade: z.string().optional(),
        role: z.string().min(1).max(128).optional(),
        hourlyRate: z.string().optional(),
        overtimeRate: z.string().optional(),
        region: z.string().max(128).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateLaborRate(id, data);
      }),
    deleteLaborRate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteLaborRate(input.id);
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
