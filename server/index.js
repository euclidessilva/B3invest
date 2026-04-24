require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const stocksRouter = require('./routes/stocks');
const dividendsRouter = require('./routes/dividends');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/stocks', stocksRouter);
app.use('/api/dividends', dividendsRouter);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`B3 Invest server running on port ${PORT}`);
});
