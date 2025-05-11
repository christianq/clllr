import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Clear expired deals every hour",
  { hours: 1 },
  internal.products.internalClearExpiredDeals,
  {}
);

export default crons;