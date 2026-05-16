export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="読み込み中">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-sky-500 dark:border-gray-700 dark:border-t-sky-400" />
    </div>
  );
}
