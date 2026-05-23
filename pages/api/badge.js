/**
 * /api/badge — Shareable SVG badge showing live PoU score.
 * Embed in your GitHub README: ![PoU Score](https://yourapp.vercel.app/api/badge)
 * Viral loop: every visitor to your repo sees your live score.
 */
import { getStats } from "../../lib/pouTracker";

const TIER_COLORS = {
  "Unicorn Utility":       { bg: "#7c3aed", fg: "#fff" },
  "Category Standard":     { bg: "#2563eb", fg: "#fff" },
  "Industry Mainstay":     { bg: "#059669", fg: "#fff" },
  "Certified Problem Solver": { bg: "#d97706", fg: "#fff" },
  "Gaining Momentum":      { bg: "#6366f1", fg: "#fff" },
  "You're In Business":    { bg: "#374151", fg: "#fff" },
  "Lab Mode":              { bg: "#9ca3af", fg: "#111" },
};

export default function handler(req, res) {
  const { total, ai, cache, fallback, errors, avgLatency } = getStats();
  const aiRate = total > 0 ? ai / total : 0;
  const cacheRate = total > 0 ? cache / total : 0;
  const tractionScore = total > 0 ? Math.min(100, Math.round((Math.log10(total + 1) / Math.log10(10001)) * 100)) : 0;
  const raw = (aiRate * 100 * 0.25) + (tractionScore * 0.25) + ((1 - (errors / Math.max(total, 1))) * 100 * 0.10) + (cacheRate * 100 * 0.15) + 50 * 0.20 + 50 * 0.05;
  const score = Math.min(1000, Math.round(raw * 10));

  const tiers = [
    { min: 751, label: "Unicorn Utility" }, { min: 601, label: "Category Standard" },
    { min: 451, label: "Industry Mainstay" }, { min: 301, label: "Certified Problem Solver" },
    { min: 101, label: "Gaining Momentum" }, { min: 0, label: "You're In Business" },
  ];
  const tier = tiers.find((t) => score >= t.min)?.label ?? "Lab Mode";
  const { bg, fg } = TIER_COLORS[tier] ?? TIER_COLORS["Lab Mode"];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" role="img" aria-label="PoU Score: ${score}">
  <title>PoU Score: ${score}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="220" height="28" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="110" height="28" fill="#1f2937"/>
    <rect x="110" width="110" height="28" fill="${bg}"/>
    <rect width="220" height="28" fill="url(#s)"/>
  </g>
  <g fill="${fg}" text-anchor="middle" font-family="Courier New,monospace" font-size="11" font-weight="600">
    <text x="55" y="18" fill="#9ca3af">PoU SCORE</text>
    <text x="165" y="19">${score} · ${tier}</text>
  </g>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
  res.status(200).send(svg);
}
