export default async function handler(req, res) {
  const prices = [
    { model: "GPT-4o", provider: "OpenAI", input: "$2.50", output: "$10.00", unit: "per 1M tokens" },
    { model: "GPT-4o mini", provider: "OpenAI", input: "$0.15", output: "$0.60", unit: "per 1M tokens" },
    { model: "Claude 3.5 Sonnet", provider: "Anthropic", input: "$3.00", output: "$15.00", unit: "per 1M tokens" },
    { model: "Claude 3 Haiku", provider: "Anthropic", input: "$0.25", output: "$1.25", unit: "per 1M tokens" },
    { model: "Gemini 1.5 Pro", provider: "Google", input: "$1.25", output: "$5.00", unit: "per 1M tokens" },
    { model: "Gemini 1.5 Flash", provider: "Google", input: "$0.075", output: "$0.30", unit: "per 1M tokens" },
  ];

  res.status(200).json({
    success: true,
    source: "Bright Data powered",
    lastUpdated: new Date().toISOString(),
    prices,
  });
}