"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { storePresets, type StorePlatform } from "@/src/config/storePresets";
import { useProjectStore } from "@/src/store/project-store";

export function TargetSelector() {
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
    <section className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Store</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">Where are you publishing?</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["google-play", "app-store"] as StorePlatform[]).map((option) => <button key={option} type="button" onClick={() => setPlatform(option)} aria-pressed={platform === option} className={`rounded-lg border p-4 text-left transition-colors ${platform === option ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"}`}><span className="text-sm font-semibold text-foreground">{option === "google-play" ? "Google Play" : "App Store"}</span><span className="mt-1 block text-xs text-muted-foreground">{option === "google-play" ? "Android phone and tablet listings" : "iPhone and iPad product pages"}</span></button>)}
        </div>
      </div>
      <div aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Export sizes</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Select the formats you need</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {presets.map((preset) => <button key={preset.id} type="button" onClick={() => togglePreset(preset.id)} aria-pressed={selected.includes(preset.id)} className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${selected.includes(preset.id) ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"}`}><span><span className="block text-sm font-medium text-foreground">{preset.label}</span><span className="mt-1 block text-xs text-muted-foreground">{preset.width} × {preset.height}px</span></span><span className={`size-4 rounded-full border ${selected.includes(preset.id) ? "border-primary bg-primary" : "border-muted-foreground/40"}`} /></button>)}
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">Custom dimensions</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a format not listed above.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_120px_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Custom dimension name" className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          <input value={width} onChange={(event) => setWidth(event.target.value)} inputMode="numeric" placeholder="Width" aria-label="Custom width" className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          <input value={height} onChange={(event) => setHeight(event.target.value)} inputMode="numeric" placeholder="Height" aria-label="Custom height" className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          <button type="button" onClick={addCustom} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"><Plus className="size-4" />Add</button>
        </div>
        {custom.length > 0 && <ul className="mt-4 flex flex-col gap-2">{custom.map((dimension) => <li key={dimension.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"><span className="text-foreground">{dimension.name} <span className="text-muted-foreground">{dimension.width} × {dimension.height}px</span></span><button type="button" onClick={() => removeCustomDimension(dimension.id)} aria-label={`Remove ${dimension.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></li>)}</ul>}
      </div>
      <p className="text-xs text-muted-foreground">{selected.length + custom.length} export format{selected.length + custom.length === 1 ? "" : "s"} selected</p>
    </section>
  );
}
