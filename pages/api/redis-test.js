export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(200).json({ error: "No env vars" });

  try {
    const testValue = JSON.stringify([{ type: "test", ts: Date.now() }]);
    const encoded = encodeURIComponent(testValue);

    const setRes = await fetch(`${url}/set/pou-test/${encoded}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const setData = await setRes.json();

    const getRes = await fetch(`${url}/get/pou-test`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();

    let parsed = null;
    try { parsed = JSON.parse(getData.result); } catch {}

    return res.status(200).json({
      writeResult: setData,
      rawRead: getData.result,
      parsedCorrectly: Array.isArray(parsed),
      parsedValue: parsed,
    });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
}