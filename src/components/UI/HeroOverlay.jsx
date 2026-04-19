import { useState, useEffect } from 'react'

export default function HeroOverlay({ isZoomed, onZoomClick }) {
  const words = ["Monitor", "Track", "Control", "Protect"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3100) // 2.5s display + 0.6s transition
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`main-layout ${isZoomed ? 'fade-hidden' : ''}`}>
      <div className="hero-content">
        <div className="subtitle-line">Air Traffic Control</div>
        <h1 className="hero-title">ATC</h1>
        
        <h2 className="hero-subtitle">
          We <span className="cycling-word">{words[index]}</span> the skies.
        </h2>

        <p className="hero-desc">
          Experience real-time global flight tracking visualized locally on a premium 
          interactive 3D globe. Monitoring worldwide aeronautical data gracefully.
        </p>

        <div className="button-group">
          <button className="btn-primary" onClick={onZoomClick}>
            Track your flight →
          </button>
          <button className="btn-outline">
            Watch Demo ▷
          </button>
        </div>
      </div>
      {/* Right column empty — reserves space for Globe under CSS grid */}
      <div className="hero-globe-space" />
    </div>
  )
}

