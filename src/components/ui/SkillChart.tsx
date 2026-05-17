import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type SkillChartProps = {
  data: { skill: string; count: number }[];
};

export function SkillChart({ data }: SkillChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">データがありません</p>;
  }

  const barHeight = 36;
  const chartHeight = Math.max(data.length * barHeight + 20, 120);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 32, left: 8, bottom: 0 }}
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
          dataKey="skill"
          width={120}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f0f9ff' }}
          formatter={(value: number) => [`${value}人`, '人数']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
