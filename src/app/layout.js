import './globals.css'

export const metadata = {
  title: 'Aditya-L1 CME Detection Tool',
  description: 'Advanced Coronal Mass Ejection Detection and Alert System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-header">
              <h1>Surya Sentinal</h1>
              
              <div className="status-bar">
                <div className="live-status">
                  <div className="live-dot"></div>
                  <span>Live Monitoring</span>
                </div>
                <div className="satellite-status">
                  <span className="satellite-icon"></span>
                  <span className="status-text">L1 Point</span>
                </div>
              </div>

              <div className="solar-stats">
                <div className="stat-card">
                  <div className="stat-value" id="solarWindSpeed">450</div>
                  <div className="stat-label">SW Speed (km/s)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" id="particleFlux">120</div>
                  <div className="stat-label">Flux (p/cm²s)</div>
                </div>
              </div>

              <div className="mission-clock" id="missionClock">
                <div className="clock-label">Mission Time</div>
                <div className="clock-time">01:350:00:00:00 UTC</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">
                <div className="nav-title">Monitoring</div>
                <a href="/" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Dashboard</span>
                  <span className="nav-status live"></span>
                </a>
                <a href="/detection" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">CME Detection</span>
                  {/* <span className="nav-badge" id="cmeAlerts"></span> */}
                </a>
                <a href="/alerts" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Alert System</span>
                  <span className="nav-badge urgent">!</span>
                </a>
              </div>

              <div className="nav-section">
                <div className="nav-title">Data & Analysis</div>
                <a href="/data" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Solar Data</span>
                </a>
                <a href="/forecast" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Earth Impact</span>
                </a>
                <a href="/history" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Historical</span>
                </a>
              </div>

              <div className="nav-section">
                <div className="nav-title">System</div>
                <a href="/settings" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Settings</span>
                </a>
                <a href="/help" className="nav-link">
                  <span className="nav-icon"></span>
                  <span className="nav-text">Help</span>
                </a>
              </div>
            </nav>

            <div className="mission-control">
              <div className="control-header">
                <span className="isro-logo">🇮🇳</span>
                <div className="control-info">
                  <h4>ISRO Mission Control</h4>
                  <p>Bangalore, India</p>
                </div>
              </div>
              <div className="control-status">
                <div className="status-indicator active"></div>
                <span>All Systems Nominal</span>
              </div>
            </div>
          </aside>

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}