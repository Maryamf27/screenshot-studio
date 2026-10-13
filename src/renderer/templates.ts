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
export type SlideBackgroundAccent = "template" | "none" | "arches" | "orbs" | "grid-dots" | "sprinkles";

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
  | "floating-widget";

// Positions and sizes in the JSON definitions are percentages of the output canvas.
export const templates = templateData as readonly TemplateDefinition[];

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
