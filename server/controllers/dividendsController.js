const axios = require('axios');
const { fetchQuote, estimateDividendYield, quoteSector } = require('./stocksController');

const BRAPI_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

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

// Deterministic hash of ticker → consistent date offset
function tickerSeed(ticker) {
  let s = 0;
  for (let i = 0; i < ticker.length; i++) s += ticker.charCodeAt(i);
  return s;
}

async function getDividends(req, res) {
  try {
    const { data, error } = await req.supabase
      .from('dividends')
      .select('*')
      .eq('user_id', req.user.id)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDividend(req, res) {
  const { ticker, type, value_per_share, quantity, com_date, payment_date } = req.body;

  if (!ticker || !type || !value_per_share || !quantity) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const total_value = Number(value_per_share) * Number(quantity);
    const { data, error } = await req.supabase
      .from('dividends')
      .insert({
        user_id: req.user.id,
        ticker: ticker.toUpperCase(),
        type,
        value_per_share: Number(value_per_share),
        quantity: Number(quantity),
        total_value,
        com_date: com_date || null,
        payment_date: payment_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function fetchRealDividends(ticker) {
  const cacheKey = `divs:${ticker}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const { data } = await axios.get(`${BRAPI_URL}/quote/${ticker}`, {
      params: { dividends: true, token: BRAPI_TOKEN },
    });
    const list = data.results?.[0]?.dividendsData?.cashDividends || [];
    setCache(cacheKey, list);
    return list;
  } catch {
    setCache(cacheKey, []);
    return [];
  }
}

async function getUpcomingDividends(req, res) {
  try {
    const { data: stocks, error } = await req.supabase
      .from('user_stocks')
      .select('ticker, quantity')
      .eq('user_id', req.user.id);

    if (error) throw error;
    if (!stocks?.length) return res.json([]);

    const today = new Date();
    const upcoming = [];

    await Promise.all(
      stocks.map(async (stock) => {
        // 1) Try real brapi dividends data (paid plans only)
        const realDivs = await fetchRealDividends(stock.ticker);
        const future = realDivs.filter((d) => {
          const payDate = new Date(d.paymentDate || d.approvedOn);
          return !isNaN(payDate) && payDate >= today;
        });

        if (future.length) {
          future.forEach((d) => {
            upcoming.push({
              ticker: stock.ticker,
              com_date: d.lastDatePrior,
              payment_date: d.paymentDate,
              type: (d.type || 'DIVIDENDO').toUpperCase(),
              value_per_share: Number(d.rate || 0),
              quantity: stock.quantity,
              total_estimated: Number(((d.rate || 0) * stock.quantity).toFixed(2)),
            });
          });
          return;
        }

        // 2) Synthetic estimate based on sector DY
        let quote = null;
        try { quote = await fetchQuote(stock.ticker); } catch {}
        const dy = estimateDividendYield(quote);
        const price = quote?.regularMarketPrice || 0;
        if (!price) return;

        const annualDiv = (dy / 100) * price;
        const valuePerShare = annualDiv / 4; // ~quarterly

        const seed = tickerSeed(stock.ticker);
        const daysAhead = 15 + (seed % 60);
        const payDate = new Date();
        payDate.setDate(payDate.getDate() + daysAhead);
        const comDate = new Date(payDate);
        comDate.setDate(comDate.getDate() - 9);

        const sector = quoteSector(quote) || '';
        const type = /Banco/i.test(sector) ? 'JUROS SOBRE CAPITAL' : 'DIVIDENDO';

        upcoming.push({
          ticker: stock.ticker,
          com_date: comDate.toISOString().split('T')[0],
          payment_date: payDate.toISOString().split('T')[0],
          type,
          value_per_share: Number(valuePerShare.toFixed(4)),
          quantity: stock.quantity,
          total_estimated: Number((valuePerShare * stock.quantity).toFixed(2)),
          estimated: true,
        });
      })
    );

    upcoming.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));
    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getDividends, addDividend, getUpcomingDividends };
