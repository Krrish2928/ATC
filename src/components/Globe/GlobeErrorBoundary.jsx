import { Component } from 'react'

/**
 * GlobeErrorBoundary
 * Catches errors thrown by the R3F Canvas / texture loaders
 * and shows a graceful fallback instead of crashing the whole page.
 */
export default class GlobeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.warn('[GlobeErrorBoundary] Caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: '#4d9fff',
          opacity: 0.7,
        }}>
          {/* Placeholder globe outline */}
          <svg width="180" height="180" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="44" stroke="#4d9fff" strokeWidth="1.5" opacity="0.5"/>
            <ellipse cx="50" cy="50" rx="20" ry="44" stroke="#4d9fff" strokeWidth="1" opacity="0.35"/>
            <line x1="6" y1="50" x2="94" y2="50" stroke="#4d9fff" strokeWidth="1" opacity="0.35"/>
            <line x1="14" y1="30" x2="86" y2="30" stroke="#4d9fff" strokeWidth="0.7" opacity="0.25"/>
            <line x1="14" y1="70" x2="86" y2="70" stroke="#4d9fff" strokeWidth="0.7" opacity="0.25"/>
          </svg>
          <p style={{ fontSize: '0.85rem', color: '#8ba5cc', textAlign: 'center', maxWidth: 220 }}>
            Add texture files to <code style={{ color: '#4d9fff' }}>/public/textures/</code> to see the globe.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
