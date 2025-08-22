const NASA_API_KEY = "NnqSQdztO0rYXNvu7x0PMKc2fcCrGYf6537RIjK8"; // put your key here

export async function getCmeData() {
  try {
    const today = new Date().toISOString().slice(0,10);
    const weekAgo = new Date(Date.now() - 7*24*3600*1000).toISOString().slice(0,10);

    const apiUrl = `https://api.nasa.gov/DONKI/CME?startDate=${weekAgo}&endDate=${today}&api_key=${NASA_API_KEY}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('NASA CME API error');
    const data = await res.json();

    const history = data.map(item => ({
      id: item.activityID,
      timestamp: item.startTime,
      speed: item.cmeAnalyses?.[0]?.speed || "N/A",
      lat: item.cmeAnalyses?.[0]?.latitude || "N/A",
      lon: item.cmeAnalyses?.[0]?.longitude || "N/A",
      note: item.note || "—"
    }));

    return {
      latest: history[0] || null,
      history
    };
  } catch (err) {
    console.error("CME fetch failed:", err);
    return {
      latest: null,
      history: []
    };
  }
}