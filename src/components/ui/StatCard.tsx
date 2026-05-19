type StatCardProps = {
  label: string;
  value: number;
  accent?: boolean;
};

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ring-1 ${
      accent
        ? 'bg-sky-500 ring-sky-500'
        : 'bg-white ring-gray-200 dark:bg-gray-900 dark:ring-gray-800'
    }`}>
      <p className={`text-xs font-medium ${accent ? 'text-sky-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold tracking-tight whitespace-nowrap ${accent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
