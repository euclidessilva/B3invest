import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { AllocationDonut } from '../components/AllocationDonut';
import { AllocationTable } from '../components/AllocationTable';
import { EmptyState } from '../components/EmptyState';
import { getPortfolio, getUpcomingDividends } from '../services/api';

export function Allocation() {
  const [portfolio, setPortfolio] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [portRes, divRes] = await Promise.all([getPortfolio(), getUpcomingDividends()]);
      setPortfolio(portRes.data);
      setUpcoming(divRes.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stocks = portfolio?.stocks || [];
  const total = portfolio?.summary?.total_current || 0;

  // DY Projetivo = (proventos futuros 12m / valor atual da carteira) * 100
  const totalProventos = upcoming.reduce((sum, d) => sum + (d.total_estimated || 0), 0);
  const dyProjetivo = total > 0 ? (totalProventos / total) * 100 : 0;

  const overConcentrated = stocks.filter((s) => {
    const pct = total > 0 ? ((s.total_value || 0) / total) * 100 : 0;
    return pct > 10;
  });

  const bestPerformer = stocks.length > 0
    ? stocks.reduce((best, s) => (s.pnl_pct > best.pnl_pct ? s : best), stocks[0])
    : null;

  const sectorGroups = stocks.reduce((acc, s) => {
    const sec = s.sector || 'Outros';
    if (!acc[sec]) acc[sec] = { total: 0, count: 0 };
    acc[sec].total += s.total_value || 0;
    acc[sec].count += 1;
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1 className="page-title">Alocação</h1>
          <p className="page-subtitle">Visualize a distribuição e diversificação da sua carteira.</p>
        </div>

        {overConcentrated.length > 0 && (
          <div style={{
            background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--error)', marginBottom: 2 }}>Concentração elevada detectada</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                {overConcentrated.map(s => s.ticker).join(', ')} representam mais de 10% da carteira. Considere diversificar.
              </div>
            </div>
          </div>
        )}

        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 8 }}>Total de Setores</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
              {Object.keys(sectorGroups).length || 0}
            </div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>setores na carteira</div>
          </div>
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 8 }}>Mais Concentrado</div>
            {stocks.length > 0 ? (
              <>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                  {stocks.reduce((max, s) => {
                    const p = total > 0 ? ((s.total_value || 0) / total) * 100 : 0;
                    const mp = total > 0 ? ((max.total_value || 0) / total) * 100 : 0;
                    return p > mp ? s : max;
                  }, stocks[0])?.ticker || '—'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>maior posição individual</div>
              </>
            ) : <div style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>—</div>}
          </div>
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 8 }}>Melhor Performance</div>
            {bestPerformer ? (
              <>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                  {bestPerformer.ticker}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                  +{(bestPerformer.pnl_pct || 0).toFixed(2)}% de retorno
                </div>
              </>
            ) : <div style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>—</div>}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <span className="section-title">Distribuição da Carteira</span>
            <span
              style={{
                background: 'var(--surface-highest)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 12,
                color: 'var(--on-surface-variant)',
              }}
            >
              DY Projetivo: <strong style={{ color: 'var(--on-surface)', marginLeft: 4 }}>{dyProjetivo.toFixed(2).replace('.', ',')}%</strong>
            </span>
            <div className="section-actions">
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                Tickers
              </button>
            </div>
          </div>
          {loading ? (
            <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: 'var(--on-surface-variant)' }}>Carregando...</div>
            </div>
          ) : stocks.length === 0 ? (
            <EmptyState
              title="Nenhum ativo na carteira"
              description="Adicione ações para visualizar a distribuição de alocação."
              cta="Adicionar primeira ação"
              ctaTo="/acoes"
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              <AllocationDonut stocks={stocks} />
              <AllocationTable stocks={stocks} total={total} />
            </div>
          )}
        </div>

        {Object.keys(sectorGroups).length > 0 && (
          <div className="card">
            <div className="section-header" style={{ marginBottom: 20 }}>
              <span className="section-title">Distribuição por Setor</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(sectorGroups)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([sector, data]) => {
                  const pct = total > 0 ? (data.total / total) * 100 : 0;
                  return (
                    <div key={sector}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{sector}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
