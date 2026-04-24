require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const stocksRouter = require('./routes/stocks');
const dividendsRouter = require('./routes/dividends');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

// Health check (útil pro Render)
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/dividends', dividendsRouter);

// Serve React build sempre que existir (funciona em prod e standalone)
const buildPath = path.join(__dirname, '../client/build');
const indexHtml = path.join(buildPath, 'index.html');
if (fs.existsSync(indexHtml)) {
  console.log(`[server] servindo React build de ${buildPath}`);
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(indexHtml));
} else {
  console.warn(`[server] client/build não encontrado — apenas API está ativa.`);
  app.get('/', (_req, res) =>
    res.status(503).send('B3 Invest: build do React ausente. Execute "npm run build".')
  );
}

app.listen(PORT, () => {
  console.log(`B3 Invest server running on port ${PORT}`);
});
