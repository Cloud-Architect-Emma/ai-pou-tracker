const MAX_LOGS = 2000;
let inMemoryLogs = [];

async function redisGet() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/pou-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.result) return null;
    // data.result is already a string — parse it once
    return JSON.parse(data.result);
  } catch (e) {
    console.error("redisGet error:", e.message);
    return null;
  }
}

async function redisSet(logs) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    // Upstash pipeline: POST array of commands
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", "pou-logs", JSON.stringify(logs.slice(-MAX_LOGS))]
      ]),
    });
    const data = await res.json();
    if (data.error) console.error("redisSet error:", data.error);
  } catch (e) {
    console.error("redisSet error:", e.message);
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