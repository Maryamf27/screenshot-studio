"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Download, FolderPlus, LayoutTemplate, Monitor, Paintbrush, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { UploadManager } from "@/components/upload-manager";
import { TargetSelector } from "@/components/target-selector";
import { CanvasPreview } from "@/components/canvas-preview";
import { CustomizationEditor } from "@/components/customization-editor";
import { ExportPanel } from "@/components/export-panel";
import { getTemplate, templates, type TemplateCategory } from "@/src/renderer/templates";
import { wizardSteps, type WizardStep } from "@/src/config/storePresets";
import { hydrateProjectStore, useProjectStore } from "@/src/store/project-store";
import { StepNavigation } from "@/components/step-navigation";

const stepIcons = [Upload, Monitor, LayoutTemplate, Paintbrush, Download] as const;

function TemplateView({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [category, setCategory] = useState<"All" | TemplateCategory>("All");
  const templateId = useProjectStore((state) => state.activeTemplate);
  const setTemplateId = useProjectStore((state) => state.setActiveTemplate);
  const activeId = getTemplate(templateId).id;
  const visibleTemplates = category === "All" ? templates : templates.filter((template) => template.category === category);
  const categories: ("All" | TemplateCategory)[] = ["All", "Fashion", "Fitness", "Education", "Productivity"];

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
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter templates by category">
            {categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${category === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"}`}>{item}</button>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleTemplates.map((template) => (
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
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [isRenamingActiveProject, setIsRenamingActiveProject] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const createProject = useProjectStore((state) => state.createProject);
  const openProject = useProjectStore((state) => state.openProject);
  const leaveProject = useProjectStore((state) => state.leaveProject);
  const renameProject = useProjectStore((state) => state.renameProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const activeProject = projects.find((project) => project.id === activeProjectId);

  useEffect(() => { hydrateProjectStore(); }, []);

  if (!hasHydrated) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading saved projects…</div>;

  if (!activeProject) return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Project dashboard</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Your projects</h2><p className="mt-2 text-sm text-slate-500">Pick up where you left off or start a new store listing.</p></div>
        <button type="button" onClick={async () => { await createProject(); setActiveStep(1); }} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"><FolderPlus className="size-4" />Create New Project</button>
      </div>
      {projects.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center"><p className="font-medium text-slate-800">No saved projects yet</p><p className="mt-1 text-sm text-slate-500">Create a project to begin uploading screenshots.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => <article key={project.id} className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-md">
          {renamingId === project.id ? <form onSubmit={(event) => { event.preventDefault(); renameProject(project.id, nameDraft); setRenamingId(null); }} className="flex gap-2"><input autoFocus value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} aria-label="Project name" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" /><button className="text-sm font-semibold text-orange-700">Save</button></form> : <div className="flex items-start justify-between gap-3"><h3 className="truncate font-semibold text-slate-900">{project.name}</h3><button type="button" aria-label={`Rename ${project.name}`} onClick={() => { setNameDraft(project.name); setRenamingId(project.id); }} className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-4" /></button></div>}
          <p className="mt-2 text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleString()} <span aria-hidden="true">·</span> {project.slides.length} slide{project.slides.length === 1 ? "" : "s"}</p>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3"><button type="button" onClick={() => { openProject(project.id); setActiveStep(1); }} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-orange-700">Open project <ArrowRight className="size-4" /></button><button type="button" onClick={() => { deleteProject(project.id); if (renamingId === project.id) setRenamingId(null); }} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="size-3.5" />Delete Project</button></div>
        </article>)}
      </div>}
    </section>
  );

  return (
    <div className="space-y-7 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <button type="button" onClick={leaveProject} className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-950">Projects Dashboard</button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isRenamingActiveProject ? <form onSubmit={(event) => { event.preventDefault(); renameProject(activeProject.id, nameDraft); setIsRenamingActiveProject(false); }} className="flex items-center gap-1.5"><input autoFocus aria-label="Current project name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setIsRenamingActiveProject(false); }} className="w-40 rounded-lg border border-slate-300 px-2.5 py-2 text-sm" /><button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Save</button></form> : <div className="flex items-center gap-1"><span className="max-w-40 truncate text-sm font-semibold text-slate-800">{activeProject.name}</span><button type="button" aria-label="Rename current project" onClick={() => { setNameDraft(activeProject.name); setIsRenamingActiveProject(true); }} className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-3.5" /></button></div>}
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={projectMenuOpen} onClick={() => setProjectMenuOpen((open) => !open)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><span className="hidden sm:inline">Current project:</span><span className="max-w-32 truncate sm:hidden">{activeProject.name}</span><ChevronDown className="size-4" /></button>
            {projectMenuOpen && <div role="menu" aria-label="Saved projects" className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <p className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Switch project</p>
              {projects.map((project) => <button key={project.id} type="button" role="menuitemradio" aria-checked={project.id === activeProjectId} onClick={() => { if (project.id !== activeProjectId) { openProject(project.id); setActiveStep(1); } setProjectMenuOpen(false); }} className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><span className="truncate">{project.name}</span>{project.id === activeProjectId && <Check className="size-4 shrink-0 text-orange-600" />}</button>)}
              <div className="my-1 border-t border-slate-100" />
              <button type="button" role="menuitem" onClick={async () => { setProjectMenuOpen(false); await createProject(); setActiveStep(1); }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-800"><Plus className="size-4" />Create New Project</button>
            </div>}
          </div>
          <button type="button" onClick={async () => { await createProject(); setActiveStep(1); setProjectMenuOpen(false); }} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="size-4" />New Project</button>
        </div>
      </div>
      <nav aria-label="Project workflow" className="-mx-1 overflow-x-auto px-1 pb-2 sm:overflow-visible sm:pb-0">
        <ol className="grid min-w-140 grid-cols-5 gap-2 sm:min-w-0 sm:gap-3">
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
        <ExportPanel onBack={() => setActiveStep(4)} />
      )}
    </div>
  );
}
