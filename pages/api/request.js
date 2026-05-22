import { logEvent } from "../../lib/pouTracker";

const CACHE = new Map();

const MODELS = [
  "https://api-inference.huggingface.co/models/distilgpt2",
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
];

function cacheKey(prompt) {
  return prompt.trim().toLowerCase();
}

async function callModel(url, prompt) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const text = await res.text();

  return {
    ok: res.ok,
    status: res.status,
    text,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const start = Date.now();

  try {
    const prompt = req.body?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const key = cacheKey(prompt);

    // -------------------------
    // 1. CACHE HIT
    // -------------------------
    if (CACHE.has(key)) {
      logEvent({
        type: "cache_hit",
        prompt,
      });

      return res.status(200).json({
        source: "cache",
        output: CACHE.get(key),
        latency: Date.now() - start,
      });
    }

    // -------------------------
    // 2. TRY MODELS (AI LAYER)
    // -------------------------
    let lastError = null;

    for (const model of MODELS) {
      try {
        const result = await callModel(model, prompt);

        if (result.ok) {
          const output = {
            model,
            raw: result.text,
          };

          CACHE.set(key, output);

          logEvent({
            type: "ai_success",
            model,
            prompt,
            latency: Date.now() - start,
          });

          return res.status(200).json({
            source: "ai",
            model,
            output,
            latency: Date.now() - start,
          });
        }

        lastError = result.text;
      } catch (err) {
        lastError = err.message;
      }
    }

    // -------------------------
    // 3. FALLBACK (GUARANTEED OUTPUT)
    // -------------------------
    const fallback = {
      text:
        "AI is a system that simulates human intelligence to process language and generate responses.",
    };

    CACHE.set(key, fallback);

    logEvent({
      type: "fallback",
      prompt,
    });

    return res.status(200).json({
      source: "fallback",
      output: fallback,
      error: lastError,
      latency: Date.now() - start,
    });
  } catch (err) {
    logEvent({
      type: "system_error",
      error: err.message,
    });

    return res.status(500).json({
      error: "System failure",
      details: err.message,
    });
  }
}