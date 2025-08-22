'use client';

import { useState, useEffect } from 'react';
// import AlertsPanel from '../../components/Dashboard/AlertsPanel';
import styles from './alerts.module.css';

const AlertsPage = () => {
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

  useEffect(() => {
    fetchAlertStats();
    const interval = setInterval(fetchAlertStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlertStats = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      
      if (data.success) {
        const alerts = data.alerts;
        const stats = {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'warning').length,
          info: alerts.filter(a => a.severity === 'info').length,
          acknowledged: alerts.filter(a => a.acknowledged).length
        };
        setAlertStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
    }
  };

  const toggleAlertsEnabled = () => {
    setSystemStatus(prev => ({
      ...prev,
      alertsEnabled: !prev.alertsEnabled,
      lastUpdate: new Date().toISOString()
    }));
  };

  const testAlert = async (severity) => {
    try {
      const testAlertData = {
        type: severity,
        severity: severity,
        title: `TEST: ${severity.toUpperCase()} Alert`,
        message: `This is a test ${severity} alert generated for system verification.`,
        parameters: {
          solarWindSpeed: severity === 'critical' ? 850 : severity === 'warning' ? 650 : 450,
          particleFlux: severity === 'critical' ? 1.2e6 : severity === 'warning' ? 8.5e5 : 3.0e5,
          direction: 'Test-generated',
          earthImpactProbability: severity === 'critical' ? 0.8 : severity === 'warning' ? 0.5 : 0.2,
          estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        recipients: systemStatus.recipients
      };

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAlertData)
      });

      if (response.ok) {
        fetchAlertStats();
      }
    } catch (error) {
      console.error('Failed to send test alert:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Alert Management System</h1>
        <p className={styles.subtitle}>
          Real-time CME detection and notification system for Aditya-L1 mission
        </p>
      </div>

      {/* System Status */}
      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <h3>System Status</h3>
            <div className={`${styles.statusIndicator} ${systemStatus.monitoring ? styles.active : styles.inactive}`}>
              {systemStatus.monitoring ? '🟢' : '🔴'}
            </div>
          </div>
          <div className={styles.statusDetails}>
            <p><strong>Monitoring:</strong> {systemStatus.monitoring ? 'Active' : 'Inactive'}</p>
            <p><strong>Alerts:</strong> {systemStatus.alertsEnabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Last Update:</strong> {new Date(systemStatus.lastUpdate).toLocaleString()}</p>
            <button 
              className={styles.toggleButton}
              onClick={toggleAlertsEnabled}
            >
              {systemStatus.alertsEnabled ? 'Disable Alerts' : 'Enable Alerts'}
            </button>
          </div>
        </div>

        <div className={styles.statusCard}>
          <h3>Alert Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{alertStats.total}</span>
              <span className={styles.statLabel}>Total Alerts</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.critical}`}>{alertStats.critical}</span>
              <span className={styles.statLabel}>Critical</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.warning}`}>{alertStats.warning}</span>
              <span className={styles.statLabel}>Warning</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.info}`}>{alertStats.info}</span>
              <span className={styles.statLabel}>Info</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{alertStats.acknowledged}</span>
              <span className={styles.statLabel}>Acknowledged</span>
            </div>
          </div>
        </div>

        <div className={styles.statusCard}>
          <h3>Recipients Configuration</h3>
          <div className={styles.recipientsList}>
            {systemStatus.recipients.map((recipient, index) => (
              <div key={index} className={styles.recipient}>
                <span className={styles.recipientIcon}>📧</span>
                <span>{recipient}</span>
                <span className={styles.recipientStatus}>✅</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statusCard}>
          <h3>Test Alerts</h3>
          <p className={styles.testDescription}>
            Generate test alerts to verify system functionality
          </p>
          <div className={styles.testButtons}>
            <button 
              className={`${styles.testButton} ${styles.testCritical}`}
              onClick={() => testAlert('critical')}
            >
              Test Critical
            </button>
            <button 
              className={`${styles.testButton} ${styles.testWarning}`}
              onClick={() => testAlert('warning')}
            >
              Test Warning
            </button>
            <button 
              className={`${styles.testButton} ${styles.testInfo}`}
              onClick={() => testAlert('info')}
            >
              Test Info
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className={styles.alertsSection}>
        {/* <AlertsPanel /> */}
      </div>

      {/* Alert Configuration */}
      <div className={styles.configSection}>
        <div className={styles.configCard}>
          <h3>Alert Thresholds Configuration</h3>
          <div className={styles.thresholdsTable}>
            <div className={styles.tableHeader}>
              <span>Parameter</span>
              <span>Critical</span>
              <span>Warning</span>
              <span>Info</span>
              <span>Unit</span>
            </div>
            <div className={styles.tableRow}>
              <span>Solar Wind Speed</span>
              <span>≥800</span>
              <span>≥600</span>
              <span>≥450</span>
              <span>km/s</span>
            </div>
            <div className={styles.tableRow}>
              <span>Particle Flux</span>
              <span>≥1.0×10⁶</span>
              <span>≥5.0×10⁵</span>
              <span>≥2.0×10⁵</span>
              <span>p/cm²/s</span>
            </div>
            <div className={styles.tableRow}>
              <span>Magnetic Field</span>
              <span>≥20</span>
              <span>≥15</span>
              <span>≥10</span>
              <span>nT</span>
            </div>
            <div className={styles.tableRow}>
              <span>Proton Flux</span>
              <span>≥10</span>
              <span>≥1</span>
              <span>≥0.1</span>
              <span>pfu</span>
            </div>
          </div>
        </div>

        <div className={styles.configCard}>
          <h3>Notification Channels</h3>
          <div className={styles.channelsList}>
            <div className={styles.channel}>
              <div className={styles.channelInfo}>
                <span className={styles.channelIcon}>📧</span>
                <div>
                  <strong>Email Notifications</strong>
                  <p>Instant email alerts to configured recipients</p>
                </div>
              </div>
              <span className={styles.channelStatus}>✅ Active</span>
            </div>
            <div className={styles.channel}>
              <div className={styles.channelInfo}>
                <span className={styles.channelIcon}>🔗</span>
                <div>
                  <strong>Webhook Integration</strong>
                  <p>HTTP POST to external monitoring systems</p>
                </div>
              </div>
              <span className={styles.channelStatus}>✅ Active</span>
            </div>
            <div className={styles.channel}>
              <div className={styles.channelInfo}>
                <span className={styles.channelIcon}>📱</span>
                <div>
                  <strong>SMS Alerts</strong>
                  <p>Critical alerts via SMS for emergency response</p>
                </div>
              </div>
              <span className={styles.channelStatus}>⏸️ Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;