"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getStorePreset, type StorePreset } from "@/src/config/storePresets";
import { renderSlide } from "@/src/renderer/render-slide";
import { getTemplate, type TemplateId } from "@/src/renderer/templates";
import { useProjectStore } from "@/src/store/project-store";
import {useTranslations} from 'next-intl';

type CanvasPreviewProps = { templateId?: TemplateId; compact?: boolean; slideIndex?: number; applySlideCustomizations?: boolean };

export function CanvasPreview({ templateId, compact = false, slideIndex, applySlideCustomizations = true }: CanvasPreviewProps) {
  const t = useTranslations('preview');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useProjectStore((state) => state.images);
  const activeSlideIndex = useProjectStore((state) => state.activeSlideIndex);
  const selectedSlideIndex = slideIndex ?? (compact ? 0 : activeSlideIndex);
  const image = images[selectedSlideIndex];
  const slideText = useMemo(() => image ? {
    headline: image.headline,
    subheadline: image.subheadline,
    badgeText: image.badgeText,
    ratingBadge: image.ratingBadge,
    cardItems: image.cardItems,
    floatingWidgetItems: image.floatingWidgetItems,
  } : undefined, [image]);
  const imageCount = images.length;
  const presetId = useProjectStore((state) => state.selectedPresetIds[0]);
  const font = useProjectStore((state) => state.font);
  const brandColor = useProjectStore((state) => state.brandColor);
  const customDimensions = useProjectStore((state) => state.customDimensions);
  const storedTemplateId = useProjectStore((state) => state.images[state.activeSlideIndex]?.templateId);
  const [error, setError] = useState<string>();
  const activeTemplateId = templateId ?? storedTemplateId ?? "award-badge";
  const useSlideCustomizations = !compact && applySlideCustomizations;
  const custom = customDimensions[0];
  const preset = useMemo(() => {
    const outputPreset: StorePreset | undefined = compact ? getStorePreset("phone") : presetId ? getStorePreset(presetId) : custom ? {
      id: custom.id,
      label: custom.name,
      width: custom.width,
      height: custom.height,
      orientation: custom.width > custom.height ? "landscape" : "portrait",
    } : getStorePreset("phone");
    if (!outputPreset) return undefined;
    const previewLimit = compact ? 640 : 960;
    const scale = Math.min(1, previewLimit / outputPreset.height);
    return { ...outputPreset, width: Math.max(1, Math.round(outputPreset.width * scale)), height: Math.max(1, Math.round(outputPreset.height * scale)) };
  }, [compact, custom, presetId]);
  const previewHeight = compact ? 224 : 544;
  const previewWidth = preset ? Math.round(previewHeight * preset.width / preset.height) : previewHeight;
  const [textWarning, setTextWarning] = useState<string>();

  useEffect(() => {
    const output = canvasRef.current;
    if (!output || !image || !preset) return;
    let cancelled = false;
    setTextWarning(undefined);
    const template = getTemplate(activeTemplateId);
    const customBackground = image.background;
    const frameColors = { dark: "#111827", light: "#f8fafc", accent: brandColor } as const;
    void renderSlide(
      { image: image.file, relatedScreenshots: images.map((screenshot) => screenshot.file), headline: slideText!.headline, subheadline: slideText!.subheadline, badgeText: useSlideCustomizations ? slideText!.badgeText : undefined, showRatingBadge: useSlideCustomizations ? image.showRatingBadge : undefined, ratingBadge: useSlideCustomizations ? slideText!.ratingBadge : undefined, cardItems: useSlideCustomizations ? slideText!.cardItems : undefined, floatingWidgetItems: useSlideCustomizations ? slideText!.floatingWidgetItems : undefined, isFirstSlide: selectedSlideIndex === 0, panoramaIndex: selectedSlideIndex, panoramaCount: imageCount, fontFamily: useSlideCustomizations ? font : undefined, headlineFontFamily: useSlideCustomizations ? image.headlineFont : undefined, subheadlineFontFamily: useSlideCustomizations ? image.subheadlineFont : undefined, cardFontFamily: useSlideCustomizations ? image.cardFontFamily : undefined, headlineColor: useSlideCustomizations ? image.headlineColor : undefined, subheadlineColor: useSlideCustomizations ? image.subheadlineColor : undefined, textAlignment: useSlideCustomizations ? image.textAlignment : undefined },
      template,
      preset,
      {
        brandColor,
        backgroundAccent: useSlideCustomizations ? image.backgroundAccent : undefined,
        showDecorativeLayers: useSlideCustomizations ? image.showDecorativeLayers : undefined,
        frameVisible: useSlideCustomizations ? image.frameVisible : undefined,
        frameColor: useSlideCustomizations && image.frameColor ? frameColors[image.frameColor] : undefined,
        background: customBackground && useSlideCustomizations ? {
          ...template.background,
          type: customBackground.type,
          start: customBackground.primaryColor,
          end: customBackground.secondaryColor,
          angle: customBackground.angle ?? template.background.angle,
        } : undefined,
        onTextOverflow: compact ? undefined : () => { if (!cancelled) setTextWarning(t('textOverflow')); },
      },
    ).then((rendered) => {
      if (cancelled) return;
      setError(undefined);
      // Keep the visible preview's backing store at full output size. CSS scales only its display.
      output.width = rendered.width;
      output.height = rendered.height;
      const context = output.getContext("2d");
      if (!context) throw new Error("Canvas 2D context is unavailable.");
      context.drawImage(rendered, 0, 0);
    }).catch((reason: unknown) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to render this screenshot.");
    });

    return () => { cancelled = true; };
  }, [activeTemplateId, brandColor, compact, font, image, imageCount, images, slideText, preset, presetId, selectedSlideIndex, t, useSlideCustomizations]);

  if (!image) return <div className={`flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500 ${compact ? "aspect-4/3 min-h-32" : "min-h-72"}`}>{t('upload')}</div>;
  return (
    <div className={compact ? "w-full" : "space-y-3"}>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {textWarning && <p role="alert" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{textWarning}</p>}
      <div className="mx-auto max-w-full" style={{ aspectRatio: preset ? `${preset.width} / ${preset.height}` : "9 / 16", width: `min(100%, ${previewWidth}px)` }}>
        <canvas ref={canvasRef} className="block size-full rounded-xl border border-slate-200 bg-white object-contain" aria-label={compact ? t('template') : t('rendered')} />
      </div>
      {!compact && <p className="text-center text-xs text-muted-foreground">{t('scale')}</p>}
    </div>
  );
}
