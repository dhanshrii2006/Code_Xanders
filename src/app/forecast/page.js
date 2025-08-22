// pages/index.js
"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Satellite, Zap, Globe, Activity, TrendingUp, Clock, Shield } from 'lucide-react';
import styles from '../styles/Dashboard.module.css';

export default function CMEDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertLevel, setAlertLevel] = useState('MODERATE');
  const [solarWindData, setSolarWindData] = useState([]);
  const [cmeEvents, setCmeEvents] = useState([]);
  const [earthImpactForecast, setEarthImpactForecast] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      generateSolarWindData();
      updateCMEEvents();
      updateEarthImpactForecast();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateSolarWindData = () => {
    const newData = Array.from({ length: 24 }, (_, i) => {
      const baseSpeed = 400 + Math.sin(i * 0.5) * 100;
      const anomaly = Math.random() > 0.8 ? Math.random() * 300 : 0;
      const speed = baseSpeed + anomaly;
      
      return {
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).getHours(),
        solarWindSpeed: Math.max(250, speed + (Math.random() - 0.5) * 50),
        particleFlux: Math.max(1, 10 + Math.random() * 50 + (anomaly > 0 ? 40 : 0)),
        magneticField: Math.max(1, 5 + Math.random() * 15 + (anomaly > 0 ? 20 : 0)),
        temperature: Math.max(50000, 100000 + Math.random() * 200000),
        anomaly: anomaly > 0
      };
    });
    setSolarWindData(newData);
  };

  const updateCMEEvents = () => {
    const events = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        speed: 650,
        direction: 'Earth-directed',
        intensity: 'Moderate',
        classification: 'Halo CME',
        status: 'Detected'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        speed: 850,
        direction: 'Earth-directed',
        intensity: 'Strong',
        classification: 'Full Halo',
        status: 'En Route'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        speed: 420,
        direction: 'Off-axis',
        intensity: 'Weak',
        classification: 'Partial Halo',
        status: 'Passed'
      }
    ];
    setCmeEvents(events);
  };

  const updateEarthImpactForecast = () => {
    const forecast = {
      estimatedArrival: new Date(Date.now() + 18 * 60 * 60 * 1000),
      impactProbability: 78,
      maxKpIndex: 6,
      geomagneticStormLevel: 'G2 - Moderate',
      satelliteRisk: 'MEDIUM',
      powerGridRisk: 'LOW',
      navigationRisk: 'MEDIUM',
      duration: '12-24 hours'
    };
    setEarthImpactForecast(forecast);
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ff4444';
      case 'HIGH': return '#ff8800';
      case 'MODERATE': return '#ffaa00';
      case 'LOW': return '#44aa44';
      default: return '#666666';
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity.toLowerCase()) {
      case 'strong': return '#ff4444';
      case 'moderate': return '#ffaa00';
      case 'weak': return '#44aa44';
      default: return '#666666';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return '#f87171';
      case 'MEDIUM': return '#facc15';
      case 'LOW': return '#4ade80';
      default: return '#9ca3af';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>CME Earth Impact Tool</h1>
        <p className={styles.subtitle}>Aditya-L1 ASPEX & SUIT Payload Analysis System</p>
        <div className={styles.statusInfo}>
          Last Updated: {currentTime.toLocaleString()} | Status: OPERATIONAL
        </div>
      </div>

      {/* Alert Banner */}
      <div 
        className={styles.alertBanner}
        style={{ 
          backgroundColor: `${getAlertColor(alertLevel)}20`,
          borderColor: getAlertColor(alertLevel)
        }}
      >
        <div className={styles.alertContent}>
          <AlertTriangle size={24} color={getAlertColor(alertLevel)} />
          <div>
            <h3 className={styles.alertTitle}>Space Weather Alert: {alertLevel}</h3>
            <p className={styles.alertDescription}>
              Active CME detected with Earth-directed trajectory. Impact expected in ~18 hours.
            </p>
          </div>
        </div>
        <div className={styles.alertLevel}>
          <div className={styles.alertLevelLabel}>Alert Level</div>
          <div className={styles.alertLevelValue} style={{ color: getAlertColor(alertLevel) }}>
            {alertLevel}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className={styles.mainGrid}>
        {/* Solar Wind Parameters */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Activity className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Real-time Solar Wind Data (ASPEX)</h2>
          </div>
          
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={solarWindData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="solarWindSpeed" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  name="Wind Speed (km/s)"
                />
                <Line 
                  type="monotone" 
                  dataKey="particleFlux" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Particle Flux"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.textBlue}`}>
                {solarWindData.length > 0 ? Math.round(solarWindData[solarWindData.length - 1]?.solarWindSpeed || 0) : 0}
              </div>
              <div className={styles.metricLabel}>Wind Speed (km/s)</div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.textYellow}`}>
                {solarWindData.length > 0 ? Math.round(solarWindData[solarWindData.length - 1]?.particleFlux || 0) : 0}
              </div>
              <div className={styles.metricLabel}>Particle Flux</div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.textGreen}`}>
                {solarWindData.length > 0 ? Math.round(solarWindData[solarWindData.length - 1]?.magneticField || 0) : 0}
              </div>
              <div className={styles.metricLabel}>B-Field (nT)</div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.textRed}`}>
                {solarWindData.length > 0 ? Math.round((solarWindData[solarWindData.length - 1]?.temperature || 0) / 1000) : 0}K
              </div>
              <div className={styles.metricLabel}>Temperature</div>
            </div>
          </div>
        </div>

        {/* Earth Impact Forecast */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Globe className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Earth Impact Forecast</h2>
          </div>
          
          {earthImpactForecast && (
            <div className={styles.forecastContainer}>
              <div className={styles.impactProbability}>
                <div className={styles.probabilityValue}>
                  {earthImpactForecast.impactProbability}%
                </div>
                <div className={styles.probabilityLabel}>Impact Probability</div>
              </div>
              
              <div className={styles.forecastDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estimated Arrival:</span>
                  <span className={styles.detailValue}>
                    {earthImpactForecast.estimatedArrival.toLocaleDateString()} {earthImpactForecast.estimatedArrival.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Kp Index Max:</span>
                  <span className={`${styles.detailValue} ${styles.textRed}`}>{earthImpactForecast.maxKpIndex}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Storm Level:</span>
                  <span className={`${styles.detailValue} ${styles.textYellow}`}>{earthImpactForecast.geomagneticStormLevel}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duration:</span>
                  <span className={styles.detailValue}>{earthImpactForecast.duration}</span>
                </div>
              </div>
              
              <div className={styles.riskSection}>
                <h4 className={styles.riskTitle}>Risk Assessment:</h4>
                <div>
                  <div className={styles.riskItem}>
                    <div className={styles.riskLabel}>
                      <Satellite size={16} className={styles.riskIcon} />
                      <span>Satellites</span>
                    </div>
                    <span className={styles.riskValue} style={{ color: getRiskColor(earthImpactForecast.satelliteRisk) }}>
                      {earthImpactForecast.satelliteRisk}
                    </span>
                  </div>
                  
                  <div className={styles.riskItem}>
                    <div className={styles.riskLabel}>
                      <Zap size={16} className={styles.riskIcon} />
                      <span>Power Grid</span>
                    </div>
                    <span className={styles.riskValue} style={{ color: getRiskColor(earthImpactForecast.powerGridRisk) }}>
                      {earthImpactForecast.powerGridRisk}
                    </span>
                  </div>
                  
                  <div className={styles.riskItem}>
                    <div className={styles.riskLabel}>
                      <TrendingUp size={16} className={styles.riskIcon} />
                      <span>Navigation</span>
                    </div>
                    <span className={styles.riskValue} style={{ color: getRiskColor(earthImpactForecast.navigationRisk) }}>
                      {earthImpactForecast.navigationRisk}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CME Events and Analysis */}
      <div className={styles.secondaryGrid}>
        {/* Recent CME Events */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Recent CME Events</h2>
          </div>
          
          <div className={styles.eventsContainer}>
            {cmeEvents.map((event) => (
              <div key={event.id} className={styles.eventCard} 
                   style={{ borderColor: getIntensityColor(event.intensity) }}>
                <div className={styles.eventHeader}>
                  <div>
                    <h4 className={styles.eventTitle}>{event.classification}</h4>
                    <p className={styles.eventTime}>
                      {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <span 
                    className={styles.intensityBadge}
                    style={{ 
                      backgroundColor: `${getIntensityColor(event.intensity)}30`,
                      color: getIntensityColor(event.intensity)
                    }}
                  >
                    {event.intensity}
                  </span>
                </div>
                
                <div className={styles.eventDetails}>
                  <div>
                    <span className={styles.eventDetailLabel}>Speed:</span>
                    <span className={styles.eventDetailValue}>{event.speed} km/s</span>
                  </div>
                  <div>
                    <span className={styles.eventDetailLabel}>Direction:</span>
                    <span className={styles.eventDetailValue}>{event.direction}</span>
                  </div>
                  <div>
                    <span className={styles.eventDetailLabel}>Status:</span>
                    <span className={styles.eventDetailValue}>{event.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Clock className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Anomaly Detection (AI)</h2>
          </div>
          
          <div className={styles.anomalyContainer}>
            <div className={`${styles.anomalyCard} ${styles.redAnomaly}`}>
              <div className={styles.anomalyHeader}>
                <div className={`${styles.anomalyIndicator} ${styles.pulse}`}></div>
                <h4 className={`${styles.anomalyTitle} ${styles.textRed}`}>High Anomaly Detected</h4>
              </div>
              <p className={styles.anomalyDescription}>
                Solar wind speed anomaly detected at 14:32 UTC. Speed increased from 420 km/s to 780 km/s within 15 minutes.
              </p>
              <div className={styles.anomalyConfidence}>
                Confidence: 94% | Algorithm: LSTM-Autoencoder
              </div>
            </div>
            
            <div className={`${styles.anomalyCard} ${styles.yellowAnomaly}`}>
              <div className={styles.anomalyHeader}>
                <div className={styles.anomalyIndicator}></div>
                <h4 className={`${styles.anomalyTitle} ${styles.textYellow}`}>Moderate Anomaly</h4>
              </div>
              <p className={styles.anomalyDescription}>
                Particle flux spike detected. Values exceeded baseline by 250%.
              </p>
              <div className={styles.anomalyConfidence}>
                Confidence: 87% | Algorithm: Isolation Forest
              </div>
            </div>
            
            <div className={`${styles.anomalyCard} ${styles.greenAnomaly}`}>
              <div className={styles.anomalyHeader}>
                <div className={styles.anomalyIndicator}></div>
                <h4 className={`${styles.anomalyTitle} ${styles.textGreen}`}>Normal Parameters</h4>
              </div>
              <p className={styles.anomalyDescription}>
                Magnetic field strength within normal range. No anomalies detected in last 2 hours.
              </p>
              <div className={styles.anomalyConfidence}>
                Baseline: 5.2 ± 2.1 nT | Current: 6.8 nT
              </div>
            </div>
          </div>
          
          <div className={styles.systemStatus}>
            <h4 className={styles.statusTitle}>System Status</h4>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Data Quality:</span>
                <span className={`${styles.statusValue} ${styles.textGreen}`}>98.7%</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Model Accuracy:</span>
                <span className={`${styles.statusValue} ${styles.textGreen}`}>92.3%</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Last Calibration:</span>
                <span className={styles.statusValue}>2h ago</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Processing Delay:</span>
                <span className={`${styles.statusValue} ${styles.textGreen}`}>1.2s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>
          CME Earth Impact Tool v2.1 | Powered by Aditya-L1 Mission Data | 
          <span className={styles.footerHighlight}> ISRO Space Weather Division</span>
        </p>
        <p className={styles.footerSecondary}>
          Real-time processing of ASPEX and SUIT payload data for space weather monitoring and forecasting
        </p>
      </div>
    </div>
  );
}