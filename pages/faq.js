import { useEffect, useState } from "react";

const T = {
  bg:      "#06060f",
  surface: "#0e0e1f",
  s2:      "#13132a",
  border:  "#1f1f3a",
  accent:  "#7c5cfc",
  dim:     "#6b6b8a",
  mono:    "'Space Mono', monospace",
};

export async function getStaticProps() {
  try {
    const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
    const res = await fetch(
      `https://api.storyblok.com/v2/cdn/stories/faq?version=published&token=${token}`
    );
    const data = await res.json();
    return { props: { story: data.story ?? null } };
  } catch {
    return { props: { story: null } };
  }
}

const FAQS = [
  { q: "What is AI PoU Tracker?", a: "A real-time observability dashboard that proves your AI is useful, not just running." },
  { q: "Is it free?", a: "Yes. The free tier tracks up to 1,000 requests per month with no signup required." },
  { q: "How do I try it?", a: "Visit https://ai-pou-tracker.vercel.app and use the Quick Test box — no account needed." },
  { q: "What metrics does it track?", a: "AI success rate, cache efficiency, latency, fallback patterns, and a live Proof of Usefulness score." },
  { q: "What is the tech stack?", a: "Next.js 14, Upstash Redis, HuggingFace Inference API, Recharts, and Vercel edge deployment." },
  { q: "Is it open source?", a: "Yes! Full source code at github.com/Cloud-Architect-Emma/ai-pou-tracker" },
];

export default function FAQ({ story }) {
  const [open, setOpen] = useState(null);
  const headline = story?.content?.body?.[0]?.headline ?? null;

  return (
    <main style={{ background: T.bg, minHeight: "100vh", padding: "48px 24px", fontFamily: "Barlow, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
            Powered by Storyblok CMS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Frequently Asked Questions
          </h1>
          {headline && (
            <p style={{ fontSize: 14, color: T.dim, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px", marginTop: 16 }}>
              {headline}
            </p>
          )}
          <p style={{ fontSize: 14, color: T.dim, marginTop: 12 }}>
            Everything you need to know about AI PoU Tracker
          </p>
        </div>

        {/* FAQ Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{ background: T.surface, border: `1px solid ${open === i ? T.accent : T.border}`, borderRadius: 10, overflow: "hidden", transition: "border-color .2s" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "Barlow, sans-serif", textAlign: "left" }}
              >
                {faq.q}
                <span style={{ color: T.accent, fontSize: 18, flexShrink: 0, marginLeft: 12 }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 16px", fontSize: 13, color: T.dim, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="/" style={{ color: T.accent, fontSize: 13, textDecoration: "none", fontFamily: T.mono }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}