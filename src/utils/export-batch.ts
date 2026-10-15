import JSZip from "jszip";
import { saveAs } from "file-saver";
import { allStorePresets, storePresets, type StorePlatform, type StorePreset } from "@/src/config/storePresets";
import { renderSlide } from "@/src/renderer/render-slide";
import { getTemplate } from "@/src/renderer/templates";
import { useProjectStore, type CustomDimension, type UploadedImage } from "@/src/store/project-store";

export type ExportTarget = {
  id: string;
  label: string;
  folder: string;
  platform: StorePlatform;
  preset: StorePreset;
};

export type ExportProgress = {
  stage: "render" | "package";
  current: number;
  total: number;
  slideIndex?: number;
  targetLabel?: string;
};

type ExportSelection = Pick<ReturnType<typeof useProjectStore.getState>, "selectedPlatform" | "selectedPresetIds" | "customDimensions">;

export function getExportTargets(state: ExportSelection = useProjectStore.getState()): ExportTarget[] {
  const platform = state.selectedPlatform;
  const selected = allStorePresets
    .filter((preset) => state.selectedPresetIds.includes(preset.id))
    .map((preset) => {
      const presetPlatform: StorePlatform = storePresets.googlePlay.presets.some(({ id }) => id === preset.id) ? "google-play" : "app-store";
      return {
        id: preset.id,
        label: preset.label,
        folder: preset.id,
        platform: presetPlatform,
        preset,
      };
    })
    .filter((target) => !platform || target.platform === platform);

  const custom: ExportTarget[] = state.customDimensions.map((dimension: CustomDimension) => ({
    id: dimension.id,
    label: `${dimension.name} (${dimension.width} x ${dimension.height})`,
    folder: `custom/${slugify(dimension.name) || dimension.id}`,
    platform: platform ?? "google-play",
    preset: {
      id: dimension.id,
      label: dimension.name,
      width: dimension.width,
      height: dimension.height,
      orientation: dimension.width > dimension.height ? "landscape" : "portrait",
    },
  }));

  return [...selected, ...custom];
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fileBaseName(slide: UploadedImage, index: number) {
  const sourceName = slide.name?.replace(/\.[^/.]+$/, "") || slide.headline || "feature";
  const slug = slugify(sourceName);
  return `slide-${index + 1}-${slug || "feature"}.png`;
}

export async function exportBatch(onProgress: (progress: ExportProgress) => void = () => undefined) {
  const state = useProjectStore.getState();
  if (state.images.length === 0) throw new Error("Upload at least one screenshot before exporting.");
  const targets = getExportTargets(state);
  if (targets.length === 0) throw new Error("Select at least one export size in Step 2.");

  const jobsTotal = state.images.length * targets.length;
  const zip = new JSZip();
  let jobsComplete = 0;

  for (const [slideIndex, slide] of state.images.entries()) {
    const template = getTemplate(slide.templateId ?? "award-badge");
    for (const target of targets) {
      onProgress({ stage: "render", current: jobsComplete, total: jobsTotal, slideIndex, targetLabel: target.label });
      const frameColors = { dark: "#111827", light: "#f8fafc", accent: state.brandColor } as const;
      const background = slide.background ? {
        ...template.background,
        type: slide.background.type,
        start: slide.background.primaryColor,
        end: slide.background.secondaryColor,
        angle: slide.background.angle ?? template.background.angle,
      } as const : undefined;
      const canvas = await renderSlide({
        image: slide.file,
        headline: slide.headline,
        subheadline: slide.subheadline,
        badgeText: slide.badgeText,
        showRatingBadge: slide.showRatingBadge,
        ratingBadge: slide.ratingBadge,
        cardItems: slide.cardItems,
        floatingWidgetItems: slide.floatingWidgetItems,
        isFirstSlide: slideIndex === 0,
        panoramaIndex: slideIndex,
        panoramaCount: state.images.length,
        fontFamily: state.font,
        headlineFontFamily: slide.headlineFont,
        subheadlineFontFamily: slide.subheadlineFont,
        cardFontFamily: slide.cardFontFamily,
        headlineColor: slide.headlineColor,
        subheadlineColor: slide.subheadlineColor,
        textAlignment: slide.textAlignment,
      }, template, target.preset, {
        brandColor: state.brandColor,
        background,
        backgroundAccent: slide.backgroundAccent,
        showDecorativeLayers: slide.showDecorativeLayers,
        frameVisible: slide.frameVisible,
        frameColor: slide.frameColor ? frameColors[slide.frameColor] : undefined,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      zip.folder(`${target.platform}/${target.folder}`)!.file(fileBaseName(slide, slideIndex), base64, { base64: true });
      jobsComplete += 1;
      onProgress({ stage: "render", current: jobsComplete, total: jobsTotal, slideIndex, targetLabel: target.label });
    }
  }

  onProgress({ stage: "package", current: 0, total: 100 });
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (metadata) => {
    onProgress({ stage: "package", current: Math.round(metadata.percent), total: 100 });
  });
  saveAs(blob, "store-screenshot-studio-export.zip");
  return { slides: state.images.length, targets: targets.length, files: jobsTotal };
}
