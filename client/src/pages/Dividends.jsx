import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
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

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  if (!key || key === 'all') return 'Todos os meses';
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  const label = format(d, "MMMM 'de' yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Dividends() {
  const [upcoming, setUpcoming] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentMonthKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const [monthFilter, setMonthFilter] = useState(currentMonthKey);

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

  // Meses únicos com proventos (ordenados crescente)
  const availableMonths = [...new Set(upcoming.map((d) => monthKey(d.payment_date)).filter(Boolean))].sort();

  // Lista filtrada conforme seleção
  const filteredUpcoming = monthFilter === 'all'
    ? upcoming
    : upcoming.filter((d) => monthKey(d.payment_date) === monthFilter);

  // Total apenas do que está sendo exibido
  const totalFiltered = filteredUpcoming.reduce(
    (sum, d) => sum + (d.total_estimated != null ? d.total_estimated : (d.value_per_share || 0) * (d.quantity || 0)),
    0
  );

  // Janelas de pagamentos futuros
  const now = new Date();
  function windowFor(days) {
    const cutoff = new Date();
    cutoff.setDate(now.getDate() + days);
    const items = upcoming.filter((d) => {
      const pay = new Date(d.payment_date);
      return !isNaN(pay) && pay >= now && pay <= cutoff;
    });
    return {
      total: items.reduce((s, d) => s + (d.total_estimated || 0), 0),
      count: items.length,
    };
  }
  const win30 = windowFor(30);
  const win60 = windowFor(60);
  const win90 = windowFor(90);

  // Próximo pagamento (o mais cedo entre os futuros)
  const nextPayment = upcoming
    .filter((d) => {
      const pay = new Date(d.payment_date);
      return !isNaN(pay) && pay >= now;
    })
    .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))[0];

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
  const hasYield = summary.total_invested > 0 && totalEstimated > 0;
  const yieldOnCost = hasYield ? (totalEstimated * 12 / summary.total_invested) * 100 : null;
  const dy12m = summary.total_current > 0 && totalEstimated > 0
    ? (totalEstimated * 12 / summary.total_current) * 100
    : null;

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
            <div className="label-caps" style={{ marginBottom: 6 }}>Total Estimado (12m)</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--on-surface)' }}>
              {fmtBRL(totalEstimated)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              {upcoming.length} {upcoming.length === 1 ? 'pagamento previsto' : 'pagamentos previstos'}
            </div>
          </div>
        </div>

        <div className="grid-65-35">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Próximos Pagamentos */}
            <div className="card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">Próximos Pagamentos</span>
                <div className="section-actions">
                  <span className="badge badge-emerald">DADOS REAIS</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: '30 dias', win: win30 },
                  { label: '60 dias', win: win60 },
                  { label: '90 dias', win: win90 },
                ].map(({ label, win }) => (
                  <div key={label} style={{
                    background: 'var(--surface-highest)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '16px 18px',
                  }}>
                    <div className="label-caps">Próximos {label}</div>
                    <div className="numeric" style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 22, fontWeight: 800,
                      color: 'var(--primary)', marginTop: 6,
                    }}>
                      {fmtBRL(win.total)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                      {win.count} {win.count === 1 ? 'pagamento' : 'pagamentos'}
                    </div>
                  </div>
                ))}
              </div>

              {nextPayment && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="label-caps" style={{ marginBottom: 10 }}>Próximo Pagamento</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="ticker-avatar" style={{ width: 40, height: 40, fontSize: 12 }}>
                        {(nextPayment.ticker || '??').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700 }}>
                          {nextPayment.ticker}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                          {fmtDate(nextPayment.payment_date)} · {nextPayment.type}
                        </div>
                      </div>
                    </div>
                    <div className="numeric" style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 20, fontWeight: 800,
                      color: 'var(--primary)',
                    }}>
                      {fmtBRL(nextPayment.total_estimated)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendário */}
            <div className="card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">Calendário Detalhado</span>
                <div className="section-actions">
                  <select
                    className="input-field"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: 13, width: 'auto', minWidth: 200, cursor: 'pointer' }}
                  >
                    <option value="all">Todos os meses</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}{m === currentMonthKey ? ' (atual)' : ''}
                      </option>
                    ))}
                  </select>
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
                <>
                  {upcoming.some((d) => d.estimated) && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', marginBottom: 14,
                      background: 'rgba(255,180,0,0.06)',
                      border: '1px solid rgba(255,180,0,0.18)',
                      borderRadius: 8,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c14f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                        Valores marcados com <strong style={{ color: '#f5c14f' }}>ESTIMADO</strong> são projeções baseadas no DY médio do setor (preço atual × DY ÷ 4).
                        Não refletem o calendário real do ticker. Para dados oficiais, é necessário plano pago da brapi.dev.
                      </div>
                    </div>
                  )}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ticker</th>
                          <th>Data COM</th>
                          <th>Pagamento</th>
                          <th>Tipo</th>
                          <th>Valor por Ação</th>
                          <th>Qtd. Ações</th>
                          <th>Total a Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUpcoming.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--on-surface-variant)' }}>
                              Nenhum provento em {monthLabel(monthFilter)}.
                            </td>
                          </tr>
                        ) : (
                          filteredUpcoming.map((d, i) => {
                            const total = d.total_estimated != null
                              ? d.total_estimated
                              : (d.value_per_share || 0) * (d.quantity || 0);
                            return (
                              <tr key={i}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="ticker-avatar">{(d.ticker || '??').slice(0, 2)}</div>
                                    <span style={{ fontWeight: 700 }}>{d.ticker}</span>
                                    {d.estimated && (
                                      <span
                                        title="Valor estimado pelo DY médio do setor — não é dado oficial"
                                        style={{
                                          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                                          padding: '2px 6px', borderRadius: 4,
                                          background: 'rgba(255,180,0,0.12)', color: '#f5c14f',
                                          border: '1px solid rgba(255,180,0,0.2)',
                                        }}
                                      >
                                        ESTIMADO
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(d.com_date)}</td>
                                <td style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(d.payment_date)}</td>
                                <td>{typeChip(d.type)}</td>
                                <td className="numeric" style={{ color: 'var(--on-surface)' }}>
                                  {fmtBRL(d.value_per_share)}
                                </td>
                                <td className="numeric" style={{ color: 'var(--on-surface-variant)' }}>
                                  {d.quantity || '—'}
                                </td>
                                <td className="numeric" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                  {fmtBRL(total)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredUpcoming.length > 0 && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: 16, padding: '14px 12px',
                      borderTop: '1px solid rgba(78,222,163,0.15)',
                      background: 'rgba(78,222,163,0.04)', borderRadius: 8,
                    }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
                          Total em {monthLabel(monthFilter)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                          {filteredUpcoming.length} {filteredUpcoming.length === 1 ? 'provento' : 'proventos'}
                        </div>
                      </div>
                      <div className="numeric" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                        {fmtBRL(totalFiltered)}
                      </div>
                    </div>
                  )}
                </>
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
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800 }}>
                        {yieldOnCost != null ? `${yieldOnCost.toFixed(2)}%` : '—'}
                      </div>
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
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800 }}>
                        {dy12m != null ? `${dy12m.toFixed(2)}%` : '—'}
                      </div>
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

          </div>
        </div>
      </main>
    </>
  );
}
