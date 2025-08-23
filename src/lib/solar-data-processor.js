// lib/solar-data-processor.js
export class SolarDataProcessor {
  constructor() {
    // NASA API endpoints
    this.APIs = {
      // DSCOVR Real-time Solar Wind data
      DSCOVR_MAG: 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json',
      DSCOVR_PLASMA: 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json',
      
      // Solar activity and flares
      SOLAR_FLARES: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
      
      // Coronal Mass Ejections
      CME_ANALYSIS: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CMEAnalysis',
      
      // Geomagnetic data
      GEOMAG: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
      
      // NASA Open Data Portal for additional datasets
      NASA_API_KEY: process.env.NASA_API_KEY || 'NnqSQdztO0rYXNvu7x0PMKc2fcCrGYf6537RIjK8',
      
      // Alternative: NASA CCMC DONKI (Space Weather Database)
      DONKI_BASE: 'https://api.nasa.gov/DONKI',
    };

    // Rate limiting
    this.lastRequest = {};
    this.minInterval = 1000; // 1 second between requests
  }

  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Rate limiting
        const now = Date.now();
        const lastReq = this.lastRequest[url] || 0;
        const timeSinceLastReq = now - lastReq;
        
        if (timeSinceLastReq < this.minInterval) {
          await this.sleep(this.minInterval - timeSinceLastReq);
        }

        this.lastRequest[url] = Date.now();

        const response = await fetch(url, {
          ...options,
          headers: {
            'User-Agent': 'Solar-Dashboard/1.0',
            'Accept': 'application/json',
            ...options.headers
          },
          timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchSolarWindData(timeRange) {
    try {
      const [magData, plasmaData] = await Promise.all([
        this.fetchWithRetry(this.APIs.DSCOVR_MAG),
        this.fetchWithRetry(this.APIs.DSCOVR_PLASMA)
      ]);

      return this.processSolarWindData(magData, plasmaData, timeRange);
    } catch (error) {
      console.error('Error fetching solar wind data:', error);
      // Return fallback data with error flag
      return this.getFallbackSolarWindData(timeRange);
    }
  }

  async fetchSolarFlareData() {
    try {
      const flareData = await this.fetchWithRetry(this.APIs.SOLAR_FLARES);
      return this.processSolarFlareData(flareData);
    } catch (error) {
      console.error('Error fetching solar flare data:', error);
      return [];
    }
  }

  async fetchCMEData() {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const endDate = new Date();
      
      const url = `${this.APIs.DONKI_BASE}/CMEAnalysis?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&api_key=${this.APIs.NASA_API_KEY}`;
      
      const cmeData = await this.fetchWithRetry(url);
      return this.processCMEData(cmeData);
    } catch (error) {
      console.error('Error fetching CME data:', error);
      return this.getFallbackCMEData();
    }
  }

  async fetchGeomagnetic() {
    try {
      const geomagData = await this.fetchWithRetry(this.APIs.GEOMAG);
      return this.processGeomagneticData(geomagData);
    } catch (error) {
      console.error('Error fetching geomagnetic data:', error);
      return null;
    }
  }

  processSolarWindData(magData, plasmaData, timeRange) {
    const hours = this.getHoursFromRange(timeRange);
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Combine and process magnetic and plasma data
    const combinedData = this.combineSolarWindData(magData, plasmaData, cutoffTime);
    
    // Calculate current conditions
    const current = this.calculateCurrentConditions(combinedData);
    
    // Generate time series
    const timeSeries = this.generateTimeSeries(combinedData, hours);
    
    // Generate particle flux data
    const particleFlux = this.generateParticleFlux(combinedData);

    return {
      current,
      timeSeries,
      particleFlux,
      recentData: combinedData.slice(-10).reverse(),
      dataQuality: this.assessDataQuality(combinedData)
    };
  }

  combineSolarWindData(magData, plasmaData, cutoffTime) {
    const combined = [];
    
    // Process magnetic field data
    const magMap = new Map();
    if (Array.isArray(magData)) {
      magData.forEach(entry => {
        if (entry.time_tag && entry.bt) {
          const timestamp = new Date(entry.time_tag + 'Z');
          if (timestamp >= cutoffTime) {
            magMap.set(timestamp.getTime(), {
              timestamp,
              magneticField: parseFloat(entry.bt) || 0,
              bx: parseFloat(entry.bx_gsm) || 0,
              by: parseFloat(entry.by_gsm) || 0,
              bz: parseFloat(entry.bz_gsm) || 0
            });
          }
        }
      });
    }

    // Process plasma data and merge with magnetic data
    if (Array.isArray(plasmaData)) {
      plasmaData.forEach(entry => {
        if (entry.time_tag && entry.speed) {
          const timestamp = new Date(entry.time_tag + 'Z');
          const timeKey = timestamp.getTime();
          
          if (timestamp >= cutoffTime) {
            const existing = magMap.get(timeKey) || { timestamp, magneticField: 0 };
            
            combined.push({
              ...existing,
              solarWindSpeed: parseFloat(entry.speed) || 0,
              protonDensity: parseFloat(entry.density) || 0,
              temperature: parseFloat(entry.temperature) || 0,
              time: timestamp.toLocaleTimeString(),
              anomaly: this.detectAnomaly(entry)
            });
          }
        }
      });
    }

    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }

  calculateCurrentConditions(data) {
    if (!data || data.length === 0) {
      return this.getFallbackCurrentData();
    }

    const latest = data[data.length - 1];
    
    return {
      solarWindSpeed: Math.round(latest.solarWindSpeed || 0),
      protonDensity: Math.round((latest.protonDensity || 0) * 10) / 10,
      temperature: Math.round(latest.temperature || 0),
      magneticField: Math.round((latest.magneticField || 0) * 10) / 10,
      lastUpdate: latest.timestamp.toISOString()
    };
  }

  generateTimeSeries(data, hours) {
    // Ensure we have data points across the time range
    const interval = Math.max(1, Math.floor(hours / 50)); // Max 50 points
    const filteredData = data.filter((_, index) => index % interval === 0);
    
    return filteredData.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.getTime()
    }));
  }

  generateParticleFlux(solarWindData) {
    // Generate synthetic particle flux data based on solar wind conditions
    const fluxData = [];
    const latest = solarWindData[solarWindData.length - 1] || {};
    
    const baseIntensity = (latest.solarWindSpeed || 400) / 400;
    const tempFactor = Math.min(2, (latest.temperature || 100000) / 100000);
    
    for (let i = 1; i <= 20; i++) {
      const energy = i * 50;
      const energyFactor = Math.exp(-energy / 500);
      
      fluxData.push({
        energy,
        protons: Math.round(baseIntensity * tempFactor * energyFactor * (Math.random() * 800 + 200)),
        electrons: Math.round(baseIntensity * energyFactor * (Math.random() * 600 + 100)),
        alphas: Math.round(baseIntensity * energyFactor * (Math.random() * 150 + 50))
      });
    }
    
    return fluxData;
  }

  processCMEData(cmeData) {
    if (!Array.isArray(cmeData)) {
      return this.getFallbackCMEData();
    }

    return cmeData
      .filter(cme => cme.startTime && cme.speed21_5)
      .map(cme => ({
        id: cme.associatedCMEID || `CME-${Date.parse(cme.startTime)}`,
        startTime: cme.startTime,
        speed: parseFloat(cme.speed21_5) || 0,
        direction: this.determineCMEDirection(cme),
        intensity: this.classifyCMEIntensity(cme.speed21_5),
        estimatedArrival: this.calculateCMEArrival(cme),
        status: this.getCMEStatus(cme),
        source: 'NASA DONKI'
      }))
      .slice(0, 10); // Limit to 10 most recent
  }

  determineCMEDirection(cme) {
    // Simplified direction determination
    if (cme.latitude !== undefined && cme.longitude !== undefined) {
      const lat = parseFloat(cme.latitude) || 0;
      const lon = parseFloat(cme.longitude) || 0;
      
      if (Math.abs(lat) < 30 && Math.abs(lon) < 30) {
        return 'Earth-directed';
      }
    }
    return 'Off-limb';
  }

  classifyCMEIntensity(speed) {
    const speedNum = parseFloat(speed) || 0;
    if (speedNum > 1000) return 'Strong';
    if (speedNum > 500) return 'Moderate';
    return 'Weak';
  }

  calculateCMEArrival(cme) {
    if (this.determineCMEDirection(cme) === 'Earth-directed' && cme.speed21_5) {
      const speed = parseFloat(cme.speed21_5);
      const distanceToEarth = 150e6; // km
      const travelTime = (distanceToEarth / speed) * 1000; // milliseconds
      
      return new Date(Date.parse(cme.startTime) + travelTime).toISOString();
    }
    return null;
  }

  getCMEStatus(cme) {
    const startTime = new Date(cme.startTime);
    const now = new Date();
    const hoursSince = (now - startTime) / (1000 * 60 * 60);
    
    if (this.determineCMEDirection(cme) === 'Earth-directed' && hoursSince < 72) {
      return 'Tracking';
    }
    return 'Dissipating';
  }

  detectAnomaly(entry) {
    // Simple anomaly detection based on thresholds
    const speed = parseFloat(entry.speed) || 0;
    const density = parseFloat(entry.density) || 0;
    const temp = parseFloat(entry.temperature) || 0;
    
    return speed > 600 || density > 25 || temp > 500000;
  }

  assessDataQuality(data) {
    if (!data || data.length === 0) return 'No Data';
    
    const validDataPoints = data.filter(entry => 
      entry.solarWindSpeed > 0 && 
      entry.protonDensity > 0 && 
      entry.temperature > 0
    ).length;
    
    const qualityRatio = validDataPoints / data.length;
    
    if (qualityRatio > 0.9) return 'Excellent';
    if (qualityRatio > 0.7) return 'Good';
    if (qualityRatio > 0.5) return 'Fair';
    return 'Poor';
  }

  getHoursFromRange(range) {
    switch (range) {
      case '1h': return 1;
      case '6h': return 6;
      case '24h': return 24;
      case '7d': return 168;
      default: return 24;
    }
  }

  async fetchSolarData(dataset, range) {
    try {
      const [solarWindData, cmeData] = await Promise.all([
        this.fetchSolarWindData(range),
        this.fetchCMEData()
      ]);

      // Combine all data sources
      const combinedData = {
        ...solarWindData,
        cmeData,
        activeCMEs: cmeData.filter(cme => cme.status === 'Tracking'),
        dataset,
        range,
        fetchTime: new Date().toISOString()
      };

      return combinedData;
    } catch (error) {
      console.error('Error in fetchSolarData:', error);
      throw error;
    }
  }

  // Fallback data methods
  getFallbackSolarWindData(timeRange) {
    const hours = this.getHoursFromRange(timeRange);
    const data = this.generateMockSolarData(hours);
    
    return {
      current: this.calculateCurrentConditions(data),
      timeSeries: data,
      particleFlux: this.generateParticleFlux(data),
      recentData: data.slice(-10).reverse(),
      dataQuality: 'Simulated'
    };
  }

  getFallbackCurrentData() {
    return {
      solarWindSpeed: 420,
      protonDensity: 8.5,
      temperature: 105000,
      magneticField: 4.2,
      lastUpdate: new Date().toISOString()
    };
  }

  getFallbackCMEData() {
    return [
      {
        id: 'CME-FALLBACK-001',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        speed: 850,
        direction: 'Earth-directed',
        intensity: 'Moderate',
        estimatedArrival: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'Tracking',
        source: 'Fallback Data'
      }
    ];
  }

  generateMockSolarData(hours) {
    const data = [];
    const now = Date.now();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now - (i * 60 * 60 * 1000));
      data.push({
        timestamp,
        time: timestamp.toLocaleTimeString(),
        solarWindSpeed: 380 + Math.random() * 200 + Math.sin(i * 0.1) * 50,
        protonDensity: 5 + Math.random() * 15 + Math.sin(i * 0.2) * 3,
        temperature: 80000 + Math.random() * 120000 + Math.cos(i * 0.15) * 30000,
        magneticField: 3 + Math.random() * 8 + Math.sin(i * 0.3) * 2,
        anomaly: Math.random() > 0.95
      });
    }
    
    return data;
  }
}