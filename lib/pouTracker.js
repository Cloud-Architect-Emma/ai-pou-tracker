// Simple in-memory PoU store (shared singleton)

const logs = [];

export function logEvent(event) {
  logs.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

export function getLogs() {
  return logs;
}

export function clearLogs() {
  logs.length = 0;
}