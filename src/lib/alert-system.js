// lib/alert-system.js

/**
 * @typedef {Object} NasaAlert
 * @property {string} id - Unique message ID
 * @property {string} type - Type of alert (e.g., CME, FLR, SEP, etc.)
 * @property {string} time - Time the alert was issued
 * @property {string} body - Main alert details
 * @property {string|null} link - External reference link if available
 */

// 🔑 Add your API key here
const NASA_API_KEY = "NnqSQdztO0rYXNvu7x0PMKc2fcCrGYf6537RIjK8";

/**
 * Normalize a raw NASA DONKI notification into a clean object
 * @param {any} alert - Raw alert from NASA API
 * @returns {NasaAlert}
 */
function normalizeAlert(alert) {
  return {
    id: alert.messageID ?? crypto.randomUUID(),
    type: alert.messageType || "Unknown",
    time: alert.messageIssueTime || new Date().toISOString(),
    body: alert.messageBody || "No details available",
    link: alert.messageURL || null,
  };
}

/**
 * Fetch NASA space weather alerts (DONKI notifications API)
 * @param {Object} options
 * @param {number} [options.days=7] - Number of past days to check
 * @param {string[]} [options.filterTypes=[]] - Only return specific alert types (e.g., ["CME", "FLR"])
 * @returns {Promise<NasaAlert[]>}
 */
export async function getNasaAlerts(options = {}) {
  const { days = 7, filterTypes = [] } = options;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const url = `https://api.nasa.gov/DONKI/notifications?startDate=${
      startDate.toISOString().split("T")[0]
    }&endDate=${endDate.toISOString().split("T")[0]}&type=all&api_key=${NASA_API_KEY}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`NASA Alerts API failed: ${res.status} ${res.statusText}`);
    }

    const raw = await res.json();

    let alerts = (raw || []).map(normalizeAlert);

    // Filter by type if specified
    if (filterTypes.length > 0) {
      alerts = alerts.filter((a) => filterTypes.includes(a.type));
    }

    // Sort by newest first
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));

    return alerts;
  } catch (err) {
    console.error("Error fetching NASA Alerts:", err.message);
    return [];
  }
}