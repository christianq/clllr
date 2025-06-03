import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subdomain: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      subdomain: args.subdomain,
      role: args.role,
    });
  },
});

export const patchAllUsersRole = mutation({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (!user.role) {
        await ctx.db.patch(user._id, { role: args.role });
        count++;
      }
    }
    return { patched: count };
  },
});