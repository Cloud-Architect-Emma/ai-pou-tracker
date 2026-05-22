import { useEffect, useState } from "react";

export default function Report() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/report")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading report...</p>;

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>{data.title}</h1>
      <p>Generated: {data.generatedAt}</p>

      <h3>Summary</h3>
      <pre>{JSON.stringify(data.summary, null, 2)}</pre>

      <h3>Insights</h3>
      <ul>
        {data.insights.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}