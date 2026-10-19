import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {ContactForm} from '@/components/contact-form';

export async function generateMetadata({params}: {params?: Promise<{locale?: string}>}): Promise<Metadata> {
  const requestedLocale = (await params)?.locale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;
  const t = await getTranslations({locale, namespace: 'metadata'});
  return {title: t('contactTitle')};
}

export default async function ContactPage({params}: {params?: Promise<{locale?: string}>}) {
  const requestedLocale = (await params)?.locale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;
  const t = await getTranslations({locale, namespace: 'contact'});
  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto max-w-2xl">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
    <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
    <p className="mt-3 mb-8 text-sm leading-6 text-muted-foreground sm:text-base">{t('description')}</p>
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-8"><ContactForm/></div>
  </div></main>;
}
