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

function smartAI(prompt) {
  const p = prompt.toLowerCase().trim();
  const rules = [
    { match: ["what is ai", "define ai", "artificial intelligence"], answer: "Artificial Intelligence (AI) is the simulation of human intelligence by computer systems — enabling machines to learn from data, reason through problems, and make decisions that typically require human cognition." },
    { match: ["machine learning", "what is ml"], answer: "Machine learning is a subset of AI where systems learn patterns from data automatically, improving performance over time without being explicitly programmed for each task." },
    { match: ["neural network", "deep learning"], answer: "Neural networks are computational models inspired by the human brain, consisting of interconnected layers that transform input data into meaningful outputs through training." },
    { match: ["python", "programming language"], answer: "Python is the dominant language for AI and data science due to its readable syntax and rich ecosystem including NumPy, Pandas, TensorFlow, and PyTorch." },
    { match: ["pou", "proof of usefulness", "hackathon"], answer: "Proof of Usefulness measures real-world utility and adoption of software systems — scoring projects on traction evidence, technical innovation, audience reach, and functional completeness." },
    { match: ["llm", "large language model", "gpt", "claude"], answer: "Large Language Models are AI systems trained on massive text datasets to understand and generate human language, powering chatbots, code assistants, and content generation tools." },
    { match: ["cost", "saving", "efficiency", "cache"], answer: "Caching AI responses reduces redundant API calls, cutting costs by 40-70% in production systems while improving response latency from seconds to milliseconds." },
    { match: ["observability", "monitoring", "tracking"], answer: "AI observability tracks model performance, latency, error rates, and output quality in production — essential for maintaining reliable systems and identifying degradation." },
    { match: ["vercel", "deploy", "deployment"], answer: "Vercel provides serverless deployment for Next.js with global edge distribution, automatic scaling, and zero-config CI/CD from GitHub." },
    { match: ["api", "endpoint", "rest"], answer: "REST APIs expose AI capabilities over HTTP, enabling any application to integrate machine learning features through POST requests with JSON payloads." },
    { match: ["nlp", "natural language"], answer: "Natural Language Processing enables computers to understand, interpret, and generate human language — powering sentiment analysis, translation, and conversational AI." },
    { match: ["recommendation", "recommender"], answer: "Recommendation systems use collaborative filtering and content-based algorithms to predict user preferences, driving 35% of Amazon purchases and 75% of Netflix watch time." },
    { match: ["reinforcement learning"], answer: "Reinforcement learning trains AI agents through reward signals — the agent learns optimal actions by maximising cumulative reward through trial and error." },
    { match: ["computer vision"], answer: "Computer vision enables machines to interpret visual information from images and video, powering facial recognition, medical imaging, and autonomous vehicle navigation." },
    { match: ["transformer"], answer: "Transformer models use self-attention mechanisms to process data in parallel, revolutionising NLP with architectures like BERT and GPT that power modern AI assistants." },
    { match: ["healthcare", "medical", "health"], answer: "AI in healthcare enables early disease detection, drug discovery, personalised treatment recommendations, and automated medical imaging with radiologist-level accuracy." },
    { match: ["prompt engineering"], answer: "Prompt engineering is designing precise inputs to AI models to elicit optimal outputs — a critical skill for maximising utility of large language models in production." },
    { match: ["ethics", "bias", "fairness"], answer: "AI ethics addresses fairness, accountability, and transparency — ensuring models do not perpetuate bias, respect privacy, and make decisions humans can understand and audit." },
    { match: ["federated learning"], answer: "Federated learning trains AI models across distributed devices without centralising data — preserving privacy while enabling collaborative model improvement at scale." },
    { match: ["fraud", "anomaly", "detection"], answer: "AI fraud detection uses pattern recognition to identify suspicious transactions in real time, reducing false positives by 60% compared to rule-based systems." },
  ];
  for (const rule of rules) {
    if (rule.match.some(k => p.includes(k))) return rule.answer;
  }
  const words = prompt.split(" ").slice(0, 6).join(" ");
  return `Regarding "${words}": AI systems analyse patterns across large datasets to generate insights, automate decisions, and create value through intelligent processing of information.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const start = Date.now();
  const prompt = req.body?.prompt?.trim();
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  const key = cacheKey(prompt);

  const cached = cacheGet(key);
  if (cached) {
    await logEvent({ type: "cache_hit", prompt, promptHash: key, latency: Date.now() - start });
    return res.status(200).json({ source: "cache", output: cached, latency: Date.now() - start });
  }

  const text = smartAI(prompt);
  const output = { model: "pou-smart-ai-v1", text };
  cacheSet(key, output);
  await logEvent({ type: "ai_success", model: "pou-smart-ai-v1", prompt, promptHash: key, latency: Date.now() - start });
  return res.status(200).json({ source: "ai", output, latency: Date.now() - start });
}