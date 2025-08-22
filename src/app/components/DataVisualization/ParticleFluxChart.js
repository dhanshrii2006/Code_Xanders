'use client'
import { useEffect, useRef, useState } from 'react'

// ✅ Move energyBands to top-level so helpers can use it
const energyBands = [
  { min: 0.1, max: 1, label: '0.1-1 keV', color: '#ff6b35' },
  { min: 1, max: 10, label: '1-10 keV', color: '#f7931e' },
  { min: 10, max: 100, label: '10-100 keV', color: '#4dabf7' },
  { min: 100, max: 1000, label: '100-1000 keV', color: '#9775fa' },
  { min: 1000, max: 10000, label: '1-10 MeV', color: '#38a169' }
]

export default function ParticleFluxChart({ data }) {
  const canvasRef = useRef(null)
  const [viewMode, setViewMode] = useState('spectrum') // spectrum, timeline, 3d
  const [selectedEnergy, setSelectedEnergy] = useState(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    
    if (viewMode === 'spectrum') {
      drawEnergySpectrum(ctx, width, height)
    } else if (viewMode === 'timeline') {
      drawTimelineView(ctx, width, height)
    } else {
      draw3DView(ctx, width, height)
    }
  }, [data, viewMode, selectedEnergy])

  const drawEnergySpectrum = (ctx, width, height) => {
    const padding = { top: 30, right: 30, bottom: 60, left: 80 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    ctx.clearRect(0, 0, width, height)

    const spectrumData = data?.currentSpectrum || generateSpectrumData()
    
    const maxFlux = Math.max(...spectrumData.map(d => d.flux))
    const minFlux = Math.min(...spectrumData.map(d => d.flux))
    
    drawSpectrumGrid(ctx, padding, chartWidth, chartHeight, spectrumData.length, minFlux, maxFlux)
    drawSpectrumBars(ctx, padding, chartWidth, chartHeight, spectrumData, maxFlux)
    drawSpectrumLabels(ctx, padding, width, height, spectrumData)
  }

  const drawSpectrumGrid = (ctx, padding, chartWidth, chartHeight, dataLength, minFlux, maxFlux) => {
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    for (let i = 0; i <= dataLength; i++) {
      const x = padding.left + (chartWidth / dataLength) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
    }
  }

  const drawSpectrumBars = (ctx, padding, chartWidth, chartHeight, spectrumData, maxFlux) => {
    const barWidth = chartWidth / spectrumData.length * 0.8
    const barSpacing = chartWidth / spectrumData.length * 0.2

    spectrumData.forEach((dataPoint, index) => {
      const x = padding.left + (chartWidth / spectrumData.length) * index + barSpacing / 2
      const barHeight = (dataPoint.flux / maxFlux) * chartHeight
      const y = padding.top + chartHeight - barHeight

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, energyBands[index % energyBands.length].color)
      gradient.addColorStop(1, energyBands[index % energyBands.length].color + '80')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      if (selectedEnergy === index) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeRect(x - 1, y - 1, barWidth + 2, barHeight + 2)
      }

      ctx.strokeStyle = energyBands[index % energyBands.length].color
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, barWidth, barHeight)
    })
  }

  const drawSpectrumLabels = (ctx, padding, width, height, spectrumData) => {
    ctx.fillStyle = '#a0aec0'
    ctx.font = '11px Inter, sans-serif'

    const maxFlux = Math.max(...spectrumData.map(d => d.flux))
    for (let i = 0; i <= 5; i++) {
      const value = (maxFlux / 5) * (5 - i)
      const y = padding.top + (height - padding.top - padding.bottom) * (i / 5)
      
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(value.toExponential(1), padding.left - 5, y)
    }

    spectrumData.forEach((_, index) => {
      const x = padding.left + (width - padding.left - padding.right) / spectrumData.length * (index + 0.5)
      const band = energyBands[index % energyBands.length]
      
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.save()
      ctx.translate(x, height - padding.bottom + 10)
      ctx.rotate(-Math.PI / 4)
      ctx.fillText(band.label, 0, 0)
      ctx.restore()
    })

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Inter, sans-serif'
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Particle Flux (particles/cm²/s/keV)', 0, 0)
    ctx.restore()

    ctx.textAlign = 'center'
    ctx.fillText('Energy Bands', width / 2, height - 5)
  }

  const drawTimelineView = (ctx, width, height) => {
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    ctx.clearRect(0, 0, width, height)

    const timelineData = data?.timeline || generateTimelineData()
    if (!timelineData.length) return

    const minTime = new Date(timelineData[0].timestamp).getTime()
    const maxTime = new Date(timelineData[timelineData.length - 1].timestamp).getTime()
    const timeRange = maxTime - minTime || 1

    energyBands.forEach((band, bandIndex) => {
      ctx.strokeStyle = band.color
      ctx.lineWidth = 2
      ctx.beginPath()

      let firstPoint = true
      timelineData.forEach((point) => {
        if (!point.energyFlux || !point.energyFlux[bandIndex]) return

        const x = padding.left + ((new Date(point.timestamp).getTime() - minTime) / timeRange) * chartWidth
        const flux = point.energyFlux[bandIndex]
        const maxFlux = Math.max(...timelineData.flatMap(p => p.energyFlux || []))
        const y = padding.top + chartHeight - (flux / maxFlux) * chartHeight

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    })

    drawTimelineGrid(ctx, padding, chartWidth, chartHeight, minTime, maxTime)
  }

  const drawTimelineGrid = (ctx, padding, chartWidth, chartHeight, minTime, maxTime) => {
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
    }

    ctx.fillStyle = '#a0aec0'
    ctx.font = '12px Inter, sans-serif'
    for (let i = 0; i <= 6; i++) {
      const time = minTime + (maxTime - minTime) * (i / 6)
      const x = padding.left + (chartWidth / 6) * i
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const timeStr = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillText(timeStr, x, padding.top + chartHeight + 10)
    }
  }

  const draw3DView = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('3D Visualization - Coming Soon', width / 2, height / 2)
    
    draw3DGrid(ctx, width, height)
  }

  const draw3DGrid = (ctx, width, height) => {
    const centerX = width / 2
    const centerY = height / 2
    const size = Math.min(width, height) * 0.3

    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 1

    for (let i = -3; i <= 3; i++) {
      ctx.beginPath()
      ctx.moveTo(centerX - size + i * size/6, centerY - size/2)
      ctx.lineTo(centerX + size + i * size/6, centerY - size/2)
      ctx.lineTo(centerX + size/2 + i * size/6, centerY + size/2)
      ctx.lineTo(centerX - size/2 + i * size/6, centerY + size/2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(centerX - size/2, centerY - size + i * size/6)
      ctx.lineTo(centerX + size/2, centerY - size + i * size/6)
      ctx.lineTo(centerX + size, centerY - size/2 + i * size/6)
      ctx.lineTo(centerX, centerY - size/2 + i * size/6)
      ctx.stroke()
    }
  }

  const handleBarClick = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    
    const padding = { left: 80, right: 30 }
    const chartWidth = rect.width - padding.left - padding.right
    
    if (x < padding.left || x > rect.width - padding.right) return

    const spectrumData = data?.currentSpectrum || generateSpectrumData()
    const barWidth = chartWidth / spectrumData.length
    const clickedBar = Math.floor((x - padding.left) / barWidth)
    
    if (clickedBar >= 0 && clickedBar < spectrumData.length) {
      setSelectedEnergy(clickedBar === selectedEnergy ? null : clickedBar)
    }
  }

  return (
    <div className="particle-flux-container">
      <div className="flux-controls">
        <div className="view-selector">
          <button
            className={`view-btn ${viewMode === 'spectrum' ? 'active' : ''}`}
            onClick={() => setViewMode('spectrum')}
          >
            Energy Spectrum
          </button>
          <button
            className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </button>
          <button
            className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
          >
            3D Analysis
          </button>
        </div>
        
        {selectedEnergy !== null && (
          <div className="selected-energy-info">
            <span className="energy-label">
              Selected: {energyBands[selectedEnergy % energyBands.length].label}
            </span>
            <button 
              className="clear-selection"
              onClick={() => setSelectedEnergy(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="chart-wrapper">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          onClick={viewMode === 'spectrum' ? handleBarClick : undefined}
          style={{ cursor: viewMode === 'spectrum' ? 'pointer' : 'default' }}
        />
      </div>

      {viewMode === 'timeline' && (
        <div className="energy-legend">
          {energyBands.map((band, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color"
                style={{ backgroundColor: band.color }}
              ></span>
              <span className="legend-label">{band.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flux-stats">
        <div className="stat-item">
          <span className="stat-label">Total Flux:</span>
          <span className="stat-value">
            {(data?.totalFlux || 1.2e6).toExponential(2)} particles/cm²/s
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Peak Energy:</span>
          <span className="stat-value">
            {data?.peakEnergy || '10-100'} keV
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Anisotropy:</span>
          <span className="stat-value">
            {data?.anisotropy || 0.15}
          </span>
        </div>
      </div>
    </div>
  )
}

// ✅ These helpers now work because energyBands is global
function generateSpectrumData() {
  return energyBands.map((band, index) => ({
    energyBand: band,
    flux: Math.pow(10, 6 - index * 0.8) * (0.8 + Math.random() * 0.4)
  }))
}

function generateTimelineData() {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - (49 - i) * 30 * 60 * 1000)
    const energyFlux = energyBands.map((_, index) => 
      Math.pow(10, 6 - index * 0.8) * (0.7 + Math.random() * 0.6)
    )
    
    data.push({
      timestamp: timestamp.toISOString(),
      energyFlux
    })
  }
  
  return data
}