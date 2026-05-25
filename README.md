# AI PoU Tracker

![PoU Score](https://ai-pou-tracker.vercel.app/api/badge)

> Real-time AI observability platform that proves your AI is useful, not just running.

##  Links
-  **Live Demo:** https://ai-pou-tracker.vercel.app
-  **Pricing:** https://ai-pou-tracker.vercel.app/pricing
-  **FAQ:** https://ai-pou-tracker.vercel.app/faq
-  **Dev.to Article:** https://dev.to/emmao/i-built-a-free-ai-observability-tool-prove-your-ai-is-useful-not-just-running-470a
-  **HackerNoon Article:** [Proof of Usefulness]

##  Try it in 30 seconds
```bash
curl -X POST https://ai-pou-tracker.vercel.app/api/request \
  -H "Content-Type: application/json" \
  -d '{"prompt": "hello world"}'
```

##  Tech Stack
- Next.js 14 App Router
- Upstash Redis (persistent serverless storage)
- Bright Data (AI pricing intelligence)
- Storyblok (headless CMS)
- HuggingFace Inference API (fallback)
- Vercel edge deployment
![PoU Score](https://ai-pou-tracker.vercel.app/api/badge)

# AI System Observability and Cost Tracker
Live demo: https://ai-pou-tracker.vercel.app

# AI System Observability and Cost Tracker

> **HackerNoon Proof of Usefulness Hackathon 2026** · Live PoU Score: see badge below

![PoU Score](https://ai-pou-tracker.vercel.app/api/badge)

Real-time AI observability platform that tracks **actual usefulness** of AI systems — not just output quality. Measures success rates, fallback patterns, cache efficiency, latency, and cost savings across every request.

## What it does

Every call to `/api/request` flows through:
1. **Cache check**: SHA-256 keyed, 1h TTL
2. **Anthropic claude-haiku-4-5**: primary model, fast + accurate
3. **Mistral-7B-Instruct**: secondary fallback via HuggingFace
4. **Static fallback**: guaranteed response, never drops a request

Every event is logged to persistent storage and surfaced via:
- **Live dashboard**: Netflix-dark UI, auto-refreshes every 2s
- **PoU Score gauge**: weighted per HackerNoon's official algorithm
- **Prompt leaderboard**:  viral loop showing top patterns
- **AI insight engine**:  Claude-generated analysis of your metrics
- **Judge-ready report**: exportable evidence for the hackathon submission
- **SVG badge**: embed in your README for viral social proof

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/request` | AI + fallback and cache pipeline |
| `GET` | `/api/score` | PoU scoring engine (aligned to hackathon criteria) |
| `GET` | `/api/stats` | Usage analytics, prompt leaderboard, hourly timeseries |
| `POST` | `/api/explain` | LLM-generated insight engine (Claude Haiku) |
| `GET` | `/api/badge` | Shareable SVG badge with live score |
| `GET` | `/api/export` | Judge-ready JSON evidence report |

## Quick start

```bash
git clone https://github.com/Cloud-Architect-Emma/ai-pou-tracker
cd ai-pou-tracker
npm install
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY and HF_TOKEN
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```env
ANTHROPIC_API_KEY=sk-ant-...         # console.anthropic.com (free tier works)
HF_TOKEN=hf_...                      # huggingface.co/settings/tokens (free)
NEXT_PUBLIC_BASE_URL=https://...     # your deployed URL for badge links
```

## Deploying to Vercel

```bash
npx vercel --prod
# Set env vars in Vercel dashboard → Settings → Environment Variables
```

## PoU Score algorithm

The score (0–1000) mirrors HackerNoon's official weighting:

| Criterion | Weight | How we measure it |
|-----------|--------|-------------------|
| Real-World Utility | 25% | AI success rate |
| Evidence of Traction | 25% | Request volume (log-scaled) |
| Audience Reach | 20% | Novel prompt diversity |
| Technical Innovation | 15% | Cache efficiency |
| Market Timing | 10% | Error-free rate |
| Functional Completeness | 5% | Latency health |

## Hackathon tags

`#proof-of-usefulness` `#ai-agents` `#ai-search` `#machine-learning` `#generative-ai` `#software-engineering` `#api` `#startup`

---
Built for [HackerNoon Proof of Usefulness Hackathon](https://hackathon.hackernoon.com/proof-of-usefulness) · Jan–Jun 2026
