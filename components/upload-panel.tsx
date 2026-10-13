"use client";

import { ImageUp } from "lucide-react";
import { useRef } from "react";

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <div className="rounded-[10px] border border-dashed border-[#bdbbb3] bg-white px-6 py-14 text-center sm:px-12 sm:py-20">
        <ImageUp className="mx-auto mb-5 h-7 w-7 text-primary" strokeWidth={1.5} />
        <h2 className="text-lg font-medium tracking-[-0.01em] text-card-foreground">
          Drop your screenshots here
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          PNG or JPG · Up to 10 screenshots
        </p>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple className="sr-only" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-7 inline-flex h-9 items-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Browse files
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Your images stay private and are processed locally in your browser.
      </p>
    </div>
  );
}
