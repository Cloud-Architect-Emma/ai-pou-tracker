import { getLogs } from "../../lib/pouTracker";

export default function handler(req, res) {
  const logs = getLogs();

  const ai = logs.filter(l => l.type === "ai_success").length;
  const fallback = logs.filter(l => l.type === "fallback").length;
  const cache = logs.filter(l => l.type === "cache_hit").length;

  let explanation = [];

  if (fallback > ai) {
    explanation.push("System relies heavily on fallback — AI layer is unstable or unavailable.");
  }

  if (cache > 0) {
    explanation.push("Caching improves efficiency and reduces repeated computation.");
  }

  if (ai > fallback) {
    explanation.push("AI layer is performing well and actively used.");
  }

  if (logs.length === 0) {
    explanation.push("No usage data yet — system has not been exercised.");
  }

  return res.json({
    summary: {
      ai,
      fallback,
      cache,
    },
    explanation,
  });
}