import { api } from "../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Id } from "../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { id } = req.body;
  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Missing or invalid id" });
    return;
  }
  try {
    await convex.mutation(api.files.deleteImage, { id: id as Id<"images"> });
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}