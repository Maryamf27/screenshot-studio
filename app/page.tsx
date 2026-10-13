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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-12">
        {/* Introduction */}
        <section className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create App Store Screenshots
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Turn raw mobile screenshots into polished, store-ready marketing
            visuals — entirely in your browser.
          </p>
        </section>

        {/* Workflow stepper */}
        <div className="mt-8 rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
          <WorkflowStepper activeStep={0} />
        </div>

        {/* Main content grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Upload dropzone — takes 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <UploadPanel />
          </div>

          {/* Supporting panel — planned workflow */}
          <aside className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground">
              How it works
            </h3>
            <ol className="mt-4 space-y-4">
              {workflowItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
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
