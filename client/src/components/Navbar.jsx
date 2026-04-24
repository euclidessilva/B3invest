import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="nav-logo">B3 Invest</NavLink>

        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/acoes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Ações
          </NavLink>
          <NavLink to="/alocacao" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Alocação
          </NavLink>
          <NavLink to="/proventos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Proventos
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: '#ffb4ab' }}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          <button className="btn-icon" title="Notificações" aria-label="Notificações">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="btn-icon" title="Configurações" aria-label="Configurações">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4edea3, #10b981)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#003824', fontSize: 13, fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {initials}
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '42px', right: 0,
                background: 'var(--surface-highest)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px 0',
                minWidth: 160, zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Conectado como</div>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%', padding: '8px 16px', background: 'transparent',
                    border: 'none', color: 'var(--error)', cursor: 'pointer',
                    fontSize: 13, textAlign: 'left', fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,180,171,0.08)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
