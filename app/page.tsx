import { AppHeader } from "@/components/app-header";
import { WizardShell } from "@/components/wizard-shell";

export default function Home() {
  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 md:py-12">
        <section className="border-b border-border pb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">New project</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.15rem]">
            Screenshot Studio
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Turn raw mobile screenshots into polished, store-ready marketing visuals.
          </p>
        </section>

        <div className="pt-8">
          <WizardShell />
        </div>
      </main>
    </>
  );
}
