import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  images: defineTable({
    fileId: v.id("_storage"),
    uploadedBy: v.optional(v.string()), // or v.id("users") if you have users
    createdAt: v.number(),
  }),
  products: defineTable({
    type: v.string(),
    title: v.string(),
    color: v.string(),
    price: v.string(),
    imageId: v.id("images"),
    filename: v.string(), // for legacy reference
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    status: v.string(), // "draft" or "published"
    originalPrice: v.optional(v.string()), // store the original price if a deal is active
    dealPrice: v.optional(v.string()), // store the deal price if a deal is active
    dealExpiresAt: v.optional(v.number()), // optional: timestamp for when the deal ends
  }),
});