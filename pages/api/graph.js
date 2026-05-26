export default async function handler(req, res) {
  try {
    const response = await fetch(process.env.NEO4J_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEO4J_API_KEY}`,
      },
      body: JSON.stringify({
        statement: `
          MERGE (openai:Provider {name: "OpenAI"})
          MERGE (anthropic:Provider {name: "Anthropic"})
          MERGE (google:Provider {name: "Google"})
          MERGE (gpt4:Model {name: "GPT-4o", cost: "High"})
          MERGE (haiku:Model {name: "Claude Haiku", cost: "Low"})
          MERGE (flash:Model {name: "Gemini Flash", cost: "Low"})
          MERGE (openai)-[:PROVIDES]->(gpt4)
          MERGE (anthropic)-[:PROVIDES]->(haiku)
          MERGE (google)-[:PROVIDES]->(flash)
          RETURN openai.name, anthropic.name, google.name
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
      data: data
    });

  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
}