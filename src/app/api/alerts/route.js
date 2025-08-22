import { getNasaAlerts } from "@/lib/alert-system";

export default async function handler(req, res) {
  try {
    const apiKey = "NnqSQdztO0rYXNvu7x0PMKc2fcCrGYf6537RIjK8";
    const alerts = await getNasaAlerts(apiKey, 7); // last 7 days
    res.status(200).json({ alerts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}