
type PaginationProps = {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ total, page, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = buildPageNumbers(page, totalPages);

  const btnBase = 'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors';
  const btnActive = `${btnBase} bg-sky-500 text-white font-medium`;
  const btnDefault = `${btnBase} text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800`;
  const btnDisabled = `${btnBase} text-gray-300 dark:text-gray-600 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {from}–{to} / {total}件
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={page <= 1 ? btnDisabled : btnDefault}
          aria-label="前のページ"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-6 items-center justify-center text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={page === p ? btnActive : btnDefault}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={page >= totalPages ? btnDisabled : btnDefault}
          aria-label="次のページ"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
