import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Mutation to generate an upload URL for the client
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Query to get a signed URL for a stored file
export const getImageUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, { fileId }) => {
    return await ctx.storage.getUrl(fileId);
  },
});

// Query to list all images
export const listImages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("images").order("desc").collect();
  },
});

// Store the fileId in the images table
export const saveImageMetadata = mutation({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, { fileId }) => {
    // TODO: Add uploadedBy field if you have authentication
    await ctx.db.insert("images", {
      fileId: fileId,
      createdAt: Date.now(),
      // uploadedBy: (await ctx.auth.getUserIdentity())?.subject, // Example if using auth
    });
  },
});

// Mutation to delete an image by _id
export const deleteImage = mutation({
  args: { id: v.id("images") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});