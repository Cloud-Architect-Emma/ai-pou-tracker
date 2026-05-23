/**
 * /api/score — PoU scoring engine aligned to HackerNoon's algorithm.
 *
 * UPGRADES from original:
 * 1. Weights now mirror the official PoU criteria (25/25/20/15/10/5).
 * 2. Uses getStats() instead of re-scanning logs (DRY).
 * 3. Adds criterion-level breakdown so judges can see each component.
 * 4. Score is PERSISTENT — survives server restarts because it reads from
 *    the persisted log file, not in-memory state.
 * 5. Adds a "tier" label matching the HackerNoon tier definitions.
 */

import { getStats } from "../../lib/pouTracker";

const TIERS = [
  { min: 751, label: "Unicorn Utility" },
  { min: 601, label: "Category Standard" },
  { min: 451, label: "Industry Mainstay" },
  { min: 301, label: "Certified Problem Solver" },
  { min: 101, label: "Gaining Momentum" },
  { min: 0,   label: "You're In Business" },
  { min: -100, label: "Lab Mode" },
];

function getTier(score) {
  return TIERS.find((t) => score >= t.min)?.label ?? "Lab Mode";
}

export default function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency } = getStats();

  if (total === 0) {
    return res.status(200).json({
      usefulnessScore: 0,
      tier: "Lab Mode",
      criteria: {},
      breakdown: { total, ai, cache, fallback, errors, avgLatency },
    });
  }

  // ─── Criterion scores (0-100 each) ────────────────────────────
  // Real-World Utility (25%): ratio of requests that got a real AI answer
  const aiRate = ai / total;
  const realWorldUtility = Math.round(aiRate * 100);

  // Evidence of Traction (25%): raw volume, log-scaled to 0-100
  // 10,000 requests → 100; 100 requests → 50; 10 → 33
  const tractionScore = total > 0
    ? Math.min(100, Math.round((Math.log10(total + 1) / Math.log10(10001)) * 100))
    : 0;

  // Audience Reach (20%): unique prompt patterns (cache diversity)
  // Proxy: (ai + fallback) / total — how many NEW prompts (non-cached)
  const novelRate = total > 0 ? (ai + fallback) / total : 0;
  const audienceReach = Math.round(novelRate * 100);

  // Technical Innovation (15%): cache efficiency — high cache hit rate
  // means the system is cleverly avoiding redundant computation
  const cacheRate = cache / total;
  const technicalInnovation = Math.round(cacheRate * 100);

  // Market Timing (10%): low error rate signals production readiness
  const errorRate = errors / total;
  const marketTiming = Math.round((1 - errorRate) * 100);

  // Functional Completeness (5%): latency health — <500ms = 100, >3000ms = 0
  const latencyScore = avgLatency > 0
    ? Math.max(0, Math.round(((3000 - Math.min(avgLatency, 3000)) / 3000) * 100))
    : 50; // unknown latency = middle score

  // ─── Weighted aggregate ───────────────────────────────────────
  const raw =
    realWorldUtility   * 0.25 +
    tractionScore      * 0.25 +
    audienceReach      * 0.20 +
    technicalInnovation* 0.15 +
    marketTiming       * 0.10 +
    latencyScore       * 0.05;

  // Scale to 0-1000 with a usefulness multiplier for high-traction projects
  const usefulnessMultiplier = total > 1000 ? 1.15 : total > 100 ? 1.08 : 1.0;
  const usefulnessScore = Math.min(1000, Math.round(raw * 10 * usefulnessMultiplier));

  return res.status(200).json({
    usefulnessScore,
    tier: getTier(usefulnessScore),
    criteria: {
      realWorldUtility:    { score: realWorldUtility,    weight: "25%", description: "AI success rate" },
      tractionEvidence:    { score: tractionScore,       weight: "25%", description: "Request volume (log-scaled)" },
      audienceReach:       { score: audienceReach,       weight: "20%", description: "Novel prompt diversity" },
      technicalInnovation: { score: technicalInnovation, weight: "15%", description: "Cache efficiency" },
      marketTiming:        { score: marketTiming,        weight: "10%", description: "Error-free rate" },
      functionalCompleteness: { score: latencyScore,     weight: "5%",  description: "Latency health" },
    },
    breakdown: { total, ai, cache, fallback, errors, avgLatency },
  });
}
