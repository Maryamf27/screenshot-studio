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
export type BackgroundAssetDefinition = { src: string; opacity?: number; fit?: "contain" | "cover" };
export type StickerDefinition = { src: string; x: number; y: number; w: number; rotation?: number };
export type ScreenshotLayerDefinition = { x: number; y: number; width: number; height: number; radius: number; fit: "contain" | "cover" };
export type ScreenshotPanelDefinition = {
  sourceSlide?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fit: "contain" | "cover";
  rotation?: number;
  borderColor?: string;
};
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
  category: TemplateCategory;
  nativeDecoration?: "fashion-festive-promo" | "fitness-neon-dark" | "fitness-cinematic" | "edu-pastel-waves";
  backgroundAsset?: BackgroundAssetDefinition;
  defaultHeadline?: string;
  defaultSubheadline?: string;
  headlineFontFamily?: string;
  stickers?: StickerDefinition[];
  screenshotPanels?: ScreenshotPanelDefinition[];
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

export type TemplateCategory = "General" | "Fashion" | "Fitness" | "Education" | "Productivity";

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
    category: "General",
    label: "Side-by-Side Feature Cards",
    style: "Two column features",
    description: "Two editable callouts flank the central phone preview.",
    headline: { ...awardTemplate.headline, y: 8, height: 7.5, fontSize: 5.2 },
    subheadline: { ...awardTemplate.subheadline, y: 17, height: 4.5 },
    badge: undefined,
    taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card) => ({
      ...card,
      x: card.x,
      y: 43,
      width: 31,
      height: 15,
      title: "",
      detail: "",
    })),
    screenshot: { ...awardTemplate.screenshot, x: 50, y: 35, width: 48, height: 64 },
  },
  {
    ...widgetTemplate,
    id: "bottom-banner-widget",
    category: "General",
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
    category: "General",
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
    category: "General",
    label: "Caption Stack",
    style: "Open editorial caption",
    description: "An open caption block leads into an oversized phone preview and an optional callout.",
    badge: {
      x: 50, y: 2.5, width: 47, height: 4.8, fontSize: 2.5, fontWeight: 700, lineHeight: 1,
      color: "#FFFFFF", fillColor: "#0F766E", paddingX: 2.2, paddingY: 0.7, align: "center",
      text: "", maxLines: 1,
    },
    headline: { ...widgetTemplate.headline, y: 9, height: 7 },
    subheadline: { ...widgetTemplate.subheadline, y: 16, height: 4.5 },
    screenshot: { ...widgetTemplate.screenshot, y: 22, width: 64, height: 67 },
    floatingWidget: widgetTemplate.floatingWidget ? { ...widgetTemplate.floatingWidget, x: 14, y: 76, width: 72, height: 15 } : undefined,
  },
];

const categoryTemplates: TemplateDefinition[] = [
  { ...widgetTemplate, id: "fashion-festive-promo", category: "Fashion", nativeDecoration: "fashion-festive-promo", defaultHeadline: "A New Season", label: "Festive Promo", style: "Fashion · festive campaign", description: "A restrained campaign canvas with gold details, generous headline space, and a large product preview.", background: { type: "gradient", start: "#D91A2A", end: "#B00C1B", angle: 135 }, bgShapeStyle: "solid", headline: { ...widgetTemplate.headline, y: 7, width: 92, height: 18, fontSize: 8, fontWeight: 800, lineHeight: 0.96, color: "#FFFFFF", maxLines: 2 }, subheadline: { ...widgetTemplate.subheadline, y: 27, color: "#FFE8B8" }, screenshot: { ...widgetTemplate.screenshot, y: 43, height: 61 }, floatingWidget: undefined },
  { ...splitTemplate, id: "fashion-panoramic-split", category: "Fashion", label: "Panoramic Split", style: "Fashion · continuous panorama", description: "A tilted phone crosses a soft, continuous fashion canvas.", background: { type: "gradient", start: "#F5E7E3", end: "#E5D7CF", angle: 135, continuous: true }, headline: { ...splitTemplate.headline, y: 6, color: "#3D2825", accentColor: "#A95043" }, subheadline: { ...splitTemplate.subheadline, y: 16, color: "#775B55" }, screenshot: { ...splitTemplate.screenshot, x: 51, y: 48, width: 78, height: 72 }, device: { ...splitTemplate.device, rotation: -12, rimColor: "#C49380" }, bgShapeStyle: "solid" },
  { ...awardTemplate, id: "fashion-editorial-grid", category: "Fashion", label: "Editorial Collage", style: "Fashion · editorial contact sheet", description: "A composed fashion campaign pairs an oversized app preview with two real screenshot panels and editable editorial copy.", defaultHeadline: "Find Your Signature Style", headlineFontFamily: "Georgia", screenshotPanels: [{ sourceSlide: 1, x: 17, y: 43, width: 20, height: 29, radius: 1.2, fit: "contain", rotation: -2, borderColor: "#D8C9BD" }, { sourceSlide: 2, x: 18, y: 75, width: 20, height: 29, radius: 1.2, fit: "contain", rotation: 2, borderColor: "#D8C9BD" }], stickers: [{ src: "/assets/fashion-sticker-sparkle.svg", x: 41, y: 43, w: 7 }, { src: "/assets/fashion-sticker-handbag.svg", x: 43, y: 76, w: 10 }], background: { type: "solid", start: "#F3EAE2" }, badge: undefined, headline: { ...awardTemplate.headline, y: 7, height: 10, width: 92, color: "#35291F", fontWeight: 500, fontSize: 6.1, lineHeight: 1.02, maxLines: 2 }, subheadline: { ...awardTemplate.subheadline, y: 18, height: 4, width: 84, color: "#78685A", fontSize: 2.35 }, screenshot: { ...awardTemplate.screenshot, x: 70, y: 54, width: 54, height: 69, radius: 2.5 }, device: { ...awardTemplate.device, color: "#F8F4EF", rimColor: "#C9B9AB", rimWidth: 0.16, glow: false }, bgShapeStyle: "solid", taskCards: undefined },
  { ...widgetTemplate, id: "fashion-promo-block", category: "Fashion", label: "Promo Block", style: "Fashion · bold campaign", description: "A high impact campaign banner leads into the product screenshot.", background: { type: "solid", start: "#F5C84C" }, headerPanel: { x: 0, y: 0, width: 100, height: 31, radius: 0, fillColor: "#E9402B" }, headline: { ...widgetTemplate.headline, y: 6, color: "#FFFFFF", fontSize: 7.2 }, subheadline: { ...widgetTemplate.subheadline, y: 17, color: "#FFF1D7" }, screenshot: { ...widgetTemplate.screenshot, y: 42, height: 60 }, floatingWidget: undefined },
  { ...splitTemplate, id: "fitness-dark-neon", category: "Fitness", nativeDecoration: "fitness-neon-dark", label: "Dark Neon", style: "Fitness · electric cyan", description: "A charcoal training layout with athletic photography and an electric cyan device edge.", defaultHeadline: "Train With Purpose", background: { type: "gradient", start: "#0A0E17", end: "#161F33", angle: 135 }, badge: undefined, headline: { ...splitTemplate.headline, y: 12, color: "#FFFFFF", accentColor: "#35E5F2" }, subheadline: { ...splitTemplate.subheadline, y: 22, color: "#B7D6DA" }, screenshot: { ...splitTemplate.screenshot, y: 38, height: 67 }, device: { ...splitTemplate.device, glow: true, rimColor: "#00A3FF", rimWidth: 0.4 }, bgShapeStyle: "solid" },
  { ...awardTemplate, id: "fitness-neon-dark", category: "Fitness", nativeDecoration: "fitness-cinematic", label: "Fitness & Bodybuilding", style: "Cinematic · dark olive", description: "Athletic photography, deep charcoal, and restrained olive accents frame the app preview.", defaultHeadline: "Move With Purpose", background: { type: "gradient", start: "#070A08", end: "#171D15", angle: 135 }, bgShapeStyle: "solid", badge: undefined, headline: { ...awardTemplate.headline, x: 8, y: 13, height: 11, width: 60, fontSize: 6.6, fontWeight: 800, align: "left", color: "#F2F4EF", accentColor: "#A3AD79" }, subheadline: { ...awardTemplate.subheadline, x: 8, y: 26, width: 55, align: "left", height: 6, color: "#B8C1B4" }, taskCards: undefined, screenshot: { ...awardTemplate.screenshot, x: 75, y: 50, width: 45, height: 67 }, device: { ...awardTemplate.device, color: "#090D0A", glow: false, rimColor: "#78845E", rimWidth: 0.25 }, floatingWidget: undefined },
  { ...awardTemplate, id: "fitness-log-cards", category: "Fitness", label: "Workout Log Cards", style: "Fitness · exercise checklist", description: "Exercise checkoff cards float above a strong phone preview.", background: { type: "solid", start: "#E8F6F5" }, headline: { ...awardTemplate.headline, color: "#103B3B" }, taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, i) => ({ ...card, y: 23 + i * 10, fillColor: "#FFFFFF", accentColor: "#0EAAA4", textColor: "#163F3D" })), screenshot: { ...awardTemplate.screenshot, y: 47, height: 56 }, badge: undefined },
  { ...widgetTemplate, id: "edu-flashcard-stack", category: "Education", label: "Academic Sticker Stack", style: "Education · premium ivory study", description: "Academic sticker art frames editable course copy and a clean device preview.", background: { type: "gradient", start: "#FBF9F6", end: "#F1EADF", angle: 135 }, headlineFontFamily: "Georgia", stickers: [{ src: "/assets/education-sticker-cap.png", x: 9, y: 40, w: 22, rotation: -13 }, { src: "/assets/education-sticker-books.png", x: 91, y: 41, w: 23, rotation: 10 }, { src: "/assets/education-sticker-pen.png", x: 10, y: 73, w: 20, rotation: 14 }, { src: "/assets/education-sticker-certificate.png", x: 90, y: 76, w: 23, rotation: -9 }], bgShapes: undefined, badge: undefined, headline: { ...widgetTemplate.headline, y: 12, height: 10, fontSize: 5.8, fontWeight: 500, lineHeight: 1.08, color: "#202B3B", maxLines: 2 }, subheadline: { ...widgetTemplate.subheadline, y: 23, height: 4, color: "#64748B", fontSize: 2.3 }, screenshot: { ...widgetTemplate.screenshot, y: 42, height: 62 }, floatingWidget: undefined, bgShapeStyle: "solid" },
  { ...widgetTemplate, id: "edu-pastel-waves", category: "Education", nativeDecoration: "edu-pastel-waves", label: "Pastel Waves & Cards", style: "Education · layered study cards", description: "Soft blue vector waves and stacked flashcards frame the learning app preview.", background: { type: "solid", start: "#EBF3FE" }, bgShapeStyle: "solid", headline: { ...widgetTemplate.headline, color: "#163B6B" }, subheadline: { ...widgetTemplate.subheadline, color: "#436A96" }, screenshot: { ...widgetTemplate.screenshot, y: 31, height: 70 }, floatingWidget: undefined },
  { ...splitTemplate, id: "edu-institution-badges", category: "Education", label: "Institution Badges", style: "Education · credential grid", description: "A tilted left phone balances a neat grid of institution badges.", background: { type: "solid", start: "#F4F8FC" }, headline: { ...splitTemplate.headline, x: 69, y: 12, width: 55, align: "left", color: "#15395B", fontSize: 4.8 }, subheadline: { ...splitTemplate.subheadline, x: 69, y: 25, width: 55, align: "left", color: "#55718C" }, screenshot: { ...splitTemplate.screenshot, x: 31, y: 49, width: 47, height: 64 }, device: { ...splitTemplate.device, rotation: -7, rimColor: "#8AB5D9" }, taskCards: (awardTemplate.taskCards ?? []).slice(0, 2).map((card, i) => ({ ...card, x: 64, y: 42 + i * 14, width: 32, height: 10, fillColor: "#FFFFFF", accentColor: "#2D75B9" })), badge: undefined },
  { ...widgetTemplate, id: "prod-minimal-widget", category: "Productivity", label: "Product Focus", style: "Productivity · screen first", description: "A quiet interface lets the uploaded app screen become the hero without a decorative device frame.", background: { type: "solid", start: "#F7F8FA" }, headline: { ...widgetTemplate.headline, y: 5.5, height: 9, fontSize: 5.4, color: "#18211E" }, subheadline: { ...widgetTemplate.subheadline, y: 15, color: "#66736E" }, screenshot: { ...widgetTemplate.screenshot, y: 25, width: 92, height: 73, radius: 1.6 }, device: { ...widgetTemplate.device, visible: false }, floatingWidget: undefined },
  { ...splitTemplate, id: "prod-split-bleed", category: "Productivity", label: "Split Bleed", style: "Productivity · developer dark mode", description: "An upper caption gives way to a dark developer screen bleeding off the lower edge.", background: { type: "gradient", start: "#10141E", end: "#202A38", angle: 135 }, headline: { ...splitTemplate.headline, y: 6, color: "#F8FAFC", accentColor: "#64D9A5" }, subheadline: { ...splitTemplate.subheadline, y: 18, color: "#AAB8C8" }, screenshot: { ...splitTemplate.screenshot, y: 35, height: 78 }, device: { ...splitTemplate.device, color: "#090D16", rimColor: "#394B5C" } },
];

const categoryCopy: Record<TemplateCategory, { headline: string; subheadline: string }> = {
  General: { headline: "A Better Way to Get Things Done", subheadline: "Everything you need, thoughtfully brought together." },
  Fashion: { headline: "Find Your Signature Style", subheadline: "Discover pieces that feel entirely your own." },
  Fitness: { headline: "Move With Purpose", subheadline: "Build a routine that works for you." },
  Education: { headline: "Make Every Lesson Count", subheadline: "Learn at your pace, one idea at a time." },
  Productivity: { headline: "Make Space for Focus", subheadline: "Bring your plans and priorities into view." },
};

// Keep defaults present for every layout so a new upload never previews with placeholder copy.
const categoryBackgrounds: Record<TemplateCategory, string> = {
  General: "/assets/general-stone-texture.jpg",
  Fashion: "/assets/fashion-editorial-photo.jpg",
  Fitness: "/assets/fitness-gym-photo.jpg",
  Education: "/assets/education-library-photo.jpg",
  Productivity: "/assets/productivity-office-photo.jpg",
};

function backgroundOpacity(template: TemplateDefinition) {
  if (template.category === "Fitness") return template.id === "fitness-log-cards" ? 0.12 : 0.4;
  if (template.category === "Fashion") {
    if (template.id === "fashion-panoramic-split") return 0.52;
    if (template.id === "fashion-editorial-grid") return 0.38;
    return 0.12;
  }
  if (template.category === "Education") return template.id === "edu-flashcard-stack" ? 0.14 : 0.18;
  if (template.category === "Productivity") return template.id === "prod-minimal-widget" ? 0.3 : 0.16;
  return 0.14;
}

export const templates: readonly TemplateDefinition[] = [...baseTemplates, ...additionalTemplates, ...categoryTemplates].map((template) => ({
  ...template,
  backgroundAsset: { src: categoryBackgrounds[template.category], opacity: backgroundOpacity(template), fit: "cover" },
  defaultHeadline: template.defaultHeadline ?? categoryCopy[template.category].headline,
  defaultSubheadline: template.defaultSubheadline ?? categoryCopy[template.category].subheadline,
}));
export const templateCategories: readonly TemplateCategory[] = Array.from(new Set(templates.map((template) => template.category)));

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
