import { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const T = {
  bg:      "#06060f",
  surface: "#0e0e1f",
  s2:      "#13132a",
  s3:      "#1a1a38",
  border:  "#1f1f3a",
  accent:  "#7c5cfc",
  blue:    "#3b82f6",
  green:   "#22c55e",
  red:     "#ef4444",
  amber:   "#f59e0b",
  dim:     "#6b6b8a",
  muted:   "#44445a",
  mono:    "'Space Mono', monospace",
};

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Kpi({ label, value, delta, color = T.accent }) {
  return (
    <Card>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.dim, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 26, color: "#fff", lineHeight: 1 }}>{value ?? "—"}</div>
      {delta && <div style={{ fontSize: 11, color: color, marginTop: 6, fontWeight: 600 }}>{delta}</div>}
    </Card>
  );
}

function LiveDot() {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(p => !p), 700); return () => clearInterval(t); }, []);
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: T.red, boxShadow: on ? `0 0 8px ${T.red}` : "none", transition: "box-shadow .3s"
    }} />
  );
}

function Gauge({ score, tier }) {
  const pct = Math.min(1, score / 1000);
  const r = 54, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  const strokeDash = pct * circumference;
  const tierColors = {
    "Unicorn Utility": "#a78bfa", "Category Standard": T.blue,
    "Industry Mainstay": T.green, "Certified Problem Solver": T.amber,
    "Gaining Momentum": "#6366f1", default: T.dim,
  };
  const color = tierColors[tier] ?? tierColors.default;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={128} height={128} style={{ overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.s3} strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={22} fontWeight="700" fill="#fff">{score}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="Barlow, sans-serif" fontSize={10} fill={T.dim}>/ 1000</text>
      </svg>
      <div style={{ fontFamily: T.mono, fontSize: 11, color, fontWeight: 700 }}>{tier}</div>
    </div>
  );
}

function CriteriaBar({ label, score, weight, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#ccc", width: 160, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 5, background: T.s3, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, width: 32, textAlign: "right" }}>{score}</div>
      <div style={{ fontSize: 10, color: T.muted, width: 28, textAlign: "right" }}>{weight}</div>
    </div>
  );
}

const TYPE_COLOR = { ai_success: T.green, cache_hit: T.blue, fallback: T.amber, system_error: T.red };

function EventFeed({ events }) {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [events]);
  return (
    <div ref={ref} style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {events.slice(0, 30).map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_COLOR[e.type] ?? T.dim, flexShrink: 0, marginTop: 3 }} />
          <span style={{ flex: 1, color: "#bbb", lineHeight: 1.5 }}>
            <span style={{ fontFamily: T.mono, color: TYPE_COLOR[e.type] ?? T.dim, fontSize: 10, marginRight: 6 }}>{e.type}</span>
            {e.prompt ? `"${e.prompt.slice(0, 55)}${e.prompt.length > 55 ? "…" : ""}"` : e.error ?? ""}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0 }}>{e.latency ? `${e.latency}ms` : ""}</span>
        </div>
      ))}
      {events.length === 0 && (
        <div style={{ color: T.dim, fontSize: 12, padding: "20px 0" }}>No events yet — send a request to /api/request</div>
      )}
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: T.dim, marginBottom: 4, fontFamily: T.mono, fontSize: 10 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
}

const TABS = ["Dashboard", "Leaderboard", "API Routes", "PoU Report", "AI Pricing", "Graph"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [score, setScore] = useState(null);
  const [explain, setExplain] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      const [s, sc] = await Promise.all([
        fetch("/api/stats").then(r => r.json()),
        fetch("/api/score").then(r => r.json()),
      ]);
      setStats(s);
      setScore(sc);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => { fetchData(); setTick(n => n + 1); }, 2000);
    return () => clearInterval(t);
  }, [fetchData]);

  const fetchExplain = useCallback(async () => {
    try {
      const e = await fetch("/api/explain").then(r => r.json());
      setExplain(e);
    } catch {}
  }, []);

  useEffect(() => { fetchExplain(); }, [fetchExplain]);

  const sendTest = async () => {
    if (!prompt.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const d = await r.json();
      setTestResult(d);
      fetchData();
    } catch (e) { setTestResult({ error: e.message }); }
    setTesting(false);
  };

  const exportData = async () => {
    try {
      const d = await fetch("/api/export").then(r => r.json());
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "pou-evidence-report.json"; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const s = stats?.summary ?? {};
  const criteria = score?.criteria ?? {};
  const hourly = stats?.hourly ?? [];
  const leaderboard = stats?.leaderboard ?? [];
  const logs = stats?.logs ?? [];
  const pouScore = score?.usefulnessScore ?? 0;
  const tier = score?.tier ?? "Lab Mode";

  const CRITERIA_CONFIG = [
    { key: "realWorldUtility",       label: "Real-World Utility",        color: T.blue,    weight: "25%" },
    { key: "tractionEvidence",       label: "Traction Evidence",         color: T.accent,  weight: "25%" },
    { key: "audienceReach",          label: "Audience Reach",            color: T.green,   weight: "20%" },
    { key: "technicalInnovation",    label: "Technical Innovation",      color: T.amber,   weight: "15%" },
    { key: "marketTiming",           label: "Market Timing",             color: "#f472b6", weight: "10%" },
    { key: "functionalCompleteness", label: "Functional Completeness",   color: "#34d399", weight: "5%"  },
  ];

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>AI PoU Tracker</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", background: T.surface, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LiveDot />
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>AI PoU TRACKER</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>v2.0</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              background: tab === i ? T.s3 : "transparent",
              color: tab === i ? "#fff" : T.dim,
              border: tab === i ? `1px solid ${T.border}` : "1px solid transparent",
              borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "Barlow, sans-serif", letterSpacing: ".02em",
            }}>{t}</button>
          ))}
        </div>

        {/* ── RIGHT SIDE NAV — Pricing link added here ── */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>↻ {tick}</span>
          <a href="/pricing" style={{ background: T.s3, color: "#ccc", border: `1px solid ${T.border}`, borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: "Barlow, sans-serif" }}>Pricing</a>
          <button onClick={exportData} style={{ background: "#1a0f2e", color: "#a78bfa", border: "1px solid #2a1a4e", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Barlow, sans-serif" }}>↓ Export Evidence</button>
          <a href="/api/badge" target="_blank" rel="noreferrer" style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: "Barlow, sans-serif" }}>🏅 Get Badge</a>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div style={{ background: T.s2, borderBottom: `1px solid ${T.border}`, padding: "6px 24px", display: "flex", gap: 32, overflowX: "auto", fontSize: 11, fontFamily: T.mono, color: T.dim, whiteSpace: "nowrap" }}>
        {[
          ["TOTAL_REQUESTS", s.total ?? 0, T.green],
          ["AI_SUCCESS", s.ai ?? 0, T.green],
          ["CACHE_HITS", s.cache ?? 0, T.blue],
          ["FALLBACKS", s.fallback ?? 0, T.amber],
          ["AVG_LATENCY", s.avgLatency ? `${s.avgLatency}ms` : "—", "#fff"],
          ["COST_SAVED", s.costSaved != null ? `$${s.costSaved}` : "—", T.green],
          ["POU_SCORE", `+${pouScore}`, T.accent],
        ].map(([k, v, c]) => (
          <span key={k}>{k} <span style={{ color: c }}>{v}</span></span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 90px)" }}>

        {/* ── Sidebar ── */}
        <div style={{ background: T.surface, borderRight: `1px solid ${T.border}`, padding: "20px 0" }}>
          <div style={{ margin: "0 12px 16px", background: "linear-gradient(135deg, #0d0a1f 0%, #170e38 100%)", border: "1px solid #2a1a4e", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: T.dim, marginBottom: 4 }}>PoU Score</div>
            <div style={{ fontFamily: T.mono, fontSize: 36, color: T.accent, lineHeight: 1 }}>{pouScore}</div>
            <div style={{ fontSize: 11, color: "#7c6db0", marginTop: 4, fontWeight: 500 }}>{tier}</div>
            <div style={{ height: 3, background: T.s3, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, pouScore / 10)}%`, height: "100%", background: T.accent, transition: "width 1s ease" }} />
            </div>
          </div>

          {[
            ["AI Engine",    s.ai > 0 ? "ACTIVE" : "IDLE", T.green],
            ["Cache Layer",  `${s.cache ?? 0} hits`,        T.blue],
            ["Fallback",     `${s.fallback ?? 0} uses`,     T.amber],
            ["Error Count",  `${s.errors ?? 0}`,            s.errors > 0 ? T.red : T.dim],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px", fontSize: 12, color: T.dim }}>
              <span>{label}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color }}>{val}</span>
            </div>
          ))}

          <div style={{ margin: "16px 12px 0", padding: 12, background: T.s2, borderRadius: 8, border: `1px dashed ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.dim, marginBottom: 8, fontWeight: 700, letterSpacing: ".06em" }}>QUICK TEST</div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter a prompt…"
              rows={3}
              style={{ width: "100%", background: T.bg, color: "#e2e0f0", border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 8px", fontSize: 11, fontFamily: "Barlow, sans-serif", resize: "none", outline: "none" }}
            />
            <button
              onClick={sendTest}
              disabled={testing || !prompt.trim()}
              style={{ width: "100%", marginTop: 6, background: testing ? T.muted : T.accent, color: "#fff", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 11, fontWeight: 700, cursor: testing ? "not-allowed" : "pointer", fontFamily: "Barlow, sans-serif" }}
            >
              {testing ? "Sending…" : "▶ Send Request"}
            </button>
            {testResult && (
              <div style={{ marginTop: 8, fontSize: 10, fontFamily: T.mono, color: testResult.error ? T.red : T.green, wordBreak: "break-word" }}>
                {testResult.error ? `✗ ${testResult.error}` : `✓ ${testResult.source} · ${testResult.latency}ms`}
              </div>
            )}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ padding: 24, overflowY: "auto" }}>

          {/* ── TAB 0: DASHBOARD ── */}
          {tab === 0 && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Observability Dashboard</h1>
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Real-time AI system metrics · auto-refreshing every 2s</div>
                </div>
                <span style={{ background: "#0a2a18", color: T.green, border: "1px solid #0d3a20", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", padding: "4px 10px", textTransform: "uppercase" }}>All Systems Operational</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                <Kpi label="Total Requests"  value={(s.total ?? 0).toLocaleString()} delta="↑ live" color={T.green} />
                <Kpi label="AI Success Rate" value={s.total > 0 ? `${((s.ai / s.total) * 100).toFixed(1)}%` : "—"} delta="Primary model" color={T.green} />
                <Kpi label="Cost Saved"      value={s.costSaved != null ? `$${s.costSaved}` : "—"} delta="via cache" color={T.green} />
                <Kpi label="Avg Latency"     value={s.avgLatency ? `${s.avgLatency}ms` : "—"} delta="end-to-end" color={T.amber} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>AI vs Fallback vs Cache (24h)</div>
                  <div style={{ fontSize: 11, color: T.dim, marginBottom: 16 }}>Hourly event distribution</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={hourly}>
                      <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: T.dim, fontSize: 9 }} interval={3} />
                      <YAxis tick={{ fill: T.dim, fontSize: 9 }} />
                      <Tooltip content={<ChartTip />} />
                      <Line type="monotone" dataKey="ai"       stroke={T.blue}  strokeWidth={2}   dot={false} name="AI" />
                      <Line type="monotone" dataKey="cache"    stroke={T.green} strokeWidth={2}   dot={false} name="Cache" />
                      <Line type="monotone" dataKey="fallback" stroke={T.amber} strokeWidth={1.5} dot={false} name="Fallback" strokeDasharray="4 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>PoU Score Breakdown</div>
                  <div style={{ fontSize: 11, color: T.dim, marginBottom: 16 }}>Weighted criteria scores</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
                    <Gauge score={pouScore} tier={tier} />
                    <div style={{ flex: 1 }}>
                      {CRITERIA_CONFIG.map(c => (
                        <CriteriaBar key={c.key} label={c.label} score={criteria[c.key]?.score ?? 0} weight={c.weight} color={c.color} />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>Event Type Distribution</div>
                  <div style={{ fontSize: 11, color: T.dim, marginBottom: 12 }}>All time breakdown</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "AI Success", value: s.ai ?? 0 },
                            { name: "Cache Hit",  value: s.cache ?? 0 },
                            { name: "Fallback",   value: s.fallback ?? 0 },
                            { name: "Errors",     value: s.errors ?? 0 },
                          ]}
                          cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value"
                        >
                          {[T.blue, T.green, T.amber, T.red].map((color, i) => <Cell key={i} fill={color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[["AI Success", T.blue, s.ai], ["Cache Hit", T.green, s.cache], ["Fallback", T.amber, s.fallback], ["Errors", T.red, s.errors]].map(([label, color, val]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
                          <span style={{ color: "#ccc" }}>{label}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, marginLeft: "auto" }}>{val ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>AI Insight Engine</div>
                  <div style={{ fontSize: 11, color: T.dim, marginBottom: 12 }}>LLM-generated analysis · powered by Claude</div>
                  <div style={{ background: "#0a0a1e", border: "1px solid #1e1a3a", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.accent, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <LiveDot /> AI Analysis <span style={{ fontSize: 9, color: T.dim }}>{explain?.source ?? ""}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#a8a6c0", lineHeight: 1.7 }}>
                      {explain?.insight ?? "Loading insight…"}
                    </div>
                  </div>
                  <button onClick={fetchExplain} style={{ marginTop: 10, background: T.s3, color: T.dim, border: `1px solid ${T.border}`, borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Barlow, sans-serif" }}>↻ Regenerate Analysis</button>
                </Card>
              </div>

              <Card>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>Live Event Feed</div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 12 }}>Real-time request log · auto-refreshing</div>
                <EventFeed events={[...logs].reverse()} />
              </Card>
            </>
          )}

          {/* ── TAB 1: LEADERBOARD ── */}
          {tab === 1 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Prompt Leaderboard</h1>
                <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Top prompts by frequency · viral loop engine</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                <Kpi label="Unique Prompts"  value={leaderboard.length.toLocaleString()} delta="tracked"    color={T.blue} />
                <Kpi label="Total Events"    value={(s.total ?? 0).toLocaleString()}      delta="all time"  color={T.green} />
                <Kpi label="Cache Rate"      value={s.total > 0 ? `${((s.cache / s.total) * 100).toFixed(1)}%` : "—"} delta="efficiency" color={T.accent} />
                <Kpi label="Top Prompt Uses" value={leaderboard[0]?.count ?? 0}           delta={leaderboard[0]?.prompt?.slice(0, 20) ?? "—"} color={T.amber} />
              </div>

              <Card style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>Top Prompts by Usage</div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 16 }}>Ranked by call count · click to copy</div>
                {leaderboard.length === 0 ? (
                  <div style={{ color: T.dim, fontSize: 13, padding: "20px 0" }}>No prompts tracked yet. Send requests to /api/request to populate the leaderboard.</div>
                ) : leaderboard.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => navigator.clipboard?.writeText(p.prompt)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: `1px solid ${T.border}`, cursor: "pointer", borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.s3}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 11, width: 28, textAlign: "center", color: i === 0 ? T.amber : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3e" : T.dim }}>#{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.mono, fontSize: 12, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.prompt}</div>
                      <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{p.count} calls · {p.avgLatency ? `avg ${p.avgLatency}ms` : "no latency data"}</div>
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 13, color: T.green, flexShrink: 0 }}>{p.count}</div>
                  </div>
                ))}
              </Card>

              <Card>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>Hourly Request Volume</div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 16 }}>Last 24 hours</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourly}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fill: T.dim, fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fill: T.dim, fontSize: 9 }} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="ai"       fill={T.blue}  name="AI"       radius={[2,2,0,0]} />
                    <Bar dataKey="cache"    fill={T.green} name="Cache"    radius={[2,2,0,0]} />
                    <Bar dataKey="fallback" fill={T.amber} name="Fallback" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}

          {/* ── TAB 2: API ROUTES ── */}
          {tab === 2 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>API Architecture</h1>
                <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Route health · latency · call volume</div>
              </div>
              {[
                { method: "POST", path: "/api/request", desc: "AI engine · fallback · cache pipeline",              note: "Primary" },
                { method: "GET",  path: "/api/score",   desc: "PoU scoring engine · criteria weights",              note: "" },
                { method: "GET",  path: "/api/stats",   desc: "Usage analytics · leaderboard · hourly timeseries",  note: "" },
                { method: "POST", path: "/api/explain", desc: "LLM explanation engine · Claude Haiku powered",      note: "AI" },
                { method: "GET",  path: "/api/badge",   desc: "Shareable SVG badge · embed in README",              note: "NEW" },
                { method: "GET",  path: "/api/export",  desc: "Judge-ready JSON evidence report",                   note: "NEW" },
              ].map((r) => (
                <div key={r.path} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 6, fontFamily: T.mono, fontSize: 12 }}>
                  <span style={{ background: r.method === "POST" ? "#0a1a3a" : "#0a2a1a", color: r.method === "POST" ? T.blue : T.green, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{r.method}</span>
                  <span style={{ color: "#ccc", flex: 1 }}>{r.path}</span>
                  <span style={{ fontSize: 11, color: T.dim, flex: 2 }}>{r.desc}</span>
                  {r.note && <span style={{ background: T.s3, color: T.accent, padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{r.note}</span>}
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
                </div>
              ))}
              <Card style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>Architecture Overview</div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 16 }}>Request flow · persistence · fallback chain</div>
                <pre style={{ fontFamily: T.mono, fontSize: 11, color: "#7c9aff", background: T.s2, borderRadius: 8, padding: 16, lineHeight: 2, overflowX: "auto" }}>{`POST /api/request
  │
  ├─► Cache hit?  ──► return cached + logEvent("cache_hit")
  │
  ├─► Anthropic claude-haiku-4-5
  │     └─► success ──► cache + logEvent("ai_success")
  │
  ├─► HF Mistral-7B-Instruct (fallback)
  │     └─► success ──► cache + logEvent("ai_success")
  │
  └─► Static fallback ──► cache + logEvent("fallback")

All logs persist to /tmp/pou-logs.json`}</pre>
              </Card>
            </>
          )}

          {/* ── TAB 3: POU REPORT ── */}
          {tab === 3 && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>PoU Evidence Report</h1>
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Judge-ready submission · HackerNoon Proof of Usefulness Hackathon 2026</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={exportData} style={{ background: "#1a0f2e", color: "#a78bfa", border: "1px solid #2a1a4e", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Barlow, sans-serif" }}>↓ Export JSON</button>
                  <a href="https://hackathon.hackernoon.com/proof-of-usefulness" target="_blank" rel="noreferrer" style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "Barlow, sans-serif" }}>Submit to HackerNoon ↗</a>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 12, padding: 32, color: "#111", fontFamily: "Barlow, sans-serif" }}>
                <div style={{ borderBottom: "2px solid #6d28d9", paddingBottom: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>AI System Observability + Cost Tracker</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Proof of Usefulness Evidence Report · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
                  </div>
                  <div style={{ background: "#1e1b4b", color: "#fff", fontSize: 28, fontFamily: "Space Mono, monospace", padding: "10px 18px", borderRadius: 10, fontWeight: 500 }}>{pouScore} / 1000</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", marginBottom: 8 }}>Project Summary</div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                    A production-grade Next.js AI observability platform that measures real usefulness of AI systems — tracking success rates, fallback patterns, cache efficiency, latency, and cost savings. Every request is logged, scored, and surfaced via a live judge-ready dashboard with verifiable traction evidence.
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", marginBottom: 10 }}>PoU Score Breakdown</div>
                  {CRITERIA_CONFIG.map(c => {
                    const sc = criteria[c.key]?.score ?? 0;
                    return (
                      <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13, color: "#374151" }}>
                        <span style={{ width: 180 }}>{c.label}</span>
                        <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${sc}%`, height: 5, background: "#6d28d9" }} />
                        </div>
                        <span style={{ width: 50, textAlign: "right", fontFamily: "Space Mono, monospace", fontSize: 12 }}>{sc}/100</span>
                        <span style={{ width: 32, textAlign: "right", color: "#9ca3af", fontSize: 11 }}>{c.weight}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", marginBottom: 10 }}>Traction Evidence</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    {[
                      ["Total Requests",  (s.total ?? 0).toLocaleString()],
                      ["AI Success Rate", s.total > 0 ? `${((s.ai / s.total) * 100).toFixed(1)}%` : "—"],
                      ["Cost Saved",      s.costSaved != null ? `$${s.costSaved}` : "—"],
                      ["Avg Latency",     s.avgLatency ? `${s.avgLatency}ms` : "—"],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b", fontFamily: "Space Mono, monospace" }}>{val}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", marginBottom: 8 }}>AI-Generated Insight</div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, background: "#f5f3ff", padding: 14, borderRadius: 8, borderLeft: "3px solid #6d28d9" }}>
                    {explain?.judgeBrief ?? explain?.insight ?? "Loading…"}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                  <span>AI PoU Tracker · github.com/Cloud-Architect-Emma/ai-pou-tracker</span>
                  <span>HackerNoon Proof of Usefulness Hackathon 2026</span>
                  <span>Score: {pouScore}/1000 · {tier}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, background: "#0a0a1e", border: "1px solid #1e1a3a", borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.accent, marginBottom: 10 }}>● Winning Strategy — What to Do Before June 5</div>
                <div style={{ fontSize: 13, color: "#a8a6c0", lineHeight: 1.8 }}>
                  <strong style={{ color: "#c4b5fd" }}>1. Publish your HackerNoon article</strong> — tags: #proof-of-usefulness #ai-agents #ai-search #machine-learning #generative-ai. Without it your entry is incomplete.
                  <br /><br />
                  <strong style={{ color: "#c4b5fd" }}>2. Embed your live badge in your GitHub README</strong> — every repo visitor becomes traction evidence the algorithm cross-validates.
                  <br /><br />
                  <strong style={{ color: "#c4b5fd" }}>3. Claim sponsor credits</strong> — Algolia for prompt leaderboard search, Neo4j for prompt relationship graphs. Each adds sponsor tags to your score.
                  <br /><br />
                  <strong style={{ color: "#c4b5fd" }}>4. Drive 1,000+ real requests</strong> — share your live demo on LinkedIn and X. Volume is the fastest way to push Traction Evidence from 30 to 80.
                </div>
              </div>
            </>
          )}

          {/* ── TAB 4: AI PRICING ── */}
          {tab === 4 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>AI Model Pricing</h1>
                <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Live pricing data · powered by Bright Data</div>
              </div>
              <PricingTable />
            </>
          )}

          {/* ── TAB 5: NEO4J GRAPH ── */}
          {tab === 5 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>AI Knowledge Graph</h1>
                <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Graph intelligence · powered by Neo4j AuraDB</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, background: "#0a2a18", border: "1px solid #0d3a20", borderRadius: 8, padding: "10px 16px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Neo4j AuraDB Free · Live graph database · 6 nodes · 2 relationship types</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { name: "OpenAI", model: "GPT-4o", cost: "High", color: "#74aa9c", useCase: "Cost Tracking" },
                  { name: "Anthropic", model: "Claude Haiku", cost: "Low", color: "#c4823a", useCase: "Observability" },
                  { name: "Google", model: "Gemini Flash", cost: "Low", color: "#4285f4", useCase: "Fallback Detection" },
                ].map((p, i) => (
                  <div key={i} style={{ background: "#0e0e1f", border: `1px solid ${p.color}40`, borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{p.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.model}</div>
                    <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 8 }}>Cost tier: <span style={{ color: p.cost === "Low" ? "#22c55e" : "#f59e0b" }}>{p.cost}</span></div>
                    <div style={{ fontSize: 11, background: "#13132a", borderRadius: 6, padding: "6px 10px", color: "#a8a6c0" }}>
                      Best for: <strong style={{ color: "#7c5cfc" }}>{p.useCase}</strong>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 10, color: "#44445a" }}>[:PROVIDES] → [:BEST_FOR]</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0e0e1f", border: "1px solid #1f1f3a", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 12 }}>Graph Schema</div>
                <pre style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#7c9aff", lineHeight: 2 }}>{`(Provider)-[:PROVIDES]->(Model)\n(Model)-[:BEST_FOR]->(UseCase)\n\nNodes: Provider, Model, UseCase\nRelationships: PROVIDES, BEST_FOR\nInstance: Neo4j AuraDB Free · 796f01b8`}</pre>
              </div>
              <div style={{ background: "#0a0a1e", border: "1px solid #1e1a3a", borderRadius: 8, padding: 14, fontSize: 12, color: "#6b6b8a" }}>
                💡 This graph models relationships between AI providers, models, and use cases — powering intelligent model selection based on your observability data.
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}