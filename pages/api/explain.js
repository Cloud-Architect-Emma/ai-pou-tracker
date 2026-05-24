import { getStats } from "../../lib/pouTracker";

function generateInsight({ total, ai, cache, fallback, errors, avgLatency }) {
  if (total === 0) return "No usage data yet. Send requests to /api/request to generate evidence for judges.";
  const lines = [];
  const aiRate = (ai / total) * 100;
  const cacheRate = (cache / total) * 100;
  if (aiRate >= 80) lines.push(`✓ Strong AI success rate of ${aiRate.toFixed(1)}% — judges score this highly under Real-World Utility (25% weight).`);
  else if (aiRate >= 50) lines.push(`⚠ AI success rate of ${aiRate.toFixed(1)}% is moderate. The fallback handles failures gracefully.`);
  else lines.push(`⚠ AI success rate of ${aiRate.toFixed(1)}% is low. System is relying on fallback.`);
  if (cacheRate >= 30) lines.push(`✓ Cache hit rate of ${cacheRate.toFixed(1)}% demonstrates Technical Innovation — avoiding redundant calls saves cost and improves latency.`);
  else if (cache > 0) lines.push(`Cache hit rate is ${cacheRate.toFixed(1)}% — will grow as users repeat similar prompts.`);
  if (total >= 1000) lines.push(`✓ ${total.toLocaleString()} total requests is strong Traction Evidence — the metric judges cross-validate against public data.`);
  else if (total >= 100) lines.push(`📈 ${total} requests recorded. Drive to 1,000+ before June 5 to maximise Traction Evidence (25% weight).`);
  else lines.push(`📈 ${total} requests so far. Share your live URL to drive usage — traction volume is 25% of your PoU score.`);
  if (avgLatency > 0 && avgLatency < 1000) lines.push(`✓ Average latency of ${avgLatency}ms is healthy — under 1s demonstrates production-grade performance.`);
  else if (avgLatency >= 1000) lines.push(`⚠ Average latency of ${avgLatency}ms is high. Caching repeat prompts reduces perceived latency.`);
  if (errors === 0) lines.push(`✓ Zero system errors — 100% error-free rate scores maximum Market Timing points (10% weight).`);
  return lines.join("\n\n");
}

export default async function handler(req, res) {
  const stats = await getStats();
  const { total, ai, cache, avgLatency } = stats;
  const insight = generateInsight(stats);
  const aiRate = total > 0 ? ((ai / total) * 100).toFixed(1) : 0;
  const cacheRate = total > 0 ? ((cache / total) * 100).toFixed(1) : 0;
  const judgeBrief = `This system processed ${total.toLocaleString()} requests with a ${aiRate}% AI success rate and ${cacheRate}% cache efficiency. Average response latency: ${avgLatency}ms. The observability layer tracks every AI call, fallback event, and cache hit in real time — providing verifiable traction evidence for the PoU algorithm.`;
  return res.status(200).json({ insight, judgeBrief, source: "rule-based", summary: stats, generatedAt: new Date().toISOString() });
}