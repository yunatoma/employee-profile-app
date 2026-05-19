type ErrorMessageProps = {
  message: string;
  hint?: string;
  className?: string;
};

export function ErrorMessage({ message, hint = '再度お試しください。', className = '' }: ErrorMessageProps) {
  return (
    <div role="alert" className={`rounded-xl bg-red-50 p-4 ring-1 ring-red-200 dark:bg-red-950 dark:ring-red-900 ${className}`}>
      <p className="text-sm font-medium text-red-700 dark:text-red-400">{message}</p>
      {hint && <p className="mt-0.5 text-xs text-red-500 dark:text-red-500">{hint}</p>}
    </div>
  );
}
