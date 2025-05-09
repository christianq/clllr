import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { stripeProductId } = await req.json();
  if (!stripeProductId) {
    return NextResponse.json({ error: "Missing stripeProductId" }, { status: 400 });
  }
  try {
    const result = await convex.action(api.products.getStripeProduct, { stripeProductId });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}