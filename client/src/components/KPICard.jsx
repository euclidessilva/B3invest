export function KPICard({ label, value, sub, icon, positive, sparkline }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${positive === true ? 'text-primary' : positive === false ? 'text-error' : ''}`}>
        {value}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {sparkline && (
        <div style={{ marginTop: 4 }}>
          <svg width="80" height="24" viewBox="0 0 80 24">
            <polyline
              points={sparkline}
              fill="none"
              stroke="#4edea3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {icon && <div className="kpi-icon">{icon}</div>}
    </div>
  );
}
