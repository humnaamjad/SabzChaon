// Tree update submission form — photo upload + optional text note.
// Sends multipart/form-data to POST /api/trees/[id]/updates.
// The API route handles Supabase Storage upload and TreeUpdate creation.
//
// Styled per THEME.md §4 (buttons + cards).
// Uses Lucide icons exclusively (§4 icons rule).

"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, FileText, Camera, Loader2 } from "lucide-react";

interface TreeUpdateFormProps {
  treeId: string;
  authToken: string | null;
  onSuccess: () => void;
}

export function TreeUpdateForm({
  treeId,
  authToken,
  onSuccess,
}: TreeUpdateFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [textNote, setTextNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit() {
    if (!photo && !textNote.trim()) {
      setError("Please upload a photo or write a note (at least one is required).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      if (textNote.trim()) formData.append("note", textNote.trim());

      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/trees/${treeId}/updates`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit update");
      }

      setSuccess(true);
      setPhoto(null);
      setTextNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-warmgray-border bg-cream-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-inktext mb-4">
        Submit Tree Update
      </h3>

      {/* Photo upload area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-inktext mb-2">
          Photo
        </label>
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-warmgray-border p-6 cursor-pointer hover:border-forest transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {photo ? (
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-forest" />
              <div>
                <p className="text-sm font-medium text-inktext">{photo.name}</p>
                <p className="text-xs text-warmgray-text">
                  {(photo.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-warmgray-text mb-2" />
              <p className="text-sm text-warmgray-text">
                Click to upload a photo
              </p>
              <p className="text-xs text-warmgray-text mt-1">
                JPG, PNG up to 10 MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Text note */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-inktext mb-2">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-brown" />
            Note (optional)
          </span>
        </label>
        <textarea
          value={textNote}
          onChange={(e) => {
            setTextNote(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          placeholder="Describe what you observed — leaf color, soil moisture, any damage..."
          rows={3}
          className="w-full rounded-lg border border-warmgray-border p-3 text-sm text-inktext placeholder:text-warmgray-text focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest resize-none"
        />
      </div>

      {/* Error / success messages */}
      {error && (
        <p className="mb-4 rounded-lg bg-[color:color-mix(in_srgb,var(--color-brick)_10%,transparent)] p-3 text-sm text-brick">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg bg-[color:color-mix(in_srgb,var(--color-forest)_10%,transparent)] p-3 text-sm text-forest">
          Update submitted successfully!
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2 bg-forest text-white font-medium hover:bg-forest-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Submit Update
          </>
        )}
      </button>
    </div>
  );
}
