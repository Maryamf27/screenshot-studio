"use client";

import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {ChevronDown, Moon, Sun} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

const locales = [
  {value: 'en', label: 'English', flag: '🇺🇸'},
  {value: 'es', label: 'Español', flag: '🇪🇸'},
  {value: 'fr', label: 'Français', flag: '🇫🇷'},
  {value: 'de', label: 'Deutsch', flag: '🇩🇪'}
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const [dark, setDark] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialDark = localStorage.getItem('studio-theme') === 'dark';
    document.documentElement.dataset.theme = initialDark ? 'dark' : 'light';
    queueMicrotask(() => setDark(initialDark));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
  }, [locale]);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) setLanguageMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [languageMenuOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    localStorage.setItem('studio-theme', next ? 'dark' : 'light');
  }

  const mainLinkClass = (href: string) =>
    `inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${pathname === href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`;
  const legalLinkClass = 'text-xs text-muted-foreground transition-colors hover:text-foreground';

  return <header className="border-b border-border bg-card">
    <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-8 md:flex md:h-[68px] md:justify-between md:py-0">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={t('navigation.homeLabel')}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary shadow-sm shadow-primary/20" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground"/><rect x="5" y="6" width="3" height="5" rx="0.5" fill="currentColor" className="text-primary-foreground"/><rect x="10" y="6" width="3" height="5" rx="0.5" fill="currentColor" className="text-primary-foreground opacity-60"/></svg>
        </span>
        <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-card-foreground">Screenshot Studio</span>
      </Link>

      <div className="col-start-2 row-start-1 flex items-center justify-end gap-1.5 md:order-3">
        <div ref={languageMenuRef} className="relative">
          <button id="language-select" type="button" aria-label={t('common.language')} aria-haspopup="listbox" aria-expanded={languageMenuOpen} onClick={() => setLanguageMenuOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Escape') setLanguageMenuOpen(false); }} className="inline-flex h-9 min-w-28 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/60 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm">
            <span className="inline-flex items-center gap-2"><span aria-hidden="true">{locales.find((item) => item.value === locale)?.flag ?? '🇺🇸'}</span>{locales.find((item) => item.value === locale)?.label ?? 'English'}</span>
            <ChevronDown size={15} className={`text-muted-foreground transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {languageMenuOpen && <div role="listbox" aria-label={t('common.language')} className="absolute end-0 z-50 mt-2 min-w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg shadow-black/10">
            {locales.map((item) => <button key={item.value} type="button" role="option" aria-selected={locale === item.value} onClick={() => { setLanguageMenuOpen(false); if (locale !== item.value) router.replace(pathname, {locale: item.value}); }} className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors ${locale === item.value ? 'bg-accent font-semibold text-accent-foreground' : 'text-foreground hover:bg-muted'}`}><span aria-hidden="true">{item.flag}</span>{item.label}</button>)}
          </div>}
        </div>
        <button type="button" onClick={toggleTheme} aria-label={t('common.theme', {theme: t(dark ? 'common.light' : 'common.dark')})} title={t('common.theme', {theme: t(dark ? 'common.light' : 'common.dark')})} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {dark ? <Sun size={17} strokeWidth={1.8}/> : <Moon size={17} strokeWidth={1.8}/>}
        </button>
      </div>

      <nav aria-label={t('navigation.main')} className="col-span-2 row-start-2 flex min-w-0 items-center justify-between border-t border-border/70 pt-2 md:order-2 md:col-span-1 md:row-auto md:justify-start md:gap-1 md:border-0 md:pt-0">
        <div className="flex items-center gap-1"><Link className={mainLinkClass('/')} href="/">{t('navigation.home')}</Link><Link className={mainLinkClass('/contact')} href="/contact">{t('navigation.contact')}</Link></div>
        <div className="flex items-center gap-3 ps-2 sm:ps-3 md:ms-4 md:border-s md:border-border"><Link className={legalLinkClass} href="/privacy">{t('navigation.privacy')}</Link><Link className={legalLinkClass} href="/terms">{t('navigation.terms')}</Link></div>
      </nav>
    </div>
  </header>;
}
