import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { DividendChart } from '../components/DividendChart';
import { EmptyState } from '../components/EmptyState';
import { getUpcomingDividends, getPortfolio } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function fmtDate(d) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return d; }
}

export function Dividends() {
  const [upcoming, setUpcoming] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [upRes, portRes] = await Promise.all([getUpcomingDividends(), getPortfolio()]);
      setUpcoming(upRes.data || []);
      setPortfolio(portRes.data);
    } catch {
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalEstimated = upcoming.reduce((sum, d) => sum + (d.total_estimated || d.value_per_share * 100), 0);

  const summary = portfolio?.summary || {};
  const stocks = portfolio?.stocks || [];

  const sectorBreakdown = (() => {
    const totalValue = stocks.reduce((s, st) => s + (st.total_value || 0), 0);
    if (!totalValue) return [];
    const groups = stocks.reduce((acc, st) => {
      const sec = st.sector || 'Outros';
      acc[sec] = (acc[sec] || 0) + (st.total_value || 0);
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([sector, value]) => ({ sector, pct: (value / totalValue) * 100 }))
      .sort((a, b) => b.pct - a.pct);
  })();
  const yieldOnCost = summary.total_invested > 0
    ? (totalEstimated * 12 / summary.total_invested) * 100
    : 8.42;
  const dy12m = summary.total_current > 0
    ? (totalEstimated * 12 / summary.total_current) * 100
    : 7.15;

  const typeChip = (type) => {
    const t = (type || '').toUpperCase();
    if (t.includes('JUROS') || t.includes('JCP')) return <span className="chip chip-blue" style={{ fontSize: 10, padding: '2px 8px' }}>JUROS SOBRE CAPITAL</span>;
    return <span className="chip chip-profit" style={{ fontSize: 10, padding: '2px 8px' }}>DIVIDENDO</span>;
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 className="page-title">Próximos Proventos</h1>
            <p className="page-subtitle">Acompanhe sua agenda de rendimentos e crescimento passivo.</p>
          </div>
          <div className="card" style={{ padding: '16px 24px', minWidth: 220 }}>
            <div className="label-caps" style={{ marginBottom: 6 }}>Total Estimado</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {fmtBRL(totalEstimated)}
              <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>+12%</span>
            </div>
          </div>
        </div>

        <div className="grid-65-35">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Evolução Mensal */}
            <div className="card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">Evolução Mensal</span>
                <div className="section-actions">
                  <span className="badge badge-emerald">2023 – 2024</span>
                </div>
              </div>
              <DividendChart />
            </div>

            {/* Calendário */}
            <div className="card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">Calendário Detalhado</span>
                <div className="section-actions">
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, color: 'var(--primary)', borderColor: 'rgba(78,222,163,0.2)' }}>
                    Ver Histórico Completo
                  </button>
                </div>
              </div>
              {loading ? (
                <div style={{ padding: 16 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <EmptyState title="Nenhum provento agendado" description="Os proventos futuros dos seus ativos aparecerão aqui." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Data COM</th>
                        <th>Pagamento</th>
                        <th>Tipo</th>
                        <th>Valor por Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((d, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="ticker-avatar">{(d.ticker || '??').slice(0, 2)}</div>
                              <span style={{ fontWeight: 700 }}>{d.ticker}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(d.com_date)}</td>
                          <td style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(d.payment_date)}</td>
                          <td>{typeChip(d.type)}</td>
                          <td className="numeric" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {fmtBRL(d.value_per_share)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Resumo Yield</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="card" style={{ padding: '14px 16px', background: 'var(--surface-highest)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Yield On Cost</div>
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800 }}>{yieldOnCost.toFixed(2)}%</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                </div>
                <div className="card" style={{ padding: '14px 16px', background: 'var(--surface-highest)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4 }}>DY 12 Meses</div>
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800 }}>{dy12m.toFixed(2)}%</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Distribuição por Setor</div>
              {sectorBreakdown.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  Adicione ações para ver a distribuição.
                </div>
              ) : (
                sectorBreakdown.map(({ sector, pct }) => (
                  <div key={sector} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{sector}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card" style={{ background: 'linear-gradient(160deg, #0d2b1a, #051424)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                  <polyline points="10,100 40,80 70,85 100,60 130,50 160,30 190,20" fill="none" stroke="#4edea3" strokeWidth="3"/>
                  <path d="M10,100 40,80 70,85 100,60 130,50 160,30 190,20 190,120 10,120Z" fill="url(#g1)" />
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="badge badge-emerald" style={{ marginBottom: 10, display: 'inline-block' }}>NOVO ANÚNCIO</span>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16, lineHeight: 1.4 }}>
                  WEGE3 anuncia Dividendos Complementares
                </div>
                <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
