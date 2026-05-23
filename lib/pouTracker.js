import fs from "fs";
import path from "path";

// Writes directly to project root — works on Windows, Mac, Linux, and Vercel
const LOG_FILE = path.join(process.cwd(), "pou-logs.json");
const MAX_LOGS = 5000;

let inMemoryFallback = [];

const PERSISTENCE_ADAPTER = {
  read() {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const raw = fs.readFileSync(LOG_FILE, "utf8");
      return JSON.parse(raw);
    } catch {
      return inMemoryFallback;
    }
  },
  write(logs) {
    try {
      fs.writeFileSync(LOG_FILE, JSON.stringify(logs.slice(-MAX_LOGS)));
    } catch {
      inMemoryFallback = logs.slice(-MAX_LOGS);
    }
  },
};

export function logEvent(event) {
  const logs = PERSISTENCE_ADAPTER.read();
  logs.push({
    ...event,
    ts: Date.now(),
    date: new Date().toISOString(),
  });
  PERSISTENCE_ADAPTER.write(logs);
}

export function getLogs() {
  return PERSISTENCE_ADAPTER.read();
}

export function getStats() {
  const logs = getLogs();
  const ai       = logs.filter(l => l.type === "ai_success").length;
  const cache    = logs.filter(l => l.type === "cache_hit").length;
  const fallback = logs.filter(l => l.type === "fallback").length;
  const errors   = logs.filter(l => l.type === "system_error").length;
  const latencies = logs.filter(l => l.latency != null).map(l => l.latency);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;
  const total = logs.length;
  return { total, ai, cache, fallback, errors, avgLatency, logs };
}