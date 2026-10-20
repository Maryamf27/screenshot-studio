import {Suspense} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import type {Metadata} from 'next';
import {routing} from '@/i18n/routing';
import {AppHeader} from '@/components/app-header';

// next-intl resolves the locale from request context for server translations.
// Keep localized routes request-rendered with Cache Components enabled.
export const instant = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({locale, namespace: 'metadata'});
  return {title: 'Store Screenshot Studio', description: t('description')};
}

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return <NextIntlClientProvider locale={locale} messages={messages}>
    <div lang={locale} dir="ltr" className="flex min-h-full flex-col">
      <Suspense fallback={null}><AppHeader /></Suspense><Suspense fallback={null}>{children}</Suspense>
    </div>
  </NextIntlClientProvider>;
}
