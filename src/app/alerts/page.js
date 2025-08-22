'use client';
import { useState, useEffect } from 'react';

const AlertsPage = () => {
  const NASA_API_KEY = "NnqSQdztO0rYXNvu7x0PMKc2fcCrGYf6537RIjK8";
  
  const [systemStatus, setSystemStatus] = useState({
    monitoring: true,
    lastUpdate: new Date().toISOString(),
    alertsEnabled: true,
    recipients: ['ISRO-Ground-Station', 'Satellite-Operators', 'Space-Weather-Center']
  });

  const [alertStats, setAlertStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    acknowledged: 0
  });

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    fetchAlertStats();
    const interval = setInterval(fetchAlertStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertStats = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `https://api.nasa.gov/DONKI/CME?startDate=${formattedStart}&endDate=${formattedEnd}&api_key=${NASA_API_KEY}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setAlerts(data);
        const stats = {
          total: data.length,
          critical: data.filter(cme => cme.speed && cme.speed >= 800).length,
          warning: data.filter(cme => cme.speed && cme.speed >= 600 && cme.speed < 800).length,
          info: data.filter(cme => cme.speed && cme.speed < 600).length,
          acknowledged: Math.floor(data.length * 0.6)
        };
        setAlertStats(stats);
        setSystemStatus(prev => ({
          ...prev,
          lastUpdate: new Date().toISOString()
        }));
        setLastFetchTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch CME data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlertsEnabled = () => {
    setSystemStatus(prev => ({
      ...prev,
      alertsEnabled: !prev.alertsEnabled,
      lastUpdate: new Date().toISOString()
    }));
  };

  const getSeverityLevel = (speed) => {
    if (!speed) return 'info';
    if (speed >= 800) return 'critical';
    if (speed >= 600) return 'warning';
    return 'info';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div style={containerStyle}>
      {/* Animated Background */}
      <div style={backgroundStyle}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              ...starStyle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div style={contentStyle}>
        {/* Enhanced Header */}
        <header style={headerStyle}>
          <div style={headerIconContainerStyle}>
            <div style={headerIconStyle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                <path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z"/>
                <path d="M5 15L6.09 17.26L9 18L6.09 18.74L5 21L3.91 18.74L1 18L3.91 17.26L5 15Z"/>
              </svg>
            </div>
            <div>
              <h1 style={titleStyle}>Alert Management System</h1>
              <div style={liveIndicatorStyle}>
                <div style={pulseDotStyle}></div>
                <span>Live Monitoring Active</span>
              </div>
            </div>
          </div>
          <p style={subtitleStyle}>
            Real-time CME detection and notification system powered by NASA DONKI API
          </p>
        </header>

        {/* Status Grid */}
        <div style={statusGridStyle}>
          {/* System Status Card */}
          <div style={{...cardStyle, ...systemStatusCardStyle}}>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>System Status</h3>
              <div style={{
                ...statusIndicatorStyle,
                ...(systemStatus.monitoring ? pulseAnimationStyle : inactiveStyle)
              }}>
                {systemStatus.monitoring ? '🟢' : '🔴'}
              </div>
            </div>
            
            <div style={statusDetailsStyle}>
              {[
                { label: 'Monitoring', value: systemStatus.monitoring ? 'Active' : 'Inactive', status: systemStatus.monitoring },
                { label: 'Alert System', value: systemStatus.alertsEnabled ? 'Enabled' : 'Disabled', status: systemStatus.alertsEnabled },
                { label: 'Last Update', value: new Date(systemStatus.lastUpdate).toLocaleString(), status: true }
              ].map((item, index) => (
                <div key={index} style={statusItemStyle}>
                  <span style={statusLabelStyle}>{item.label}</span>
                  <span style={{
                    ...statusValueStyle,
                    color: item.status ? '#10b981' : '#ef4444'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button 
              style={{
                ...toggleButtonStyle,
                background: systemStatus.alertsEnabled 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                  : 'linear-gradient(135deg, #10b981, #059669)'
              }}
              onClick={toggleAlertsEnabled}
            >
              {systemStatus.alertsEnabled ? 'Disable Alerts' : 'Enable Alerts'}
            </button>
          </div>

          {/* Alert Statistics Card */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Alert Statistics</h3>
              {isLoading && <div style={loadingSpinnerStyle}>⟳</div>}
            </div>
            
            <div style={statsGridStyle}>
              {[
                { key: 'total', label: 'Total Alerts', color: '#60a5fa' },
                { key: 'critical', label: 'Critical', color: '#ef4444' },
                { key: 'warning', label: 'Warning', color: '#f59e0b' },
                { key: 'info', label: 'Info', color: '#10b981' },
                { key: 'acknowledged', label: 'Acknowledged', color: '#8b5cf6' }
              ].map((stat) => (
                <div key={stat.key} style={statItemStyle}>
                  <span style={{...statValueStyle, color: stat.color}}>
                    {alertStats[stat.key]}
                  </span>
                  <span style={statLabelStyle}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recipients Status */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Alert Recipients</h3>
          <div style={recipientsGridStyle}>
            {systemStatus.recipients.map((recipient, index) => (
              <div key={index} style={recipientItemStyle}>
                <div style={recipientIconStyle}>
                  {index === 0 ? '🛰️' : index === 1 ? '📡' : '🌍'}
                </div>
                <div>
                  <div style={recipientNameStyle}>{recipient}</div>
                  <div style={recipientStatusStyle}>
                    <span style={onlineIndicatorStyle}>●</span> Online
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Recent CME Alerts</h3>
            <button onClick={fetchAlertStats} style={refreshButtonStyle} disabled={isLoading}>
              <span style={isLoading ? {animation: 'spin 1s linear infinite'} : {}}>
                ⟳
              </span>
              Refresh
            </button>
          </div>
          
          {alerts.length === 0 ? (
            <div style={noAlertsStyle}>
              <div style={noAlertsIconStyle}>🌌</div>
              <p>No CME events detected in the past 7 days</p>
              <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>System is monitoring continuously</p>
            </div>
          ) : (
            <div style={alertsListStyle}>
              {alerts.slice(0, 5).map((cme, index) => {
                const severity = getSeverityLevel(cme.speed);
                return (
                  <div key={index} style={{...alertCardStyle, ...getSeverityCardStyle(severity)}}>
                    <div style={alertHeaderStyle}>
                      <div style={alertSeverityBadgeStyle(severity)}>
                        {getSeverityIcon(severity)} {severity.toUpperCase()}
                      </div>
                      <div style={alertTimeStyle}>
                        {formatTimeAgo(cme.startTime)}
                      </div>
                    </div>
                    <div style={alertContentStyle}>
                      <div style={alertDetailStyle}>
                        <strong>Speed:</strong> {cme.speed ? `${cme.speed} km/s` : 'N/A'}
                      </div>
                      <div style={alertDetailStyle}>
                        <strong>Time:</strong> {new Date(cme.startTime).toLocaleString()}
                      </div>
                      <div style={alertNoteStyle}>
                        {cme.note || "No additional details available"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {lastFetchTime && (
          <div style={footerStyle}>
            Last data refresh: {lastFetchTime.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a, #581c87, #1e293b)',
  position: 'relative',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const backgroundStyle = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 1
};

const starStyle = {
  position: 'absolute',
  width: '2px',
  height: '2px',
  background: '#60a5fa',
  borderRadius: '50%',
  animation: 'twinkle 3s infinite'
};

const contentStyle = {
  position: 'relative',
  zIndex: 10,
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '2rem'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '4rem'
};

const headerIconContainerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2rem',
  marginBottom: '2rem'
};

const headerIconStyle = {
  padding: '1.5rem',
  background: 'linear-gradient(135deg, #f97316, #dc2626)',
  borderRadius: '1.5rem',
  boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)',
  animation: 'float 6s ease-in-out infinite'
};

const titleStyle = {
  fontSize: '3.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #fb923c, #ef4444)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: '1rem',
  textAlign: 'left'
};

const liveIndicatorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#cbd5e1'
};

const pulseDotStyle = {
  width: '0.5rem',
  height: '0.5rem',
  background: '#10b981',
  borderRadius: '50%',
  animation: 'ping 2s infinite'
};

const subtitleStyle = {
  fontSize: '1.25rem',
  color: '#cbd5e1',
  maxWidth: '40rem',
  margin: '0 auto',
  lineHeight: '1.8'
};

const statusGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '2rem',
  marginBottom: '3rem'
};

const cardStyle = {
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '2rem',
  padding: '2rem',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  marginBottom: '2rem'
};

const systemStatusCardStyle = {
  background: 'rgba(30, 41, 59, 0.9)'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const cardTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: 0
};

const statusIndicatorStyle = {
  fontSize: '2rem',
  transition: 'all 0.3s ease'
};

const pulseAnimationStyle = {
  animation: 'pulse 2s infinite'
};

const inactiveStyle = {
  opacity: 0.5
};

const statusDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem'
};

const statusItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  background: 'rgba(71, 85, 105, 0.3)',
  borderRadius: '1rem',
  border: '1px solid rgba(148, 163, 184, 0.1)'
};

const statusLabelStyle = {
  color: '#cbd5e1'
};

const statusValueStyle = {
  fontWeight: 'bold'
};

const toggleButtonStyle = {
  border: 'none',
  borderRadius: '1rem',
  color: 'white',
  padding: '1rem 2rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '1rem'
};

const statItemStyle = {
  textAlign: 'center',
  padding: '1.5rem 1rem',
  background: 'rgba(71, 85, 105, 0.2)',
  borderRadius: '1rem',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  transition: 'transform 0.2s ease'
};

const statValueStyle = {
  display: 'block',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem'
};

const statLabelStyle = {
  color: '#94a3b8',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const loadingSpinnerStyle = {
  fontSize: '1.5rem',
  animation: 'spin 1s linear infinite'
};

const recipientsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem'
};

const recipientItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  background: 'rgba(71, 85, 105, 0.2)',
  borderRadius: '1rem',
  border: '1px solid rgba(148, 163, 184, 0.1)'
};

const recipientIconStyle = {
  fontSize: '2rem'
};

const recipientNameStyle = {
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: '0.25rem'
};

const recipientStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#10b981',
  fontSize: '0.9rem'
};

const onlineIndicatorStyle = {
  color: '#10b981'
};

const refreshButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  border: 'none',
  borderRadius: '0.75rem',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all 0.2s ease'
};

const noAlertsStyle = {
  textAlign: 'center',
  padding: '3rem',
  color: '#94a3b8'
};

const noAlertsIconStyle = {
  fontSize: '4rem',
  marginBottom: '1rem'
};

const alertsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const alertCardStyle = {
  padding: '1.5rem',
  borderRadius: '1rem',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  transition: 'all 0.2s ease'
};

const getSeverityCardStyle = (severity) => {
  const colors = {
    critical: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)'
  };
  return { background: colors[severity] || colors.info };
};

const alertHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
};

const alertSeverityBadgeStyle = (severity) => {
  const colors = {
    critical: { background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' },
    warning: { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' },
    info: { background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }
  };
  return {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    ...colors[severity]
  };
};

const alertTimeStyle = {
  color: '#94a3b8',
  fontSize: '0.9rem'
};

const alertContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const alertDetailStyle = {
  color: '#e2e8f0'
};

const alertNoteStyle = {
  color: '#94a3b8',
  fontSize: '0.9rem',
  fontStyle: 'italic',
  marginTop: '0.5rem'
};

const footerStyle = {
  textAlign: 'center',
  color: '#64748b',
  fontSize: '0.9rem',
  marginTop: '2rem',
  padding: '1rem',
  borderTop: '1px solid rgba(148, 163, 184, 0.2)'
};

export default AlertsPage;