export default async function handler(req, res) {
  try {
    // Test the API key is valid first
    const response = await fetch(
      "https://api.brightdata.com/user",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
        },
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(200).json({ 
        success: false, 
        status: response.status,
        message: text 
      });
    }

    const data = JSON.parse(text);
    res.status(200).json({ success: true, user: data });

  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
}