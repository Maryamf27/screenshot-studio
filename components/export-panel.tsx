"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { getExportTargets, exportBatch, type ExportProgress } from "@/src/utils/export-batch";
import { useProjectStore } from "@/src/store/project-store";

export function ExportPanel({ onBack }: { onBack: () => void }) {
  const images = useProjectStore((state) => state.images);
  const selectedPresetIds = useProjectStore((state) => state.selectedPresetIds);
  const customDimensions = useProjectStore((state) => state.customDimensions);
  const selectedPlatform = useProjectStore((state) => state.selectedPlatform);
  const targets = useMemo(() => getExportTargets({ selectedPresetIds, customDimensions, selectedPlatform }), [selectedPlatform, selectedPresetIds, customDimensions]);
  const [progress, setProgress] = useState<ExportProgress>();
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string>();
  const totalFiles = images.length * targets.length;
  const percent = progress?.stage === "package"
    ? progress.current
    : progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const startExport = async () => {
    setBusy(true);
    setComplete(false);
    setError(undefined);
    try {
      await exportBatch(setProgress);
      setComplete(true);
      setProgress(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The export could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Step 5 / Export</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Review and export your screenshots</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Each slide will be rendered at every selected output size and packaged in a store-organized ZIP.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Slides" value={images.length} />
        <SummaryCard label="Selected targets" value={targets.length} />
        <SummaryCard label="PNG files in ZIP" value={totalFiles} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Output folders</h3>
        {targets.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {targets.map((target) => (
            <li key={target.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="min-w-0 truncate text-sm font-medium text-slate-800">{target.label}</span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">{target.platform}/{target.folder}/</span>
            </li>
          ))}
        </ul> : <p className="mt-2 text-sm text-slate-500">No export targets selected. Go back to Step 2 to choose sizes.</p>}
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {complete && <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 className="size-5 shrink-0" />ZIP created and downloaded successfully.</div>}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} disabled={busy} className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Back to customization</button>
        <button type="button" onClick={startExport} disabled={busy || !images.length || !targets.length} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Preparing export..." : "Render and download ZIP"}
        </button>
      </div>

      {busy && progress && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="export-progress-title">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><LoaderCircle className="size-5 animate-spin" /></span>
            <div>
              <h3 id="export-progress-title" className="font-semibold text-slate-900">Building your export</h3>
              <p className="mt-0.5 text-xs text-slate-500">{progress.stage === "render" ? `Rendering slide ${(progress.slideIndex ?? 0) + 1} of ${images.length} (${progress.targetLabel})...` : "Packaging PNG files into ZIP..."}</p>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Export progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <div className="h-full rounded-full bg-orange-500 transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-right text-xs tabular-nums text-slate-500">{progress.stage === "render" ? `${progress.current} / ${progress.total} images rendered` : `${progress.current}% packaged`}</p>
        </div>
      </div>}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p></div>;
}
