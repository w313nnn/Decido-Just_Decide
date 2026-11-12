export function DecidoLoader({ label = 'Loading Decido…' }: { label?: string }) {
  return (
    <div className="decido-loading-overlay">
    <div className="decido-loader" role="status">
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="37" className="loader-track" />
        <g className="loader-plate">
          <circle cx="50" cy="50" r="22" className="loader-rim" />
          <circle cx="50" cy="50" r="16" className="loader-well" />
          <path d="m42 50 5 5 11-11" className="loader-check" />
        </g>
        <g className="loader-orbit" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <g transform="translate(50 13) rotate(90)">
            <ellipse cy="-6" rx="4" ry="6" fill="currentColor" />
            <path d="M0 0v13" />
          </g>
          <g transform="translate(50 87) rotate(-90)">
            <path d="M-4-12v6a4 4 0 0 0 8 0v-6M0-12v25" />
          </g>
        </g>
      </svg>
      <span>{label}</span>
    </div>
    </div>
  );
}
