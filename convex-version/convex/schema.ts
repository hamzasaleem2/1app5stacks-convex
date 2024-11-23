import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pokemon: defineTable({
    name: v.string(),
    dexId: v.number(),
    eloRating: v.number(),
  }).index("by_elo", ["eloRating"]),
  votes: defineTable({
    votedForId: v.id("pokemon"),
    votedAgainstId: v.id("pokemon"),
  }),
});
