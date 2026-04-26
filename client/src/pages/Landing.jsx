import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            B3 Invest
          </Link>
          <div className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary">Acessar plataforma →</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Entrar</Link>
                <Link to="/register" className="btn-primary">Criar conta</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
        </div>
        <div className="landing-container">
          <span className="badge badge-emerald" style={{ marginBottom: 20 }}>● PLATAFORMA EM ATIVIDADE</span>
          <h1 className="landing-h1">
            Sua carteira da <span className="text-primary">B3</span><br />
            organizada com elegância.
          </h1>
          <p className="landing-sub">
            Acompanhe valor investido, lucro/prejuízo, alocação e proventos<br />
            em tempo real — tudo em um único dashboard.
          </p>
          <div className="landing-cta-row">
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ padding: '16px 32px', fontSize: 15 }}>
                Acessar minha carteira →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: 15 }}>
                  Começar agora →
                </Link>
                <Link to="/login" className="btn-secondary" style={{ padding: '16px 32px', fontSize: 15 }}>
                  Já tenho conta
                </Link>
              </>
            )}
          </div>

          {/* Hero preview chart */}
          <div className="landing-preview">
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-dot red" />
                <span className="preview-dot yellow" />
                <span className="preview-dot green" />
                <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--on-surface-variant)' }}>b3invest.app/dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-kpis">
                  {[
                    { label: 'VALOR INVESTIDO', val: 'R$ 142.450,00', sub: '+2,4% vs mês anterior' },
                    { label: 'VALOR ATUAL', val: 'R$ 158.922,45', sub: 'Lucro: R$ 16.472', primary: true },
                    { label: 'RENTABILIDADE', val: '+11,56%', primary: true },
                    { label: 'ATIVOS', val: '18', sub: '12 Ações · 4 FIIs' },
                  ].map((k, i) => (
                    <div key={i} className="preview-kpi">
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{k.label}</div>
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: k.primary ? 'var(--primary)' : 'var(--on-surface)', marginTop: 4 }}>{k.val}</div>
                      {k.sub && <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginTop: 2 }}>{k.sub}</div>}
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 400 100" style={{ width: '100%', height: 80, marginTop: 16 }}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q50,60 100,55 T200,40 T300,30 T400,15 L400,100 L0,100 Z" fill="url(#heroGrad)"/>
                  <path d="M0,80 Q50,60 100,55 T200,40 T300,30 T400,15" fill="none" stroke="#4edea3" strokeWidth="2.5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="label-caps" style={{ color: 'var(--primary)' }}>Funcionalidades</span>
            <h2 className="landing-h2">Tudo que um investidor da B3 precisa</h2>
            <p className="landing-section-sub">
              Cotações em tempo real, análise visual de alocação e calendário de proventos.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
                title: 'Dashboard em Tempo Real',
                desc: 'KPIs de valor investido, valor atual, rentabilidade e quantidade de ativos. Cotações da brapi.dev atualizadas a cada 5 minutos.',
              },
              {
                icon: <><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
                title: 'Alocação Visual',
                desc: 'Pie chart com labels externos, barras de progresso por ativo e por setor. Detecta automaticamente concentrações acima de 10%.',
              },
              {
                icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
                title: 'Calendário de Proventos',
                desc: 'Próximos dividendos e JCP listados por ticker. Yield on Cost e DY 12 meses calculados automaticamente.',
              },
              {
                icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
                title: 'Histórico de Patrimônio',
                desc: 'Snapshots diários da sua carteira para visualizar a evolução mês a mês — sem depender de planos pagos.',
              },
              {
                icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
                title: 'Privacidade por Padrão',
                desc: 'Row Level Security do Supabase: cada usuário só enxerga suas próprias ações. Cadastro restrito por chave de convite.',
              },
              {
                icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
                title: '100% Gratuito',
                desc: 'Open source, sem mensalidades, sem upsell. Você tem total controle dos seus dados — basta configurar o Supabase.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="label-caps" style={{ color: 'var(--primary)' }}>Como funciona</span>
            <h2 className="landing-h2">Em 3 passos simples</h2>
          </div>

          <div className="steps-grid">
            {[
              { n: '01', t: 'Crie sua conta', d: 'Solicite uma chave de convite ao administrador e cadastre-se em segundos.' },
              { n: '02', t: 'Adicione suas ações', d: 'Use o autocomplete de tickers da B3 para registrar cada compra com data e preço médio.' },
              { n: '03', t: 'Acompanhe em tempo real', d: 'Dashboard, alocação e proventos sempre atualizados. Snapshot diário do patrimônio.' },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3 className="step-title">{s.t}</h3>
                <p className="step-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 className="landing-h2">Pronto para organizar sua carteira?</h2>
          <p className="landing-section-sub" style={{ marginBottom: 32 }}>
            Comece agora — leva menos de um minuto.
          </p>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '16px 36px', fontSize: 15 }}>
              Ir para o Dashboard →
            </Link>
          ) : (
            <Link to="/register" className="btn-primary" style={{ padding: '16px 36px', fontSize: 15 }}>
              Criar minha conta gratuita →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: 'var(--on-surface)' }}>B3 Invest</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
              Cotações fornecidas por <a href="https://brapi.dev" target="_blank" rel="noreferrer" className="link-emerald">brapi.dev</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
