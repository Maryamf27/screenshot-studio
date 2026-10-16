import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use | Screenshot Studio" };

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Legal</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Terms of use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 16, 2026</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground sm:text-base">
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Using Screenshot Studio</h2><p>Screenshot Studio helps you prepare marketing images for app store listings. You are responsible for ensuring your use of the service follows applicable laws and the rules of the stores where you publish your images.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Your content</h2><p>You retain responsibility for the screenshots, logos, text, and other materials you upload. You must have the rights needed to use those materials. Avoid uploading content you are not authorized to use.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Acceptable use</h2><p>Do not use the service to violate others’ rights, distribute unlawful content, interfere with the service, or attempt to access systems without authorization.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Availability</h2><p>The service is provided as available and may change over time. We may fix, update, or temporarily suspend features to maintain the service.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Contact</h2><p>Questions about these terms can be sent through our <a className="text-primary underline underline-offset-4" href="/contact">contact page</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
