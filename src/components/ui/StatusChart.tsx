import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type StatusChartProps = {
  active: number;
  leave: number;
};

const DATA_CONFIG = [
  { key: 'active', label: '稼働中', color: '#10b981' },
  { key: 'leave',  label: '休業中', color: '#f59e0b' },
];

export function StatusChart({ active, leave }: StatusChartProps) {
  const values = { active, leave };
  const data = DATA_CONFIG.filter((d) => values[d.key as keyof typeof values] > 0).map((d) => ({
    name: d.label,
    value: values[d.key as keyof typeof values],
    color: d.color,
  }));

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">データがありません</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}人`]}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
