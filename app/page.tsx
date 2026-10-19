import { WizardShell } from "@/components/wizard-shell";
import {getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';

export default async function Home({params}: {params?: Promise<{locale?: string}>}) {
  const requestedLocale = (await params)?.locale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;
  const t = await getTranslations({locale, namespace: 'home'});
  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <section className="border-b border-border pb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.15rem]">
            {t('title')}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </section>

        <div className="pt-8">
          <WizardShell />
        </div>
      </main>
    </>
  );
}
