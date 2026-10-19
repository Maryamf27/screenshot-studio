import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';

export async function generateMetadata({params}: {params?: Promise<{locale?: string}>}): Promise<Metadata> {
  const requestedLocale = (await params)?.locale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;
  const t = await getTranslations({locale, namespace: 'metadata'});
  return {title: t('termsTitle')};
}

export default async function TermsPage({params}: {params?: Promise<{locale?: string}>}) {
  const requestedLocale = (await params)?.locale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;
  const t = await getTranslations({locale, namespace: 'legal'});
  const sections = t.raw('termsSections') as [string, string][];
  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16"><article className="mx-auto max-w-3xl">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
    <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{t('termsTitle')}</h1>
    <p className="mt-3 text-sm text-muted-foreground">{t('updated')}</p>
    <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground sm:text-base">
      {sections.map(([title, body], index) => <section key={title}><h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2><p>{index === 4 ? <>{body.split(t('contactLink'))[0]}<Link className="text-primary underline underline-offset-4" href="/contact">{t('contactLink')}</Link>{body.split(t('contactLink'))[1]}</> : body}</p></section>)}
    </div>
  </article></main>;
}
