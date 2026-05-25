export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1vijqt9jfj7olije&include_errors=true",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          { url: "https://openai.com/api/pricing" },
          { url: "https://www.anthropic.com/pricing" },
        ]),
      }
    );

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}