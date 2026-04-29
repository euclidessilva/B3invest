import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { KPICard } from '../components/KPICard';
import { StockTable } from '../components/StockTable';
import { PortfolioChart } from '../components/PortfolioChart';
import { EmptyState } from '../components/EmptyState';
import { EditStockModal } from '../components/EditStockModal';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getPortfolio, deleteStock, updateStock, getSnapshots } from '../services/api';

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function fmtPct(v) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${(v || 0).toFixed(2)}%`;
}

export function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editStock, setEditStock] = useState(null);
  const { toasts, success, error: toastError } = useToast();
  const navigate = useNavigate();

  const loadPortfolio = useCallback(async (opts = {}) => {
    try {
      const [{ data }, { data: snaps }] = await Promise.all([
        getPortfolio(opts),
        getSnapshots(2).catch(() => ({ data: [] })),
      ]);
      setPortfolio(data);
      setSnapshots(snaps || []);
    } catch (err) {
      toastError('Erro ao carregar portfólio');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPortfolio({ refresh: true });
      success('Cotações atualizadas');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  const handleDelete = async (id) => {
    try {
      await deleteStock(id);
      success('Ação removida da carteira');
      loadPortfolio();
    } catch {
      toastError('Erro ao remover ação');
    }
  };

  const handleEdit = async (id, payload) => {
    try {
      await updateStock(id, payload);
      success('Ação atualizada com sucesso');
      loadPortfolio();
    } catch {
      toastError('Erro ao atualizar ação');
    }
  };

  const stocks = portfolio?.stocks || [];
  const summary = portfolio?.summary || {};

  const assetBreakdown = (() => {
    const acoes = stocks.filter(s => !s.ticker.includes('11')).length;
    const fiis = stocks.filter(s => s.ticker.endsWith('11')).length;
    return `${acoes} Ações · ${fiis} FIIs`;
  })();

  // Variação do valor investido vs snapshot mais antigo disponível
  const investedDelta = (() => {
    if (snapshots.length < 2 || !summary.total_invested) return null;
    const oldest = snapshots[0];
    if (!oldest.total_invested || oldest.total_invested === 0) return null;
    const pct = ((summary.total_invested - oldest.total_invested) / oldest.total_invested) * 100;
    return { pct, since: oldest.snapshot_date };
  })();

  const investedSub = (() => {
    if (loading) return '';
    if (!summary.total_invested) return 'Sem dados';
    if (!investedDelta) return 'Coletando histórico...';
    const sign = investedDelta.pct >= 0 ? '+' : '';
    return `${sign}${investedDelta.pct.toFixed(2)}% desde os primeiros aportes`;
  })();

  return (
    <>
      <Navbar />
      <main className="page">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div className="page-header" style={{ margin: 0 }}>
            <h1 className="page-title">Visão Geral</h1>
            <p className="page-subtitle">Acompanhe o desempenho da sua carteira em tempo real.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="search-bar" style={{ maxWidth: 260 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input placeholder="Buscar ativos..." />
            </div>
            <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing}>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
              >
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button className="btn-primary" onClick={() => navigate('/acoes')}>
              + Adicionar Ação
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <KPICard
            label="Valor Investido"
            value={loading ? '...' : fmtBRL(summary.total_invested)}
            sub={investedSub}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            }
          />
          <KPICard
            label="Valor Atual"
            value={loading ? '...' : fmtBRL(summary.total_current)}
            sub={`Lucro: ${fmtBRL(summary.total_pnl)}`}
            positive={summary.total_pnl >= 0}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            }
          />
          <KPICard
            label="Rentabilidade Total"
            value={loading ? '...' : fmtPct(summary.total_pnl_pct)}
            positive={summary.total_pnl_pct >= 0}
            sparkline="0,20 15,14 30,18 45,10 60,6 75,2 80,4"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            }
          />
          <KPICard
            label="Quantidade de Ativos"
            value={loading ? '...' : `${summary.asset_count || 0} Ativos`}
            sub={assetBreakdown}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
          />
        </div>

        {/* Stock Table */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="section-header">
            <span className="section-title">Minhas Ações</span>
            <span className="badge badge-emerald">TOP PERFORMANCE</span>
            <div className="section-actions">
              <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filtrar
              </button>
              <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar
              </button>
            </div>
          </div>

          {!loading && stocks.length === 0 ? (
            <EmptyState
              title="Você ainda não possui ações"
              description="Adicione a primeira ação à sua carteira para começar a acompanhar o desempenho."
              cta="Adicionar primeira ação"
              ctaTo="/acoes"
            />
          ) : (
            <StockTable
              stocks={stocks}
              loading={loading}
              onDelete={handleDelete}
              onEdit={(s) => setEditStock(s)}
            />
          )}
        </div>

        {/* Bottom Grid */}
        <div className="grid-65-35">
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Evolução do Patrimônio</span>
            </div>
            <PortfolioChart />
          </div>

          <div className="card" style={{ position: 'relative' }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Destaques do Dia</span>
            </div>
            {stocks.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                Adicione ações para ver os destaques.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...stocks]
                  .sort((a, b) => Math.abs(b.change_pct || 0) - Math.abs(a.change_pct || 0))
                  .slice(0, 5)
                  .map((s, i, arr) => {
                    const positive = (s.change_pct || 0) >= 0;
                    return (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        paddingBottom: i < arr.length - 1 ? 14 : 0,
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                        <div className="ticker-avatar" style={{ width: 36, height: 36, fontSize: 11 }}>
                          {s.ticker.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700 }}>
                            {s.ticker}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fmtBRL(s.current_price)}
                          </div>
                        </div>
                        <span className={`chip ${positive ? 'chip-profit' : 'chip-loss'}`}>
                          {fmtPct(s.change_pct)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      <EditStockModal stock={editStock} open={!!editStock} onSave={handleEdit} onClose={() => setEditStock(null)} />
      <ToastContainer toasts={toasts} />
    </>
  );
}
