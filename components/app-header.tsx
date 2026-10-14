"use client";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="3"
                width="14"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary-foreground"
              />
              <rect
                x="5"
                y="6"
                width="3"
                height="5"
                rx="0.5"
                fill="currentColor"
                className="text-primary-foreground"
              />
              <rect
                x="10"
                y="6"
                width="3"
                height="5"
                rx="0.5"
                fill="currentColor"
                className="text-primary-foreground opacity-60"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-card-foreground">
              Screenshot Studio
            </h1>
            <p className="text-xs text-muted-foreground">
              Screenshot generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
