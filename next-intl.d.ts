import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'en' | 'es' | 'fr' | 'de' | 'ar';
    Messages: typeof en;
  }
}
