import { getStats } from "../../lib/pouTracker";

export default async function handler(req, res) {
  const { total, ai, cache, errors } = await getStats();
  const aiRate = total > 0 ? ai / total : 0;
  const cacheRate = total > 0 ? cache / total : 0;
  const traction = Math.min(100, Math.round((Math.log10(total + 1) / Math.log10(10001)) * 100));
  const raw = aiRate * 100 * 0.25 + traction * 0.25 + ((ai + (total - cache)) / Math.max(total, 1) * 100) * 0.20 + cacheRate * 100 * 0.15 + ((1 - errors / Math.max(total, 1)) * 100) * 0.10 + 50 * 0.05;
  const score = Math.min(1000, Math.round(raw * 10));
  const tiers = [
    { min: 751, label: "Unicorn Utility",    color: "#7c3aed" },
    { min: 601, label: "Category Standard",  color: "#2563eb" },
    { min: 451, label: "Industry Mainstay",  color: "#059669" },
    { min: 301, label: "Certified Solver",   color: "#d97706" },
    { min: 101, label: "Gaining Momentum",   color: "#6366f1" },
    { min: 0,   label: "You're In Business", color: "#374151" },
  ];
  const tier = tiers.find(t => score >= t.min) ?? tiers[tiers.length - 1];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="28" role="img" aria-label="PoU Score: ${score}">
  <title>PoU Score: ${score}</title>
  <clipPath id="r"><rect width="240" height="28" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="120" height="28" fill="#1f2937"/>
    <rect x="120" width="120" height="28" fill="${tier.color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600">
    <text x="60"  y="18" fill="#9ca3af">PoU SCORE</text>
    <text x="180" y="18">${score} · ${tier.label}</text>
  </g>
</svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  return res.status(200).send(svg);
}