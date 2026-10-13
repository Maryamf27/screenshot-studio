"use client";

import { useState } from "react";
import { Check, Download, LayoutTemplate, Monitor, Paintbrush, Upload } from "lucide-react";
import { UploadManager } from "@/components/upload-manager";
import { TargetSelector } from "@/components/target-selector";
import { wizardSteps, type WizardStep } from "@/src/config/storePresets";

const stepIcons = [Upload, Monitor, LayoutTemplate, Paintbrush, Download] as const;

function PlaceholderView({ step }: { step: WizardStep }) {
  const current = wizardSteps[step - 1];

  return (
    <section className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
        {(() => {
          const Icon = stepIcons[step - 1];
          return <Icon className="h-5 w-5" aria-hidden="true" />;
        })()}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-card-foreground">{current.label}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        This workspace is ready for the {current.label.toLowerCase()} flow.
      </p>
    </section>
  );
}

export function WizardShell() {
  const [activeStep, setActiveStep] = useState<WizardStep>(1);

  return (
    <div className="space-y-8">
      <nav aria-label="Project workflow">
        <ol className="grid grid-cols-5 gap-2">
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
                  className="group flex w-full flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                      isActive || isComplete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className={`hidden text-xs font-medium sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {activeStep === 1 ? <UploadManager /> : activeStep === 2 ? <TargetSelector /> : <PlaceholderView step={activeStep} />}
    </div>
  );
}
