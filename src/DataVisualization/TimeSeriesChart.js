'use client'
import { useEffect, useRef, useState } from 'react'

export default function TimeSeriesChart({ data }) {
  const canvasRef = useRef(null)
  const [selectedParameter, setSelectedParameter] = useState('solarWindSpeed')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const parameters = {
    solarWindSpeed: { label: 'Solar Wind Speed (km/s)', color: '#4dabf7', unit: 'km/s' },
    protonDensity: { label: 'Proton Density (/cm³)', color: '#ff6b35', unit: '/cm³' },
    temperature: { label: 'Temperature (K)', color: '#f7931e', unit: 'K' },
    magneticField: { label: 'Magnetic Field (nT)', color: '#9775fa', unit: 'nT' }
  }

  useEffect(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    drawChart(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
  }, [data, selectedParameter])

  const drawChart = (ctx, width, height) => {
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (!data || !data.length) {
      drawNoData(ctx, width, height)
      return
    }

    const values = data.map(d => d[selectedParameter]).filter(v => v !== null && v !== undefined)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue || 1

    const minTime = new Date(data[0].timestamp).getTime()
    const maxTime = new Date(data[data.length - 1].timestamp).getTime()
    const timeRange = maxTime - minTime || 1

    // Draw grid
    drawGrid(ctx, padding, chartWidth, chartHeight, minValue, maxValue, minTime, maxTime)

    // Draw data line
    drawDataLine(ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange)

    // Draw anomaly markers
    drawAnomalies(ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange)

    // Draw axes labels
    drawLabels(ctx, padding, width, height, minValue, maxValue, minTime, maxTime)
  }

  const drawGrid = (ctx, padding, chartWidth, chartHeight, minValue, maxValue, minTime, maxTime) => {
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
    }
  }

  const drawDataLine = (ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange) => {
    const color = parameters[selectedParameter].color
    
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Create gradient for fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
    gradient.addColorStop(0, `${color}40`)
    gradient.addColorStop(1, `${color}10`)

    let path = new Path2D()
    let fillPath = new Path2D()
    let firstPoint = true

    data.forEach((point, index) => {
      const value = point[selectedParameter]
      if (value === null || value === undefined) return

      const x = padding.left + ((new Date(point.timestamp).getTime() - minTime) / timeRange) * chartWidth
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (firstPoint) {
        path.moveTo(x, y)
        fillPath.moveTo(padding.left, padding.top + chartHeight)
        fillPath.lineTo(x, y)
        firstPoint = false
      } else {
        path.lineTo(x, y)
        fillPath.lineTo(x, y)
      }
    })

    // Complete fill path
    const lastPoint = data[data.length - 1]
    if (lastPoint) {
      const lastX = padding.left + ((new Date(lastPoint.timestamp).getTime() - minTime) / timeRange) * chartWidth
      fillPath.lineTo(lastX, padding.top + chartHeight)
      fillPath.closePath()
    }

    // Draw fill
    ctx.fillStyle = gradient
    ctx.fill(fillPath)

    // Draw line
    ctx.stroke(path)

    // Draw data points
    drawDataPoints(ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange, color)
  }

  const drawDataPoints = (ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange, color) => {
    data.forEach((point, index) => {
      const value = point[selectedParameter]
      if (value === null || value === undefined) return

      const x = padding.left + ((new Date(point.timestamp).getTime() - minTime) / timeRange) * chartWidth
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      
      if (point.anomaly) {
        ctx.strokeStyle = '#e53e3e'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const drawAnomalies = (ctx, padding, chartWidth, chartHeight, minValue, valueRange, minTime, timeRange) => {
    data.forEach(point => {
      if (!point.anomaly) return

      const x = padding.left + ((new Date(point.timestamp).getTime() - minTime) / timeRange) * chartWidth
      
      ctx.strokeStyle = '#e53e3e'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
      
      ctx.setLineDash([])
    })
  }

  const drawLabels = (ctx, padding, width, height, minValue, maxValue, minTime, maxTime) => {
    ctx.fillStyle = '#a0aec0'
    ctx.font = '12px Inter, sans-serif'

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (maxValue - minValue) * (1 - i / 5)
      const y = padding.top + (height - padding.top - padding.bottom) * (i / 5)
      
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(value.toFixed(1), padding.left - 10, y)
    }

    // X-axis labels (time)
    for (let i = 0; i <= 6; i++) {
      const time = minTime + (maxTime - minTime) * (i / 6)
      const x = padding.left + (width - padding.left - padding.right) * (i / 6)
      
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const timeStr = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillText(timeStr, x, height - padding.bottom + 10)
    }

    // Axis labels
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Inter, sans-serif'
    
    // Y-axis title
    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText(parameters[selectedParameter].label, 0, 0)
    ctx.restore()

    // X-axis title
    ctx.textAlign = 'center'
    ctx.fillText('Time', width / 2, height - 5)
  }

  const drawNoData = (ctx, width, height) => {
    ctx.fillStyle = '#a0aec0'
    ctx.font = '16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('No data available', width / 2, height / 2)
  }

  const handleCanvasClick = (event) => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    
    // Find closest data point
    const padding = { left: 60, right: 20 }
    const chartWidth = rect.width - padding.left - padding.right
    
    if (x < padding.left || x > rect.width - padding.right) return

    const minTime = new Date(data[0].timestamp).getTime()
    const maxTime = new Date(data[data.length - 1].timestamp).getTime()
    const timeRange = maxTime - minTime || 1
    
    const clickTime = minTime + ((x - padding.left) / chartWidth) * timeRange
    
    // Find closest point
    let closestIndex = 0
    let minDistance = Math.abs(new Date(data[0].timestamp).getTime() - clickTime)
    
    data.forEach((point, index) => {
      const distance = Math.abs(new Date(point.timestamp).getTime() - clickTime)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })
    
    setHoveredPoint(closestIndex)
  }

  // Generate sample data if none provided
  const sampleData = data || generateSampleData()

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <div className="parameter-selector">
          {Object.entries(parameters).map(([key, param]) => (
            <button
              key={key}
              className={`param-btn ${selectedParameter === key ? 'active' : ''}`}
              onClick={() => setSelectedParameter(key)}
              style={{ '--param-color': param.color }}
            >
              <span className="param-indicator"></span>
              {param.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chart-wrapper">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          onClick={handleCanvasClick}
        />
        
        {hoveredPoint !== null && (
          <div className="chart-tooltip">
            <div className="tooltip-header">
              {new Date(sampleData[hoveredPoint].timestamp).toLocaleString()}
            </div>
            <div className="tooltip-content">
              <div className="tooltip-item">
                <span className="tooltip-label">
                  {parameters[selectedParameter].label}:
                </span>
                <span className="tooltip-value">
                  {sampleData[hoveredPoint][selectedParameter]} {parameters[selectedParameter].unit}
                </span>
              </div>
              {sampleData[hoveredPoint].anomaly && (
                <div className="tooltip-anomaly">
                  ⚠️ Anomaly Detected
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot normal"></span>
          Normal readings
        </div>
        <div className="legend-item">
          <span className="legend-dot anomaly"></span>
          Anomalies detected
        </div>
      </div>
    </div>
  )
}

function generateSampleData() {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (99 - i) * 15 * 60 * 1000) // 15 min intervals
    
    // Generate realistic solar wind data with some variability
    const baseWind = 400 + Math.sin(i * 0.1) * 50
    const windNoise = (Math.random() - 0.5) * 100
    const solarWindSpeed = Math.max(250, baseWind + windNoise)
    
    const baseDensity = 8 + Math.sin(i * 0.15) * 3
    const densityNoise = (Math.random() - 0.5) * 4
    const protonDensity = Math.max(1, baseDensity + densityNoise)
    
    const baseTemp = 100000 + Math.sin(i * 0.08) * 50000
    const tempNoise = (Math.random() - 0.5) * 30000
    const temperature = Math.max(50000, baseTemp + tempNoise)
    
    const baseMag = 5 + Math.sin(i * 0.12) * 2
    const magNoise = (Math.random() - 0.5) * 3
    const magneticField = Math.max(0, baseMag + magNoise)
    
    // Occasionally inject anomalies
    const anomaly = Math.random() < 0.05 // 5% chance
    
    if (anomaly) {
      // Amplify values for anomalies
      data.push({
        timestamp: timestamp.toISOString(),
        solarWindSpeed: solarWindSpeed * 1.5,
        protonDensity: protonDensity * 2,
        temperature: temperature * 1.3,
        magneticField: magneticField * 2,
        anomaly: true
      })
    } else {
      data.push({
        timestamp: timestamp.toISOString(),
        solarWindSpeed,
        protonDensity,
        temperature,
        magneticField,
        anomaly: false
      })
    }
  }
  
  return data
}