function fmtPctBR(v) {
  return (v || 0).toFixed(2).replace('.', ',') + '%';
}

export function AllocationTable({ stocks, total }) {
  const rows = stocks
    .map((s) => ({
      ticker: s.ticker,
      pct: total > 0 ? ((s.total_value || 0) / total) * 100 : 0,
      sector: s.sector || '—',
      dy: s.dy_12m || 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 30 }}></th>
            <th>Empresa</th>
            <th>%</th>
            <th>Setor</th>
            <th>DY Projetivo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.ticker}>
              <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>{i + 1}.</td>
              <td>
                <a
                  href={`https://brapi.dev/quote/${r.ticker}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(78,222,163,0.4)',
                    textUnderlineOffset: 3,
                  }}
                >
                  {r.ticker}
                </a>
              </td>
              <td style={{ fontWeight: 700 }} className="numeric">{fmtPctBR(r.pct)}</td>
              <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>{r.sector}</td>
              <td className="numeric" style={{ color: 'var(--on-surface)' }}>{fmtPctBR(r.dy)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
