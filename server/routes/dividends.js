const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDividends, addDividend, getUpcomingDividends } = require('../controllers/dividendsController');

router.use(authenticate);

router.get('/', getDividends);
router.post('/', addDividend);
router.get('/upcoming', getUpcomingDividends);

module.exports = router;
