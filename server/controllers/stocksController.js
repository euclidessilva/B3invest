const axios = require('axios');

const BRAPI_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

// Simple in-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

const BRAPI_PRO = process.env.BRAPI_PRO === 'true';

async function fetchQuote(ticker, force = false) {
  if (!force) {
    const cached = getCached(`quote:${ticker}`);
    if (cached) return cached;
  }

  const params = { token: BRAPI_TOKEN, modules: 'summaryProfile' };
  // Inclui histórico de dividendos apenas em planos pagos da brapi
  if (BRAPI_PRO) params.dividends = true;

  const { data } = await axios.get(`${BRAPI_URL}/quote/${ticker}`, { params });

  const result = data.results?.[0] || null;
  if (result) setCache(`quote:${ticker}`, result);
  return result;
}

function quoteSector(quote) {
  return quote?.summaryProfile?.industry || quote?.summaryProfile?.sector || null;
}

// Trailing 12-month dividend yield estimate per ticker.
// brapi free plan doesn't expose dividend data, so we use a sector-based
// historical average as a reasonable proxy. Returns percentage.
const SECTOR_DY_AVG = {
  // brapi industry classifications
  'Bancos Diversificados': 6.8,
  'Bancos Regionais': 6.5,
  'Seguradoras': 9.5,
  'Energia Elétrica': 8.0,
  'Petróleo e Gás Integrado': 11.0,
  'Exploração e/ou Refino': 10.5,
  'Distribuição de Combustíveis': 7.5,
  'Mineração': 8.0,
  'Minerais Metálicos': 8.0,
  'Siderurgia': 5.5,
  'Telecomunicações': 6.0,
  'Imóveis': 7.0,
  'Bens de Consumo': 4.0,
  'Varejo': 3.5,
  'Saúde': 2.5,
  'Tecnologia': 2.0,
  // brapi sector fallbacks
  'Serviços Financeiros': 7.0,
  'Energia': 8.0,
  'Materiais Básicos': 6.5,
  'Bens de Consumo Cíclicos': 4.0,
  'Bens de Consumo Não Cíclicos': 4.5,
  'Saúde Médica': 2.5,
  'Imobiliário': 7.0,
  'Tecnologia da Informação': 2.0,
  'Serviços de Comunicação': 5.5,
  'Industriais': 4.5,
  'Utilidade Pública': 8.5,
};

function estimateDividendYield(quote) {
  // Try real data first (paid plans only)
  if (quote?.dividendsData?.cashDividends?.length && quote?.regularMarketPrice) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const sum = quote.dividendsData.cashDividends
      .filter((d) => d.paymentDate && new Date(d.paymentDate) >= oneYearAgo)
      .reduce((acc, d) => acc + (d.rate || 0), 0);
    return (sum / quote.regularMarketPrice) * 100;
  }
  // Fallback: industry/sector-based average
  const industry = quote?.summaryProfile?.industry;
  const sector = quote?.summaryProfile?.sector;
  return SECTOR_DY_AVG[industry] || SECTOR_DY_AVG[sector] || 5.0;
}

async function getUserStocks(req, res) {
  try {
    const { data, error } = await req.supabase
      .from('user_stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addStock(req, res) {
  const { ticker, quantity, average_price, purchase_date } = req.body;

  if (!ticker || !quantity || !average_price || !purchase_date) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    let company_name = ticker;
    let sector = null;

    try {
      const quote = await fetchQuote(ticker.toUpperCase());
      if (quote) {
        company_name = quote.longName || quote.shortName || ticker;
        sector = quote.sector || null;
      }
    } catch {}

    // Check if ticker already exists for user — update average price
    const { data: existing } = await req.supabase
      .from('user_stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('ticker', ticker.toUpperCase())
      .single();

    if (existing) {
      const totalQty = existing.quantity + Number(quantity);
      const newAvgPrice =
        (existing.quantity * existing.average_price + Number(quantity) * Number(average_price)) /
        totalQty;

      const { data, error } = await req.supabase
        .from('user_stocks')
        .update({
          quantity: totalQty,
          average_price: Number(newAvgPrice.toFixed(2)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    const { data, error } = await req.supabase
      .from('user_stocks')
      .insert({
        user_id: req.user.id,
        ticker: ticker.toUpperCase(),
        company_name,
        quantity: Number(quantity),
        average_price: Number(average_price),
        purchase_date,
        sector,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateStock(req, res) {
  const { id } = req.params;
  const { quantity, average_price, purchase_date } = req.body;

  try {
    const { data, error } = await req.supabase
      .from('user_stocks')
      .update({
        quantity: Number(quantity),
        average_price: Number(average_price),
        purchase_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Ação não encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteStock(req, res) {
  const { id } = req.params;

  try {
    const { error } = await req.supabase
      .from('user_stocks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPortfolio(req, res) {
  try {
    const { data: stocks, error } = await req.supabase
      .from('user_stocks')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    if (!stocks.length) return res.json({ stocks: [], summary: {} });

    const tickers = [...new Set(stocks.map((s) => s.ticker))];
    const quotes = {};

    const forceRefresh = req.query.refresh === 'true';

    // brapi free plan limits to 1 ticker per request — fetch individually in parallel
    await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const quote = await fetchQuote(ticker, forceRefresh);
          if (quote) quotes[ticker] = quote;
        } catch (err) {
          console.error(`[brapi] Erro ao buscar ${ticker}:`, err.response?.data || err.message);
        }
      })
    );

    let totalInvested = 0;
    let totalCurrent = 0;

    const enriched = stocks.map((s) => {
      const quote = quotes[s.ticker] || {};
      const currentPrice = quote.regularMarketPrice || s.average_price;
      const totalCost = s.quantity * s.average_price;
      const totalValue = s.quantity * currentPrice;
      const pnl = totalValue - totalCost;
      const pnlPct = (pnl / totalCost) * 100;

      totalInvested += totalCost;
      totalCurrent += totalValue;

      return {
        ...s,
        current_price: currentPrice,
        total_cost: totalCost,
        total_value: totalValue,
        pnl,
        pnl_pct: pnlPct,
        company_name: s.company_name || quote.longName || quote.shortName || s.ticker,
        sector: quoteSector(quote) || s.sector || null,
        change_pct: quote.regularMarketChangePercent || 0,
        dy_12m: estimateDividendYield(quote),
      };
    });

    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Save daily snapshot (upsert by user_id + snapshot_date)
    if (totalCurrent > 0) {
      const today = new Date().toISOString().split('T')[0];
      try {
        await req.supabase
          .from('portfolio_snapshots')
          .upsert(
            {
              user_id: req.user.id,
              snapshot_date: today,
              total_invested: Number(totalInvested.toFixed(2)),
              total_value: Number(totalCurrent.toFixed(2)),
              total_pnl: Number(totalPnl.toFixed(2)),
              asset_count: stocks.length,
            },
            { onConflict: 'user_id,snapshot_date' }
          );
      } catch (err) {
        console.error('[snapshot] erro ao salvar:', err.message);
      }
    }

    res.json({
      stocks: enriched,
      summary: {
        total_invested: totalInvested,
        total_current: totalCurrent,
        total_pnl: totalPnl,
        total_pnl_pct: totalPnlPct,
        asset_count: stocks.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSnapshots(req, res) {
  const months = Math.min(parseInt(req.query.months) || 12, 36);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  try {
    const { data, error } = await req.supabase
      .from('portfolio_snapshots')
      .select('snapshot_date, total_invested, total_value, total_pnl')
      .eq('user_id', req.user.id)
      .gte('snapshot_date', cutoffStr)
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getQuote(req, res) {
  const { ticker } = req.params;
  try {
    const quote = await fetchQuote(ticker.toUpperCase());
    if (!quote) return res.status(404).json({ error: 'Ticker não encontrado' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function searchTicker(req, res) {
  const { query } = req.params;
  try {
    const cached = getCached(`search:${query}`);
    if (cached) return res.json(cached);

    const { data } = await axios.get(`${BRAPI_URL}/quote/list`, {
      params: { search: query, limit: 10, token: BRAPI_TOKEN },
    });

    const result = data.stocks || [];
    setCache(`search:${query}`, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUserStocks, addStock, updateStock, deleteStock, getPortfolio, getQuote, searchTicker,
  getSnapshots, fetchQuote, estimateDividendYield, quoteSector,
};
