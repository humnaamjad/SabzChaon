// Shared loading spinner component.
// Used by ProtectedRoute, auth pages, and anywhere async data is loading.

export default function LoadingState({
  message = "Loading…",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-cream border-t-forest" />
        <p className="text-sm text-warmgray-text">{message}</p>
      </div>
    </div>
  );
}
