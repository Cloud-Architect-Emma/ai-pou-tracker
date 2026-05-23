/**
 * /api/export — Returns structured JSON for PDF report generation.
 * Call this from the frontend, then use jsPDF to render the judge report.
 */
import { getStats } from "../../lib/pouTracker";

const TIERS = [
  { min: 751, label: "Unicorn Utility" }, { min: 601, label: "Category Standard" },
  { min: 451, label: "Industry Mainstay" }, { min: 301, label: "Certified Problem Solver" },
  { min: 101, label: "Gaining Momentum" }, { min: 0, label: "You're In Business" },
];

export default function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency } = getStats();
  const aiRate = total > 0 ? ai / total : 0;
  const cacheRate = total > 0 ? cache / total : 0;
  const tractionScore = total > 0 ? Math.min(100, Math.round((Math.log10(total + 1) / Math.log10(10001)) * 100)) : 0;
  const criteria = {
    realWorldUtility:    { score: Math.round(aiRate * 100),    weight: 25 },
    tractionEvidence:    { score: tractionScore,               weight: 25 },
    audienceReach:       { score: Math.round(((ai + fallback) / Math.max(total, 1)) * 100), weight: 20 },
    technicalInnovation: { score: Math.round(cacheRate * 100), weight: 15 },
    marketTiming:        { score: Math.round((1 - errors / Math.max(total, 1)) * 100), weight: 10 },
    functionalCompleteness: { score: avgLatency > 0 ? Math.max(0, Math.round(((3000 - Math.min(avgLatency, 3000)) / 3000) * 100)) : 50, weight: 5 },
  };
  const raw = Object.values(criteria).reduce((acc, c) => acc + c.score * (c.weight / 100), 0);
  const score = Math.min(1000, Math.round(raw * 10));
  const tier = TIERS.find((t) => score >= t.min)?.label ?? "Lab Mode";

  res.status(200).json({
    project: "AI System Observability + Cost Tracker",
    url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://ai-pou-tracker.vercel.app",
    generatedAt: new Date().toISOString(),
    score, tier, criteria,
    traction: { total, ai, cache, fallback, errors, avgLatency,
      costSaved: parseFloat((cache * 0.00025).toFixed(4)),
      aiSuccessRate: parseFloat((aiRate * 100).toFixed(1)),
      cacheHitRate: parseFloat((cacheRate * 100).toFixed(1)),
    },
    hackathon: {
      name: "HackerNoon Proof of Usefulness",
      deadline: "June 5, 2026",
      sponsors: ["Bright Data", "Storyblok", "Neo4j", "Algolia"],
      tags: ["#proof-of-usefulness", "#ai-agents", "#ai-search", "#machine-learning"],
    },
  });
}
