import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const logEvent = mutation({
  args: {
    type: v.string(),
    timestamp: v.number(),
    userId: v.optional(v.string()),
    path: v.string(),
    element: v.optional(v.string()),
    extra: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics_events", args);
    return null;
  },
});

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analytics_events")
      .order("desc")
      .take(100);
  },
});