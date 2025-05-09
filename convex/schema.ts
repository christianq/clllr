import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  images: defineTable({
    fileId: v.id("_storage"),
    uploadedBy: v.optional(v.string()), // or v.id("users") if you have users
    createdAt: v.number(),
  }),
});