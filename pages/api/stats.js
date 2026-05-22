import { getLogs } from "../../lib/pouTracker";

export default function handler(req, res) {
  const logs = getLogs();

  const summary = {
    totalEvents: logs.length,
    cacheHits: logs.filter(l => l.type === "cache_hit").length,
    aiSuccess: logs.filter(l => l.type === "ai_success").length,
    fallbackUses: logs.filter(l => l.type === "fallback").length,
    errors: logs.filter(l => l.type === "system_error").length,
  };

  return res.status(200).json({
    summary,
    logs,
  });
}