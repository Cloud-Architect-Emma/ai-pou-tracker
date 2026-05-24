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
    return data.result ? JSON.parse(data.result) : null;
  } catch { return null; }
}

async function redisSet(logs) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/pou-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([JSON.stringify(logs.slice(-MAX_LOGS))]),
    });
  } catch {}
}

export async function logEvent(event) {
  const saved = await redisGet();
  const logs = Array.isArray(saved) ? saved : inMemoryLogs;
  logs.push({ ...event, ts: Date.now(), date: new Date().toISOString() });
  inMemoryLogs = logs.slice(-MAX_LOGS);
  await redisSet(inMemoryLogs);
}

export async function getLogs() {
  const saved = await redisGet();
  if (Array.isArray(saved)) { inMemoryLogs = saved; return saved; }
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