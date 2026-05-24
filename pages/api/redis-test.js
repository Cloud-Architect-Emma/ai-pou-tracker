export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(200).json({ error: "No Redis env vars found", url: !!url, token: !!token });
  }

  try {
    // Write test
    const setRes = await fetch(`${url}/set/redis-test`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["redis-test", "working-" + Date.now()]),
    });
    const setData = await setRes.json();

    // Read test
    const getRes = await fetch(`${url}/get/redis-test`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();

    return res.status(200).json({
      envVarsPresent: true,
      writeResult: setData,
      readResult: getData,
      redisWorking: getData.result !== null,
    });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
}