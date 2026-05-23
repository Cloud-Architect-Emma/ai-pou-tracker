import crypto from "crypto";
import { logEvent } from "../../lib/pouTracker";

const CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function cacheKey(prompt) {
  return crypto.createHash("sha256").update(prompt.trim().toLowerCase()).digest("hex").slice(0, 16);
}
function cacheGet(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { CACHE.delete(key); return null; }
  return entry.output;
}
function cacheSet(key, output) {
  CACHE.set(key, { output, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function callHuggingFace(prompt) {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("No HF_TOKEN");

  // Only fully free models — no Pro account needed
  const models = [
    { id: "google/flan-t5-base",  type: "text2text" },
    { id: "google/flan-t5-large", type: "text2text" },
    { id: "gpt2",                 type: "generation" },
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 150, temperature: 0.7 },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error(`${model.id} HTTP ${res.status}:`, err);
        continue;
      }

      const data = await res.json();

      // Handle model loading (503)
      if (data.error && data.estimated_time) {
        console.log(`${model.id} loading, estimated ${data.estimated_time}s — skipping`);
        continue;
      }

      let text = "";
      if (Array.isArray(data) && data[0]?.generated_text) {
        text = data[0].generated_text;
      } else if (data?.generated_text) {
        text = data.generated_text;
      }

      // For generation models, strip the input prompt echo
      if (model.type === "generation" && text.startsWith(prompt)) {
        text = text.slice(prompt.length).trim();
      }

      if (text && text.length > 10) {
        return { text, model: model.id };
      }
    } catch (err) {
      console.error(`${model.id} failed:`, err.message);
    }
  }

  throw new Error("All HF models failed");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const start = Date.now();
  const prompt = req.body?.prompt?.trim();
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const key = cacheKey(prompt);

  // 1. Cache hit
  const cached = cacheGet(key);
  if (cached) {
    logEvent({ type: "cache_hit", prompt, promptHash: key, latency: Date.now() - start });
    return res.status(200).json({ source: "cache", output: cached, latency: Date.now() - start });
  }

  // 2. HuggingFace free models
  try {
    const { text, model } = await callHuggingFace(prompt);
    const output = { model, text };
    cacheSet(key, output);
    logEvent({ type: "ai_success", model, prompt, promptHash: key, latency: Date.now() - start });
    return res.status(200).json({ source: "ai", output, latency: Date.now() - start });
  } catch (err) {
    console.error("All HF models failed:", err.message);
  }

  // 3. Static fallback — always works
  const output = {
    model: "static-fallback",
    text: "AI systems use mathematical models trained on large datasets to recognize patterns and generate intelligent responses to human queries.",
  };
  cacheSet(key, output);
  logEvent({ type: "fallback", prompt, promptHash: key, latency: Date.now() - start });
  return res.status(200).json({ source: "fallback", output, latency: Date.now() - start });
}