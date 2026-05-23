/**
 * /api/stats — Usage analytics with prompt leaderboard.
 *
 * UPGRADES from original:
 * 1. Uses getStats() from persistent tracker.
 * 2. Adds prompt leaderboard — top 20 prompts by frequency.
 * 3. Adds hourly timeseries for the live chart.
 * 4. Adds model breakdown (which AI model served the most requests).
 * 5. Computes cost savings: each cache hit saves ~$0.00025 (Haiku price).
 */

import { getStats } from "../../lib/pouTracker";

const COST_PER_AI_CALL = 0.00025; // ~Haiku input+output for avg prompt

export default function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency, logs } = getStats();

  // ─── Prompt leaderboard ───────────────────────────────────────
  const promptMap = new Map();
  for (const log of logs) {
    if (!log.prompt) continue;
    const existing = promptMap.get(log.promptHash ?? log.prompt);
    if (existing) {
      existing.count++;
      if (log.latency) existing.latencies.push(log.latency);
    } else {
      promptMap.set(log.promptHash ?? log.prompt, {
        prompt: log.prompt.slice(0, 80),
        count: 1,
        latencies: log.latency ? [log.latency] : [],
        type: log.type,
      });
    }
  }
  const leaderboard = [...promptMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((p) => ({
      ...p,
      avgLatency: p.latencies.length
        ? Math.round(p.latencies.reduce((a, b) => a + b, 0) / p.latencies.length)
        : null,
      latencies: undefined, // strip raw array
    }));

  // ─── Model breakdown ──────────────────────────────────────────
  const modelMap = new Map();
  for (const log of logs) {
    if (log.type !== "ai_success" || !log.model) continue;
    modelMap.set(log.model, (modelMap.get(log.model) ?? 0) + 1);
  }
  const modelBreakdown = Object.fromEntries(modelMap);

  // ─── Hourly timeseries (last 24h) ────────────────────────────
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i}:00`,
    ai: 0,
    cache: 0,
    fallback: 0,
    errors: 0,
  }));
  for (const log of logs) {
    const age = now - (log.ts ?? 0);
    if (age > 24 * 60 * 60 * 1000) continue;
    const bucketIdx = 23 - Math.floor(age / (60 * 60 * 1000));
    if (bucketIdx < 0 || bucketIdx > 23) continue;
    const b = buckets[bucketIdx];
    if (log.type === "ai_success") b.ai++;
    else if (log.type === "cache_hit") b.cache++;
    else if (log.type === "fallback") b.fallback++;
    else if (log.type === "system_error") b.errors++;
  }

  // ─── Cost savings ─────────────────────────────────────────────
  const costSaved = parseFloat((cache * COST_PER_AI_CALL).toFixed(4));

  return res.status(200).json({
    summary: { total, ai, cache, fallback, errors, avgLatency, costSaved },
    leaderboard,
    modelBreakdown,
    hourly: buckets,
  });
}
