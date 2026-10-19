"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Plus, Smartphone, Trash2 } from "lucide-react";
import { CanvasPreview } from "@/components/canvas-preview";
import { getAutomaticTextColor } from "@/src/renderer/render-slide";
import { getTemplate } from "@/src/renderer/templates";
import { useProjectStore, type UploadedImage } from "@/src/store/project-store";
import {useTranslations} from 'next-intl';
import { StepNavigation } from "@/components/step-navigation";

const presetGroups = [
  {
    label: "Solid Light / Warm", options: [
      { label: "Golden Yellow", type: "solid", primaryColor: "#FDE047", secondaryColor: "#FDE047" },
      { label: "Warm Taupe", type: "solid", primaryColor: "#786252", secondaryColor: "#786252" },
      { label: "Pure White", type: "solid", primaryColor: "#FFFFFF", secondaryColor: "#FFFFFF" },
      { label: "Crisp Slate Light", type: "solid", primaryColor: "#F8FAFC", secondaryColor: "#F8FAFC" },
    ]
  },
  {
    label: "Pastel & Vibrant", options: [
      { label: "Soft Lavender", type: "solid", primaryColor: "#F3E8FF", secondaryColor: "#F3E8FF" },
      { label: "Blush Pink", type: "solid", primaryColor: "#FCE7F3", secondaryColor: "#FCE7F3" },
      { label: "Mint Green", type: "solid", primaryColor: "#DCFCE7", secondaryColor: "#DCFCE7" },
      { label: "Sky Blue", type: "solid", primaryColor: "#E0F2FE", secondaryColor: "#E0F2FE" },
    ]
  },
  {
    label: "Gradients", options: [
      { label: "Sunset Pop", type: "gradient", primaryColor: "#F43F5E", secondaryColor: "#FB923C" },
      { label: "Cool Indigo", type: "gradient", primaryColor: "#4F46E5", secondaryColor: "#7C3AED" },
      { label: "Emerald Wave", type: "gradient", primaryColor: "#059669", secondaryColor: "#34D399" },
      { label: "Soft Aura", type: "gradient", primaryColor: "#EEF2FF", secondaryColor: "#E0E7FF" },
    ]
  },
  {
    label: "Dark Premium", options: [
      { label: "Obsidian Dark", type: "solid", primaryColor: "#090D16", secondaryColor: "#090D16" },
      { label: "Midnight Navy", type: "solid", primaryColor: "#0F172A", secondaryColor: "#0F172A" },
      { label: "Deep Violet", type: "solid", primaryColor: "#1E1B4B", secondaryColor: "#1E1B4B" },
      { label: "Charcoal", type: "solid", primaryColor: "#18181B", secondaryColor: "#18181B" },
    ]
  },
] as const;

const controlClass = "mt-1.5 h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100";
const toggleClass = "cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-[0.98]";
const fontOptions = ["Arial", "Verdana", "Trebuchet MS", "Georgia", "Courier New"];

function ThemeSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const t = useTranslations('customize');
  const [open, setOpen] = useState(false);
  const id = label.toLowerCase().replaceAll(" ", "-");
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <span id={`${id}-label`} className="block text-xs font-semibold text-slate-600">{label}</span>
      <button type="button" aria-labelledby={`${id}-label`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className={`${controlClass} flex cursor-pointer items-center justify-between gap-3 pr-4 text-left hover:bg-slate-50`}>
        <span className="min-w-0 truncate">{selected.label.startsWith('i18n:') ? t(selected.label.slice(5) as never) : selected.label}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div role="listbox" aria-labelledby={`${id}-label`} className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10">
        {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-orange-50 focus-visible:bg-orange-50 focus-visible:outline-none ${value === option.value ? "bg-orange-50 font-semibold text-orange-800" : "text-slate-700"}`}>{option.label.startsWith('i18n:') ? t(option.label.slice(5) as never) : option.label}</button>)}
      </div>}
    </div>
  );
}

function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (font: string) => void }) {
  const [open, setOpen] = useState(false);
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div
      className="relative"
      onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
    >
      <span id={`${id}-label`} className="block text-xs font-semibold text-slate-600">{label}</span>
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${controlClass} flex cursor-pointer items-center justify-between gap-3 pr-4 text-left hover:bg-slate-50`}
      >
        <span className="min-w-0 truncate">{value}</span><ChevronDown className={`size-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div role="listbox" aria-labelledby={`${id}-label`} className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl shadow-slate-950/10">
        {fontOptions.map((font) => <button key={font} type="button" role="option" aria-selected={value === font} onClick={() => { onChange(font); setOpen(false); }} className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-orange-50 focus-visible:bg-orange-50 focus-visible:outline-none ${value === font ? "bg-orange-50 font-semibold text-orange-800" : "text-slate-600"}`} style={{ fontFamily: `"${font}", sans-serif` }}>{font}</button>)}
      </div>}
    </div>
  );
}

function resolveTemplateColor(color: string, brandColor: string) {
  if (color === "$brand") return brandColor;
  if (color !== "$brand-pastel") return color;
  const value = Number.parseInt(brandColor.slice(1), 16);
  const channel = (shift: number) => Math.round(((value >> shift) & 0xff) * 0.12 + 255 * 0.88);
  return `#${[channel(16), channel(8), channel(0)].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

function ColorOverride({ label, value, onChange, onAuto }: { label: string; value: string; onChange: (color: string) => void; onAuto: () => void }) {
  const t = useTranslations('customize');
  return <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2">
    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600"><input aria-label={`${label} color override`} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="truncate">{label}</span></label>
    <button type="button" onClick={onAuto} className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">{t('auto')}</button>
  </div>;
}

function SlideThumbnail({ image, index, active, onSelect }: { image: UploadedImage; index: number; active: boolean; onSelect: () => void }) {
  const t = useTranslations('customize');
  const [source] = useState(() => URL.createObjectURL(image.file));
  useEffect(() => () => URL.revokeObjectURL(source), [source]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={t('editSlide', {number: index + 1, name: image.name})}
      className={`group w-28 shrink-0 cursor-pointer rounded-xl border p-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${active ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <span className="relative block aspect-4/5 overflow-hidden rounded-lg bg-slate-100">
        {source ? <img src={source} alt="" className="size-full object-contain" /> : <span className="flex size-full items-center justify-center"><Smartphone className="size-5 text-slate-400" /></span>}
        <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">{index + 1}</span>
        {active && <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-orange-500 text-white"><Check className="size-3" /></span>}
      </span>
      <span className="mt-2 block truncate text-xs font-semibold text-slate-800" title={image.name}>{image.name || t('singleSlide', {number: index + 1})}</span>
    </button>
  );
}

export function CustomizationEditor({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const t = useTranslations('customize');
  const tRoot = useTranslations();
  const images = useProjectStore((state) => state.images);
  const activeSlideIndex = useProjectStore((state) => state.activeSlideIndex);
  const setActiveSlideIndex = useProjectStore((state) => state.setActiveSlideIndex);
  const updateSlide = useProjectStore((state) => state.updateSlide);
  const font = useProjectStore((state) => state.font);
  const brandColor = useProjectStore((state) => state.brandColor);
  const activeTemplateId = useProjectStore((state) => state.images[state.activeSlideIndex]?.templateId);
  const setBrandSettings = useProjectStore((state) => state.setBrandSettings);
  const applyBrandColorToAllSlides = useProjectStore((state) => state.applyBrandColorToAllSlides);
  const activeImage = images[activeSlideIndex];

  if (!activeImage) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h3 className="font-semibold text-slate-900">{t('none')}</h3><p className="mt-2 text-sm text-slate-500">{t('addScreenshot')}</p><StepNavigation onBack={onBack} onContinue={onContinue} continueLabel={t('continueToExport')} className="mt-6" /></section>;
  }

  const template = getTemplate(activeTemplateId);
  const slideText = {
    headline: activeImage.headline,
    subheadline: activeImage.subheadline,
    badgeText: activeImage.badgeText,
    ratingBadge: activeImage.ratingBadge,
    cardItems: activeImage.cardItems,
    floatingWidgetItems: activeImage.floatingWidgetItems,
  };
  const defaultCardItems: NonNullable<UploadedImage["cardItems"]> = template.taskCards?.map((item, index) => ({ id: `${template.id}-${index}`, subtitle: item.time, title: item.title, detail: item.detail }))
    ?? template.routineRows?.rows.map((item, index) => ({ id: `${template.id}-${index}`, subtitle: item.time, title: item.title })) ?? [];
  const defaultWidgetItems = template.floatingWidget ? [{ id: `${template.id}-widget-0`, title: template.floatingWidget.title, subtitle: template.floatingWidget.detail }] : [];
  const editableItems = slideText.cardItems ?? defaultCardItems;
  const editableWidgetItems = slideText.floatingWidgetItems ?? defaultWidgetItems;
  const ratingBadge = slideText.ratingBadge ?? activeImage.ratingBadge;
  const templateBackground = template.background;
  const hasDecorativeLayers = Boolean(template.badge || template.taskCards?.length || template.routineRows || template.floatingWidget);
  const templateStart = resolveTemplateColor(templateBackground.start, brandColor);
  const background = activeImage.background ?? {
    type: templateBackground.type,
    primaryColor: templateStart,
    secondaryColor: resolveTemplateColor(templateBackground.end ?? templateBackground.start, brandColor),
    angle: templateBackground.angle ?? 135,
  };
  const automaticTextColor = getAutomaticTextColor({ type: background.type, start: background.primaryColor, end: background.secondaryColor, angle: background.angle }, brandColor);
  const update = (updates: Parameters<typeof updateSlide>[1]) => updateSlide(activeImage.id, updates);

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t('step')}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{t('title')}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t('description')}</p>
      </header>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{t('slides')}</h3>
          <span className="text-xs text-slate-500">{images.length === 1 ? t('screenshot', {count: images.length}) : t('screenshotCount', {count: images.length})}</span>
        </div>
        <nav aria-label={t('selectScreenshot')} className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => <SlideThumbnail key={image.id} image={image} index={index} active={index === activeSlideIndex} onSelect={() => setActiveSlideIndex(index)} />)}
        </nav>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="mb-3 flex items-center justify-between gap-3">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t('live')}</p><p className="mt-1 text-sm font-semibold text-slate-900">Slide {activeSlideIndex + 1} · {activeImage.name}</p></div>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500">{t('updates')}</span>
          </div>
          <CanvasPreview slideIndex={activeSlideIndex} />
        </div>

        <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
          <section className="space-y-3">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('typography')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('editCopy')}</p></div>
            <label className="block text-xs font-semibold text-slate-600">{t('headline')}<input className={controlClass} type="text" value={slideText.headline} onChange={(event) => update({ headline: event.target.value })} placeholder={template.defaultHeadline ?? t('headlinePlaceholder')} /></label>
            <label className="block text-xs font-semibold text-slate-600">{t('subheadline')}<textarea className={`${controlClass} h-20 resize-y py-2`} value={slideText.subheadline} onChange={(event) => update({ subheadline: event.target.value })} placeholder={template.defaultSubheadline ?? t('subheadlinePlaceholder')} /></label>
            {template.badge && <label className="block text-xs font-semibold text-slate-600">{t('badge')}<input className={controlClass} type="text" value={slideText.badgeText ?? ""} onChange={(event) => update({ badgeText: event.target.value })} placeholder={t('verified')} /></label>}
            <FontPicker label={t('headlineFont')} value={activeImage.headlineFont ?? template.headlineFontFamily ?? font} onChange={(headlineFont) => update({ headlineFont })} />
            <FontPicker label={t('subheadlineFont')} value={activeImage.subheadlineFont ?? font} onChange={(subheadlineFont) => update({ subheadlineFont })} />
            <div><span className="text-xs font-semibold text-slate-600">{t('alignment')}</span><div className="mt-1.5 grid grid-cols-3 rounded-xl bg-slate-100 p-1" role="group" aria-label={t('alignment')}>{(["left", "center", "right"] as const).map((alignment) => <button key={alignment} type="button" onClick={() => update({ textAlignment: alignment })} aria-pressed={(activeImage.textAlignment ?? "center") === alignment} className={`${toggleClass} capitalize ${(activeImage.textAlignment ?? "center") === alignment ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"}`}>{t(`alignments.${alignment}`)}</button>)}</div></div>
            <div className="space-y-2"><span className="text-xs font-semibold text-slate-600">{t('colorOverrides')}</span><ColorOverride label={t('headline')} value={activeImage.headlineColor ?? automaticTextColor} onChange={(headlineColor) => update({ headlineColor })} onAuto={() => update({ headlineColor: undefined })} /><ColorOverride label={t('subheadline')} value={activeImage.subheadlineColor ?? automaticTextColor} onChange={(subheadlineColor) => update({ subheadlineColor })} onAuto={() => update({ subheadlineColor: undefined })} /></div>
          </section>

          {(template.taskCards?.length || template.routineRows) && <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('routineCards')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('savedRows')}</p></div>
            <FontPicker label={t('cardFont')} value={activeImage.cardFontFamily ?? activeImage.subheadlineFont ?? font} onChange={(cardFontFamily) => update({ cardFontFamily })} />
            {editableItems.map((item, index) => <fieldset key={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <legend className="px-1 text-[11px] font-semibold text-slate-500">{t('item', {number: index + 1})}</legend>
              <label className="block text-xs font-semibold text-slate-600">{t('timeSubtitle')}<input className={controlClass} type="text" value={item.subtitle} onChange={(event) => update({ cardItems: editableItems.map((current) => current.id === item.id ? { ...current, subtitle: event.target.value } : current) })} placeholder={t('timeExample')} /></label>
              <label className="block text-xs font-semibold text-slate-600">{t('titleField')}<input className={controlClass} type="text" value={item.title} onChange={(event) => update({ cardItems: editableItems.map((current) => current.id === item.id ? { ...current, title: event.target.value } : current) })} placeholder={t('addTask')} /></label>
              {template.taskCards && <label className="block text-xs font-semibold text-slate-600">{t('detail')}<input className={controlClass} type="text" value={item.detail ?? ""} onChange={(event) => update({ cardItems: editableItems.map((current) => current.id === item.id ? { ...current, detail: event.target.value } : current) })} placeholder={t('optionalDetail')} /></label>}
              <button type="button" onClick={() => update({ cardItems: editableItems.filter((current) => current.id !== item.id) })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><Trash2 className="size-3.5" />{t('removeItem')}</button>
            </fieldset>)}
            <button type="button" onClick={() => update({ cardItems: [...editableItems, { id: crypto.randomUUID(), subtitle: "", title: "", ...(template.taskCards ? { detail: "" } : {}) }] })} className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50"><Plus className="size-4" />{t('addItem')}</button>
          </section>}

          {template.floatingWidget && <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('widget')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('widgetCopy')}</p></div>
            {editableWidgetItems.map((item, index) => <fieldset key={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <legend className="px-1 text-[11px] font-semibold text-slate-500">{t('widgetItem', {number: index + 1})}</legend>
              <label className="block text-xs font-semibold text-slate-600">{t('titleField')}<input className={controlClass} type="text" value={item.title} onChange={(event) => update({ floatingWidgetItems: editableWidgetItems.map((current) => current.id === item.id ? { ...current, title: event.target.value } : current) })} placeholder={t('widgetTitle')} /></label>
              <label className="block text-xs font-semibold text-slate-600">{t('subheadline')}<input className={controlClass} type="text" value={item.subtitle} onChange={(event) => update({ floatingWidgetItems: editableWidgetItems.map((current) => current.id === item.id ? { ...current, subtitle: event.target.value } : current) })} placeholder={t('supportingDetail')} /></label>
              <button type="button" onClick={() => update({ floatingWidgetItems: editableWidgetItems.filter((current) => current.id !== item.id) })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><Trash2 className="size-3.5" />{t('removeItem')}</button>
            </fieldset>)}
            <button type="button" onClick={() => update({ floatingWidgetItems: [...editableWidgetItems, { id: crypto.randomUUID(), title: "", subtitle: "" }] })} className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50"><Plus className="size-4" />{t('addWidget')}</button>
          </section>}

          <details className="group border-t border-slate-100 pt-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">{t('social')} <span className="float-right text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true">⌄</span></summary>
            <div className="mt-3 space-y-3">
              <p className="text-xs leading-5 text-slate-500">{t('socialHelp')}</p>
              <button type="button" role="switch" aria-checked={activeImage.showRatingBadge} onClick={() => update({ showRatingBadge: !activeImage.showRatingBadge })} className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"><span>{t('showRating')}</span><span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${activeImage.showRatingBadge ? "bg-orange-500" : "bg-slate-300"}`}><span className={`size-4 rounded-full bg-white shadow transition-transform ${activeImage.showRatingBadge ? "translate-x-5" : "translate-x-0"}`} /></span></button>
              <label className="block text-xs font-semibold text-slate-600">{t('score')}<input className={controlClass} type="text" value={ratingBadge.score} onChange={(event) => update({ ratingBadge: { ...ratingBadge, score: event.target.value } })} placeholder={t('ratingPlaceholder')} /></label>
              <label className="block text-xs font-semibold text-slate-600">{t('starCount')}<input className={controlClass} type="number" min="0" max="5" step="1" value={ratingBadge.stars} onChange={(event) => update({ ratingBadge: { ...ratingBadge, stars: Math.max(0, Math.min(5, Math.floor(Number(event.target.value) || 0))) } })} /></label>
              <label className="block text-xs font-semibold text-slate-600">{t('subtitle')}<input className={controlClass} type="text" value={ratingBadge.subtitle} onChange={(event) => update({ ratingBadge: { ...ratingBadge, subtitle: event.target.value } })} placeholder={t('reviewsPlaceholder')} /></label>
            </div>
          </details>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('accents')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('patternHelp')}</p></div>
            <ThemeSelect label={t('pattern')} value={activeImage.backgroundAccent ?? "template"} onChange={(value) => update({ backgroundAccent: value as NonNullable<UploadedImage["backgroundAccent"]> })} options={[
              { value: "template", label: "i18n:templateDefault" },
              { value: "none", label: "i18n:noneSolid" },
              { value: "arches", label: "i18n:softArches" },
              { value: "floating-orbs", label: "i18n:floatingOrbs" },
              { value: "subtle-grid-dots", label: "i18n:gridDots" },
              { value: "sprinkles-sparks", label: "i18n:sprinkles" },
            ]} />
          </section>

          {hasDecorativeLayers && <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('layers')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('layersHelp')}</p></div>
            <button type="button" role="switch" aria-checked={activeImage.showDecorativeLayers !== false} onClick={() => update({ showDecorativeLayers: activeImage.showDecorativeLayers === false })} className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"><span>{t('showLayers')}</span><span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${activeImage.showDecorativeLayers === false ? "bg-slate-300" : "bg-orange-500"}`}><span className={`size-4 rounded-full bg-white shadow transition-transform ${activeImage.showDecorativeLayers === false ? "translate-x-0" : "translate-x-5"}`} /></span></button>
          </section>}

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('background')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('backgroundHelp')}</p></div>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="group" aria-label={t('backgroundType')}>{(["solid", "gradient"] as const).map((type) => <button key={type} type="button" onClick={() => update({ background: { ...background, type } })} aria-pressed={background.type === type} className={`${toggleClass} capitalize ${background.type === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"}`}>{t(`backgroundTypes.${type}`)}</button>)}</div>
            <div className={`grid gap-3 ${background.type === "gradient" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              <label className="block text-xs font-semibold text-slate-600">{background.type === "gradient" ? t('startColor') : t('backgroundColor')}<span className="mt-1.5 flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm hover:border-slate-300"><input aria-label={t('primaryColor')} type="color" value={background.primaryColor} onChange={(event) => update({ background: { ...background, primaryColor: event.target.value } })} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="font-mono text-[11px] font-medium text-slate-500">{background.primaryColor.toUpperCase()}</span></span></label>
              {background.type === "gradient" && <label className="block text-xs font-semibold text-slate-600">{t('endColor')}<span className="mt-1.5 flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm hover:border-slate-300"><input aria-label={t('secondaryColor')} type="color" value={background.secondaryColor} onChange={(event) => update({ background: { ...background, secondaryColor: event.target.value } })} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="font-mono text-[11px] font-medium text-slate-500">{background.secondaryColor.toUpperCase()}</span></span></label>}
            </div>
            {background.type === "gradient" && <label className="block text-xs font-semibold text-slate-600">{t('angle')} <span className="font-mono font-medium text-slate-500">{background.angle ?? 135}&#176;</span><input aria-label={t('angleAria')} type="range" min="0" max="360" step="5" value={background.angle ?? 135} onChange={(event) => update({ background: { ...background, angle: Number(event.target.value) } })} className="mt-2 block w-full cursor-pointer accent-orange-500" /></label>}
            <div className="space-y-3">{presetGroups.map((group) => <div key={group.label}><h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{tRoot(`presetGroups.${group.label.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')}` as never)}</h4><div className="grid grid-cols-2 gap-2">{group.options.map((preset) => <button key={preset.label} type="button" onClick={() => update({ background: { type: preset.type, primaryColor: preset.primaryColor, secondaryColor: preset.secondaryColor, angle: 135 } })} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-left text-[11px] font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98]"><span className="size-5 shrink-0 rounded-md border border-slate-200" style={{ background: preset.type === "gradient" ? `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})` : preset.primaryColor }} /><span className="truncate">{tRoot(`presets.${preset.label.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')}` as never)}</span></button>)}</div></div>)}</div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('deviceFrame')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('deviceHelp')}</p></div>
            <button type="button" role="switch" aria-checked={activeImage.frameVisible !== false} onClick={() => update({ frameVisible: activeImage.frameVisible === false })} className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"><span>{t('showDevice')}</span><span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${activeImage.frameVisible === false ? "bg-slate-300" : "bg-orange-500"}`}><span className={`size-4 rounded-full bg-white shadow transition-transform ${activeImage.frameVisible === false ? "translate-x-0" : "translate-x-5"}`} /></span></button>
            <ThemeSelect label={t('frameFinish')} value={activeImage.frameColor ?? "template"} onChange={(value) => update({ frameColor: value === "template" ? undefined : value as NonNullable<UploadedImage["frameColor"]> })} options={[
              { value: "template", label: "i18n:templateDefault" },
              { value: "dark", label: "i18n:dark" },
              { value: "light", label: "i18n:light" },
              { value: "accent", label: "i18n:accent" },
            ]} />
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div><h3 className="text-sm font-semibold text-slate-900">{t('projectBrand')}</h3><p className="mt-0.5 text-xs text-slate-500">{t('brandHelp')}</p></div>
            <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300"><input aria-label={t('brandColorAria')} type="color" value={brandColor} onChange={(event) => setBrandSettings({ brandColor: event.target.value })} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" />{t('brandColor')} <span className="ml-auto font-mono text-[11px] text-slate-400">{brandColor.toUpperCase()}</span></label>
            <button type="button" onClick={applyBrandColorToAllSlides} className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"><Check className="size-3.5" />{t('applyBrand')}</button>
          </section>
        </aside>
      </div>
      <StepNavigation onBack={onBack} onContinue={onContinue} continueLabel={t('continueToExport')} />
    </section>
  );
}
