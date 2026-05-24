const MAX_LOGS = 2000;
let inMemoryLogs = [];

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet() {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/pou-logs`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    if (!data.result) return null;
    const parsed = JSON.parse(data.result);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error("redisGet error:", e.message);
    return null;
  }
}

async function redisSet(logs) {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  try {
    // Use pipeline to SET the value — body must be ["value"] array
    const res = await fetch(`${REDIS_URL}/set/pou-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["pou-logs", JSON.stringify(logs.slice(-MAX_LOGS))]),
    });
    const data = await res.json();
    if (data.error) console.error("redisSet error:", data.error);
  } catch (e) {
    console.error("redisSet fetch error:", e.message);
  }
}

export async function logEvent(event) {
  const saved = await redisGet();
  const logs = Array.isArray(saved) ? saved : [...inMemoryLogs];
  logs.push({ ...event, ts: Date.now(), date: new Date().toISOString() });
  const trimmed = logs.slice(-MAX_LOGS);
  inMemoryLogs = trimmed;
  await redisSet(trimmed);
}

export async function getLogs() {
  const saved = await redisGet();
  if (Array.isArray(saved)) {
    inMemoryLogs = saved;
    return saved;
  }
  return inMemoryLogs;
}

export async function getStats() {
  const logs = await getLogs();
  const ai       = logs.filter(l => l.type === "ai_success").length;
  const cache    = logs.filter(l => l.type === "cache_hit").length;
  const fallback = logs.filter(l => l.type === "fallback").length;
  const errors   = logs.filter(l => l.type === "system_error").length;
  const latencies = logs.filter(l => l.latency != null).map(l => l.latency);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  return { total: logs.length, ai, cache, fallback, errors, avgLatency, logs };
}