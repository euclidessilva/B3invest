const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserStocks,
  addStock,
  updateStock,
  deleteStock,
  getPortfolio,
  getQuote,
  searchTicker,
  getSnapshots,
} = require('../controllers/stocksController');

router.use(authenticate);

// Static routes BEFORE parameterized ones
router.get('/portfolio', getPortfolio);
router.get('/snapshots', getSnapshots);
router.get('/quote/:ticker', getQuote);
router.get('/search/:query', searchTicker);

router.get('/', getUserStocks);
router.post('/', addStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

module.exports = router;
