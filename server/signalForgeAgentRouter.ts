import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import {
  SignalForgeGateError,
  signalForgeFixtureIds,
  signalForgeReadOnlyGate,
} from "./signalForgeReadOnlyAgent";

/**
 * Internal-only future model lane. Deliberately has no public procedure,
 * action executor, connection to JCEE-INFRA, or browser-side provider key.
 * Current static Manus website never invokes this endpoint.
 */
export const signalForgeAgentRouter = router({
  analyze: adminProcedure
    .input(z.object({ fixture_id: z.enum(signalForgeFixtureIds) }).strict())
    .mutation(async ({ ctx, input }) => {
      try {
        return await signalForgeReadOnlyGate.analyze({
          actor_id: ctx.user.openId,
          fixture_id: input.fixture_id,
          enabled: process.env.SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED === "true",
        });
      } catch (error) {
        if (error instanceof SignalForgeGateError) {
          if (error.reason === "DISABLED")
            throw new TRPCError({ code: "FORBIDDEN", message: "Internal agent lab disabled." });
          if (error.reason === "RATE_LIMIT" || error.reason === "BUSY")
            throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Internal agent lab budget exceeded." });
        }
        // No provider errors, prompts, credentials or response payloads leak.
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Agent analysis unavailable." });
      }
    }),
});
