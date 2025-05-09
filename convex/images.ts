import { query } from "./_generated/server";
import { v } from "convex/values";

export const listImages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("images").collect();
  },
});

export const getImage = query({
  args: { id: v.id("images") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});