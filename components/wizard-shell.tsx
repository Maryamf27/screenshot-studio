"use client";

import { useState } from "react";
import { Check, Download, LayoutTemplate, Monitor, Paintbrush, Upload } from "lucide-react";
import { UploadManager } from "@/components/upload-manager";
import { TargetSelector } from "@/components/target-selector";
import { CanvasPreview } from "@/components/canvas-preview";
import { CustomizationEditor } from "@/components/customization-editor";
import { getTemplate, templates } from "@/src/renderer/templates";
import { wizardSteps, type WizardStep } from "@/src/config/storePresets";
import { useProjectStore } from "@/src/store/project-store";
import { StepNavigation } from "@/components/step-navigation";

const stepIcons = [Upload, Monitor, LayoutTemplate, Paintbrush, Download] as const;

function PlaceholderView({ step, onBack, onContinue }: { step: WizardStep; onBack: () => void; onContinue: () => void }) {
  const current = wizardSteps[step - 1];

  return (
    <section className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-12 text-center rounded-2xl shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-primary ring-1 ring-orange-100">
        {(() => {
          const Icon = stepIcons[step - 1]; // Fixed line-break array indexing bug
          return <Icon className="h-5 w-5" aria-hidden="true" />;
        })()}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{current.label}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        This workspace is ready for the {current.label.toLowerCase()} flow.
      </p>
      <StepNavigation onBack={onBack} onContinue={onContinue} continueLabel="Next" className="mt-6 w-full max-w-sm border-0 pt-0" />
    </section>
  );
}

function TemplateView({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const templateId = useProjectStore((state) => state.activeTemplate);
  const setTemplateId = useProjectStore((state) => state.setActiveTemplate);
  const activeId = getTemplate(templateId).id;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Step 3 / Template</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Pick a template</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose a starting layout. Each card previews your first screenshot; the selected design is rendered at the active target&apos;s full dimensions.</p>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-900">Template gallery</h4>
            <span className="text-xs text-slate-500">{templates.length} styles</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              aria-pressed={template.id === activeId}
              className={`group cursor-pointer rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:p-4 ${template.id === activeId ? "border-orange-300 bg-orange-50 shadow-md ring-1 ring-orange-100" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"}`}
            >
              <span className="mb-3 block overflow-hidden rounded-xl bg-slate-100 p-2 transition-colors group-hover:bg-slate-200/70">
                <CanvasPreview templateId={template.id} compact />
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold tracking-tight text-slate-900">{template.label}</span>
                {template.id === activeId && <span className="flex size-6 items-center justify-center rounded-full bg-orange-500 text-white"><Check className="size-3.5" aria-hidden="true" /></span>}
              </span>
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-700">{template.style}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">{template.description}</span>
            </button>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Live preview</p>
            <h4 className="mt-1 font-semibold tracking-tight text-slate-900">{templates.find((template) => template.id === activeId)?.label}</h4>
          </div>
          <CanvasPreview templateId={activeId} slideIndex={0} applySlideCustomizations={false} />
          <p className="mt-3 text-xs leading-5 text-slate-500">Preview uses Slide 1 and updates as you choose a layout.</p>
        </aside>
      </div>
      <StepNavigation onBack={onBack} onContinue={onContinue} continueLabel="Next" />
    </section>
  );
}

export function WizardShell() {
  const [activeStep, setActiveStep] = useState<WizardStep>(1);

  return (
    <div className="space-y-7 sm:space-y-8">
      <nav aria-label="Project workflow" className="-mx-1 overflow-x-auto px-1 pb-2 sm:overflow-visible sm:pb-0">
        <ol className="grid min-w-[560px] grid-cols-5 gap-2 sm:min-w-0 sm:gap-3">
          {wizardSteps.map((step, index) => {
            const stepNumber = (index + 1) as WizardStep;
            const Icon = stepIcons[index];
            const isComplete = stepNumber < activeStep;
            const isActive = stepNumber === activeStep;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setActiveStep(stepNumber)}
                  aria-current={isActive ? "step" : undefined}
                  className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl py-1 text-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-semibold shadow-sm transition-all duration-200 group-hover:shadow-md sm:h-11 sm:w-11 ${
                      isActive || isComplete
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300"
                    }`}
                  >
                    {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className={`text-[10px] font-medium leading-4 sm:text-xs ${isActive ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {activeStep === 1 ? (
        <UploadManager onContinue={() => setActiveStep(2)} />
      ) : activeStep === 2 ? (
        <TargetSelector onBack={() => setActiveStep((step) => Math.max(1, step - 1) as WizardStep)} onContinue={() => setActiveStep(3)} />
      ) : activeStep === 3 ? (
        <TemplateView onBack={() => setActiveStep((step) => Math.max(1, step - 1) as WizardStep)} onContinue={() => setActiveStep(4)} />
      ) : activeStep === 4 ? (
        <CustomizationEditor onBack={() => setActiveStep((step) => Math.max(1, step - 1) as WizardStep)} onContinue={() => setActiveStep(5)} />
      ) : (
        <PlaceholderView step={activeStep} onBack={() => setActiveStep((step) => Math.max(1, step - 1) as WizardStep)} onContinue={() => setActiveStep(Math.min(5, activeStep + 1) as WizardStep)} />
      )}
    </div>
  );
}
