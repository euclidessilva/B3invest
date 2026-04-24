import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { AddStockForm } from '../components/AddStockForm';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { addStock, getStocks, getPortfolio } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function fmtDate(d) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return d; }
}

export function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toasts, success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [stocksRes, portfolioRes] = await Promise.all([getStocks(), getPortfolio()]);
      setStocks(stocksRes.data || []);
      setTotalValue(portfolioRes.data?.summary?.total_current || 0);
    } catch {
      toastError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddStock = async (payload) => {
    try {
      await addStock(payload);
      success(`${payload.ticker} adicionado à carteira com sucesso!`);
      loadData();
    } catch (err) {
      toastError(err.response?.data?.error || 'Erro ao adicionar ação');
      throw err;
    }
  };

  const recent = [...stocks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

  return (
    <>
      <Navbar />
      <main className="page">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 className="page-title">Gestão de Ativos</h1>
            <p className="page-subtitle">Atualize sua carteira com novas posições e acompanhe o crescimento do seu patrimônio.</p>
          </div>
          <button className="btn-secondary" onClick={loadData}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Atualizar
          </button>
        </div>

        <AddStockForm onSubmit={handleAddStock} totalPortfolioValue={totalValue} />

        <div className="card" style={{ marginTop: 32 }}>
          <div className="section-header">
            <span className="section-title">Últimas Inclusões</span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '20%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 14 }}>
              Nenhuma ação adicionada ainda.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ativo</th>
                    <th>Data</th>
                    <th>Qtd</th>
                    <th>Preço Pago</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="ticker-avatar">{s.ticker.slice(0, 2)}</div>
                          <span style={{ fontWeight: 700 }}>{s.ticker}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--on-surface-variant)' }}>{fmtDate(s.purchase_date)}</td>
                      <td className="numeric">{s.quantity}</td>
                      <td className="numeric">{fmtBRL(s.average_price)}</td>
                      <td><span className="chip chip-processed">Processado</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </>
  );
}
