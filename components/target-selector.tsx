"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { StepNavigation } from "@/components/step-navigation";
import { storePresets, type StorePlatform } from "@/src/config/storePresets";
import { useProjectStore } from "@/src/store/project-store";

const selectableClass = "cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.99] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

export function TargetSelector({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const platform = useProjectStore((state) => state.selectedPlatform);
  const selected = useProjectStore((state) => state.selectedPresetIds);
  const custom = useProjectStore((state) => state.customDimensions);
  const setPlatform = useProjectStore((state) => state.setPlatform);
  const togglePreset = useProjectStore((state) => state.togglePreset);
  const addCustomDimension = useProjectStore((state) => state.addCustomDimension);
  const removeCustomDimension = useProjectStore((state) => state.removeCustomDimension);
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const presets = platform === "google-play" ? storePresets.googlePlay.presets : storePresets.appStore.presets;
  const addCustom = () => {
    const parsedWidth = Number(width);
    const parsedHeight = Number(height);
    if (!name.trim() || !Number.isInteger(parsedWidth) || !Number.isInteger(parsedHeight) || parsedWidth < 1 || parsedHeight < 1) return;
    addCustomDimension({ name: name.trim(), width: parsedWidth, height: parsedHeight });
    setName(""); setWidth(""); setHeight("");
  };

  return (
    <section className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Store</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Where are you publishing?</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["google-play", "app-store"] as StorePlatform[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPlatform(option)}
              aria-pressed={platform === option}
              className={`${selectableClass} ${platform === option ? "border-primary bg-accent" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <span className="text-sm font-semibold text-slate-900">{option === "google-play" ? "Google Play" : "App Store"}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{option === "google-play" ? "Android phone and tablet listings" : "iPhone and iPad product pages"}</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Export sizes</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Select the formats you need</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => togglePreset(preset.id)}
              aria-pressed={selected.includes(preset.id)}
              className={`${selectableClass} flex items-center justify-between ${selected.includes(preset.id) ? "border-primary bg-accent" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <span>
                <span className="block text-sm font-medium text-slate-900">{preset.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{preset.width} × {preset.height}px</span>
              </span>
              <span className={`size-4 rounded-full border ${selected.includes(preset.id) ? "border-primary bg-primary" : "border-slate-300"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Custom dimensions</h3>
        <p className="mt-1 text-sm text-slate-500">Add a format not listed above.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_120px_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Custom dimension name" className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
          <input value={width} onChange={(event) => setWidth(event.target.value)} inputMode="numeric" placeholder="Width" aria-label="Custom width" className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
          <input value={height} onChange={(event) => setHeight(event.target.value)} inputMode="numeric" placeholder="Height" aria-label="Custom height" className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
          <button type="button" onClick={addCustom} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"><Plus className="size-4" />Add</button>
        </div>
        {custom.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {custom.map((dimension) => (
              <li key={dimension.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium text-slate-900">{dimension.name} <span className="font-normal text-slate-500">{dimension.width} × {dimension.height}px</span></span>
                <button type="button" onClick={() => removeCustomDimension(dimension.id)} aria-label={`Remove ${dimension.name}`} className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">{selected.length + custom.length} export format{selected.length + custom.length === 1 ? "" : "s"} selected</p>
        <StepNavigation onBack={onBack} onContinue={onContinue} continueLabel="Next" continueDisabled={selected.length + custom.length === 0} className="sm:min-w-64" />
      </div>
    </section>
  );
}
