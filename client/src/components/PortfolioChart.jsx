import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSnapshots } from '../services/api';

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function fmtK(v) {
  if (v >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${v.toFixed(0)}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-highest)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
      </div>
    </div>
  );
};

// Group daily snapshots by month — keep last value of each month
function aggregateByMonth(snapshots) {
  const buckets = new Map();
  snapshots.forEach((s) => {
    const d = new Date(s.snapshot_date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    const existing = buckets.get(key);
    if (!existing || new Date(s.snapshot_date) > new Date(existing.snapshot_date)) {
      buckets.set(key, s);
    }
  });

  const sorted = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([key, s]) => {
    const monthIdx = parseInt(key.split('-')[1]);
    return {
      month: MONTHS[monthIdx],
      value: Number(s.total_value),
    };
  });
}

export function PortfolioChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnapshots(12)
      .then(({ data: snaps }) => setData(aggregateByMonth(snaps)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: 180 }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', gap: 8 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          Coletando histórico do seu patrimônio.<br />
          A evolução aparecerá aqui após alguns dias de uso.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barSize={40}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtK} tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(78,222,163,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#4edea3' : 'rgba(78,222,163,0.35)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
