// Shared loading spinner component.
// Used by ProtectedRoute, auth pages, and anywhere async data is loading.
// Features a themed spinner with a contextual message.

import { TreePine } from "lucide-react";

export default function LoadingState({
  message = "Loading…",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Themed tree-icon spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-warmgray-border/50" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-forest" />
          <div className="absolute inset-0 flex items-center justify-center">
            <TreePine className="h-5 w-5 text-forest" />
          </div>
        </div>
        <p className="text-sm font-medium text-warmgray-text">{message}</p>
      </div>
    </div>
  );
}
