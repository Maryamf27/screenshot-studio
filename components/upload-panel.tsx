"use client";

import { ImageUp } from "lucide-react";

export function UploadPanel() {
  return (
    <div className="w-full">
      {/* Dropzone */}
      <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-colors sm:p-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <ImageUp className="h-7 w-7 text-accent-foreground" />
        </div>

        <p className="text-base font-medium text-card-foreground">
          Drag &amp; drop screenshots here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or browse to select files
        </p>

        <button
          disabled
          className="mt-5 inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
          title="Upload not yet implemented"
        >
          Browse Files
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>PNG, JPG</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>Max 10 screenshots</span>
        </div>
      </div>

      {/* Processing note */}
      <div className="mt-3 rounded-lg bg-accent/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
        All processing happens locally in your browser — your images never leave
        your device.
      </div>
    </div>
  );
}
