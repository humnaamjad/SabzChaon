// Tree update submission form — photo upload + optional text note.
// Sends multipart/form-data to POST /api/trees/[id]/updates.
// The API route handles Supabase Storage upload and TreeUpdate creation.
//
// VISUAL REDESIGN: "Check in on your tree" ritual feeling.
// Uses Lucide icons exclusively. All submission logic preserved exactly.

"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, FileText, Camera, Loader2, ImagePlus, CheckCircle } from "lucide-react";

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
    <div className="overflow-hidden rounded-2xl border border-warmgray-border/60 bg-cream-card shadow-sm">
      {/* Header accent */}
      <div className="border-b border-warmgray-border/50 bg-forest/3 px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-inktext">
          <Camera className="h-5 w-5 text-forest" />
          Check in on your tree
        </h3>
        <p className="mt-0.5 text-xs text-warmgray-text">
          Upload a photo so AI can assess your tree&apos;s visible health.
        </p>
      </div>

      <div className="p-6">
        {/* Photo upload area */}
        <div className="mb-5">
          <div
            className={`group flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 ${
              photo
                ? "border-forest/40 bg-forest/3"
                : "border-warmgray-border hover:border-forest/50 hover:bg-forest/3"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {photo ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">
                  <Camera className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <p className="text-sm font-medium text-inktext">{photo.name}</p>
                  <p className="text-xs text-warmgray-text">
                    {(photo.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-warmgray-border/30 transition-colors group-hover:bg-forest/10">
                  <ImagePlus className="h-6 w-6 text-warmgray-text transition-colors group-hover:text-forest" />
                </div>
                <p className="text-sm font-medium text-warmgray-text group-hover:text-inktext transition-colors">
                  Click to upload a photo
                </p>
                <p className="mt-1 text-xs text-warmgray-text">
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
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-inktext">
            <span className="flex items-center gap-1.5">
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
            className="w-full rounded-xl border border-warmgray-border bg-white p-3 text-sm text-inktext placeholder:text-warmgray-text/60 transition-colors focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest resize-none"
          />
        </div>

        {/* Error / success messages */}
        {error && (
          <div className="mb-4 rounded-xl bg-brick/8 px-4 py-3 text-sm text-brick">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-forest/8 px-4 py-3 text-sm text-forest">
            <CheckCircle className="h-4 w-4" />
            Update submitted successfully!
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 bg-forest text-white font-semibold shadow-sm shadow-forest/10 hover:bg-forest-hover hover:shadow-md hover:shadow-forest/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting update…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Submit Check-in
            </>
          )}
        </button>
      </div>
    </div>
  );
}
