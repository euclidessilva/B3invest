import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#76B7B2', // teal
  '#F0E5C2', // cream
  '#5778A4', // blue
  '#B05F7C', // magenta
  '#9B7BC0', // purple
  '#9DBA66', // green
  '#E8A26F', // peach
  '#D4A5A5', // dusty pink
  '#7CA3C9', // sky blue
  '#C4B07A', // olive
];

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function fmtPctBR(v) {
  return v.toFixed(2).replace('.', ',') + '%';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--surface-highest)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 4 }}>{d.ticker}</div>
      <div style={{ color: 'var(--on-surface-variant)' }}>{fmtBRL(d.value)}</div>
      <div style={{ color: 'var(--on-surface)' }}>{fmtPctBR(d.pct)}</div>
    </div>
  );
};

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, outerRadius, ticker, pct, fill }) => {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 14;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        strokeWidth={1}
        fill="none"
        opacity={0.7}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 6 : -6)}
        y={ey}
        dy={4}
        textAnchor={textAnchor}
        fill="var(--on-surface)"
        fontSize={12}
        fontFamily="Inter, sans-serif"
        fontWeight={500}
      >
        {ticker}: {fmtPctBR(pct)}
      </text>
    </g>
  );
};

export function AllocationDonut({ stocks }) {
  const total = stocks.reduce((sum, s) => sum + (s.total_value || 0), 0);
  const data = stocks
    .map((s) => ({ ticker: s.ticker, value: s.total_value || 0, pct: total > 0 ? ((s.total_value || 0) / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ height: 360, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 30, right: 100, bottom: 30, left: 100 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            stroke="var(--background)"
            strokeWidth={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
