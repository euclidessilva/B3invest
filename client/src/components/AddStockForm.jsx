import { useState, useEffect, useRef } from 'react';
import { searchTicker, getQuote } from '../services/api';

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

const POPULAR = ['PETR4', 'VALE3', 'BBAS3', 'ITUB4', 'WEGE3'];

export function AddStockForm({ onSubmit, totalPortfolioValue = 0 }) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const searchTimeout = useRef(null);
  const wrapRef = useRef(null);

  const costEstimate = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);
  const allocationImpact = totalPortfolioValue > 0
    ? (costEstimate / (totalPortfolioValue + costEstimate)) * 100
    : costEstimate > 0 ? 100 : 0;

  useEffect(() => {
    if (ticker.length < 2) { setSuggestions([]); return; }
    clearTimeout(searchTimeout.current);
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await searchTicker(ticker);
        setSuggestions(data.slice(0, 8));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [ticker]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectTicker = async (sym) => {
    setTicker(sym);
    setShowSuggestions(false);
    setSuggestions([]);
    try {
      const { data } = await getQuote(sym);
      setCurrentQuote(data);
      if (!price) setPrice(data.regularMarketPrice?.toFixed(2) || '');
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker || !quantity || !price || !date) return;
    setSubmitting(true);
    try {
      await onSubmit({ ticker: ticker.toUpperCase(), quantity: Number(quantity), average_price: Number(price), purchase_date: date });
      setTicker(''); setQuantity(''); setPrice(''); setDate(''); setCurrentQuote(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr', gap: 20, alignItems: 'start' }}>
      {/* Left: Form */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ color: 'var(--primary)', fontSize: 20 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Adicionar Ação</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Busca de Ticker</label>
            <div className="autocomplete-wrapper" ref={wrapRef}>
              <div className="input-group">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="input-field"
                  value={ticker}
                  onChange={(e) => { setTicker(e.target.value.toUpperCase()); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Ex: PETR4, VALE3, ITUB4..."
                  autoComplete="off"
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {suggestions.map((s) => (
                    <div key={s.stock} className="autocomplete-item" onMouseDown={() => selectTicker(s.stock)}>
                      <div className="ticker-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{s.stock.slice(0, 2)}</div>
                      <div>
                        <div className="ticker-sym">{s.stock}</div>
                        <div className="ticker-name">{s.name || s.stock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {POPULAR.map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => selectTicker(p)}
                  style={{
                    background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.2)',
                    color: 'var(--primary)', borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {p === 'PETR4' ? 'POPULAR: ' : ''}{p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input className="input-field" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Data da Compra</label>
              <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preço Pago por Ação (R$)</label>
            <div className="input-group has-prefix">
              <span className="input-prefix">R$</span>
              <input
                className="input-field"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            {currentQuote && (
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 6 }}>
                Preço atual de mercado: <span style={{ color: 'var(--primary)' }}>{fmtBRL(currentQuote.regularMarketPrice)}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={submitting}>
            {submitting ? (
              'Processando...'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Adicionar à Carteira
              </>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 12 }}>
            Os dados serão processados e refletidos no seu Dashboard em instantes.
          </p>
        </form>
      </div>

      {/* Right: Summary + Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <div className="label-caps" style={{ marginBottom: 16 }}>Resumo da Operação</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Custo Total Estimado</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16 }} className="numeric">{fmtBRL(costEstimate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Taxas de Corretagem (B3)</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16 }} className="numeric">{fmtBRL(0)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Impacto na Alocação</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 16 }}>+{allocationImpact.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <InsightsCard />
      </div>
    </div>
  );
}

function InsightsCard() {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay();
  const isOpen = day >= 1 && day <= 5 && h >= 9 && h < 18;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', minHeight: 200 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        <svg viewBox="0 0 300 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          {[50,80,60,90,70,110,85,130,100,150].map((y, i) => (
            <g key={i}>
              <rect x={i * 28 + 10} y={y} width={10} height={4} fill={y > 100 ? '#ef4444' : '#22c55e'} opacity={0.8} />
              <line x1={i * 28 + 10} y1={y - 10} x2={i * 28 + 10} y2={y + 14} stroke={y > 100 ? '#ef4444' : '#22c55e'} strokeWidth={2} />
            </g>
          ))}
        </svg>
      </div>
      <div style={{ position: 'relative' }}>
        <span className={`market-status ${isOpen ? 'market-open' : 'market-closed'}`}>
          {isOpen ? 'Mercado Aberto' : 'Mercado Fechado'}
        </span>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, marginTop: 12, marginBottom: 10 }}>
          Insights em Tempo Real
        </div>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 14 }}>
          Mantenha sua carteira diversificada. O B3 Invest recomenda não concentrar mais de 10% do seu capital em um único ticker.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Dica de Gestão</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Considere o Preço Médio (PM) antes de aportar.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
