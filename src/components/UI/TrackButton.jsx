export default function TrackButton() {
  return (
    <div className="track-button-wrapper">
      <button
        className="track-button"
        onClick={() => alert('Flight tracking coming soon!')}
        aria-label="Track your flight"
      >
        Track your flight
        <span className="track-button-arrow">→</span>
      </button>
    </div>
  )
}
