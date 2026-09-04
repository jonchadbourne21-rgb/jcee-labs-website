import * as restate from "@restatedev/restate-sdk";
import { makeReceipt } from "./canonical.mjs";

export const jceeShadowWorkflow = restate.workflow({
  name: "JceeShadowPlug",
  handlers: {
    run: async (ctx, input) => {
      const semantic = await ctx.run("jcee-canonical-shadow-decision", async () => {
        return makeReceipt(input, {
          substrate: "RESTATE_LOCAL_TESTCONTAINER",
          execution_id: `restate:${ctx.key}`,
          durable_recorded: true,
          substrate_signal: input.substrate_signal,
        });
      });
      return semantic;
    },
  },
});
