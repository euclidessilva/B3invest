import { useState, useEffect } from 'react';

export function EditStockModal({ stock, open, onSave, onClose }) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stock) {
      setQuantity(String(stock.quantity));
      setPrice(String(stock.average_price));
      setDate(stock.purchase_date?.split('T')[0] || '');
    }
  }, [stock]);

  if (!open || !stock) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(stock.id, { quantity: Number(quantity), average_price: Number(price), purchase_date: date });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Editar {stock.ticker}</h3>
        <p>Atualize a posição desta ação na sua carteira.</p>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Quantidade</label>
          <input className="input-field" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Preço Médio (R$)</label>
          <input className="input-field" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Data da Compra</label>
          <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
