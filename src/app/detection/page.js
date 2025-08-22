// app/detection/page.js
'use client'
import "./detection.css"
import { useState, useEffect } from 'react'

export default function CMEDetection() {
  const [detectionData, setDetectionData] = useState({
    currentAnalysis: {
      status: 'analyzing',
      confidence: 0.78,
      anomalies: 3,
      processing: true
    },
    recentEvents: [
      {
        id: 1,
        timestamp: '2024-01-15T08:30:00Z',
        intensity: 'moderate',
        speed: 650,
        direction: 'earth-directed',
        probability: 0.85,
        status: 'confirmed'
      },
      {
        id: 2,
        timestamp: '2024-01-15T06:15:00Z',
        intensity: 'weak',
        speed: 420,
        direction: 'off-limb',
        probability: 0.65,
        status: 'under-review'
      }
    ],
    algorithmStats: {
      processed: 15420,
      detected: 23,
      falsePositives: 2,
      accuracy: 0.934
    }
  })

  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date()
      const data = []
      
      for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() - (99 - i) * 15 * 60 * 1000) // 15-minute intervals
        const baseSpeed = 400
        const normalVariation = Math.random() * 100 - 50
        
        let anomalyBoost = 0
        if (Math.random() < 0.05) { // 5% chance of anomaly
          anomalyBoost = Math.random() * 300 + 200
        }
        
        data.push({
          time: time.toISOString(),
          solarWindSpeed: Math.max(200, baseSpeed + normalVariation + anomalyBoost),
          particleFlux: Math.max(50, 120 + Math.random() * 80 - 40),
          magneticField: -5 + Math.random() * 10,
          anomaly: anomalyBoost > 0
        })
      }
      
      return data
    }

    setTimeSeriesData(generateTimeSeriesData())
    
    const interval = setInterval(() => {
      setTimeSeriesData(generateTimeSeriesData())
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'weak': return '#FFD700'
      case 'moderate': return '#FF6B35'
      case 'strong': return '#FF4444'
      case 'extreme': return '#CC0000'
      default: return '#8A9BAE'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅'
      case 'under-review': return '🔍'
      case 'dismissed': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="cme-detection">
      {/* Detection Header */}
      <div className="detection-header">
        <div className="header-content">
          <h1 className="page-title">CME Detection Engine</h1>
          <p className="page-subtitle">
            Real-time anomaly detection using advanced algorithms on ASPEX and SUIT payload data
          </p>
        </div>
        <div className="detection-controls">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button className="export-btn">Export Data</button>
        </div>
      </div>

      <div className="detection-grid">
        
        <div className="detection-card analysis-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Real-time Analysis
            </h3>
            <div className="analysis-status">
              <div className="status-indicator processing"></div>
              <span>Processing</span>
            </div>
          </div>
          <div className="card-content">
            <div className="analysis-metrics">
              <div className="metric-large">
                <div className="metric-value">{(detectionData.currentAnalysis.confidence * 100).toFixed(1)}%</div>
                <div className="metric-label">Detection Confidence</div>
              </div>
              <div className="metric-grid">
                <div className="metric-item">
                  <div className="metric-number">{detectionData.currentAnalysis.anomalies}</div>
                  <div className="metric-desc">Active Anomalies</div>
                </div>
                <div className="metric-item">
                  <div className="metric-number">{detectionData.algorithmStats.processed}</div>
                  <div className="metric-desc">Data Points</div>
                </div>
                <div className="metric-item">
                  <div className="metric-number">{(detectionData.algorithmStats.accuracy * 100).toFixed(1)}%</div>
                  <div className="metric-desc">Accuracy</div>
                </div>
              </div>
            </div>
            
            <div className="algorithm-status">
              <div className="algorithm-item">
                <div className="algorithm-name">Time-Series Anomaly Detection</div>
                <div className="algorithm-indicator active"></div>
              </div>
              <div className="algorithm-item">
                <div className="algorithm-name">Particle Flux Analysis</div>
                <div className="algorithm-indicator active"></div>
              </div>
              <div className="algorithm-item">
                <div className="algorithm-name">Magnetic Field Correlation</div>
                <div className="algorithm-indicator warning"></div>
              </div>
              <div className="algorithm-item">
                <div className="algorithm-name">SUIT Image Processing</div>
                <div className="algorithm-indicator active"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="detection-card timeseries-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Solar Wind Time-Series Analysis
            </h3>
            <div className="chart-controls">
              <button className="chart-btn active">Speed</button>
              <button className="chart-btn">Flux</button>
              <button className="chart-btn">B-Field</button>
            </div>
          </div>
          <div className="card-content">
            <div className="timeseries-chart">
              <div className="chart-area">
                <div className="chart-grid">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid-line" style={{ top: `${i * 25}%` }}></div>
                  ))}
                </div>
                <div className="chart-data">
                  {timeSeriesData.map((point, index) => (
                    <div
                      key={index}
                      className={`data-point ${point.anomaly ? 'anomaly' : ''}`}
                      style={{
                        left: `${(index / timeSeriesData.length) * 100}%`,
                        bottom: `${(point.solarWindSpeed / 1000) * 100}%`
                      }}
                    ></div>
                  ))}
                </div>
                <div className="chart-overlay">
                  <div className="threshold-line high"></div>
                  <div className="threshold-line critical"></div>
                  <div className="threshold-label high">High Threshold (600 km/s)</div>
                  <div className="threshold-label critical">Critical Threshold (800 km/s)</div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color normal"></div>
                  <span>Normal Values</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color anomaly"></div>
                  <span>Detected Anomalies</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color threshold"></div>
                  <span>Alert Thresholds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detection-card events-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Detected CME Events
            </h3>
            <div className="events-stats">
              <span className="events-count">{detectionData.recentEvents.length} events</span>
            </div>
          </div>
          <div className="card-content">
            <div className="events-list">
              {detectionData.recentEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-header">
                    <div className="event-time">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div className="event-status">
                      <span className="status-icon">{getStatusIcon(event.status)}</span>
                      <span className="status-text">{event.status}</span>
                    </div>
                  </div>
                  
                  <div className="event-details">
                    <div className="event-metrics">
                      <div className="event-metric">
                        <div 
                          className="intensity-indicator"
                          style={{ backgroundColor: getIntensityColor(event.intensity) }}
                        ></div>
                        <div className="metric-info">
                          <div className="metric-label">Intensity</div>
                          <div className="metric-value">{event.intensity.toUpperCase()}</div>
                        </div>
                      </div>
                      
                      <div className="event-metric">
                        <div className="metric-icon">🌪️</div>
                        <div className="metric-info">
                          <div className="metric-label">Speed</div>
                          <div className="metric-value">{event.speed} km/s</div>
                        </div>
                      </div>
                      
                      <div className="event-metric">
                        <div className="metric-icon">🎯</div>
                        <div className="metric-info">
                          <div className="metric-label">Direction</div>
                          <div className="metric-value">{event.direction}</div>
                        </div>
                      </div>
                      
                      <div className="event-metric">
                        <div className="metric-icon">📊</div>
                        <div className="metric-info">
                          <div className="metric-label">Probability</div>
                          <div className="metric-value">{(event.probability * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="event-actions">
                      <button className="action-btn details">View Details</button>
                      <button className="action-btn alert">Create Alert</button>
                      <button className="action-btn track">Track Impact</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detection-card performance-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">⚡</span>
              Algorithm Performance
            </h3>
          </div>
          <div className="card-content">
            <div className="performance-metrics">
              <div className="performance-item">
                <div className="performance-label">Processing Rate</div>
                <div className="performance-value">2.4 MB/s</div>
                <div className="performance-bar">
                  <div className="bar-fill" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">Detection Latency</div>
                <div className="performance-value">30s</div>
                <div className="performance-bar">
                  <div className="bar-fill success" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">False Positive Rate</div>
                <div className="performance-value">2.1%</div>
                <div className="performance-bar">
                  <div className="bar-fill warning" style={{ width: '21%' }}></div>
                </div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">Model Confidence</div>
                <div className="performance-value">94.2%</div>
                <div className="performance-bar">
                  <div className="bar-fill success" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="tuning-controls">
              <div className="tuning-title">Algorithm Tuning</div>
              <div className="tuning-sliders">
                <div className="slider-control">
                  <label>Sensitivity Threshold</label>
                  <input type="range" min="0.1" max="1.0" step="0.1" defaultValue="0.7" />
                  <span>0.7</span>
                </div>
                <div className="slider-control">
                  <label>Noise Filter</label>
                  <input type="range" min="0" max="10" step="1" defaultValue="3" />
                  <span>3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detection-card analytics-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Advanced Analytics
            </h3>
          </div>
          <div className="card-content">
            <div className="analytics-tabs">
              <button className="tab-btn active">Pattern Recognition</button>
              <button className="tab-btn">Correlation Analysis</button>
              <button className="tab-btn">Predictive Models</button>
            </div>
            
            <div className="analytics-content">
              <div className="pattern-analysis">
                <div className="pattern-item">
                  <div className="pattern-name">Recurring 27-day Pattern</div>
                  <div className="pattern-confidence">87% confidence</div>
                  <div className="pattern-description">
                    Solar rotation-based recurring CME activity detected
                  </div>
                </div>
                
                <div className="pattern-item">
                  <div className="pattern-name">Velocity-Intensity Correlation</div>
                  <div className="pattern-confidence">92% confidence</div>
                  <div className="pattern-description">
                    Strong correlation between particle flux and wind speed anomalies
                  </div>
                </div>
                
                <div className="pattern-item">
                  <div className="pattern-name">Magnetic Field Precursors</div>
                  <div className="pattern-confidence">78% confidence</div>
                  <div className="pattern-description">
                    B-field rotations preceding 73% of major events
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detection-card sources-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Data Sources Status
            </h3>
          </div>
          <div className="card-content">
            <div className="sources-grid">
              <div className="source-item">
                <div className="source-header">
                  <div className="source-name">ASPEX SWIS</div>
                  <div className="source-status active">Online</div>
                </div>
                <div className="source-metrics">
                  <div className="source-metric">
                    <span>Data Rate:</span>
                    <span>1.2 MB/s</span>
                  </div>
                  <div className="source-metric">
                    <span>Last Update:</span>
                    <span>2s ago</span>
                  </div>
                  <div className="source-metric">
                    <span>Quality:</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
              
              <div className="source-item">
                <div className="source-header">
                  <div className="source-name">ASPEX STEPS</div>
                  <div className="source-status active">Online</div>
                </div>
                <div className="source-metrics">
                  <div className="source-metric">
                    <span>Data Rate:</span>
                    <span>0.8 MB/s</span>
                  </div>
                  <div className="source-metric">
                    <span>Last Update:</span>
                    <span>1s ago</span>
                  </div>
                  <div className="source-metric">
                    <span>Quality:</span>
                    <span>Good</span>
                  </div>
                </div>
              </div>
              
              <div className="source-item">
                <div className="source-header">
                  <div className="source-name">SUIT Imager</div>
                  <div className="source-status warning">Limited</div>
                </div>
                <div className="source-metrics">
                  <div className="source-metric">
                    <span>Data Rate:</span>
                    <span>0.3 MB/s</span>
                  </div>
                  <div className="source-metric">
                    <span>Last Update:</span>
                    <span>45s ago</span>
                  </div>
                  <div className="source-metric">
                    <span>Quality:</span>
                    <span>Fair</span>
                  </div>
                </div>
              </div>
              
              <div className="source-item">
                <div className="source-header">
                  <div className="source-name">CACTus DB</div>
                  <div className="source-status active">Synced</div>
                </div>
                <div className="source-metrics">
                  <div className="source-metric">
                    <span>Last Sync:</span>
                    <span>5 min ago</span>
                  </div>
                  <div className="source-metric">
                    <span>Events:</span>
                    <span>1,247</span>
                  </div>
                  <div className="source-metric">
                    <span>Status:</span>
                    <span>Up to date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 </div>
  )
}