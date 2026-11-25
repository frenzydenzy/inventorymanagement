export function EmptyState({
  title = "Nothing here yet",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-12 text-center">
      <span className="text-3xl">📭</span>
      <p className="font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
