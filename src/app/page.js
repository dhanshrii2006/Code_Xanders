// app/page.js
'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [solarData, setSolarData] = useState({
    solarWindSpeed: 450,
    particleFlux: 120,
    magneticField: -2.1,
    temperature: 100000,
    cmeEvents: []
  })

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Solar wind speed increasing', time: '10:30 UTC' },
    { id: 2, type: 'info', message: 'ASPEX data nominal', time: '10:25 UTC' },
    { id: 3, type: 'critical', message: 'Possible CME detected', time: '10:20 UTC' }
  ])

  const [systemStatus, setSystemStatus] = useState({
    aspex: 'nominal',
    suit: 'nominal',
    dataLink: 'nominal',
    groundStation: 'nominal'
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setSolarData(prev => ({
        ...prev,
        solarWindSpeed: 400 + Math.random() * 200,
        particleFlux: 100 + Math.random() * 50,
        magneticField: -5 + Math.random() * 10,
        temperature: 80000 + Math.random() * 40000
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const speedElement = document.getElementById('solarWindSpeed')
    const fluxElement = document.getElementById('particleFlux')
    
    if (speedElement) {
      speedElement.textContent = Math.round(solarData.solarWindSpeed)
    }
    if (fluxElement) {
      fluxElement.textContent = Math.round(solarData.particleFlux)
    }
  }, [solarData])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Solar Monitoring Dashboard</h1>
          <p className="dashboard-subtitle">
            Real-time Aditya-L1 data from Lagrange Point L1 • 1.5 million km from Earth
          </p>
        </div>
        <div className="header-stats">
          <div className="mission-time">
            <span className="label">Mission Day:</span>
            <span className="value" id="missionDay">245</span>
          </div>
          <div className="data-rate">
            <span className="label">Data Rate:</span>
            <span className="value">2.4 Mbps</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card solar-wind-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Solar Wind Monitor
            </h3>
            <div className="card-status">
              <div className="status-dot active"></div>
              <span>Live</span>
            </div>
          </div>
          <div className="card-content">
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-value">{Math.round(solarData.solarWindSpeed)}</div>
                <div className="metric-label">Speed (km/s)</div>
                <div className="metric-trend up">+12%</div>
              </div>
              <div className="metric">
                <div className="metric-value">{solarData.temperature.toLocaleString()}</div>
                <div className="metric-label">Temperature (K)</div>
                <div className="metric-trend stable">±2%</div>
              </div>
            </div>
            <div className="solar-wind-chart">
              <div className="chart-placeholder">
                <div className="chart-line"></div>
                <span>Real-time chart visualization</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card particle-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Particle Flux (ASPEX)
            </h3>
            <div className="card-status">
              <div className="status-dot active"></div>
              <span>Nominal</span>
            </div>
          </div>
          <div className="card-content">
            <div className="particle-types">
              <div className="particle-type">
                <div className="particle-icon proton">H+</div>
                <div className="particle-data">
                  <div className="particle-value">{Math.round(solarData.particleFlux)}</div>
                  <div className="particle-unit">p/cm²·s</div>
                </div>
              </div>
              <div className="particle-type">
                <div className="particle-icon alpha">α</div>
                <div className="particle-data">
                  <div className="particle-value">{Math.round(solarData.particleFlux * 0.12)}</div>
                  <div className="particle-unit">α/cm²·s</div>
                </div>
              </div>
              <div className="particle-type">
                <div className="particle-icon electron">e-</div>
                <div className="particle-data">
                  <div className="particle-value">{Math.round(solarData.particleFlux * 2.8)}</div>
                  <div className="particle-unit">e-/cm²·s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card cme-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              CME Detection Engine
            </h3>
            <div className="card-status">
              <div className="status-dot warning"></div>
              <span>Analyzing</span>
            </div>
          </div>
          <div className="card-content">
            <div className="cme-status">
              <div className="threat-level moderate">
                <div className="threat-indicator"></div>
                <div className="threat-info">
                  <div className="threat-label">Current Threat Level</div>
                  <div className="threat-value">MODERATE</div>
                </div>
              </div>
              <div className="detection-stats">
                <div className="detection-item">
                  <span className="detection-label">Events Today:</span>
                  <span className="detection-value">3</span>
                </div>
                <div className="detection-item">
                  <span className="detection-label">Under Analysis:</span>
                  <span className="detection-value">1</span>
                </div>
                <div className="detection-item">
                  <span className="detection-label">Earth-Directed:</span>
                  <span className="detection-value">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card system-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              System Health
            </h3>
            <div className="card-status">
              <div className="status-dot active"></div>
              <span>Nominal</span>
            </div>
          </div>
          <div className="card-content">
            <div className="system-components">
              {Object.entries(systemStatus).map(([component, status]) => (
                <div key={component} className="component">
                  <div className="component-name">
                    {component.toUpperCase()}
                  </div>
                  <div className={`component-status ${status}`}>
                    <div className="status-indicator"></div>
                    <span>{status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Recent Alerts
            </h3>
            <div className="card-actions">
              <button className="view-all-btn">View All</button>
            </div>
          </div>
          <div className="card-content">
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-indicator"></div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card forecast-card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon"></span>
              Earth Impact Forecast
            </h3>
            <div className="card-status">
              <div className="status-dot warning"></div>
              <span>Monitoring</span>
            </div>
          </div>
          <div className="card-content">
            <div className="forecast-summary">
              <div className="impact-probability">
                <div className="probability-circle">
                  <div className="probability-value">65%</div>
                  <div className="probability-label">Impact Probability</div>
                </div>
              </div>
              <div className="forecast-details">
                <div className="forecast-item">
                  <span className="forecast-label">Estimated Arrival:</span>
                  <span className="forecast-value">Jan 17, 14:30 UTC</span>
                </div>
                <div className="forecast-item">
                  <span className="forecast-label">Intensity:</span>
                  <span className="forecast-value moderate">Moderate</span>
                </div>
                <div className="forecast-item">
                  <span className="forecast-label">Duration:</span>
                  <span className="forecast-value">6-12 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Dashboard Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: rgba(22, 36, 71, 0.4);
          border: 1px solid rgb(62, 9, 154);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(255, 179, 71, 0.3);
        }

        .dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }

        .mission-time, .data-rate {
          text-align: right;
        }

        .header-stats .label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .header-stats .value {
          font-size: 18px;
          font-weight: 600;
          color: var(--status-active);
          font-family: 'Courier New', monospace;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          padding: 0 24px;
        }

        /* Dashboard Cards */
        .dashboard-card {
          background: rgba(22, 36, 71, 0.6);
          border: 1px solid rgb(62, 9, 154);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          // background: linear-gradient(90deg, 
          //   var(--solar-primary), 
          //   var(--solar-secondary), 
          //   var(--solar-primary)
          // );
          opacity: 0.6;
        }

        .dashboard-card:hover {
          // transform: translateY(-4px);
          box-shadow: 0 5px 20px rgba(83, 77, 149, 0.21);
          // border-color: rgb(62, 9, 154);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-icon {
          font-size: 20px;
        }

        .card-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .status-dot.active {
          background: var(--status-active);
          animation: pulse 2s infinite;
        }

        .status-dot.warning {
          background: var(--status-warning);
          animation: pulse 2s infinite;
        }

        /* Solar Wind Card */
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .metric {
          text-align: center;
          padding: 16px;
          background: rgba(11, 20, 38, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--solar-secondary);
          font-family: 'Courier New', monospace;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .metric-trend {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .metric-trend.up {
          background: rgba(0, 200, 81, 0.2);
          color: var(--status-active);
        }

        .metric-trend.stable {
          background: rgba(255, 215, 0, 0.2);
          color: var(--status-warning);
        }

        .solar-wind-chart {
          height: 80px;
          background: rgba(11, 20, 38, 0.4);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .chart-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent, 
            var(--solar-primary), 
            var(--solar-secondary), 
            transparent
          );
          animation: chart-flow 3s ease-in-out infinite;
        }

        @keyframes chart-flow {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        /* Particle Card */
        .particle-types {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        .particle-type {
          text-align: center;
          padding: 16px;
          background: rgba(11, 20, 38, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .particle-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-weight: 700;
          font-size: 14px;
        }

        .particle-icon.proton {
          background: rgba(255, 107, 53, 0.2);
          color: var(--solar-primary);
        }

        .particle-icon.alpha {
          background: rgba(255, 179, 71, 0.2);
          color: var(--solar-secondary);
        }

        .particle-icon.electron {
          background: rgba(0, 255, 127, 0.2);
          color: var(--status-active);
        }

        .particle-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
        }

        .particle-unit {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* CME Detection Card */
        .threat-level {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(11, 20, 38, 0.6);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .threat-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid var(--status-warning);
          position: relative;
        }

        .threat-indicator::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          background: var(--status-warning);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }

        .threat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .threat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--status-warning);
        }

        .detection-stats {
          display: grid;
          gap: 8px;
        }

        .detection-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 107, 53, 0.1);
        }

        .detection-label {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .detection-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        /* System Health */
        .system-components {
          display: grid;
          gap: 12px;
        }

        .component {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(11, 20, 38, 0.4);
          border-radius: 8px;
        }

        .component-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .component-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .component-status.nominal {
          color: var(--status-active);
        }

        .component-status .status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-active);
        }

        /* Alerts Card */
        .view-all-btn {
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.4);
          color: var(--solar-primary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          background: rgba(255, 107, 53, 0.3);
        }

        .alerts-list {
          display: grid;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(11, 20, 38, 0.4);
          border-radius: 8px;
          border-left: 3px solid var(--text-muted);
        }

        .alert-item.warning {
          border-left-color: var(--status-warning);
        }

        .alert-item.critical {
          border-left-color: var(--status-critical);
        }

        .alert-item.info {
          border-left-color: var(--status-active);
        }

        .alert-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
          margin-top: 4px;
          flex-shrink: 0;
        }

        .alert-item.warning .alert-indicator {
          background: var(--status-warning);
          animation: pulse 2s infinite;
        }

        .alert-item.critical .alert-indicator {
          background: var(--status-critical);
          animation: pulse 1s infinite;
        }

        .alert-item.info .alert-indicator {
          background: var(--status-active);
        }

        .alert-message {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .alert-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Earth Impact Forecast */
        .forecast-summary {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .probability-circle {
          width: 100px;
          height: 100px;
          border: 4px solid var(--status-warning);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .probability-circle::after {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(var(--status-warning) 0deg 234deg, rgba(255, 215, 0, 0.2) 234deg 360deg);
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .probability-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--status-warning);
          z-index: 1;
        }

        .probability-label {
          font-size: 8px;
          color: var(--text-muted);
          text-align: center;
          z-index: 1;
        }

        .forecast-details {
          flex: 1;
          display: grid;
          gap: 12px;
        }

        .forecast-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 107, 53, 0.1);
        }

        .forecast-label {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .forecast-value {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 13px;
        }

        .forecast-value.moderate {
          color: var(--status-warning);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          
          .header-stats {
            align-self: stretch;
            justify-content: space-around;
          }
        }
      `}</style>
    </div>
  )
}