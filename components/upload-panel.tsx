"use client";

import { ImageUp } from "lucide-react";
import { useRef } from "react";
import {useTranslations} from 'next-intl';

export function UploadPanel() {
  const t = useTranslations('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <div className="rounded-md border border-dashed border-[#b8b8b3] bg-card px-6 py-16 text-center sm:px-12 sm:py-24">
        <ImageUp className="mx-auto mb-5 h-7 w-7 text-primary" strokeWidth={1.5} />
        <h2 className="text-lg font-medium tracking-[-0.015em] text-card-foreground">
          {t('drop')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('types')} <span aria-hidden="true">&middot;</span> {t('upToTen')}
        </p>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple className="sr-only" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-7 inline-flex h-9 items-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t('browse')}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t('privacy')}
      </p>
    </div>
  );
}
