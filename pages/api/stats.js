import { getStats } from "../../lib/pouTracker";

export default async function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency, logs } = await getStats();

  const promptMap = new Map();
  for (const log of logs) {
    if (!log.prompt) continue;
    const k = log.promptHash ?? log.prompt.slice(0, 80);
    const ex = promptMap.get(k);
    if (ex) { ex.count++; if (log.latency) ex.latencies.push(log.latency); }
    else { promptMap.set(k, { prompt: log.prompt.slice(0, 80), count: 1, latencies: log.latency ? [log.latency] : [] }); }
  }
  const leaderboard = [...promptMap.values()]
    .sort((a, b) => b.count - a.count).slice(0, 20)
    .map(p => ({ prompt: p.prompt, count: p.count, avgLatency: p.latencies.length ? Math.round(p.latencies.reduce((a, b) => a + b, 0) / p.latencies.length) : null }));

  const modelMap = new Map();
  for (const log of logs) {
    if (log.type !== "ai_success" || !log.model) continue;
    modelMap.set(log.model, (modelMap.get(log.model) ?? 0) + 1);
  }

  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => ({ hour: i, label: `${i}:00`, ai: 0, cache: 0, fallback: 0, errors: 0 }));
  for (const log of logs) {
    const age = now - (log.ts ?? 0);
    if (age > 86400000) continue;
    const idx = 23 - Math.floor(age / 3600000);
    if (idx < 0 || idx > 23) continue;
    const b = buckets[idx];
    if (log.type === "ai_success") b.ai++;
    else if (log.type === "cache_hit") b.cache++;
    else if (log.type === "fallback") b.fallback++;
    else if (log.type === "system_error") b.errors++;
  }

  return res.status(200).json({
    summary: { total, ai, cache, fallback, errors, avgLatency, costSaved: parseFloat((cache * 0.00025).toFixed(4)) },
    leaderboard,
    modelBreakdown: Object.fromEntries(modelMap),
    hourly: buckets,
    logs: logs.slice(-100),
  });
}