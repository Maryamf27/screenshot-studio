"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function AppHeader() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initialDark = localStorage.getItem("studio-theme") === "dark";
    document.documentElement.dataset.theme = initialDark ? "dark" : "light";
    setDark(initialDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("studio-theme", next ? "dark" : "light");
  }

  const mainLinkClass = (href: string) =>
    `inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;
  const legalLinkClass = "text-xs text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3 sm:px-8 md:flex md:h-[68px] md:justify-between md:py-0">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Screenshot Studio home">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary shadow-sm shadow-primary/20">
            <svg width="19" height="19" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
              <rect x="5" y="6" width="3" height="5" rx="0.5" fill="currentColor" className="text-primary-foreground" />
              <rect x="10" y="6" width="3" height="5" rx="0.5" fill="currentColor" className="text-primary-foreground opacity-60" />
            </svg>
          </span>
          <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-card-foreground">Screenshot Studio</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          title={`Switch to ${dark ? "light" : "dark"} theme`}
          className="col-start-2 row-start-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:order-3"
        >
          {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>

        <nav aria-label="Main navigation" className="col-span-2 row-start-2 flex min-w-0 items-center justify-between border-t border-border/70 pt-2 md:order-2 md:col-span-1 md:row-auto md:justify-start md:gap-1 md:border-0 md:pt-0">
          <div className="flex items-center gap-1">
            <Link className={mainLinkClass("/")} href="/">Workspace</Link>
            <Link className={mainLinkClass("/contact")} href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3 pl-3 md:ml-4 md:border-l md:border-border">
            <Link className={legalLinkClass} href="/privacy">Privacy</Link>
            <Link className={legalLinkClass} href="/terms">Terms</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
