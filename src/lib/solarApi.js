import fetch from 'node-fetch';

const SOLAR_API_KEY = process.env.SOLAR_API_KEY; // store your API key in .env.local

export async function fetchSolarData({ dataset = 'aspex', range = '24h' }) {
  try {
    // Example external API URL - replace with real one
    const url = `https://aditya-l1-api.example.com/data?dataset=${dataset}&range=${range}&api_key=${SOLAR_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch solar data');
    }

    const data = await response.json();

    // Transform data to match frontend expected format
    return {
      success: true,
      data: {
        solarWindData: data.solarWindData || [],
        cmeEvents: data.cmeEvents || [],
        earthImpactForecast: data.earthImpactForecast || null
      }
    };
  } catch (error) {
    console.error('fetchSolarData error:', error);
    return { success: false, error: error.message };
  }
}