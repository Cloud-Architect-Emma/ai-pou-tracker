import { getLogs } from "../../lib/pouTracker";

export default function handler(req, res) {
  const logs = getLogs();

  const total = logs.length;

  const ai = logs.filter(l => l.type === "ai_success").length;
  const cache = logs.filter(l => l.type === "cache_hit").length;
  const fallback = logs.filter(l => l.type === "fallback").length;

  // NEW: treat fallback as valid usefulness
  const usefulnessScore =
    (ai * 15) +
    (cache * 8) +
    (fallback * 6); // <-- upgraded weighting

  return res.status(200).json({
    usefulnessScore: Math.min(1000, usefulnessScore),
    breakdown: {
      totalRequests: total,
      aiSuccess: ai,
      cacheHits: cache,
      fallbackUses: fallback,
    },
  });
}