import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    // Join with images
    const images = await ctx.db.query("images").collect();
    const imageMap = Object.fromEntries(images.map(img => [img._id, img]));
    return products.map(product => ({
      ...product,
      image: imageMap[product.imageId] || null,
    }));
  },
});

export const upsertProduct = mutation({
  args: {
    id: v.optional(v.id("products")),
    type: v.string(),
    title: v.string(),
    color: v.string(),
    price: v.string(),
    imageId: v.id("images"),
    filename: v.string(),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      await ctx.db.patch(args.id, {
        type: args.type,
        title: args.title,
        color: args.color,
        price: args.price,
        imageId: args.imageId,
        filename: args.filename,
        stripeProductId: args.stripeProductId,
        stripePriceId: args.stripePriceId,
        status: args.status,
      });
      return args.id;
    } else {
      return await ctx.db.insert("products", {
        type: args.type,
        title: args.title,
        color: args.color,
        price: args.price,
        imageId: args.imageId,
        filename: args.filename,
        stripeProductId: args.stripeProductId,
        stripePriceId: args.stripePriceId,
        status: args.status ?? "draft",
      });
    }
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const publishToStripe = action({
  args: { id: v.id("products") },
  returns: v.union(v.object({ stripeProductId: v.string() }), v.object({ error: v.string() })),
  handler: async (ctx, { id }): Promise<{ stripeProductId: string } | { error: string }> => {
    "use node";
    const product: Doc<"products"> | null = await ctx.runQuery(api.products.getProduct, { id });
    if (!product) return { error: "Product not found" };
    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) return { error: "Missing STRIPE_SECRET_KEY env var" };
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecret, { apiVersion: "2025-04-30.basil" });
      // Fetch the image document using a query (actions can't use ctx.db)
      const imageDoc = await ctx.runQuery(api.images.getImage, { id: product.imageId });
      let imageUrl: string | undefined = undefined;
      if (imageDoc && imageDoc.fileId) {
        const url = await ctx.storage.getUrl(imageDoc.fileId);
        if (url) imageUrl = url;
      }
      if (product.stripeProductId) {
        // Update existing Stripe product
        await stripe.products.update(product.stripeProductId, {
          name: product.title,
          description: `${product.type} - ${product.color}`,
          images: imageUrl ? [imageUrl] : [],
        });
        // Sync price
        const prices = await stripe.prices.list({ product: product.stripeProductId, active: true });
        const convexPrice = Math.round(Number(product.price) * 100);
        const convexCurrency = "usd";
        let priceNeedsUpdate = true;
        for (const price of prices.data) {
          if (price.unit_amount === convexPrice && price.currency === convexCurrency) {
            priceNeedsUpdate = false;
            break;
          }
        }
        let newPriceId = product.stripePriceId;
        if (priceNeedsUpdate) {
          // Deactivate old prices
          for (const price of prices.data) {
            await stripe.prices.update(price.id, { active: false });
          }
          // Create new price
          const newPrice = await stripe.prices.create({
            product: product.stripeProductId,
            unit_amount: convexPrice,
            currency: convexCurrency,
          });
          newPriceId = newPrice.id;
          // Update product in Convex with new price ID
          await ctx.runMutation(api.products.upsertProduct, {
            id: product._id,
            type: product.type,
            title: product.title,
            color: product.color,
            price: product.price,
            imageId: product.imageId,
            filename: product.filename,
            status: product.status,
            stripeProductId: product.stripeProductId,
            stripePriceId: newPriceId,
          });
        }
        return { stripeProductId: product.stripeProductId };
      } else {
        // Create product in Stripe
        const stripeProduct = await stripe.products.create({
          name: product.title,
          description: `${product.type} - ${product.color}`,
          images: imageUrl ? [imageUrl] : [],
        });
        // Create price in Stripe
        const newPrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(Number(product.price) * 100),
          currency: "usd",
        });
        // Update product in Convex
        await ctx.runMutation(api.products.upsertProduct, {
          id: product._id,
          type: product.type,
          title: product.title,
          color: product.color,
          price: product.price,
          imageId: product.imageId,
          filename: product.filename,
          status: product.status,
          stripeProductId: stripeProduct.id,
          stripePriceId: newPrice.id,
        });
        return { stripeProductId: stripeProduct.id };
      }
    } catch (err: any) {
      return { error: err.message || "Unknown error" };
    }
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const markAsPublished = mutation({
  args: { id: v.id("products"), stripeProductId: v.string() },
  handler: async (ctx, { id, stripeProductId }) => {
    await ctx.db.patch(id, { stripeProductId, status: "published" });
    return null;
  },
});

export const patchAllProductsStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let count = 0;
    for (const product of products) {
      if (product && "_id" in product && !("status" in product)) {
        await ctx.db.patch((product as { _id: Id<"products"> })._id, { status: "draft" });
        count++;
      }
    }
    return { patched: count };
  },
});

export const getStripeProduct = action({
  args: { stripeProductId: v.string() },
  returns: v.union(
    v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      image: v.optional(v.string()),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
    }),
    v.object({ error: v.string() })
  ),
  handler: async (ctx, { stripeProductId }) => {
    "use node";
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return { error: "Missing STRIPE_SECRET_KEY env var" };
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-04-30.basil" });
    try {
      const product = await stripe.products.retrieve(stripeProductId);
      // Get the first image if available
      const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : undefined;
      // Get the price
      const prices = await stripe.prices.list({ product: stripeProductId, limit: 1 });
      const price = prices.data[0];
      return {
        id: product.id,
        name: product.name,
        description: product.description ?? "",
        image,
        price: price && price.unit_amount != null ? price.unit_amount : undefined,
        currency: price ? price.currency : undefined,
      };
    } catch (err: any) {
      return { error: err.message || "Unknown error" };
    }
  },
});