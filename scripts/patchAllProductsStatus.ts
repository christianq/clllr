const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require("dotenv").config();

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  const convex = new ConvexHttpClient(convexUrl);
  const result = await convex.mutation(api.products.patchAllProductsStatus, {});
  console.log("Patched products:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});