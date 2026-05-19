import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type DepartmentChartProps = {
  data: Record<string, number>;
};

const COLORS = [
  '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd',
  '#0284c7', '#0369a1', '#075985', '#0c4a6e',
];

export function DepartmentChart({ data }: DepartmentChartProps) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">データがありません</p>;
  }

  const barHeight = 36;
  const chartHeight = Math.max(entries.length * barHeight + 20, 120);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={entries}
        margin={{ top: 0, right: 20, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f0f9ff' }}
          formatter={(value) => [`${value}人`, '人数']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {entries.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
