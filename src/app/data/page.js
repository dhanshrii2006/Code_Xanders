// app/data/page.js
'use client'
import "./solar.css"
import { useState, useEffect } from 'react'
// import Sidebar from '../../components/Sidebar'
import TimeSeriesChart from '../components/DataVisualization/TimeSeriesChart'
import ParticleFluxChart from '../components/DataVisualization/ParticleFluxChart'
import CMETracker from '../components/DataVisualization/CMETracker'

export default function SolarDataPage() {
  const [solarData, setSolarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState('aspex')
  const [timeRange, setTimeRange] = useState('24h')
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  useEffect(() => {
    fetchSolarData()
    
    // Set up real-time data updates
    if (realTimeEnabled) {
      const interval = setInterval(fetchSolarData, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [selectedDataset, timeRange, realTimeEnabled])

  const fetchSolarData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/solar-data?dataset=${selectedDataset}&range=${timeRange}`)
      const data = await response.json()
      setSolarData(data)
    } catch (error) {
      console.error('Error fetching solar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStats = solarData?.current || {}

  return (
    <div className="app-container">
      {/* <Sidebar /> */}
      <main className="main-content">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Solar Data Monitoring</h1>
            <p className="page-subtitle">Real-time Aditya-L1 ASPEX & SUIT payload data</p>
          </div>
          <div className="header-controls">
            <div className="control-group">
              <label className="control-label">Dataset</label>
              <select 
                className="control-select"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                <option value="aspex">ASPEX (Solar Wind)</option>
                <option value="suit">SUIT (Imaging)</option>
                <option value="combined">Combined View</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label">Time Range</label>
              <select 
                className="control-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            <div className="control-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={realTimeEnabled}
                  onChange={(e) => setRealTimeEnabled(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                Real-time Updates
              </label>
            </div>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-4">
          <div className="card stats-card">
            <div className="stats-icon solar-wind">⚡</div>
            <div className="stats-value" style={{color: 'var(--plasma-blue)'}}>
              {currentStats.solarWindSpeed || '--'} km/s
            </div>
            <div className="stats-label">Solar Wind Speed</div>
            <div className={`status-indicator ${currentStats.solarWindSpeed > 500 ? 'danger' : currentStats.solarWindSpeed > 400 ? 'warning' : 'normal'}`}>
              {currentStats.solarWindSpeed > 500 ? 'High' : currentStats.solarWindSpeed > 400 ? 'Elevated' : 'Normal'}
            </div>
          </div>

          <div className="card stats-card">
            <div className="stats-icon proton">🌐</div>
            <div className="stats-value" style={{color: 'var(--solar-orange)'}}>
              {currentStats.protonDensity || '--'} /cm³
            </div>
            <div className="stats-label">Proton Density</div>
            <div className={`status-indicator ${currentStats.protonDensity > 20 ? 'danger' : currentStats.protonDensity > 10 ? 'warning' : 'normal'}`}>
              {currentStats.protonDensity > 20 ? 'High' : currentStats.protonDensity > 10 ? 'Elevated' : 'Normal'}
            </div>
          </div>

          <div className="card stats-card">
            <div className="stats-icon temperature">🌡️</div>
            <div className="stats-value" style={{color: 'var(--solar-yellow)'}}>
              {currentStats.temperature || '--'}K
            </div>
            <div className="stats-label">Plasma Temperature</div>
            <div className={`status-indicator ${currentStats.temperature > 200000 ? 'danger' : currentStats.temperature > 100000 ? 'warning' : 'normal'}`}>
              {currentStats.temperature > 200000 ? 'High' : currentStats.temperature > 100000 ? 'Elevated' : 'Normal'}
            </div>
          </div>

          <div className="card stats-card">
            <div className="stats-icon magnetic">🧲</div>
            <div className="stats-value" style={{color: 'var(--cosmic-purple)'}}>
              {currentStats.magneticField || '--'} nT
            </div>
            <div className="stats-label">Magnetic Field</div>
            <div className={`status-indicator ${currentStats.magneticField > 10 ? 'danger' : currentStats.magneticField > 5 ? 'warning' : 'normal'}`}>
              {currentStats.magneticField > 10 ? 'High' : currentStats.magneticField > 5 ? 'Elevated' : 'Normal'}
            </div>
          </div>
        </div>

        {/* Main Data Visualization */}
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Solar Wind Parameters</h2>
              <div className="card-actions">
                <button className="btn btn-sm" onClick={() => fetchSolarData()}>
                  <span className="refresh-icon">🔄</span>
                  Refresh
                </button>
              </div>
            </div>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <TimeSeriesChart data={solarData?.timeSeries} />
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Particle Flux Analysis</h2>
              <div className="data-quality">
                <span className="status-dot status-normal"></span>
                Data Quality: Good
              </div>
            </div>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <ParticleFluxChart data={solarData?.particleFlux} />
            )}
          </div>
        </div>

        {/* CME Tracking Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Coronal Mass Ejection Tracker</h2>
            <div className="cme-stats">
              <span className="cme-count">Active CMEs: {solarData?.activeCMEs?.length || 0}</span>
              <span className="last-detection">
                Last Detection: {solarData?.lastCMEDetection || 'No recent activity'}
              </span>
            </div>
          </div>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <CMETracker data={solarData?.cmeData} />
          )}
        </div>

        {/* Data Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Data Points</h2>
            <div className="table-controls">
              <button className="btn btn-sm">Export CSV</button>
              <button className="btn btn-sm">Download Raw Data</button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Solar Wind (km/s)</th>
                  <th>Proton Density (/cm³)</th>
                  <th>Temperature (K)</th>
                  <th>Magnetic Field (nT)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {solarData?.recentData?.map((row, index) => (
                  <tr key={index}>
                    <td>{new Date(row.timestamp).toLocaleString()}</td>
                    <td>{row.solarWindSpeed}</td>
                    <td>{row.protonDensity}</td>
                    <td>{row.temperature}</td>
                    <td>{row.magneticField}</td>
                    <td>
                      <span className={`status-badge ${row.anomaly ? 'anomaly' : 'normal'}`}>
                        {row.anomaly ? 'Anomaly' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source Information */}
        <div className="grid grid-2">
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">ASPEX Payload</h3>
            </div>
            <div className="info-content">
              <p>Aditya Solar wind Particle EXperiment measures solar wind particles and their properties.</p>
              <ul className="info-list">
                <li>Solar wind speed and direction</li>
                <li>Proton and alpha particle flux</li>
                <li>Energy spectrum analysis</li>
                <li>3D velocity distribution</li>
              </ul>
              <div className="data-status">
                <span className="status-dot status-normal"></span>
                Operational
              </div>
            </div>
          </div>

          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">SUIT Payload</h3>
            </div>
            <div className="info-content">
              <p>Solar Ultraviolet Imaging Telescope provides high-resolution solar imaging.</p>
              <ul className="info-list">
                <li>UV imaging of solar corona</li>
                <li>CME detection and tracking</li>
                <li>Solar flare monitoring</li>
                <li>Coronal hole mapping</li>
              </ul>
              <div className="data-status">
                <span className="status-dot status-normal"></span>
                Operational
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}