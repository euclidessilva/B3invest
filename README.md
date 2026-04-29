<p align="center">
  <img src="https://img.icons8.com/color/96/stocks.png" alt="B3 Invest Logo" width="80" />
</p>

<h1 align="center">B3 Invest</h1>

<p align="center">
  <strong>📈 Gerenciador de Carteira da Bolsa de Valores Brasileira</strong>
</p>

<p align="center">
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#stack">Stack</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#uso">Uso</a> •
  <a href="#estrutura-do-projeto">Estrutura</a> •
  <a href="#contribuindo">Contribuindo</a> •
  <a href="#licença">Licença</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

---

## Sobre

**B3 Invest** é uma aplicação web full-stack para gerenciar sua carteira de ações da B3 (Bolsa de Valores brasileira). Acompanhe suas ações, visualize a evolução do patrimônio, analise a alocação da carteira e monitore seus dividendos — tudo em um dashboard moderno e responsivo.

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🔐 **Autenticação** | Login e cadastro seguros com Supabase Auth |
| 📊 **Dashboard** | KPIs da carteira, tabela de ações, gráfico de evolução patrimonial |
| ➕ **Gestão de Ações** | Adicionar, editar e remover ações com autocomplete de tickers |
| 🍩 **Alocação** | Gráfico donut e barras de distribuição por ativo e setor |
| 💰 **Proventos** | Calendário de dividendos, yield on cost, DY 12 meses |
| 📈 **Cotações em Tempo Real** | Preços atualizados via API brapi.dev |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 (SPA) |
| **Backend** | Node.js + Express |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **API Financeira** | [brapi.dev](https://brapi.dev) |
| **Gráficos** | Recharts |

---

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org) v18+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Token da [brapi.dev](https://brapi.dev) (gratuito)

### 1. Clonar o repositório

```bash
git clone https://github.com/euclidessilva/B3invest.git
cd B3invest
```

### 2. Instalar dependências

```bash
npm run install:all
```

### 3. Configurar variáveis de ambiente

```bash
# Raiz do projeto (backend)
cp .env.example .env

# Frontend (React)
cp client/.env.example client/.env
```

Preencha ambos os arquivos `.env` com suas credenciais:

| Variável | Obrigatória | Descrição |
|----------|:-:|-----------|
| `SUPABASE_URL` | ✅ | URL do seu projeto Supabase |
| `SUPABASE_ANON_KEY` | ✅ | Chave anon (pública) do Supabase |
| `SUPABASE_SERVICE_KEY` | ✅ | Chave service_role do Supabase |
| `BRAPI_TOKEN` | ✅ | Token da API brapi.dev |
| `BRAPI_PRO` | ⬜ | `true` se você tem plano pago da brapi (libera dividendos reais). Padrão `false` |
| `INVITE_KEY` | ✅ | Chave exigida para novos cadastros |
| `ADMIN_EMAILS` | ⬜ | E-mails (separados por vírgula) com acesso a `/admin` |
| `REACT_APP_API_URL` | ✅ | `http://localhost:3001` (dev) ou URL pública (prod) |
| `REACT_APP_SUPABASE_URL` | ✅ | Mesmo que `SUPABASE_URL` |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ | Mesmo que `SUPABASE_ANON_KEY` |

> 💡 **Sobre `BRAPI_PRO`** — no plano gratuito da brapi.dev, o histórico de dividendos não está disponível. Quando esta flag está `false`, o calendário de proventos exibe valores **estimados** (DY médio do setor × preço atual ÷ 4) marcados com badge `ESTIMADO`. Após assinar o plano PRO em [brapi.dev/dashboard](https://brapi.dev/dashboard), defina `BRAPI_PRO=true` para usar dados oficiais.

### 4. Configurar banco de dados (Supabase)

Execute o SQL abaixo no **SQL Editor** do Supabase:

<details>
<summary>📋 Clique para ver o script SQL</summary>

```sql
-- Tabela de ações do usuário
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

-- Tabela de dividendos
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

-- Snapshots do portfólio
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

-- Row Level Security
ALTER TABLE user_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own stocks" ON user_stocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own dividends" ON dividends
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own snapshots" ON portfolio_snapshots
  FOR ALL USING (auth.uid() = user_id);
```

</details>

---

## Uso

### Desenvolvimento

```bash
npm run dev
```

| Serviço | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend (API) | http://localhost:3001 |

### Produção

```bash
npm run build
npm start
```

O servidor Express serve o build do React e a API REST na porta `3001`.

---

## Estrutura do Projeto

```
B3invest/
├── client/                     # Frontend React
│   ├── public/                 # Assets estáticos
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── AddStockForm.jsx
│   │   │   ├── AllocationDonut.jsx
│   │   │   ├── AllocationTable.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── DividendChart.jsx
│   │   │   ├── EditStockModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PortfolioChart.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StockTable.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Allocation.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dividends.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Stocks.jsx
│   │   ├── services/           # Integrações (API, Supabase)
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── server/                     # Backend Node.js
│   ├── controllers/
│   │   ├── dividendsController.js
│   │   └── stocksController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── dividends.js
│   │   └── stocks.js
│   └── index.js
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run install:all` | Instala dependências do backend e frontend |
| `npm run dev` | Inicia backend + frontend em modo desenvolvimento |
| `npm run server` | Inicia apenas o backend (com nodemon) |
| `npm run client` | Inicia apenas o frontend React |
| `npm run build` | Gera o build de produção do frontend |
| `npm start` | Inicia o servidor em modo produção |

---

## Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. **Fork** o repositório
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um **Pull Request**

### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação, sem mudança de lógica |
| `refactor:` | Refatoração de código |
| `test:` | Testes |
| `chore:` | Manutenção geral |

---

## Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/euclidessilva">Euclides Silva</a>
</p>
