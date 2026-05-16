type DepartmentChartProps = {
  data: Record<string, number>;
};

export function DepartmentChart({ data }: DepartmentChartProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="text-sm text-gray-700">データがありません</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 text-left font-medium text-gray-700">部署</th>
          <th className="py-2 text-right font-medium text-gray-700">人数</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([dept, count]) => (
          <tr key={dept} className="border-b border-gray-100">
            <td className="py-2 text-gray-900">{dept}</td>
            <td className="py-2 text-right text-gray-900">{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
