import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await signUp(email, password, name);
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
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
            <div className="login-tagline">Crie sua conta e comece a investir melhor.</div>
          </div>

          <div className="login-card">
            {error && (
              <div style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--error)', marginBottom: 20 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--primary)', marginBottom: 20 }}>
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input className="input-field" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Senha</label>
                    <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar Senha</label>
                    <input className="input-field" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar minha conta →'}
                </button>
              </form>
            )}

            {success && (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={() => navigate('/login')}>
                Ir para o Login
              </button>
            )}
          </div>

          <div className="login-signup">
            Já possui uma conta?{' '}
            <Link to="/login" className="link-emerald">Fazer login</Link>
          </div>
        </div>
      </div>

      <div className="login-right">
        <svg viewBox="0 0 600 800" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ opacity: 0.15 }}>
          {[...Array(8)].map((_, i) => (
            <rect key={i} x={50 + i * 68} y={800 - 80 - i * 60 - (i % 3) * 40} width={48} height={80 + i * 60 + (i % 3) * 40} rx={4} fill={i === 7 ? '#4edea3' : '#1e3a5f'} />
          ))}
        </svg>
      </div>
    </div>
  );
}
