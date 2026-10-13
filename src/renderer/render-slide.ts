import type { StorePreset } from "@/src/config/storePresets";
import type { TemplateDefinition } from "@/src/renderer/templates";

export type RenderSlideInput = {
  headline: string;
  subheadline: string;
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  fontFamily?: string;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function drawFrame(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, kind: "phone" | "tablet") {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = width * 0.035;
  ctx.shadowOffsetY = height * 0.012;
  ctx.fillStyle = "#171717";
  roundedRect(ctx, x, y, width, height, Math.min(radius * 2, width * 0.12));
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#050505";
  const bezel = width * (kind === "tablet" ? 0.035 : 0.024);
  roundedRect(ctx, x + bezel, y + bezel, width - bezel * 2, height - bezel * 2, Math.min(radius, width * 0.1));
  ctx.fill();
  ctx.fillStyle = "#161616";
  roundedRect(ctx, x + width * 0.38, y + bezel * 0.6, width * 0.24, height * 0.018, width * 0.02);
  ctx.fill();
  ctx.restore();
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

export function renderSlide(slide: RenderSlideInput, template: TemplateDefinition, preset: StorePreset): void {
  const canvas = slide.canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const scale = preset.width / 100;
  const px = (value: number) => value * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (template.background.type === "gradient") {
    const angle = ((template.background.angle ?? 135) * Math.PI) / 180;
    const length = Math.hypot(canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(canvas.width / 2 - Math.cos(angle) * length, canvas.height / 2 - Math.sin(angle) * length, canvas.width / 2 + Math.cos(angle) * length, canvas.height / 2 + Math.sin(angle) * length);
    gradient.addColorStop(0, template.background.start);
    gradient.addColorStop(1, template.background.end ?? template.background.start);
    ctx.fillStyle = gradient;
  } else ctx.fillStyle = template.background.start;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const family = slide.fontFamily ?? "Inter, Arial, sans-serif";
  ctx.textAlign = template.headline.align;
  ctx.textBaseline = "top";
  ctx.font = `700 ${px(template.headline.fontSize)}px ${family}`;
  ctx.fillStyle = template.headline.color;
  drawWrappedText(ctx, slide.headline, px(template.headline.x), px(template.headline.y), px(template.headline.width), px(template.headline.fontSize * 1.18));
  ctx.font = `400 ${px(template.subheadline.fontSize)}px ${family}`;
  ctx.fillStyle = template.subheadline.color;
  drawWrappedText(ctx, slide.subheadline, px(template.subheadline.x), px(template.subheadline.y), px(template.subheadline.width), px(template.subheadline.fontSize * 1.35));

  const frameWidth = px(template.screenshot.width);
  const frameHeight = (frameWidth * preset.height) / preset.width * (template.screenshot.height / 70);
  const frameX = px(template.screenshot.x) - frameWidth / 2;
  const frameY = px(template.screenshot.y);
  drawFrame(ctx, frameX, frameY, frameWidth, frameHeight, px(template.screenshot.radius), template.screenshot.frame);
  const inset = frameWidth * 0.035;
  ctx.save();
  roundedRect(ctx, frameX + inset, frameY + inset, frameWidth - inset * 2, frameHeight - inset * 2, px(template.screenshot.radius));
  ctx.clip();
  const imageRatio = slide.image.width / slide.image.height;
  const boxRatio = (frameWidth - inset * 2) / (frameHeight - inset * 2);
  let drawWidth = frameWidth - inset * 2;
  let drawHeight = frameHeight - inset * 2;
  if (imageRatio > boxRatio) drawWidth = drawHeight * imageRatio;
  else drawHeight = drawWidth / imageRatio;
  ctx.drawImage(slide.image, frameX + inset + (frameWidth - inset * 2 - drawWidth) / 2, frameY + inset + (frameHeight - inset * 2 - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}
