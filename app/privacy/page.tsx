import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | Screenshot Studio" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Legal</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Privacy policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 16, 2026</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground sm:text-base">
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Information you provide</h2><p>Screenshot Studio processes the images and project details you choose to provide so you can create store listing graphics. Contact form submissions include the name, email address, subject, and message you enter.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">How information is used</h2><p>We use submitted information to operate the studio, respond to support requests, and improve the service. Contact messages are sent through EmailJS when the service is configured.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Storage and sharing</h2><p>Project data may be stored in your browser to support the editor. Information submitted through the contact form is transmitted to EmailJS and handled according to its privacy terms. We do not sell personal information.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Your choices</h2><p>You can choose what information and images to provide. For questions about this policy or a contact submission, use our <a className="text-primary underline underline-offset-4" href="/contact">contact page</a>.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">Policy updates</h2><p>We may update this policy as the service changes. The date above indicates when it was most recently revised.</p></section>
        </div>
      </article>
    </main>
  );
}
