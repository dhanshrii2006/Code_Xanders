// pages/api/solar-data.js or app/api/solar-data/route.js (depending on Next.js version)
import { SolarDataProcessor } from '../../lib/solar-data-processor';

const solarProcessor = new SolarDataProcessor();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataset = 'aspex', range = '24h' } = req.query;

    // Validate parameters
    const validDatasets = ['aspex', 'suit', 'combined'];
    const validRanges = ['1h', '6h', '24h', '7d'];

    if (!validDatasets.includes(dataset)) {
      return res.status(400).json({ error: 'Invalid dataset parameter' });
    }

    if (!validRanges.includes(range)) {
      return res.status(400).json({ error: 'Invalid range parameter' });
    }

    // Fetch and process solar data
    const solarData = await solarProcessor.fetchSolarData(dataset, range);

    // Return processed data
    res.status(200).json({
      success: true,
      data: solarData,
      timestamp: new Date().toISOString(),
      source: 'NASA APIs'
    });

  } catch (error) {
    console.error('Error in solar-data API:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch solar data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// For App Router (Next.js 13+), export as named functions:
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataset = searchParams.get('dataset') || 'aspex';
    const range = searchParams.get('range') || '24h';

    // Validate parameters
    const validDatasets = ['aspex', 'suit', 'combined'];
    const validRanges = ['1h', '6h', '24h', '7d'];

    if (!validDatasets.includes(dataset)) {
      return Response.json({ error: 'Invalid dataset parameter' }, { status: 400 });
    }

    if (!validRanges.includes(range)) {
      return Response.json({ error: 'Invalid range parameter' }, { status: 400 });
    }

    // Fetch and process solar data
    const solarData = await solarProcessor.fetchSolarData(dataset, range);

    // Return processed data
    return Response.json({
      success: true,
      data: solarData,
      timestamp: new Date().toISOString(),
      source: 'NASA APIs'
    });

  } catch (error) {
    console.error('Error in solar-data API:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to fetch solar data',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}