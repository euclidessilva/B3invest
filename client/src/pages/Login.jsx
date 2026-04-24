import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-form-wrap">
          <div className="login-logo-area">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <div className="login-logo">B3 Invest</div>
            <div className="login-tagline">Sua jornada rumo à liberdade financeira começa aqui.</div>
          </div>

          <div className="login-card">
            {error && (
              <div style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--error)', marginBottom: 20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <div className="input-group">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    className="input-field"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Senha</label>
                  <a href="#forgot" className="link-emerald" onClick={(e) => e.preventDefault()}>Esqueci minha senha</a>
                </div>
                <div className="input-group" style={{ position: 'relative' }}>
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    className="input-field"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 4 }}
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Lembrar deste dispositivo
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar na plataforma →'}
              </button>
            </form>

            <div className="divider">Ou acesse com sua conta</div>

            <div className="oauth-buttons">
              <button type="button" className="btn-oauth">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="btn-oauth">
                <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-42.3-154.4-124.1c-66.4-111.1-119.3-281.4-119.3-443 0-164.6 91.1-251.6 224.8-251.6 68.7 0 133.5 45.1 178.6 45.1 43.8 0 119.7-48.2 199-48.2 0 0 67.3 5.8 113.5 56.6zm-382.7-148.1c5.8-1.3 11.6-1.9 17.4-1.9 45.1 0 83.3 22.4 111.4 57.4s42.3 79.9 42.3 124.4c0 2.6-.6 5.1-.6 7.7-47.6-1.3-93.3-24.4-124.4-60.7s-46.4-84.2-46.4-127.5c0-.6.3-.9.3-1.4z"/>
                </svg>
                Apple ID
              </button>
            </div>
          </div>

          <div className="login-signup">
            Ainda não possui uma conta?{' '}
            <Link to="/register" className="link-emerald">Criar nova conta</Link>
          </div>

          <div className="login-security">
            <div className="security-item">
              <span className="security-dot" />
              SISTEMAS B3: ONLINE
            </div>
            <div className="security-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              CRIPTOGRAFIA SSL 256-BIT
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <svg viewBox="0 0 600 800" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ opacity: 0.15 }}>
          {[...Array(8)].map((_, i) => (
            <rect
              key={i}
              x={50 + i * 68}
              y={800 - 80 - i * 60 - (i % 3) * 40}
              width={48}
              height={80 + i * 60 + (i % 3) * 40}
              rx={4}
              fill={i === 7 ? '#4edea3' : '#1e3a5f'}
            />
          ))}
          <path
            d="M50,600 C120,500 200,520 270,430 C340,340 400,380 470,280 C540,180 580,200 620,120"
            fill="none"
            stroke="#4edea3"
            strokeWidth="3"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}
