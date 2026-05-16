type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-md bg-red-50 p-4 text-red-600">
      <p>{message}</p>
      <p className="mt-1 text-sm">再度お試しください。</p>
    </div>
  );
}
