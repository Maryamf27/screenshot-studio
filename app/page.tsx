import { WizardShell } from "@/components/wizard-shell";

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <section className="border-b border-border pb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Workspace</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.15rem]">
            Your projects
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Manage your projects and create polished, store-ready app listing images.
          </p>
        </section>

        <div className="pt-8">
          <WizardShell />
        </div>
      </main>
    </>
  );
}
