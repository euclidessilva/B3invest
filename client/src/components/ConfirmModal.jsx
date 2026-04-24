export function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title || 'Confirmar ação'}</h3>
        <p>{message || 'Tem certeza que deseja continuar?'}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              background: 'rgba(255,180,171,0.15)',
              border: '1px solid rgba(255,180,171,0.3)',
              color: 'var(--error)',
              borderRadius: 8, padding: '10px 20px',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
