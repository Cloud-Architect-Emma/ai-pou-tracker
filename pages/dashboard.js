import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);

  const fetchData = () => {
    fetch("/api/score")
      .then((res) => res.json())
      .then(setData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Loading...</p>;

  const { breakdown, usefulnessScore } = data;

  // Chart data (derived from backend stats)
  const pieData = [
    { name: "AI Success", value: breakdown.aiSuccess },
    { name: "Fallback", value: breakdown.fallbackUses },
    { name: "Cache Hits", value: breakdown.cacheHits },
  ];

  const trendData = [
    { name: "Requests", value: breakdown.totalRequests },
    { name: "AI", value: breakdown.aiSuccess },
    { name: "Fallback", value: breakdown.fallbackUses },
  ];

  const COLORS = ["#4f46e5", "#f97316", "#10b981"];

  return (
    <div style={styles.page}>
      <h1>Proof of Usefulness Dashboard</h1>

      {/* SCORE */}
      <div style={styles.card}>
        <h2>PoU Score</h2>
        <div style={styles.big}>{usefulnessScore}</div>
      </div>

      {/* PIE CHART */}
      <div style={styles.chartBox}>
        <h3>AI vs Fallback Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LINE / TREND CHART */}
      <div style={styles.chartBox}>
        <h3>Usage Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BREAKDOWN */}
      <div style={styles.grid}>
        <div>Requests: {breakdown.totalRequests}</div>
        <div>AI: {breakdown.aiSuccess}</div>
        <div>Fallback: {breakdown.fallbackUses}</div>
        <div>Cache: {breakdown.cacheHits}</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    padding: 30,
  },
  card: {
    padding: 20,
    background: "#111827",
    color: "white",
    borderRadius: 10,
    marginBottom: 20,
  },
  big: {
    fontSize: 40,
  },
  chartBox: {
    marginTop: 20,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    marginTop: 20,
    gap: 10,
  },
};