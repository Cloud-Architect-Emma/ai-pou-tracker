export default async function handler(req, res) {
  try {
    const credentials = Buffer.from(
      `${process.env.NEO4J_USERNAME}:${process.env.NEO4J_PASSWORD}`
    ).toString("base64");

    const response = await fetch(process.env.NEO4J_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({
        statement: `
          MERGE (openai:Provider {name: "OpenAI"})
          MERGE (anthropic:Provider {name: "Anthropic"})
          MERGE (google:Provider {name: "Google"})
          MERGE (gpt4:Model {name: "GPT-4o", cost: "High"})
          MERGE (haiku:Model {name: "Claude Haiku", cost: "Low"})
          MERGE (flash:Model {name: "Gemini Flash", cost: "Low"})
          MERGE (uc1:UseCase {name: "Observability"})
          MERGE (uc2:UseCase {name: "Cost Tracking"})
          MERGE (uc3:UseCase {name: "Fallback Detection"})
          MERGE (openai)-[:PROVIDES]->(gpt4)
          MERGE (anthropic)-[:PROVIDES]->(haiku)
          MERGE (google)-[:PROVIDES]->(flash)
          MERGE (haiku)-[:BEST_FOR]->(uc1)
          MERGE (gpt4)-[:BEST_FOR]->(uc2)
          MERGE (flash)-[:BEST_FOR]->(uc3)
          RETURN openai.name as openai, anthropic.name as anthropic, google.name as google
        `
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(200).json({ 
        success: false, 
        status: response.status,
        message: text 
      });
    }

    const data = JSON.parse(text);
    res.status(200).json({ 
      success: true, 
      message: "Neo4j graph populated successfully",
      nodes: ["OpenAI", "Anthropic", "Google", "GPT-4o", "Claude Haiku", "Gemini Flash"],
      relationships: ["PROVIDES", "BEST_FOR"],
      data 
    });

  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
}