import { getStats } from "../../lib/pouTracker";

const TIERS = [
  { min: 751, label: "Unicorn Utility" },
  { min: 601, label: "Category Standard" },
  { min: 451, label: "Industry Mainstay" },
  { min: 301, label: "Certified Problem Solver" },
  { min: 101, label: "Gaining Momentum" },
  { min: 0,   label: "You're In Business" },
  { min: -100,label: "Lab Mode" },
];

export default async function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency } = await getStats();

  if (total === 0) {
    return res.status(200).json({
      usefulnessScore: 0, tier: "Lab Mode",
      criteria: {
        realWorldUtility:       { score: 0,  weight: "25%", description: "AI success rate" },
        tractionEvidence:       { score: 0,  weight: "25%", description: "Request volume" },
        audienceReach:          { score: 0,  weight: "20%", description: "Novel prompt diversity" },
        technicalInnovation:    { score: 0,  weight: "15%", description: "Cache efficiency" },
        marketTiming:           { score: 0,  weight: "10%", description: "Error-free rate" },
        functionalCompleteness: { score: 50, weight: "5%",  description: "Latency health" },
      },
      breakdown: { total, ai, cache, fallback, errors, avgLatency },
    });
  }

  const aiRate    = ai / total;
  const cacheRate = cache / total;
  const errorRate = errors / total;
  const novelRate = (ai + fallback) / total;

  const realWorldUtility       = Math.round(aiRate * 100);
  const tractionScore          = Math.min(100, Math.round((Math.log10(total + 1) / Math.log10(10001)) * 100));
  const audienceReach          = Math.round(novelRate * 100);
  const technicalInnovation    = Math.round(cacheRate * 100);
  const marketTiming           = Math.round((1 - errorRate) * 100);
  const functionalCompleteness = avgLatency > 0
    ? Math.max(0, Math.round(((3000 - Math.min(avgLatency, 3000)) / 3000) * 100))
    : 50;

  const raw =
    realWorldUtility       * 0.25 +
    tractionScore          * 0.25 +
    audienceReach          * 0.20 +
    technicalInnovation    * 0.15 +
    marketTiming           * 0.10 +
    functionalCompleteness * 0.05;

  const multiplier = total > 1000 ? 1.15 : total > 100 ? 1.08 : 1.0;
  const usefulnessScore = Math.min(1000, Math.round(raw * 10 * multiplier));
  const tier = TIERS.find(t => usefulnessScore >= t.min)?.label ?? "Lab Mode";

  return res.status(200).json({
    usefulnessScore, tier,
    criteria: {
      realWorldUtility:       { score: realWorldUtility,       weight: "25%", description: "AI success rate" },
      tractionEvidence:       { score: tractionScore,          weight: "25%", description: "Request volume (log-scaled)" },
      audienceReach:          { score: audienceReach,          weight: "20%", description: "Novel prompt diversity" },
      technicalInnovation:    { score: technicalInnovation,    weight: "15%", description: "Cache efficiency" },
      marketTiming:           { score: marketTiming,           weight: "10%", description: "Error-free rate" },
      functionalCompleteness: { score: functionalCompleteness, weight: "5%",  description: "Latency health" },
    },
    breakdown: { total, ai, cache, fallback, errors, avgLatency },
  });
}