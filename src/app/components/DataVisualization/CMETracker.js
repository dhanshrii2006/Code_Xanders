// components/DataVisualization/CMETracker.js
'use client'
import { useEffect, useRef, useState } from 'react'

export default function CMETracker({ data }) {
  const canvasRef = useRef(null)
  const [selectedCME, setSelectedCME] = useState(null)
  const [showTrajectories, setShowTrajectories] = useState(true)
  const [animationFrame, setAnimationFrame] = useState(0)

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
    
    drawCMEVisualization(ctx, width, height)
  }, [data, selectedCME, showTrajectories, animationFrame])

  useEffect(() => {
    // Animation loop for real-time updates
    const interval = setInterval(() => {
      setAnimationFrame(frame => frame + 1)
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  const drawCMEVisualization = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.4

    // Draw sun at center
    drawSun(ctx, centerX, centerY, 15)
    
    // Draw orbital paths
    drawOrbitalPaths(ctx, centerX, centerY, maxRadius)
    
    // Draw Earth's position
    drawEarth(ctx, centerX + maxRadius * 0.8, centerY, 8)
    
    // Draw Aditya-L1 position
    drawAdityaL1(ctx, centerX + maxRadius * 0.85, centerY, 5)
    
    // Get CME data or generate sample
    const cmeData = data?.activeCMEs || generateSampleCMEs()
    
    // Draw CMEs
    cmeData.forEach((cme, index) => {
      drawCME(ctx, centerX, centerY, maxRadius, cme, index === selectedCME)
    })
    
    // Draw legends and info
    drawLegend(ctx, width, height)
  }

  const drawSun = (ctx, x, y, radius) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, '#fff700')
    gradient.addColorStop(0.7, '#ff6b35')
    gradient.addColorStop(1, '#ff4500')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()

    // corona lines
    ctx.strokeStyle = '#fff70040'
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const startRadius = radius + 5
      const endRadius = radius + 15
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(angle) * startRadius, y + Math.sin(angle) * startRadius)
      ctx.lineTo(x + Math.cos(angle) * endRadius, y + Math.sin(angle) * endRadius)
      ctx.stroke()
    }
  }

  const drawEarth = (ctx, x, y, radius) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, '#4dabf7')
    gradient.addColorStop(0.6, '#2c5aa0')
    gradient.addColorStop(1, '#1a365d')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Earth', x, y + radius + 15)
  }

  const drawAdityaL1 = (ctx, x, y, radius) => {
    ctx.fillStyle = '#9775fa'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.strokeStyle = '#9775fa'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - radius - 5, y - 2)
    ctx.lineTo(x - radius - 5, y + 2)
    ctx.moveTo(x + radius + 5, y - 2)
    ctx.lineTo(x + radius + 5, y + 2)
    ctx.stroke()
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Aditya-L1', x, y + radius + 15)
  }

  const drawOrbitalPaths = (ctx, centerX, centerY, maxRadius) => {
    ctx.strokeStyle = '#4a556840'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * 0.8, 0, 2 * Math.PI)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * 0.85, 0, 2 * Math.PI)
    ctx.stroke()
    
    ctx.setLineDash([])
  }

  const drawCME = (ctx, centerX, centerY, maxRadius, cme, isSelected) => {
    const angle = (cme.direction * Math.PI) / 180
    const speed = cme.speed || 1
    const progress = ((animationFrame * speed) % 100) / 100
    const distance = progress * maxRadius

    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance

    ctx.fillStyle = isSelected ? '#ff0000' : '#ffa94d'
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, 2 * Math.PI)
    ctx.fill()

    if (showTrajectories) {
      ctx.strokeStyle = '#ffa94d60'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const drawLegend = (ctx, width, height) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'left'

    ctx.fillText('☀ Sun', 20, height - 60)
    ctx.fillText('🌍 Earth', 20, height - 40)
    ctx.fillText('🛰 Aditya-L1', 20, height - 20)
  }

  const generateSampleCMEs = () => {
    return [
      { id: 1, direction: 45, speed: 1.5 },
      { id: 2, direction: 120, speed: 1.2 },
      { id: 3, direction: 200, speed: 0.8 },
    ]
  }

  return (
    <div style={{ width: '100%', height: '500px', background: '#0b0c10' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
