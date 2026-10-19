import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const supported = new Set<string>(routing.locales);

export default function proxy(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split('/')[1];
  if (/^[a-z]{2}(?:-[A-Z]{2})?$/.test(firstSegment) && !supported.has(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${request.nextUrl.pathname.slice(firstSegment.length + 1)}` || '/en';
    return NextResponse.redirect(url);
  }
  return handleI18nRouting(request);
}

export const config = {matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']};
