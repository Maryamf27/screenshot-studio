import { AppHeader } from "@/components/app-header";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { UploadPanel } from "@/components/upload-panel";
import {
  Upload,
  Monitor,
  LayoutTemplate,
  Paintbrush,
  Download,
} from "lucide-react";

const workflowItems = [
  {
    icon: Upload,
    title: "Upload screenshots",
    description: "Add your raw mobile app screenshots.",
  },
  {
    icon: Monitor,
    title: "Select platform",
    description: "Choose App Store or Google Play dimensions.",
  },
  {
    icon: LayoutTemplate,
    title: "Choose a template",
    description: "Pick a layout for your store listing.",
  },
  {
    icon: Paintbrush,
    title: "Customize the design",
    description: "Adjust colors, text, and positioning.",
  },
  {
    icon: Download,
    title: "Export images",
    description: "Download your finished store screenshots.",
  },
];

export default function Home() {
  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 md:py-12">
        <section className="border-b border-border pb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">New project</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.15rem]">
            Create app store screenshots
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Turn raw mobile screenshots into polished, store-ready marketing visuals.
          </p>
        </section>

        <div className="border-b border-border px-1 py-6 sm:px-2">
          <WorkflowStepper activeStep={0} />
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-14">
          <UploadPanel />
          <aside className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pl-7">
            <h3 className="text-sm font-semibold text-card-foreground">Project workflow</h3>
            <ol className="mt-5 space-y-5">
              {workflowItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </main>
    </>
  );
}
