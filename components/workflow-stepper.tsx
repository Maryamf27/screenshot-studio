import { Upload, Monitor, LayoutTemplate, Paintbrush, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  label: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  { label: "Upload", icon: Upload },
  { label: "Platform", icon: Monitor },
  { label: "Template", icon: LayoutTemplate },
  { label: "Customize", icon: Paintbrush },
  { label: "Export", icon: Download },
];

interface WorkflowStepperProps {
  /** Zero-based index of the currently active step. */
  activeStep?: number;
}

export function WorkflowStepper({ activeStep = 0 }: WorkflowStepperProps) {
  return (
    <nav aria-label="Workflow steps" className="w-full">
      <ol className="flex items-center justify-between gap-0 overflow-x-auto">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const Icon = step.icon;

          return (
            <li key={step.label} className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`h-px w-6 sm:w-10 md:w-14 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}

              {/* Step */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
