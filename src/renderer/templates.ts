import templateData from "@/src/renderer/templates.json";

export type TextLayerDefinition = {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: 400 | 500 | 700 | 800;
  lineHeight: number;
  color: string;
  align: CanvasTextAlign;
  maxLines?: number;
  accentColor?: string;
  accentWords?: string[];
  autoContrast?: boolean;
};

export type BackgroundDefinition = { type: "solid" | "gradient"; start: string; end?: string; angle?: number; continuous?: boolean };
export type ScreenshotLayerDefinition = { x: number; y: number; width: number; height: number; radius: number; fit: "contain" | "cover" };
export type DeviceLayerDefinition = {
  type: "phone";
  visible: boolean;
  color: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  rimColor?: string;
  rimWidth?: number;
  notchVisible?: boolean;
};
export type BadgeLayerDefinition = TextLayerDefinition & {
  fillColor: string;
  text: string;
  paddingX: number;
  paddingY: number;
  firstSlideOnly?: boolean;
  laurel?: boolean;
};

export type BackgroundShapeDefinition = {
  type: "circle" | "orb" | "pill" | "pillar" | "arch" | "wave";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation?: number;
  opacity?: number;
};
export type BackgroundShapeStyle = "arch" | "orbs" | "pillars" | "solid";
export type SlideBackgroundAccent = "template" | "none" | "arches" | "orbs" | "grid-dots" | "sprinkles" | "floating-orbs" | "subtle-grid-dots" | "sprinkles-sparks";

export type HeaderPanelDefinition = { x: number; y: number; width: number; height: number; radius: number; fillColor: string };
export type TaskCardDefinition = { x: number; y: number; width: number; height: number; radius: number; fillColor: string; textColor: string; accentColor: string; time: string; title: string; detail?: string };
export type RoutineRowsDefinition = { x: number; y: number; width: number; rowHeight: number; gap: number; radius: number; fillColor: string; textColor: string; mutedColor: string; accentColor: string; rows: { time: string; title: string }[] };
export type FloatingWidgetDefinition = { x: number; y: number; width: number; height: number; radius: number; fillColor: string; textColor: string; mutedColor: string; accentColor: string; eyebrow: string; title: string; detail: string };

export type TemplateDefinition = {
  id: TemplateId;
  label: string;
  style: string;
  description: string;
  background: BackgroundDefinition;
  bgShapeStyle: BackgroundShapeStyle;
  headline: TextLayerDefinition;
  subheadline: TextLayerDefinition;
  screenshot: ScreenshotLayerDefinition;
  device: DeviceLayerDefinition;
  badge?: BadgeLayerDefinition;
  bgShapes?: BackgroundShapeDefinition[];
  headerPanel?: HeaderPanelDefinition;
  taskCards?: TaskCardDefinition[];
  routineRows?: RoutineRowsDefinition;
  floatingWidget?: FloatingWidgetDefinition;
};

export type TemplateId =
  | "award-badge"
  | "earthy-routine"
  | "split-bleed"
  | "floating-widget"
  | "side-by-side-proof"
  | "bottom-banner-widget"
  | "split-sidecar-hero"
  | "top-pill-story";

// Positions and sizes in the JSON definitions are percentages of the output canvas.
const baseTemplates = templateData as readonly TemplateDefinition[];
const awardTemplate = baseTemplates.find((template) => template.id === "award-badge")!;
const splitTemplate = baseTemplates.find((template) => template.id === "split-bleed")!;
const widgetTemplate = baseTemplates.find((template) => template.id === "floating-widget")!;

const additionalTemplates: TemplateDefinition[] = [
  {
    ...awardTemplate,
    id: "side-by-side-proof",
    label: "Side-by-Side Proof Cards",
    style: "Paired feature cards",
    description: "Two compact proof cards sit side by side above a centered device hero.",
    headline: { ...awardTemplate.headline, y: 8, height: 7.5 },
    subheadline: { ...awardTemplate.subheadline, y: 16, height: 4.5 },
    taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, index) => ({ ...card, x: index === 0 ? 6 : 51, y: 23, width: 43, height: 11.5 })),
    screenshot: { ...awardTemplate.screenshot, x: 50, y: 39, width: 70, height: 61 },
  },
  {
    ...widgetTemplate,
    id: "bottom-banner-widget",
    label: "Bottom Banner Notification",
    style: "Overlapping bottom banner",
    description: "A broad notification banner overlaps the lower edge of a large centered phone.",
    headline: { ...widgetTemplate.headline, y: 4, height: 8 },
    subheadline: { ...widgetTemplate.subheadline, y: 13, height: 5 },
    screenshot: { ...widgetTemplate.screenshot, y: 20, width: 72, height: 69 },
    floatingWidget: widgetTemplate.floatingWidget ? { ...widgetTemplate.floatingWidget, x: 7, y: 76, width: 86, height: 17, radius: 3.4 } : undefined,
  },
  {
    ...splitTemplate,
    id: "split-sidecar-hero",
    label: "Split Sidecar Hero",
    style: "Left copy, right device",
    description: "A compact text and feature column balances a large phone positioned on the right.",
    background: { type: "gradient", start: "#E9F6F4", end: "#D8EAE7", angle: 145 },
    headerPanel: { x: 5, y: 5, width: 40, height: 25, radius: 3, fillColor: "#FFFFFF" },
    headline: { ...splitTemplate.headline, x: 8, y: 9, width: 34, height: 9, align: "left", color: "#153B3A", accentColor: "#0F766E" },
    subheadline: { ...splitTemplate.subheadline, x: 8, y: 19, width: 34, height: 8, align: "left", color: "#426361" },
    screenshot: { ...splitTemplate.screenshot, x: 72, y: 20, width: 52, height: 68 },
    taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, index) => ({ ...card, x: 6, y: index === 0 ? 32 : 44.5, width: 39, height: 10.5 })),
    badge: undefined,
  },
  {
    ...widgetTemplate,
    id: "top-pill-story",
    label: "Top Pill Story",
    style: "Pill-tag feature stack",
    description: "A compact pill tag leads into a headline, phone preview, and a small floating status card.",
    badge: {
      x: 50, y: 2.5, width: 47, height: 4.8, fontSize: 2.5, fontWeight: 700, lineHeight: 1,
      color: "#FFFFFF", fillColor: "#0F766E", paddingX: 2.2, paddingY: 0.7, align: "center",
      text: "NEW  ·  FEATURED", maxLines: 1,
    },
    headline: { ...widgetTemplate.headline, y: 9, height: 7 },
    subheadline: { ...widgetTemplate.subheadline, y: 16, height: 4.5 },
    screenshot: { ...widgetTemplate.screenshot, y: 22, width: 64, height: 67 },
    floatingWidget: widgetTemplate.floatingWidget ? { ...widgetTemplate.floatingWidget, x: 14, y: 76, width: 72, height: 15 } : undefined,
  },
];

export const templates: readonly TemplateDefinition[] = [...baseTemplates, ...additionalTemplates];

const legacyTemplateIds: Record<string, TemplateId> = {
  "classic-top": "earthy-routine",
  "gradient-pop": "floating-widget",
  "minimal-white": "floating-widget",
  "feature-badge": "award-badge",
  "dark-premium": "split-bleed",
  "split-caption": "split-bleed",
  "continuous-panorama": "earthy-routine",
  "warm-editorial": "floating-widget",
};

export function getTemplate(id: string | null | undefined): TemplateDefinition {
  const canonicalId = id ? legacyTemplateIds[id] ?? id : undefined;
  return templates.find((template) => template.id === canonicalId) ?? templates[0];
}
