import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ConfirmModal } from '../components/ConfirmModal';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { adminListUsers, adminUpdatePassword, adminDeleteUser } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function fmtDate(d) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: ptBR }); } catch { return d; }
}

export function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toasts, success, error: toastError } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await adminListUsers();
      setUsers(data);
    } catch (err) {
      toastError(err.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toastError('Senha deve ter ao menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await adminUpdatePassword(passwordTarget.id, newPassword);
      success(`Senha de ${passwordTarget.email} alterada`);
      setPasswordTarget(null);
      setNewPassword('');
    } catch (err) {
      toastError(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteUser(deleteTarget.id);
      success(`Usuário ${deleteTarget.email} excluído`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toastError(err.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1 className="page-title">Área Administrativa</h1>
          <p className="page-subtitle">Gerencie usuários cadastrados na plataforma.</p>
        </div>

        <div className="card">
          <div className="section-header">
            <span className="section-title">Usuários ({users.length})</span>
            <div className="section-actions">
              <button className="btn-secondary" onClick={loadUsers}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Atualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Cadastro</th>
                    <th>Último Login</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === user.id;
                    const initials = (u.full_name || u.email || '?')
                      .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #4edea3, #10b981)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#003824', fontSize: 11, fontWeight: 700,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.full_name || '—'}</div>
                              {isSelf && <div style={{ fontSize: 11, color: 'var(--primary)' }}>Você</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>{u.email}</td>
                        <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>{fmtDate(u.created_at)}</td>
                        <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>{fmtDate(u.last_sign_in_at)}</td>
                        <td>
                          {u.email_confirmed_at ? (
                            <span className="chip chip-profit">Confirmado</span>
                          ) : (
                            <span className="chip chip-neutral">Pendente</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn-icon"
                              onClick={() => { setPasswordTarget(u); setNewPassword(''); }}
                              title="Alterar senha"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </button>
                            {!isSelf && (
                              <button
                                className="btn-icon danger"
                                onClick={() => setDeleteTarget(u)}
                                title="Excluir usuário"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Change password modal */}
      {passwordTarget && (
        <div className="modal-overlay" onClick={() => setPasswordTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Alterar senha</h3>
            <p>
              Defina uma nova senha para <strong style={{ color: 'var(--on-surface)' }}>{passwordTarget.email}</strong>.
              O usuário poderá fazer login imediatamente com a nova senha.
            </p>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Nova Senha</label>
              <input
                className="input-field"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setPasswordTarget(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handlePasswordChange} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir ${deleteTarget?.email}? Esta ação removerá o usuário e todos os dados associados (ações, proventos, snapshots). Não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}
