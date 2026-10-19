import { Geist, Geist_Mono } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import type {Metadata} from 'next';
import enMessages from '@/messages/en.json';

export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Store Screenshot Studio',
  description: 'Create polished app store screenshots in minutes.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider locale="en" messages={enMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
