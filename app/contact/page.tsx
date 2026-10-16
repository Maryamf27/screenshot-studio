import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact | Screenshot Studio" };

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">We’re here to help</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Contact us</h1>
        <p className="mt-3 mb-8 text-sm leading-6 text-muted-foreground sm:text-base">Have a question or feedback about Screenshot Studio? Send us a note and we’ll get back to you.</p>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8"><ContactForm /></div>
      </div>
    </main>
  );
}
