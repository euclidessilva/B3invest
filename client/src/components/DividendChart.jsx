import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function generateMockDividendHistory() {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      month: MONTHS[d.getMonth()],
      value: 1000 + Math.random() * 3500,
      isCurrent: i === 0,
    });
  }
  return data;
}

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

export function DividendChart() {
  const data = generateMockDividendHistory();
  const peak = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

  return (
    <div style={{ height: 260, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="dividendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtK} tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(78,222,163,0.2)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4edea3"
            strokeWidth={2.5}
            fill="url(#dividendGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#4edea3', stroke: 'var(--background)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
