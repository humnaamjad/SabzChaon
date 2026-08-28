// Shared error state display component.
// Used by ProtectedRoute, auth pages, and anywhere errors need to be shown.

import { AlertCircle } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message,
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-brick" />
        <h2 className="text-lg font-semibold text-inktext">{title}</h2>
        {message && (
          <p className="text-sm text-warmgray-text">{message}</p>
        )}
        {retry && (
          <button
            onClick={retry}
            className="mt-2 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-hover"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
