export type TemplateId = "classic-top" | "gradient-pop";

export type TemplateDefinition = {
  id: TemplateId;
  label: string;
  description: string;
  background: { type: "solid" | "gradient"; start: string; end?: string; angle?: number };
  headline: { x: number; y: number; width: number; fontSize: number; color: string; align: CanvasTextAlign };
  subheadline: { x: number; y: number; width: number; fontSize: number; color: string; align: CanvasTextAlign };
  screenshot: { x: number; y: number; width: number; height: number; radius: number; frame: "phone" | "tablet" };
};

export const templates: readonly TemplateDefinition[] = [
  {
    id: "classic-top",
    label: "Classic Top",
    description: "Clean headline above a framed product preview.",
    background: { type: "solid", start: "#f4f1ea" },
    headline: { x: 50, y: 10, width: 82, fontSize: 7, color: "#171717", align: "center" },
    subheadline: { x: 50, y: 18, width: 76, fontSize: 3.2, color: "#5b5b5b", align: "center" },
    screenshot: { x: 50, y: 57, width: 67, height: 70, radius: 4, frame: "phone" },
  },
  {
    id: "gradient-pop",
    label: "Gradient Pop",
    description: "A bright two-stop gradient with confident centered copy.",
    background: { type: "gradient", start: "#6d5dfc", end: "#d96cff", angle: 135 },
    headline: { x: 50, y: 11, width: 84, fontSize: 7.2, color: "#ffffff", align: "center" },
    subheadline: { x: 50, y: 19, width: 76, fontSize: 3.3, color: "#f7eaff", align: "center" },
    screenshot: { x: 50, y: 58, width: 67, height: 70, radius: 4, frame: "phone" },
  },
];

export function getTemplate(id: string | null | undefined) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
