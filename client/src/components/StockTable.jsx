import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function fmtPct(v) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${(v || 0).toFixed(2)}%`;
}

export function StockTable({ stocks, onDelete, onEdit, loading }) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const PER_PAGE = 6;

  const total = stocks.length;
  const pages = Math.ceil(total / PER_PAGE);
  const slice = stocks.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '30%' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
            {[...Array(5)].map((_, j) => (
              <div key={j} className="skeleton skeleton-text" style={{ width: 80 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Empresa</th>
              <th>Qtd</th>
              <th>Preço Médio</th>
              <th>Preço Atual</th>
              <th>Variação</th>
              <th>Total Atual</th>
              <th>Lucro/Prejuízo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((s) => {
              const pnlPositive = (s.pnl || 0) >= 0;
              const varPositive = (s.change_pct || 0) >= 0;
              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ticker-avatar">
                        {s.ticker.slice(0, 2)}
                      </div>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{s.ticker}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--on-surface-variant)' }}>{s.company_name || '—'}</td>
                  <td className="numeric">{s.quantity}</td>
                  <td className="numeric">{fmtBRL(s.average_price)}</td>
                  <td className="numeric">{fmtBRL(s.current_price)}</td>
                  <td>
                    <span className={`chip ${varPositive ? 'chip-profit' : 'chip-loss'}`}>
                      {fmtPct(s.change_pct)}
                    </span>
                  </td>
                  <td className="numeric">{fmtBRL(s.total_value)}</td>
                  <td>
                    <span className="numeric" style={{ color: pnlPositive ? 'var(--primary)' : 'var(--error)', fontWeight: 700 }}>
                      {pnlPositive ? '+' : ''}{fmtBRL(s.pnl)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => onEdit(s)} title="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="btn-icon danger" onClick={() => setDeleteTarget(s)} title="Excluir">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > PER_PAGE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 12px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            Exibindo {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} de {total} ações
          </span>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>›</button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remover ação"
        message={`Tem certeza que deseja remover ${deleteTarget?.ticker} da sua carteira? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
