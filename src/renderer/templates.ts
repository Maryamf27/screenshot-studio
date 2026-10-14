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
export type BackgroundAssetDefinition = { src: string; opacity?: number };
export type StickerDefinition = { src: string; x: number; y: number; w: number; rotation?: number };
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
  rotation?: number;
  glow?: boolean;
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
  category?: TemplateCategory;
  nativeDecoration?: "fashion-festive-promo" | "fitness-neon-dark" | "edu-pastel-waves";
  backgroundAsset?: BackgroundAssetDefinition;
  defaultHeadline?: string;
  defaultRatingBadge?: { score: string; stars: number; subtitle: string };
  headlineFontFamily?: string;
  stickers?: StickerDefinition[];
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

export type TemplateCategory = "Fashion" | "Fitness" | "Education" | "Productivity";

export type TemplateId =
  | "award-badge"
  | "earthy-routine"
  | "split-bleed"
  | "floating-widget"
  | "side-by-side-proof"
  | "bottom-banner-widget"
  | "split-sidecar-hero"
  | "top-pill-story"
  | "fashion-panoramic-split" | "fashion-editorial-grid" | "fashion-promo-block"
  | "fitness-dark-neon" | "fitness-log-cards"
  | "edu-flashcard-stack" | "edu-institution-badges"
  | "prod-minimal-widget" | "prod-split-bleed"
  | "fashion-festive-promo" | "fitness-neon-dark" | "edu-pastel-waves";

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

const categoryTemplates: TemplateDefinition[] = [
  { ...widgetTemplate, id: "fashion-festive-promo", category: "Fashion", nativeDecoration: "fashion-festive-promo", defaultHeadline: "FREE SHIPPING FREE RETURNS", label: "Festive Promo", style: "Fashion · festive campaign", description: "A bold red campaign with gold ribbons, confetti sparks, and stacked offer copy.", background: { type: "gradient", start: "#D91A2A", end: "#B00C1B", angle: 135 }, bgShapeStyle: "solid", headline: { ...widgetTemplate.headline, y: 7, width: 92, height: 18, fontSize: 8, fontWeight: 800, lineHeight: 0.96, color: "#FFFFFF", maxLines: 2 }, subheadline: { ...widgetTemplate.subheadline, y: 27, color: "#FFE8B8" }, screenshot: { ...widgetTemplate.screenshot, y: 43, height: 61 }, floatingWidget: undefined },
  { ...splitTemplate, id: "fashion-panoramic-split", category: "Fashion", label: "Panoramic Split", style: "Fashion · continuous panorama", description: "A tilted phone crosses a soft, continuous fashion canvas.", background: { type: "gradient", start: "#F5E7E3", end: "#E5D7CF", angle: 135, continuous: true }, headline: { ...splitTemplate.headline, y: 6, color: "#3D2825", accentColor: "#A95043" }, subheadline: { ...splitTemplate.subheadline, y: 16, color: "#775B55" }, screenshot: { ...splitTemplate.screenshot, x: 51, y: 48, width: 78, height: 72 }, device: { ...splitTemplate.device, rotation: -12, rimColor: "#C49380" }, bgShapeStyle: "solid" },
  { ...awardTemplate, id: "fashion-editorial-grid", category: "Fashion", label: "Editorial Grid", style: "Fashion · serif editorial", description: "Floating aesthetic stickers frame a centered editorial headline and phone.", background: { type: "solid", start: "#F5EFEB" }, defaultHeadline: "AI Stylist & outfit planner", defaultRatingBadge: { score: "5", stars: 5, subtitle: "6000 reviews" }, stickers: [{ src: "/assets/fashion-sticker-handbag.svg", x: 12, y: 44, w: 24, rotation: -13 }, { src: "/assets/fashion-sticker-dress.svg", x: 88, y: 43, w: 24, rotation: 11 }, { src: "/assets/fashion-sticker-sparkle.svg", x: 87, y: 69, w: 18, rotation: -8 }], badge: { x: 50, y: 2.5, width: 70, height: 5.2, fontSize: 2.5, fontWeight: 700, lineHeight: 1, color: "#66524A", fillColor: "#FBF8F5", paddingX: 2.4, paddingY: 0.7, align: "center", text: "Trusted by 2M Users", laurel: true }, headline: { ...awardTemplate.headline, y: 12, height: 10, color: "#35291F", fontWeight: 500, fontSize: 6.1, lineHeight: 1.02, maxLines: 2 }, subheadline: { ...awardTemplate.subheadline, y: 23, height: 4, color: "#78685A" }, screenshot: { ...awardTemplate.screenshot, y: 45, width: 50, height: 57 }, bgShapeStyle: "solid", taskCards: undefined },
  { ...widgetTemplate, id: "fashion-promo-block", category: "Fashion", label: "Promo Block", style: "Fashion · bold campaign", description: "A high impact campaign banner leads into the product screenshot.", background: { type: "solid", start: "#F5C84C" }, headerPanel: { x: 0, y: 0, width: 100, height: 31, radius: 0, fillColor: "#E9402B" }, headline: { ...widgetTemplate.headline, y: 6, color: "#FFFFFF", fontSize: 7.2 }, subheadline: { ...widgetTemplate.subheadline, y: 17, color: "#FFF1D7" }, screenshot: { ...widgetTemplate.screenshot, y: 42, height: 60 }, floatingWidget: undefined },
  { ...splitTemplate, id: "fitness-dark-neon", category: "Fitness", nativeDecoration: "fitness-neon-dark", backgroundAsset: { src: "/assets/fitness-athlete-silhouette.svg", opacity: 0.3 }, label: "Dark Neon", style: "Fitness · neon social proof", description: "A dark canvas, athlete silhouette, cyan device glow, and laurel badge.", background: { type: "gradient", start: "#0A0E17", end: "#161F33", angle: 135 }, badge: { x: 50, y: 3, width: 48, height: 5, fontSize: 2.8, fontWeight: 800, lineHeight: 1, color: "#C9FBFF", fillColor: "#12343C", paddingX: 2, paddingY: 0.8, align: "center", text: "9M+ USERS", laurel: true }, headline: { ...splitTemplate.headline, y: 12, color: "#FFFFFF", accentColor: "#35E5F2" }, subheadline: { ...splitTemplate.subheadline, y: 22, color: "#B7D6DA" }, screenshot: { ...splitTemplate.screenshot, y: 38, height: 67 }, device: { ...splitTemplate.device, glow: true, rimColor: "#00A3FF", rimWidth: 0.4 }, bgShapeStyle: "solid" },
  { ...splitTemplate, id: "fitness-neon-dark", category: "Fitness", nativeDecoration: "fitness-neon-dark", backgroundAsset: { src: "/assets/fitness-athlete-silhouette.svg", opacity: 0.3 }, label: "Neon Dark", style: "Fitness · electric cyan glow", description: "A dark fitness canvas with an athlete silhouette, radial blue aura, glowing device rim, and laurel social proof.", background: { type: "gradient", start: "#0A0E17", end: "#161F33", angle: 135 }, bgShapeStyle: "solid", badge: { x: 50, y: 3, width: 48, height: 5.5, fontSize: 2.8, fontWeight: 800, lineHeight: 1, color: "#F3C668", fillColor: "#141A24", paddingX: 2, paddingY: 0.8, align: "center", text: "9M+ USERS", laurel: true }, headline: { ...splitTemplate.headline, y: 12, color: "#FFFFFF", accentColor: "#00A3FF" }, subheadline: { ...splitTemplate.subheadline, y: 22, color: "#B6C4DA" }, screenshot: { ...splitTemplate.screenshot, y: 38, height: 67 }, device: { ...splitTemplate.device, glow: true, rimColor: "#00A3FF", rimWidth: 0.35 }, floatingWidget: undefined },
  { ...awardTemplate, id: "fitness-log-cards", category: "Fitness", label: "Workout Log Cards", style: "Fitness · exercise checklist", description: "Exercise checkoff cards float above a strong phone preview.", background: { type: "solid", start: "#E8F6F5" }, headline: { ...awardTemplate.headline, color: "#103B3B" }, taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, i) => ({ ...card, y: 23 + i * 10, fillColor: "#FFFFFF", accentColor: "#0EAAA4", textColor: "#163F3D" })), screenshot: { ...awardTemplate.screenshot, y: 47, height: 56 }, badge: undefined },
  { ...widgetTemplate, id: "edu-flashcard-stack", category: "Education", label: "Academic Sticker Stack", style: "Education · premium ivory study", description: "Academic sticker art frames a refined study headline, social proof, and device preview.", background: { type: "gradient", start: "#FBF9F6", end: "#F1EADF", angle: 135 }, defaultHeadline: "Master Any Skill in Weeks", defaultRatingBadge: { score: "4.9", stars: 5, subtitle: "Loved by learners" }, headlineFontFamily: "Playfair Display", stickers: [{ src: "/assets/education-sticker-cap.png", x: 9, y: 40, w: 22, rotation: -13 }, { src: "/assets/education-sticker-books.png", x: 91, y: 41, w: 23, rotation: 10 }, { src: "/assets/education-sticker-pen.png", x: 10, y: 73, w: 20, rotation: 14 }, { src: "/assets/education-sticker-certificate.png", x: 90, y: 76, w: 23, rotation: -9 }], bgShapes: undefined, badge: { x: 50, y: 2.5, width: 50, height: 4.5, fontSize: 2.3, fontWeight: 700, lineHeight: 1, color: "#5B4A32", fillColor: "#FFFEFC", paddingX: 2, paddingY: 0.6, align: "center", text: "ACADEMY APPROVED", laurel: true }, headline: { ...widgetTemplate.headline, y: 12, height: 10, fontSize: 5.8, fontWeight: 500, lineHeight: 1.08, color: "#202B3B", maxLines: 2 }, subheadline: { ...widgetTemplate.subheadline, y: 23, height: 4, color: "#64748B", fontSize: 2.3 }, screenshot: { ...widgetTemplate.screenshot, y: 42, height: 62 }, floatingWidget: undefined, bgShapeStyle: "solid" },
  { ...widgetTemplate, id: "edu-pastel-waves", category: "Education", nativeDecoration: "edu-pastel-waves", label: "Pastel Waves & Cards", style: "Education · layered study cards", description: "Soft blue vector waves and stacked flashcards frame the learning app preview.", background: { type: "solid", start: "#EBF3FE" }, bgShapeStyle: "solid", headline: { ...widgetTemplate.headline, color: "#163B6B" }, subheadline: { ...widgetTemplate.subheadline, color: "#436A96" }, screenshot: { ...widgetTemplate.screenshot, y: 31, height: 70 }, floatingWidget: undefined },
  { ...splitTemplate, id: "edu-institution-badges", category: "Education", label: "Institution Badges", style: "Education · credential grid", description: "A tilted left phone balances a neat grid of institution badges.", background: { type: "solid", start: "#F4F8FC" }, headline: { ...splitTemplate.headline, x: 69, y: 12, width: 55, align: "left", color: "#15395B", fontSize: 4.8 }, subheadline: { ...splitTemplate.subheadline, x: 69, y: 25, width: 55, align: "left", color: "#55718C" }, screenshot: { ...splitTemplate.screenshot, x: 31, y: 49, width: 47, height: 64 }, device: { ...splitTemplate.device, rotation: -7, rimColor: "#8AB5D9" }, taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, i) => ({ ...card, x: 64, y: 42 + i * 14, width: 32, height: 10, fillColor: "#FFFFFF", accentColor: "#2D75B9" })), badge: undefined },
  { ...widgetTemplate, id: "prod-minimal-widget", category: "Productivity", label: "Minimal Widget", style: "Productivity · task notifications", description: "Editable task rows appear as floating widgets around a clean phone frame.", background: { type: "solid", start: "#F7F8FA" }, screenshot: { ...widgetTemplate.screenshot, y: 28, height: 65 }, floatingWidget: { ...widgetTemplate.floatingWidget!, x: 50, y: 68, width: 82, height: 20, eyebrow: "TODAY", title: "Plan your next task", detail: "Stay focused and on track" } },
  { ...splitTemplate, id: "prod-split-bleed", category: "Productivity", label: "Split Bleed", style: "Productivity · developer dark mode", description: "An upper caption gives way to a dark developer screen bleeding off the lower edge.", background: { type: "gradient", start: "#10141E", end: "#202A38", angle: 135 }, headline: { ...splitTemplate.headline, y: 6, color: "#F8FAFC", accentColor: "#64D9A5" }, subheadline: { ...splitTemplate.subheadline, y: 18, color: "#AAB8C8" }, screenshot: { ...splitTemplate.screenshot, y: 35, height: 78 }, device: { ...splitTemplate.device, color: "#090D16", rimColor: "#394B5C" } },
];

export const templates: readonly TemplateDefinition[] = [...baseTemplates, ...additionalTemplates, ...categoryTemplates];

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
