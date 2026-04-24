# B3 Invest

Gerenciador de carteira da Bolsa de Valores brasileira (B3/Bovespa).

## Stack

- **Frontend:** React 18 (SPA)
- **Backend:** Node.js + Express
- **Banco de dados:** Supabase (PostgreSQL)
- **API financeira:** brapi.dev
- **Autenticação:** Supabase Auth
- **Gráficos:** Recharts

## Setup

### 1. Clonar e instalar

```bash
git clone <repo>
cd b3invest
npm run install:all
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha no `.env`:
- `SUPABASE_URL` — URL do seu projeto Supabase
- `SUPABASE_ANON_KEY` — Chave anon do Supabase
- `SUPABASE_SERVICE_KEY` — Chave service_role do Supabase
- `BRAPI_TOKEN` — Token da brapi.dev (obtenha em brapi.dev)
- `REACT_APP_SUPABASE_URL` — Mesmo que SUPABASE_URL
- `REACT_APP_SUPABASE_ANON_KEY` — Mesmo que SUPABASE_ANON_KEY
- `REACT_APP_API_URL` — http://localhost:3001 (dev) ou URL de produção

### 3. Banco de dados (Supabase)

Execute no SQL Editor do Supabase:

```sql
CREATE TABLE user_stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  company_name VARCHAR(100),
  quantity INTEGER NOT NULL,
  average_price DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  sector VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dividends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  type VARCHAR(30) NOT NULL,
  value_per_share DECIMAL(10,4) NOT NULL,
  quantity INTEGER NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  com_date DATE,
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own stocks" ON user_stocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own dividends" ON dividends
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_invested DECIMAL(14,2) NOT NULL,
  total_value DECIMAL(14,2) NOT NULL,
  total_pnl DECIMAL(14,2) NOT NULL,
  asset_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own snapshots" ON portfolio_snapshots
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Token brapi.dev

Crie conta em [brapi.dev](https://brapi.dev) e obtenha seu token gratuito.

## Executar

### Desenvolvimento

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Produção

```bash
npm run build
npm start
```

O servidor Express serve o build do React e a API na porta 3001.

## Funcionalidades

- **Autenticação** — Login/cadastro com Supabase Auth
- **Dashboard** — KPIs da carteira, tabela de ações, gráfico de patrimônio
- **Ações** — Adicionar/editar/remover ações com autocomplete de tickers
- **Alocação** — Gráfico donut e barras de distribuição por ativo e setor
- **Proventos** — Calendário de dividendos, yield on cost, DY 12 meses
