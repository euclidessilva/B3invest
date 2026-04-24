import { useNavigate } from 'react-router-dom';

export function EmptyState({ title, description, cta, ctaTo }) {
  const navigate = useNavigate();
  return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
      <h3>{title || 'Nenhum dado encontrado'}</h3>
      <p>{description || 'Comece adicionando seus primeiros ativos à carteira.'}</p>
      {cta && ctaTo && (
        <button className="btn-primary" onClick={() => navigate(ctaTo)}>
          {cta}
        </button>
      )}
    </div>
  );
}
