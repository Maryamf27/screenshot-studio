"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { getStorePreset } from "@/src/config/storePresets";
import { renderSlide } from "@/src/renderer/render-slide";
import { getTemplate, type TemplateId } from "@/src/renderer/templates";
import { useProjectStore } from "@/src/store/project-store";

type CanvasPreviewProps = { templateId?: TemplateId };

export function CanvasPreview({ templateId = "classic-top" }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const image = useProjectStore((state) => state.images[0]);
  const presetId = useProjectStore((state) => state.selectedPresetIds[0]);
  const font = useProjectStore((state) => state.font);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const preset = getStorePreset(presetId ?? "phone");
    if (!preset) return;
    const source = new Image();
    const url = URL.createObjectURL(image.file);
    source.onload = () => {
      renderSlide({ headline: "Your app, beautifully presented", subheadline: "A polished store listing that feels ready to ship.", image: source, canvas: canvasRef.current!, fontFamily: font }, getTemplate(templateId), preset);
      URL.revokeObjectURL(url);
    };
    source.src = url;
    return () => {
      source.onload = null;
      URL.revokeObjectURL(url);
    };
  }, [font, image, presetId, templateId]);

  if (!image) return <div className="flex min-h-72 items-center justify-center border border-dashed border-border text-sm text-muted-foreground">Upload a screenshot to preview a template.</div>;
  return <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-medium text-primary"><CheckCircle2 aria-hidden="true" /> Gate 1 renderer check ready</div><canvas ref={canvasRef} className="mx-auto max-h-[34rem] w-full rounded-xl border border-border object-contain shadow-sm" aria-label="Rendered screenshot preview" /></div>;
}
