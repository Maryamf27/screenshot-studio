import type { StorePreset } from "@/src/config/storePresets";
import type { BackgroundAssetDefinition, BackgroundDefinition, BackgroundShapeDefinition, BackgroundShapeStyle, DeviceLayerDefinition, FloatingWidgetDefinition, SlideBackgroundAccent, ScreenshotPanelDefinition, StickerDefinition, TaskCardDefinition, TemplateDefinition } from "@/src/renderer/templates";

export type SlideData = {
  image: Blob | HTMLImageElement | HTMLCanvasElement;
  relatedScreenshots?: (Blob | HTMLImageElement | HTMLCanvasElement)[];
  headline: string;
  subheadline?: string;
  badgeText?: string;
  showRatingBadge?: boolean;
  ratingBadge?: { score: string; stars: number; subtitle: string };
  cardItems?: { id: string; subtitle: string; title: string; detail?: string }[];
  floatingWidgetItems?: { id: string; title: string; subtitle: string }[];
  isFirstSlide?: boolean;
  panoramaIndex?: number;
  panoramaCount?: number;
  fontFamily?: string;
  headlineFontFamily?: string;
  subheadlineFontFamily?: string;
  cardFontFamily?: string;
  headlineColor?: string;
  subheadlineColor?: string;
  textAlignment?: CanvasTextAlign;
};

export type RenderOptions = {
  brandColor?: string;
  frameColor?: string;
  frameVisible?: boolean;
  background?: TemplateDefinition["background"];
  backgroundAccent?: SlideBackgroundAccent;
  showDecorativeLayers?: boolean;
  onTextOverflow?: (message: string) => void;
};

type ImageLike = HTMLImageElement | HTMLCanvasElement;
const backgroundAssetCache = new Map<string, Promise<HTMLImageElement>>();
const screenshotImageCache = new WeakMap<Blob, Promise<HTMLImageElement>>();

function loadBackgroundAsset(src: string): Promise<HTMLImageElement> {
  const cached = backgroundAssetCache.get(src);
  if (cached) return cached;
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load template background asset: ${src}`));
    image.src = src;
  });
  backgroundAssetCache.set(src, pending);
  return pending;
}

async function drawBackgroundAsset(ctx: CanvasRenderingContext2D, asset: BackgroundAssetDefinition | undefined, canvasWidth: number, canvasHeight: number, preloadedImage?: HTMLImageElement) {
  if (!asset) return;
  let image: HTMLImageElement;
  if (preloadedImage) image = preloadedImage;
  else {
    try {
      image = await loadBackgroundAsset(asset.src);
    } catch {
      return;
    }
  }

  if (asset.fit === "cover") {
    const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;
    ctx.save();
    ctx.globalAlpha = asset.opacity ?? 1;
    ctx.drawImage(image, (canvasWidth - imageWidth) / 2, (canvasHeight - imageHeight) / 2, imageWidth, imageHeight);
    ctx.restore();
    return;
  }

  const offscreen = document.createElement("canvas");
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const offscreenContext = offscreen.getContext("2d");
  if (!offscreenContext) return;
  const maxWidth = canvasWidth * 0.9;
  const maxHeight = canvasHeight * 0.82;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;
  const centerX = canvasWidth * 0.53;
  const x = centerX - imageWidth / 2;
  const y = canvasHeight * 0.11;
  offscreenContext.drawImage(image, x, y, imageWidth, imageHeight);

  // Fade the silhouette toward the headline area and slide edges so it reads as atmosphere.
  offscreenContext.globalCompositeOperation = "destination-in";
  const maskRadius = Math.max(canvasWidth * 0.42, canvasHeight * 0.48);
  const mask = offscreenContext.createRadialGradient(centerX, canvasHeight * 0.56, maskRadius * 0.08, centerX, canvasHeight * 0.56, maskRadius);
  mask.addColorStop(0, "rgba(255,255,255,0.78)");
  mask.addColorStop(0.56, "rgba(255,255,255,0.43)");
  mask.addColorStop(1, "rgba(255,255,255,0)");
  offscreenContext.fillStyle = mask;
  offscreenContext.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.globalAlpha = asset.opacity ?? 0.3;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

function drawTemplateStickers(
  ctx: CanvasRenderingContext2D,
  stickers: { definition: StickerDefinition; image: HTMLImageElement }[],
  canvasWidth: number,
  canvasHeight: number,
) {
  const unit = Math.min(canvasWidth, canvasHeight);
  const margin = unit * 0.025;
  for (const { definition, image } of stickers) {
    const aspect = image.naturalWidth / image.naturalHeight;
    if (!Number.isFinite(aspect) || aspect <= 0) continue;
    const requestedWidth = (definition.w / 100) * canvasWidth;
    const maxWidth = Math.min(requestedWidth, canvasWidth * 0.32, unit * 0.3);
    const maxHeight = Math.min(canvasHeight * 0.23, unit * 0.36);
    let drawWidth = Math.min(maxWidth, maxHeight * aspect);
    let drawHeight = drawWidth / aspect;
    const angle = ((definition.rotation ?? 0) * Math.PI) / 180;
    const rotatedWidth = () => Math.abs(Math.cos(angle)) * drawWidth + Math.abs(Math.sin(angle)) * drawHeight;
    const rotatedHeight = () => Math.abs(Math.sin(angle)) * drawWidth + Math.abs(Math.cos(angle)) * drawHeight;
    const fitScale = Math.min(1, (canvasWidth - margin * 2) / rotatedWidth(), (canvasHeight - margin * 2) / rotatedHeight());
    drawWidth *= fitScale;
    drawHeight *= fitScale;
    const halfRotatedWidth = rotatedWidth() / 2;
    const halfRotatedHeight = rotatedHeight() / 2;
    const centerX = Math.min(canvasWidth - margin - halfRotatedWidth, Math.max(margin + halfRotatedWidth, (definition.x / 100) * canvasWidth));
    const centerY = Math.min(canvasHeight - margin - halfRotatedHeight, Math.max(margin + halfRotatedHeight, (definition.y / 100) * canvasHeight));
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.shadowColor = "rgba(26, 36, 52, 0.2)";
    ctx.shadowBlur = Math.max(4, unit * 0.014);
    ctx.shadowOffsetY = unit * 0.006;
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }
}

function loadImage(source: SlideData["image"]): Promise<{ image: ImageLike; dispose: () => void }> {
  if (!(source instanceof Blob)) return Promise.resolve({ image: source, dispose: () => undefined });
  let pending = screenshotImageCache.get(source);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const url = URL.createObjectURL(source);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The screenshot could not be decoded as an image."));
      };
      image.src = url;
    });
    screenshotImageCache.set(source, pending);
  }
  return pending.then((image) => ({ image, dispose: () => undefined }));
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function drawPhone(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number, device: DeviceLayerDefinition) {
  const radius = width * 0.105;
  const shadowBlur = ((device.shadowBlur ?? 2.5) / 100) * canvasWidth;
  const shadowOffsetY = ((device.shadowOffsetY ?? 0.8) / 100) * canvasHeight;
  ctx.save();
  const shadowLayers = [
    { alpha: 0.1, blur: 1, offset: 1 },
    { alpha: 0.075, blur: 0.62, offset: 0.58 },
    { alpha: 0.05, blur: 0.3, offset: 0.25 },
  ];
  for (const layer of shadowLayers) {
    ctx.shadowColor = `rgba(15, 23, 42, ${layer.alpha})`;
    ctx.shadowBlur = shadowBlur * layer.blur;
    ctx.shadowOffsetY = shadowOffsetY * layer.offset;
    ctx.fillStyle = device.color;
    roundedRect(ctx, x, y, width, height, radius);
    ctx.fill();
  }
  ctx.shadowColor = "transparent";
  const bezel = width * 0.018;
  ctx.fillStyle = "#05070b";
  roundedRect(ctx, x + bezel, y + bezel, width - bezel * 2, height - bezel * 2, radius * 0.88);
  ctx.fill();
  if (device.rimColor) {
    ctx.strokeStyle = device.rimColor;
    ctx.lineWidth = Math.max(1, ((device.rimWidth ?? 0.25) / 100) * canvasWidth);
    ctx.shadowColor = device.rimColor;
    ctx.shadowBlur = Math.max(2, shadowBlur * 1.2);
    roundedRect(ctx, x, y, width, height, radius);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDeviceAccents(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, device: DeviceLayerDefinition) {
  if (!device.notchVisible) return;
  ctx.save();
  ctx.fillStyle = "#050505";
  const notchWidth = width * 0.27;
  const notchHeight = Math.max(2, height * 0.014);
  roundedRect(ctx, x + (width - notchWidth) / 2, y + height * 0.014, notchWidth, notchHeight, notchHeight / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.68, y + height * 0.021 + notchHeight / 2, Math.max(1, width * 0.006), 0, Math.PI * 2);
  ctx.fillStyle = "#303745";
  ctx.fill();
  ctx.restore();
}

async function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  layer: TemplateDefinition["headline"],
  canvasWidth: number,
  canvasHeight: number,
  family: string,
  alignment: CanvasTextAlign = layer.align,
  colorOverride?: string,
  backgroundColors: string[] = [],
  onOverflow?: (message: string) => void,
): Promise<void> {
  if (!text.trim()) return;
  const x = (layer.x / 100) * canvasWidth;
  const y = (layer.y / 100) * canvasHeight;
  const width = (layer.width / 100) * canvasWidth;
  const height = (layer.height / 100) * canvasHeight;
  const baseFontSize = (layer.fontSize / 100) * Math.min(canvasWidth, canvasHeight);
  const minimumFontSize = Math.max(12, baseFontSize * 0.62);
  const left = alignment === "center" ? x - width / 2 : alignment === "right" ? x - width : x;
  const top = y;

  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.max(0, left), Math.max(0, top), Math.min(width, canvasWidth - Math.max(0, left)), Math.min(height, canvasHeight - Math.max(0, top)));
  ctx.clip();
  ctx.textAlign = alignment;
  ctx.textBaseline = "top";
  const baseColor = colorOverride ?? layer.color;
  const accentColor = !colorOverride && layer.accentColor && backgroundColors.every((backgroundColor) =>
    contrastRatio(luminance(layer.accentColor!), luminance(backgroundColor)) >= 3,
  ) ? layer.accentColor : baseColor;
  ctx.fillStyle = baseColor;
  const maxLines = Math.max(1, layer.maxLines ?? Math.floor(height / Math.max(1, baseFontSize * layer.lineHeight)));
  const makeLines = (fontSize: number) => {
    ctx.font = `${layer.fontWeight} ${fontSize}px "${family}", sans-serif`;
    const lines: string[] = [];
    let line = "";
    for (const word of text.trim().split(/\s+/)) {
      let remaining = word;
      while (ctx.measureText(remaining).width > width && remaining.length > 1) {
        let splitAt = 1;
        while (splitAt < remaining.length && ctx.measureText(remaining.slice(0, splitAt + 1)).width <= width) splitAt += 1;
        if (line) { lines.push(line); line = ""; }
        lines.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt);
      }
      const candidate = line ? `${line} ${remaining}` : remaining;
      if (line && ctx.measureText(candidate).width > width) {
        lines.push(line);
        line = remaining;
      } else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  };
  let fontSize = baseFontSize;
  let visibleLines = makeLines(fontSize);
  while (fontSize > minimumFontSize && (visibleLines.length > maxLines || visibleLines.length * fontSize * layer.lineHeight > height)) {
    fontSize = Math.max(minimumFontSize, fontSize * 0.94);
    visibleLines = makeLines(fontSize);
  }
  const lineHeight = fontSize * layer.lineHeight;
  const fits = visibleLines.length <= maxLines && visibleLines.length * lineHeight <= height;
  if (!fits) onOverflow?.("Text is too long for this template. Shorten the headline or subheadline before exporting.");
  visibleLines = visibleLines.slice(0, maxLines);
  ctx.font = `${layer.fontWeight} ${fontSize}px "${family}", sans-serif`;
  visibleLines.forEach((value, index) => {
    const lineY = y + index * lineHeight;
    if (!layer.accentColor || !layer.accentWords?.length) {
      ctx.fillStyle = baseColor;
      ctx.fillText(value, x, lineY, width);
      return;
    }
    const parts = value.split(" ");
    const spaceWidth = ctx.measureText(" ").width;
    const lineWidth = ctx.measureText(value).width;
    let cursorX = alignment === "center" ? x - lineWidth / 2 : alignment === "right" ? x - lineWidth : x;
    ctx.textAlign = "left";
    for (const part of parts) {
      const normalized = part.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
      const accentWords = layer.accentWords.map((word) => word.toLowerCase());
      ctx.fillStyle = accentWords.includes(normalized) ? accentColor : baseColor;
      ctx.fillText(part, cursorX, lineY);
      cursorX += ctx.measureText(part).width + spaceWidth;
    }
    ctx.textAlign = alignment;
  });
  ctx.restore();
}

async function drawBadge(ctx: CanvasRenderingContext2D, text: string, template: TemplateDefinition, canvasWidth: number, canvasHeight: number, family: string): Promise<void> {
  const badge = template.badge;
  if (!badge || !text.trim()) return;
  const x = (badge.x / 100) * canvasWidth;
  const y = (badge.y / 100) * canvasHeight;
  const maxWidth = (badge.width / 100) * canvasWidth;
  const fontSize = (badge.fontSize / 100) * canvasWidth;
  const paddingX = (badge.paddingX / 100) * canvasWidth;
  const paddingY = (badge.paddingY / 100) * canvasHeight;
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.max(0, x - maxWidth / 2), Math.max(0, y), Math.min(maxWidth, canvasWidth), Math.min(canvasHeight, (badge.height / 100) * canvasHeight + paddingY * 2));
  ctx.clip();
  await document.fonts.load(`${badge.fontWeight} ${fontSize}px "${family}"`);
  ctx.font = `${badge.fontWeight} ${fontSize}px "${family}"`;
  const width = Math.min(maxWidth, ctx.measureText(text).width + paddingX * 2);
  const height = Math.max((badge.height / 100) * canvasHeight, fontSize * badge.lineHeight + paddingY * 2);
  if (badge.laurel) {
    ctx.fillStyle = "#B88B3A";
    const centerY = y + height / 2;
    for (const direction of [-1, 1]) {
      for (let index = 0; index < 4; index += 1) {
        const leafX = x + direction * (width / 2 + paddingX * 0.35 + index * fontSize * 0.48);
        const leafY = centerY + (index - 1.5) * fontSize * 0.36;
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(direction * (0.35 + index * 0.12));
        ctx.beginPath();
        ctx.ellipse(0, 0, fontSize * 0.28, fontSize * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  ctx.fillStyle = badge.fillColor;
  roundedRect(ctx, x - width / 2, y, width, height, height / 2);
  ctx.fill();
  ctx.font = `${badge.fontWeight} ${fontSize}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = badge.color;
  ctx.fillText(text, x, y + height / 2, Math.max(0, width - paddingX * 2));
  ctx.restore();
}

async function drawRatingBadge(
  ctx: CanvasRenderingContext2D,
  rating: { score: string; stars: number; subtitle: string },
  topPercent: number,
  canvasWidth: number,
  canvasHeight: number,
  family: string,
  textColor: string,
  darkBackground: boolean,
  centerXPercent = 50,
  scale = 1,
) {
  const centerX = (centerXPercent / 100) * canvasWidth;
  const top = (topPercent / 100) * canvasHeight;
  const scoreSize = canvasWidth * 0.032 * scale;
  const starsSize = canvasWidth * 0.013 * scale;
  const subtitleSize = canvasWidth * 0.013 * scale;
  const scoreY = top + canvasHeight * 0.018 * scale;
  const starsY = top + canvasHeight * 0.041 * scale;
  const subtitleY = top + canvasHeight * 0.064 * scale;
  const accentColor = darkBackground ? "#FFD978" : "#986B1E";
  const stars = "★".repeat(Math.max(0, Math.min(5, Math.floor(rating.stars))));
  await document.fonts.load(`800 ${scoreSize}px "${family}"`);
  await document.fonts.load(`700 ${starsSize}px "${family}"`);
  await document.fonts.load(`500 ${subtitleSize}px "${family}"`);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${scoreSize}px "${family}"`;
  ctx.fillStyle = textColor;
  ctx.fillText(rating.score, centerX, scoreY);
  const scoreWidth = ctx.measureText(rating.score).width;

  // Fine curved stems and rotated leaves form a small laurel around the score.
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = accentColor;
  ctx.lineWidth = Math.max(1, canvasWidth * 0.0012);
  for (const direction of [-1, 1]) {
    const branchX = centerX + direction * (scoreWidth / 2 + scoreSize * 0.52);
    ctx.beginPath();
    ctx.moveTo(branchX, scoreY + scoreSize * 0.55);
    ctx.quadraticCurveTo(branchX + direction * scoreSize * 0.24, scoreY, branchX, scoreY - scoreSize * 0.68);
    ctx.stroke();
    for (let index = 0; index < 4; index += 1) {
      const leafY = scoreY + scoreSize * (0.36 - index * 0.34);
      ctx.save();
      ctx.translate(branchX + direction * scoreSize * 0.08, leafY);
      ctx.rotate(direction * (0.72 - index * 0.13));
      ctx.beginPath();
      ctx.ellipse(0, 0, scoreSize * 0.19, scoreSize * 0.075, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.font = `700 ${starsSize}px "${family}"`;
  ctx.fillStyle = accentColor;
  ctx.fillText(stars, centerX, starsY);
  ctx.font = `500 ${subtitleSize}px "${family}"`;
  ctx.fillStyle = textColor;
  ctx.fillText(rating.subtitle, centerX, subtitleY);
  ctx.restore();
}

function drawBackgroundShape(ctx: CanvasRenderingContext2D, shape: BackgroundShapeDefinition, canvasWidth: number, canvasHeight: number) {
  const x = (shape.x / 100) * canvasWidth;
  const y = (shape.y / 100) * canvasHeight;
  const width = (shape.width / 100) * canvasWidth;
  const height = (shape.height / 100) * canvasHeight;
  ctx.save();
  ctx.globalAlpha = Math.min(0.18, Math.max(0.08, shape.opacity ?? 0.1));
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(((shape.rotation ?? 0) * Math.PI) / 180);
  const left = -width / 2;
  const top = -height / 2;
  if (shape.type === "orb") {
    const radius = Math.max(width, height) / 2;
    const color = /^#([\da-f]{6})$/i.exec(shape.color);
    const rgb = color ? [16, 8, 0].map((shift) => (Number.parseInt(color[1], 16) >> shift) & 0xff).join(", ") : "99, 102, 241";
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, `rgba(${rgb}, 0.9)`);
    glow.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shape.type === "circle") {
    ctx.fillStyle = shape.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shape.type === "pill" || shape.type === "pillar") {
    ctx.fillStyle = shape.color;
    roundedRect(ctx, left, top, width, height, height / 2);
  } else if (shape.type === "arch") {
    ctx.fillStyle = shape.color;
    const radius = Math.min(width / 2, height * 0.48);
    ctx.beginPath();
    ctx.moveTo(left, height / 2);
    ctx.lineTo(left, top + radius);
    ctx.arcTo(left, top, 0, top, radius);
    ctx.arcTo(-left, top, -left, top + radius, radius);
    ctx.lineTo(-left, height / 2);
    ctx.closePath();
  } else {
    ctx.fillStyle = shape.color;
    ctx.beginPath();
    ctx.moveTo(left, top + height * 0.28);
    ctx.bezierCurveTo(left + width * 0.28, top - height * 0.12, left + width * 0.52, top + height * 0.64, -left, top + height * 0.16);
    ctx.lineTo(-left, height / 2);
    ctx.lineTo(left, height / 2);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

function drawBackgroundShapes(ctx: CanvasRenderingContext2D, style: BackgroundShapeStyle, shapes: BackgroundShapeDefinition[] | undefined, canvasWidth: number, canvasHeight: number) {
  if (style === "solid") return;
  for (const shape of shapes ?? []) drawBackgroundShape(ctx, shape, canvasWidth, canvasHeight);
}

function drawNativeTemplateDecoration(ctx: CanvasRenderingContext2D, decoration: TemplateDefinition["nativeDecoration"], width: number, height: number) {
  if (!decoration) return;
  const unit = Math.min(width, height);
  ctx.save();
  if (decoration === "fashion-festive-promo") {
    // Fixed pseudo-random positions make the festive pattern stable between renders.
    for (let index = 0; index < 78; index += 1) {
      const x = ((index * 73 + 19) % 997) / 997 * width;
      const y = ((index * 137 + 41) % 991) / 991 * height;
      const radius = unit * (0.0015 + (index % 4) * 0.00055);
      const gold = index % 3 === 0;
      ctx.globalAlpha = 0.34 + (index % 4) * 0.08;
      ctx.strokeStyle = gold ? "#F3C668" : "#FFE8EA";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = Math.max(1, unit * 0.0012);
      if (index % 4 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x - radius * 2.2, y);
        ctx.lineTo(x + radius * 2.2, y);
        ctx.moveTo(x, y - radius * 2.2);
        ctx.lineTo(x, y + radius * 2.2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.48;
    ctx.strokeStyle = "#F3C668";
    ctx.lineWidth = Math.max(2, unit * 0.0035);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-width * 0.04, height * 0.23);
    ctx.bezierCurveTo(width * 0.14, height * 0.19, width * 0.07, height * 0.04, width * 0.32, -height * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 1.04, height * 0.78);
    ctx.bezierCurveTo(width * 0.86, height * 0.81, width * 0.94, height * 0.96, width * 0.68, height * 1.04);
    ctx.stroke();
  } else if (decoration === "fitness-neon-dark") {
    const glowX = width > height ? width * 0.8 : width * 0.5;
    const glowY = height * (width > height ? 0.52 : 0.58);
    const radius = Math.max(unit * 0.44, width * 0.32);
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, radius);
    glow.addColorStop(0, "rgba(0, 136, 255, 0.28)");
    glow.addColorStop(0.46, "rgba(0, 136, 255, 0.12)");
    glow.addColorStop(1, "rgba(0, 136, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (decoration === "fitness-cinematic") {
    const glow = ctx.createRadialGradient(width * 0.47, height * 0.52, unit * 0.05, width * 0.47, height * 0.52, unit * 0.72);
    glow.addColorStop(0, "rgba(119, 139, 78, 0.19)");
    glow.addColorStop(0.55, "rgba(52, 67, 39, 0.10)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (decoration === "edu-pastel-waves") {
    ctx.strokeStyle = "rgba(91, 150, 224, 0.19)";
    ctx.lineWidth = Math.max(2, unit * 0.0035);
    for (let index = 0; index < 3; index += 1) {
      const yTop = height * (0.15 + index * 0.035);
      ctx.beginPath();
      ctx.moveTo(-width * 0.05, yTop);
      ctx.bezierCurveTo(width * 0.22, yTop - height * 0.11, width * 0.42, yTop + height * 0.09, width * 0.7, yTop - height * 0.025);
      ctx.bezierCurveTo(width * 0.84, yTop - height * 0.09, width * 0.94, yTop - height * 0.07, width * 1.05, yTop - height * 0.015);
      ctx.stroke();
      const yBottom = height * (0.84 + index * 0.035);
      ctx.beginPath();
      ctx.moveTo(-width * 0.05, yBottom);
      ctx.bezierCurveTo(width * 0.24, yBottom - height * 0.1, width * 0.46, yBottom + height * 0.07, width * 0.73, yBottom - height * 0.015);
      ctx.bezierCurveTo(width * 0.88, yBottom - height * 0.07, width * 0.96, yBottom - height * 0.04, width * 1.05, yBottom + height * 0.01);
      ctx.stroke();
    }
    const cardWidth = width * (width > height ? 0.27 : 0.48);
    const cardHeight = height * (width > height ? 0.28 : 0.16);
    const positions = width > height
      ? [[width * 0.41, height * 0.58], [width * 0.51, height * 0.63], [width * 0.4, height * 0.68]]
      : [[-width * 0.06, height * 0.42], [width * 0.58, height * 0.49], [-width * 0.03, height * 0.56]];
    positions.forEach(([x, y], index) => {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
      ctx.shadowBlur = unit * 0.025;
      ctx.shadowOffsetY = unit * 0.008;
      ctx.fillStyle = index === 1 ? "#F9FCFF" : "#FFFFFF";
      roundedRect(ctx, x, y, cardWidth, cardHeight, Math.min(16, unit * 0.018));
      ctx.fill();
      ctx.restore();
    });
  }
  ctx.restore();
}

function drawDeviceGlow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number) {
  ctx.save();
  ctx.strokeStyle = "#00A3FF";
  ctx.lineWidth = Math.max(2, Math.min(canvasWidth, canvasHeight) * 0.0015);
  ctx.shadowColor = "#00A3FF";
  ctx.shadowBlur = Math.max(8, 20 * Math.min(canvasWidth, canvasHeight) / 1080);
  roundedRect(ctx, x, y, width, height, width * 0.105);
  ctx.stroke();
  ctx.restore();
}

function parseRgbColor(color: string): [number, number, number] | undefined {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());
  if (hex) {
    const value = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    const integer = Number.parseInt(value, 16);
    return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
  }
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*[\d.]+)?\s*\)$/i.exec(color.trim());
  if (!rgb) return undefined;
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map((channel) => Math.min(255, Math.max(0, channel))) as [number, number, number];
}

/** Derive a richer, darker pattern tone from hex or rgb(a) background colors. */
export function getDarkerPatternColor(backgroundColor: string): string {
  const channels = parseRgbColor(backgroundColor);
  if (!channels) return "#334155";
  const [red, green, blue] = channels.map((channel) => channel / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  let hue = 0;
  let saturation = 0;
  let lightness = (maximum + minimum) / 2;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (maximum === red) hue = ((green - blue) / delta) % 6;
    else if (maximum === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  // Warm yellows shift slightly toward amber as the lightness drops.
  if (hue >= 38 && hue <= 62) hue -= 4;
  saturation = saturation === 0 ? 0 : Math.min(1, saturation * 1.06 + 0.015);
  lightness *= 0.76;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSection = hue / 60;
  const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
  let [r, g, b] = hueSection < 1 ? [chroma, secondary, 0]
    : hueSection < 2 ? [secondary, chroma, 0]
      : hueSection < 3 ? [0, chroma, secondary]
        : hueSection < 4 ? [0, secondary, chroma]
          : hueSection < 5 ? [secondary, 0, chroma]
            : [chroma, 0, secondary];
  const match = lightness - chroma / 2;
  r += match; g += match; b += match;
  return `#${[r, g, b].map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
}

function getLighterPatternColor(backgroundColor: string): string {
  const channels = parseRgbColor(backgroundColor);
  if (!channels) return "#B6F0F5";
  const cyanTint = [207, 250, 254];
  const lifted = channels.map((channel, index) => Math.round(channel * 0.32 + cyanTint[index] * 0.68));
  return `#${lifted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function makeDensityShapes(style: BackgroundShapeStyle, color: string, opacity: number): BackgroundShapeDefinition[] {
  const definitions: Record<Exclude<BackgroundShapeStyle, "solid">, BackgroundShapeDefinition[]> = {
    arch: [
      { type: "arch", x: -18, y: 7, width: 48, height: 37, color, opacity },
      { type: "arch", x: 68, y: 6, width: 48, height: 37, color, opacity, rotation: 180 },
      { type: "arch", x: -16, y: 48, width: 43, height: 39, color, opacity },
      { type: "arch", x: 73, y: 51, width: 43, height: 39, color, opacity, rotation: 180 },
      { type: "arch", x: 29, y: 75, width: 42, height: 35, color, opacity },
    ],
    orbs: [
      { type: "orb", x: -12, y: 7, width: 44, height: 29, color, opacity },
      { type: "orb", x: 67, y: 15, width: 46, height: 31, color, opacity },
      { type: "orb", x: 1, y: 47, width: 38, height: 26, color, opacity },
      { type: "orb", x: 69, y: 50, width: 47, height: 34, color, opacity },
      { type: "orb", x: 25, y: 76, width: 43, height: 26, color, opacity },
      { type: "orb", x: 44, y: 34, width: 34, height: 22, color, opacity },
    ],
    pillars: [
      { type: "pillar", x: 3, y: 5, width: 7, height: 58, color, opacity },
      { type: "pillar", x: 15, y: 41, width: 5, height: 55, color, opacity },
      { type: "pillar", x: 83, y: 4, width: 6, height: 62, color, opacity },
      { type: "pillar", x: 94, y: 31, width: 5, height: 57, color, opacity },
      { type: "pillar", x: 36, y: 79, width: 5, height: 31, color, opacity },
      { type: "pillar", x: 61, y: 1, width: 4, height: 25, color, opacity },
    ],
  };
  return style === "solid" ? [] : definitions[style];
}

function averageColor(colors: string[]) {
  const parsed = colors.map(parseRgbColor).filter((color): color is [number, number, number] => Boolean(color));
  if (!parsed.length) return "#F8FAFC";
  const average = [0, 1, 2].map((channel) => Math.round(parsed.reduce((sum, color) => sum + color[channel], 0) / parsed.length));
  return `#${average.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function drawBackgroundOverlay(ctx: CanvasRenderingContext2D, overlay: SlideBackgroundAccent | undefined, template: TemplateDefinition, canvasWidth: number, canvasHeight: number, backgroundColors: string[]) {
  const mode = overlay ?? "template";
  if (mode === "none") return;
  const baseColor = averageColor(backgroundColors);
  const isDarkBackground = luminance(baseColor) < 0.35;
  const patternColor = isDarkBackground ? getLighterPatternColor(baseColor) : getDarkerPatternColor(baseColor);
  const patternOpacity = isDarkBackground ? 0.18 : 0.16;
  if (mode === "template") {
    const templateShapes = template.bgShapes?.map((shape) => ({ ...shape, color: patternColor, opacity: patternOpacity }));
    const denseShapes = makeDensityShapes(template.bgShapeStyle, patternColor, patternOpacity);
    drawBackgroundShapes(ctx, template.bgShapeStyle, [...(templateShapes ?? []), ...denseShapes], canvasWidth, canvasHeight);
    return;
  }

  const tone = patternColor;
  if (mode === "arches") {
    drawBackgroundShapes(ctx, "arch", [
      { type: "arch", x: -15, y: 4, width: 48, height: 39, color: tone, opacity: patternOpacity },
      { type: "arch", x: 67, y: 2, width: 48, height: 42, color: tone, opacity: patternOpacity, rotation: 180 },
      { type: "arch", x: -18, y: 45, width: 45, height: 42, color: tone, opacity: patternOpacity },
      { type: "arch", x: 73, y: 46, width: 45, height: 43, color: tone, opacity: patternOpacity, rotation: 180 },
      { type: "arch", x: 29, y: 75, width: 42, height: 36, color: tone, opacity: patternOpacity },
    ], canvasWidth, canvasHeight);
  } else if (mode === "orbs" || mode === "floating-orbs") {
    drawBackgroundShapes(ctx, "orbs", [
      { type: "orb", x: -12, y: 6, width: 48, height: 31, color: tone, opacity: patternOpacity },
      { type: "orb", x: 67, y: 10, width: 48, height: 33, color: tone, opacity: patternOpacity },
      { type: "orb", x: 0, y: 43, width: 42, height: 30, color: tone, opacity: patternOpacity },
      { type: "orb", x: 65, y: 46, width: 50, height: 35, color: tone, opacity: patternOpacity },
      { type: "orb", x: 23, y: 75, width: 48, height: 30, color: tone, opacity: patternOpacity },
      { type: "orb", x: 43, y: 30, width: 38, height: 24, color: tone, opacity: patternOpacity },
    ], canvasWidth, canvasHeight);
  } else if (mode === "grid-dots" || mode === "subtle-grid-dots") {
    const spacing = canvasWidth / 24;
    const radius = Math.max(2.5, canvasWidth * 0.003);
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    ctx.fillStyle = tone;
    for (let x = spacing / 2; x < canvasWidth; x += spacing) {
      for (let y = spacing / 2; y < canvasHeight; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (mode === "sprinkles" || mode === "sprinkles-sparks") {
    const marks = [
      [5, 28, 1], [13, 35, -1], [94, 28, -1], [87, 37, 1],
      [6, 47, -1], [15, 58, 1], [93, 52, 1], [84, 62, -1],
      [5, 72, 1], [13, 84, -1], [94, 76, -1], [86, 88, 1],
      [24, 31, -1], [76, 27, 1], [30, 72, 1], [70, 78, -1],
      [20, 45, 1], [80, 48, -1], [23, 88, -1], [75, 92, 1],
      [8, 18, 1], [91, 15, -1], [18, 66, -1], [82, 70, 1],
      [34, 28, 1], [66, 24, -1], [37, 88, -1], [63, 84, 1],
      [7, 96, -1], [96, 96, 1], [4, 7, -1], [96, 7, 1],
    ] as const;
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    ctx.strokeStyle = tone;
    ctx.fillStyle = tone;
    ctx.lineCap = "round";
    for (const [percentX, percentY, direction] of marks) {
      const x = (percentX / 100) * canvasWidth;
      const y = (percentY / 100) * canvasHeight;
      const radius = canvasWidth * 0.006;
      ctx.lineWidth = Math.max(1, canvasWidth * 0.0015);
      ctx.beginPath();
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x, y + radius);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + radius * 1.8 * direction, y + radius * 1.3, radius * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawHeaderPanel(ctx: CanvasRenderingContext2D, template: TemplateDefinition, canvasWidth: number, canvasHeight: number) {
  const panel = template.headerPanel;
  if (!panel) return;
  const x = (panel.x / 100) * canvasWidth;
  const y = (panel.y / 100) * canvasHeight;
  const width = (panel.width / 100) * canvasWidth;
  const height = (panel.height / 100) * canvasHeight;
  ctx.save();
  ctx.fillStyle = panel.fillColor;
  ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
  ctx.shadowBlur = canvasWidth * 0.018;
  ctx.shadowOffsetY = canvasHeight * 0.006;
  roundedRect(ctx, x, y, width, height, (panel.radius / 100) * canvasWidth);
  ctx.fill();
  ctx.restore();
}

async function drawTaskCard(ctx: CanvasRenderingContext2D, card: TaskCardDefinition, item: { subtitle: string; title: string; detail?: string }, canvasWidth: number, canvasHeight: number, family: string) {
  const x = (card.x / 100) * canvasWidth;
  const y = (card.y / 100) * canvasHeight;
  const width = (card.width / 100) * canvasWidth;
  const height = (card.height / 100) * canvasHeight;
  const radius = (card.radius / 100) * canvasWidth;
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.max(0, x), Math.max(0, y), Math.max(0, Math.min(width, canvasWidth - x)), Math.max(0, Math.min(height, canvasHeight - y)));
  ctx.clip();
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
  ctx.shadowBlur = canvasWidth * 0.012;
  ctx.shadowOffsetY = canvasHeight * 0.003;
  ctx.fillStyle = card.fillColor;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
  const scale = Math.max(0.55, Math.min(canvasWidth / 360, height / 48, width / 200));
  const indicatorRadius = Math.max(3, width * 0.014);
  const centerY = y + height / 2;
  const indicatorX = x + 24 * scale;
  const textX = x + 50 * scale;
  const titleSize = 14 * scale;
  const subtitleSize = 11 * scale;
  const titleY = y + 18 * scale;
  const subtitleY = y + 34 * scale;
  const rightEdge = x + width - 14 * scale;
  const textLimit = Math.max(0, rightEdge - textX);
  ctx.save();
  ctx.fillStyle = card.accentColor;
  ctx.beginPath();
  ctx.arc(indicatorX, centerY, indicatorRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  await document.fonts.load(`500 ${subtitleSize}px "${family}"`);
  await document.fonts.load(`700 ${titleSize}px "${family}"`);
  ctx.font = `700 ${titleSize}px "${family}"`;
  ctx.fillStyle = card.textColor;
  const timeWidth = item.subtitle ? Math.min(textLimit * 0.45, ctx.measureText(item.subtitle).width) : 0;
  const titleWidth = Math.max(0, textLimit - (timeWidth ? timeWidth + 12 * scale : 0));
  ctx.fillText(item.title, textX, titleY, titleWidth);
  if (item.subtitle) {
    ctx.textAlign = "right";
    ctx.font = `400 ${subtitleSize}px "${family}"`;
    ctx.fillStyle = card.accentColor;
    ctx.fillText(item.subtitle, rightEdge, titleY + 1 * scale, timeWidth || textLimit * 0.45);
    ctx.textAlign = "left";
  }
  if (item.detail) {
    ctx.font = `400 ${subtitleSize}px "${family}"`;
    ctx.fillStyle = card.textColor;
    ctx.globalAlpha = 0.68;
    ctx.fillText(item.detail, textX, subtitleY, textLimit);
  }
  ctx.restore();
  ctx.restore();
}

async function drawRoutineRows(ctx: CanvasRenderingContext2D, template: TemplateDefinition, items: { subtitle: string; title: string }[], canvasWidth: number, canvasHeight: number, family: string, yOffset = 0) {
  const layout = template.routineRows;
  if (!layout) return;
  const x = (layout.x / 100) * canvasWidth;
  const startY = ((layout.y + yOffset) / 100) * canvasHeight;
  const width = (layout.width / 100) * canvasWidth;
  const rowHeight = (layout.rowHeight / 100) * canvasHeight;
  const gap = (layout.gap / 100) * canvasHeight;
  for (const [index, row] of items.entries()) {
    const y = startY + index * (rowHeight + gap);
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.max(0, x), Math.max(0, y), Math.max(0, Math.min(width, canvasWidth - x)), Math.max(0, Math.min(rowHeight, canvasHeight - y)));
    ctx.clip();
    ctx.fillStyle = layout.fillColor;
    roundedRect(ctx, x, y, width, rowHeight, (layout.radius / 100) * canvasWidth);
    ctx.fill();
    ctx.fillStyle = layout.accentColor;
    roundedRect(ctx, x + width * 0.045, y + rowHeight * 0.2, width * 0.018, rowHeight * 0.6, rowHeight * 0.3);
    ctx.fill();
    const insetX = x + width * 0.09;
    const timeSize = canvasWidth * 0.014;
    const titleSize = canvasWidth * 0.019;
    await document.fonts.load(`500 ${timeSize}px "${family}"`);
    await document.fonts.load(`700 ${titleSize}px "${family}"`);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `500 ${timeSize}px "${family}"`;
    ctx.fillStyle = layout.mutedColor;
    ctx.fillText(row.subtitle, insetX, y + rowHeight * 0.32, width * 0.8);
    ctx.font = `700 ${titleSize}px "${family}"`;
    ctx.fillStyle = layout.textColor;
    ctx.fillText(row.title, insetX, y + rowHeight * 0.7, width * 0.8);
    ctx.restore();
  }
}

async function drawFloatingWidget(ctx: CanvasRenderingContext2D, widget: FloatingWidgetDefinition | undefined, items: { title: string; subtitle: string }[], canvasWidth: number, canvasHeight: number, family: string) {
  if (!widget || !items.some((item) => item.title.trim() || item.subtitle.trim()) && !widget.eyebrow.trim()) return;
  const x = (widget.x / 100) * canvasWidth;
  const y = (widget.y / 100) * canvasHeight;
  const width = (widget.width / 100) * canvasWidth;
  const height = (widget.height / 100) * canvasHeight;
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.max(0, x), Math.max(0, y), Math.max(0, Math.min(width, canvasWidth - x)), Math.max(0, Math.min(height, canvasHeight - y)));
  ctx.clip();
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.22)";
  ctx.shadowBlur = canvasWidth * 0.035;
  ctx.shadowOffsetY = canvasHeight * 0.012;
  ctx.fillStyle = widget.fillColor;
  roundedRect(ctx, x, y, width, height, (widget.radius / 100) * canvasWidth);
  ctx.fill();
  ctx.restore();
  const inset = width * 0.07;
  const eyebrowSize = canvasWidth * 0.014;
  const titleSize = canvasWidth * (items.length > 1 ? 0.02 : 0.024);
  const detailSize = canvasWidth * (items.length > 1 ? 0.014 : 0.016);
  await document.fonts.load(`500 ${eyebrowSize}px "${family}"`);
  await document.fonts.load(`700 ${titleSize}px "${family}"`);
  await document.fonts.load(`400 ${detailSize}px "${family}"`);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `500 ${eyebrowSize}px "${family}"`;
  ctx.fillStyle = widget.accentColor;
  ctx.fillText(widget.eyebrow, x + inset, y + height * 0.17, width - inset * 2);
  const contentTop = y + height * 0.36;
  const contentHeight = height * 0.55;
  const itemHeight = contentHeight / Math.max(1, items.length);
  for (const [index, item] of items.entries()) {
    const rowTop = contentTop + index * itemHeight;
    ctx.font = `700 ${titleSize}px "${family}"`;
    ctx.fillStyle = widget.textColor;
    ctx.fillText(item.title, x + inset, rowTop, width - inset * 2);
    ctx.font = `400 ${detailSize}px "${family}"`;
    ctx.fillStyle = widget.mutedColor;
    ctx.fillText(item.subtitle, x + inset, rowTop + itemHeight * 0.48, width - inset * 2);
  }
  ctx.restore();
  ctx.restore();
}

function drawScreenshot(ctx: CanvasRenderingContext2D, image: ImageLike, x: number, y: number, width: number, height: number, radius: number, fit: "contain" | "cover", insetRatio = 0.018) {
  const inset = width * insetRatio;
  const screenX = x + inset;
  const screenY = y + inset;
  const screenWidth = width - inset * 2;
  const screenHeight = height - inset * 2;
  ctx.save();
  roundedRect(ctx, screenX, screenY, screenWidth, screenHeight, radius);
  ctx.clip();
  const imageWidth = image instanceof HTMLCanvasElement ? image.width : image.naturalWidth;
  const imageHeight = image instanceof HTMLCanvasElement ? image.height : image.naturalHeight;
  if (!imageWidth || !imageHeight) throw new Error("The screenshot has no usable image dimensions.");
  const scale = boxFitScale(imageWidth, imageHeight, screenWidth, screenHeight, fit);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.drawImage(image, screenX + (screenWidth - drawWidth) / 2, screenY + (screenHeight - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}

function drawScreenshotPanel(ctx: CanvasRenderingContext2D, image: ImageLike, panel: ScreenshotPanelDefinition, canvasWidth: number, canvasHeight: number) {
  const x = (panel.x / 100) * canvasWidth;
  const y = (panel.y / 100) * canvasHeight;
  const width = (panel.width / 100) * canvasWidth;
  const height = (panel.height / 100) * canvasHeight;
  const rotation = ((panel.rotation ?? 0) * Math.PI) / 180;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvasWidth, canvasHeight);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const left = -width / 2;
  const top = -height / 2;
  ctx.shadowColor = "rgba(34, 26, 20, 0.16)";
  ctx.shadowBlur = Math.max(3, Math.min(canvasWidth, canvasHeight) * 0.012);
  ctx.shadowOffsetY = Math.min(canvasHeight * 0.008, 12);
  ctx.fillStyle = "#fffdf9";
  roundedRect(ctx, left - 4, top - 4, width + 8, height + 8, Math.max(0, (panel.radius / 100) * canvasWidth));
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.save();
  roundedRect(ctx, left, top, width, height, Math.max(0, (panel.radius / 100) * canvasWidth));
  ctx.clip();
  const imageWidth = image instanceof HTMLCanvasElement ? image.width : image.naturalWidth;
  const imageHeight = image instanceof HTMLCanvasElement ? image.height : image.naturalHeight;
  if (!imageWidth || !imageHeight) throw new Error("A collage screenshot has no usable image dimensions.");
  const scale = boxFitScale(imageWidth, imageHeight, width, height, panel.fit);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
  if (panel.borderColor) {
    ctx.strokeStyle = panel.borderColor;
    ctx.lineWidth = Math.max(1, canvasWidth * 0.0015);
    roundedRect(ctx, left, top, width, height, Math.max(0, (panel.radius / 100) * canvasWidth));
    ctx.stroke();
  }
  ctx.restore();
}

function boxFitScale(imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number, fit: "contain" | "cover") {
  const xScale = boxWidth / imageWidth;
  const yScale = boxHeight / imageHeight;
  return fit === "cover" ? Math.max(xScale, yScale) : Math.min(xScale, yScale);
}

function fitFrameToImage(imageWidth: number, imageHeight: number, maxWidth: number, maxHeight: number, insetRatio: number) {
  const imageAspect = imageWidth / imageHeight;
  // Match the image to the frame's inner screen opening, accounting for the bezel inset.
  const frameHeightPerWidth = (1 - insetRatio * 2) / imageAspect + insetRatio * 2;
  const width = Math.max(1, Math.min(maxWidth, maxHeight / frameHeightPerWidth));
  return { width, height: width * frameHeightPerWidth };
}

function resolveBackgroundColor(color: string, brandColor: string) {
  if (color === "$brand") return brandColor;
  if (color === "$brand-pastel") return pastelFromBrand(brandColor);
  return color;
}

function luminance(color: string) {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match) return 1;
  const value = Number.parseInt(match[1], 16);
  const channels = [16, 8, 0].map((shift) => ((value >> shift) & 0xff) / 255).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: number, background: number) {
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return (lighter + 0.05) / (darker + 0.05);
}

function automaticTextColor(backgroundColors: string[]) {
  const values = backgroundColors.map(luminance);
  const minimumWhiteContrast = Math.min(...values.map((value) => contrastRatio(1, value)));
  const minimumDarkContrast = Math.min(...values.map((value) => contrastRatio(0.0056, value)));
  return minimumWhiteContrast >= minimumDarkContrast ? "#FFFFFF" : "#0B1220";
}

export function getAutomaticTextColor(background: BackgroundDefinition, brandColor = "#111111") {
  const start = resolveBackgroundColor(background.start, brandColor);
  const end = resolveBackgroundColor(background.end ?? background.start, brandColor);
  return automaticTextColor(background.type === "gradient" ? [start, end] : [start]);
}

/** Render a complete opaque slide at the preset's intrinsic output dimensions. */
export async function renderSlide(
  slide: SlideData,
  template: TemplateDefinition,
  preset: StorePreset,
  options: RenderOptions = {},
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D context is unavailable.");
  // Keep every renderer layer, including shadows and rotated stickers, within the export bounds.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let loaded: Awaited<ReturnType<typeof loadImage>> | undefined;
  let loadedPanels: { definition: ScreenshotPanelDefinition; image: ImageLike; dispose: () => void }[] = [];
  let loadedStickers: { definition: StickerDefinition; image: HTMLImageElement }[] = [];
  try {
    const [screenshotAsset, panelAssets, stickerAssets, backgroundAsset] = await Promise.all([
      loadImage(slide.image),
      Promise.all((template.screenshotPanels ?? []).map(async (definition) => {
        const source = slide.relatedScreenshots?.[definition.sourceSlide ?? 0] ?? slide.image;
        const loadedPanel = await loadImage(source);
        return { definition, ...loadedPanel };
      })),
      Promise.all((template.stickers ?? []).map(async (definition) => {
        try {
          return { definition, image: await loadBackgroundAsset(definition.src) };
        } catch {
          return undefined;
        }
      })),
      template.backgroundAsset ? loadBackgroundAsset(template.backgroundAsset.src).catch(() => undefined) : Promise.resolve(undefined),
    ]);
    loaded = screenshotAsset;
    loadedPanels = panelAssets;
    loadedStickers = stickerAssets.filter((sticker): sticker is { definition: StickerDefinition; image: HTMLImageElement } => Boolean(sticker));
    const family = slide.fontFamily ?? "Arial, sans-serif";
    const headlineFamily = slide.headlineFontFamily ?? template.headlineFontFamily ?? family;
    const subheadlineFamily = slide.subheadlineFontFamily ?? family;
    const cardFamily = slide.cardFontFamily ?? subheadlineFamily;
    await Promise.all([family, headlineFamily, subheadlineFamily, cardFamily].map((fontFamily) => document.fonts.load(`400 16px "${fontFamily}"`)));
    await document.fonts.ready;
    const background = options.background ?? template.background;
    const brandColor = options.brandColor ?? "#111111";
    const backgroundStart = resolveBackgroundColor(background.start, brandColor);
    const backgroundEnd = resolveBackgroundColor(background.end ?? background.start, brandColor);
    const contrastColor = getAutomaticTextColor(background, brandColor);
    const contrastBackgrounds = background.type === "gradient" ? [backgroundStart, backgroundEnd] : [backgroundStart];
    if (background.type === "gradient") {
      let gradient: CanvasGradient;
      if (background.continuous && (slide.panoramaCount ?? 1) > 1) {
        const count = Math.max(1, Math.floor(slide.panoramaCount ?? 1));
        const index = Math.min(count - 1, Math.max(0, Math.floor(slide.panoramaIndex ?? 0)));
        gradient = ctx.createLinearGradient(-index * canvas.width, canvas.height / 2, (count - index) * canvas.width, canvas.height / 2);
      } else {
        const radians = ((background.angle ?? 135) * Math.PI) / 180;
        const halfLength = (Math.abs(Math.cos(radians)) * canvas.width + Math.abs(Math.sin(radians)) * canvas.height) / 2;
        const dx = Math.cos(radians) * halfLength;
        const dy = Math.sin(radians) * halfLength;
        gradient = ctx.createLinearGradient(canvas.width / 2 - dx, canvas.height / 2 - dy, canvas.width / 2 + dx, canvas.height / 2 + dy);
      }
      gradient.addColorStop(0, backgroundStart);
      gradient.addColorStop(1, backgroundEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backgroundStart;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackgroundOverlay(ctx, options.backgroundAccent, template, canvas.width, canvas.height, contrastBackgrounds);
    drawNativeTemplateDecoration(ctx, template.nativeDecoration, canvas.width, canvas.height);
    await drawBackgroundAsset(ctx, template.backgroundAsset, canvas.width, canvas.height, backgroundAsset);
    drawHeaderPanel(ctx, template, canvas.width, canvas.height);
    const showDecorativeLayers = options.showDecorativeLayers !== false;

    const badgeText = slide.badgeText ?? "";
    if (showDecorativeLayers && template.badge && badgeText.trim() && (!template.badge.firstSlideOnly || slide.isFirstSlide !== false)) {
      await drawBadge(ctx, badgeText, template, canvas.width, canvas.height, slide.headlineFontFamily ?? family);
    }
    const laurelBadgeVisible = Boolean(template.badge?.laurel && badgeText.trim() && (!template.badge.firstSlideOnly || slide.isFirstSlide !== false));
    const rating = slide.ratingBadge;
    const hasRatingContent = Boolean(rating && (rating.score.trim() || rating.subtitle.trim() || rating.stars > 0));
    const showRatingBadge = showDecorativeLayers && !laurelBadgeVisible && slide.showRatingBadge === true && hasRatingContent;
    const pillBadgeBottom = template.badge && !template.badge.laurel ? template.badge.y + template.badge.height + 0.5 : 0;
    const editorialFashion = template.id === "fashion-editorial-grid";
    const academicEducation = template.id === "edu-flashcard-stack";
    const ratingTop = editorialFashion || academicEducation ? 29 : pillBadgeBottom || 0.5;
    const ratingBottom = ratingTop + 6.8;
    const headlineY = editorialFashion || academicEducation ? Math.max(template.headline.y, pillBadgeBottom) : Math.max(template.headline.y, pillBadgeBottom, showRatingBadge ? ratingBottom + 0.7 : 0);
    const headlineLayer = { ...template.headline, y: headlineY };
    const subheadlineLayer = {
      ...template.subheadline,
      y: Math.max(template.subheadline.y, headlineLayer.y + headlineLayer.height + 0.5),
    };
    if (showRatingBadge) {
      const darkBackground = luminance(averageColor(contrastBackgrounds)) < 0.35;
      await drawRatingBadge(ctx, rating!, ratingTop, canvas.width, canvas.height, headlineFamily, contrastColor, darkBackground, 50, (editorialFashion || academicEducation) ? 0.72 : 1);
    }
    const headlineText = slide.headline === "Your Main Headline" ? template.defaultHeadline ?? slide.headline : slide.headline;
    const subheadlineText = slide.subheadline?.trim() ? slide.subheadline : template.defaultSubheadline ?? "";
    await drawText(ctx, headlineText, headlineLayer, canvas.width, canvas.height, headlineFamily, slide.textAlignment, slide.headlineColor ?? (template.headline.autoContrast === false ? undefined : contrastColor), contrastBackgrounds, options.onTextOverflow);
    await drawText(ctx, subheadlineText, subheadlineLayer, canvas.width, canvas.height, subheadlineFamily, slide.textAlignment, slide.subheadlineColor ?? (template.subheadline.autoContrast === false ? undefined : contrastColor), contrastBackgrounds, options.onTextOverflow);

    const defaultItems = template.taskCards?.map((item) => ({ subtitle: item.time, title: item.title, detail: item.detail }))
      ?? template.routineRows?.rows.map((item) => ({ subtitle: item.time, title: item.title })) ?? [];
    const items = slide.cardItems?.map(({ subtitle, title, detail }) => ({ subtitle, title, detail })) ?? defaultItems;
    const copyBottom = Math.max(headlineLayer.y + headlineLayer.height, subheadlineLayer.y + subheadlineLayer.height);
    const firstCardTop = template.taskCards?.[0]?.y ?? template.routineRows?.y;
    const cardOffset = showDecorativeLayers && firstCardTop !== undefined ? Math.max(0, copyBottom + 1 - firstCardTop) : 0;
    const cardBounds: { left: number; right: number; bottom: number }[] = [];
    const itemsForCards = template.id === "side-by-side-proof" ? items.slice(0, 2) : items;
    const taskCards = template.taskCards;
    if (showDecorativeLayers && taskCards?.length) {
      const verticalStep = taskCards.length > 1 ? taskCards[1].y - taskCards[0].y : 0;
      const step = verticalStep || taskCards[0].height + 1;
      for (const [index, item] of itemsForCards.entries()) {
        const card = taskCards[index] ?? taskCards[taskCards.length - 1];
        const y = (index < taskCards.length ? card.y : taskCards[taskCards.length - 1].y + (index - taskCards.length + 1) * step) + cardOffset;
        const positionedCard = { ...card, y };
        await drawTaskCard(ctx, positionedCard, item, canvas.width, canvas.height, cardFamily);
        cardBounds.push({ left: card.x, right: card.x + card.width, bottom: y + card.height });
      }
    }
    if (showDecorativeLayers && template.routineRows && items.length > 0) {
      await drawRoutineRows(ctx, template, items, canvas.width, canvas.height, cardFamily, cardOffset);
      const rowLayout = template.routineRows;
      const bottom = rowLayout.y + cardOffset + Math.max(0, items.length - 1) * (rowLayout.rowHeight + rowLayout.gap) + rowLayout.rowHeight;
      cardBounds.push({ left: rowLayout.x, right: rowLayout.x + rowLayout.width, bottom });
    }

    const box = template.screenshot;
    const imageWidth = loaded.image instanceof HTMLCanvasElement ? loaded.image.width : loaded.image.naturalWidth;
    const imageHeight = loaded.image instanceof HTMLCanvasElement ? loaded.image.height : loaded.image.naturalHeight;
    const insetRatio = template.device.visible && options.frameVisible !== false ? 0.018 : 0;
    const maxFrameWidth = (box.width / 100) * canvas.width;
    const maxFrameHeight = (box.height / 100) * canvas.height;
    let frameY = (box.y / 100) * canvas.height;
    let frameSize = fitFrameToImage(imageWidth, imageHeight, maxFrameWidth, maxFrameHeight, insetRatio);
    let frameX = (box.x / 100) * canvas.width - frameSize.width / 2;
    const overlappingCardBounds = cardBounds.filter((bounds) => frameX < (bounds.right / 100) * canvas.width && frameX + frameSize.width > (bounds.left / 100) * canvas.width);
    if (overlappingCardBounds.length > 0 && frameSize.height > 0) {
      const cardBottom = Math.max(...overlappingCardBounds.map((bounds) => bounds.bottom)) / 100 * canvas.height;
      frameY = Math.max(frameY, cardBottom + canvas.height * 0.015);
      const availableHeight = Math.max(1, canvas.height * 0.98 - frameY);
      frameSize = fitFrameToImage(imageWidth, imageHeight, maxFrameWidth, Math.min(maxFrameHeight, availableHeight), insetRatio);
      frameX = (box.x / 100) * canvas.width - frameSize.width / 2;
    }
    const x = frameX;
    const y = frameY;
    const frameWidth = frameSize.width;
    const frameHeight = frameSize.height;
    const rotation = template.device.rotation ?? 0;
    if (rotation) {
      ctx.save();
      ctx.translate(x + frameWidth / 2, y + frameHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      const rotatedX = -frameWidth / 2;
      const rotatedY = -frameHeight / 2;
      if (template.device.visible && options.frameVisible !== false) {
        drawPhone(ctx, rotatedX, rotatedY, frameWidth, frameHeight, canvas.width, canvas.height, { ...template.device, color: options.frameColor ?? template.device.color });
        if (template.device.glow) drawDeviceGlow(ctx, rotatedX, rotatedY, frameWidth, frameHeight, canvas.width, canvas.height);
      }
      drawScreenshot(ctx, loaded.image, rotatedX, rotatedY, frameWidth, frameHeight, (box.radius / 100) * canvas.width, "contain", insetRatio);
      if (template.device.visible && options.frameVisible !== false) drawDeviceAccents(ctx, rotatedX, rotatedY, frameWidth, frameHeight, template.device);
      ctx.restore();
    } else {
    if (template.device.visible && options.frameVisible !== false) {
      drawPhone(ctx, x, y, frameWidth, frameHeight, canvas.width, canvas.height, { ...template.device, color: options.frameColor ?? template.device.color });
      if (template.device.glow) drawDeviceGlow(ctx, x, y, frameWidth, frameHeight, canvas.width, canvas.height);
    }
    drawScreenshot(ctx, loaded.image, x, y, frameWidth, frameHeight, (box.radius / 100) * canvas.width, "contain", insetRatio);
    if (template.device.visible && options.frameVisible !== false) drawDeviceAccents(ctx, x, y, frameWidth, frameHeight, template.device);
    }
    // Keep collage imagery and small art accents above the base artwork and device, as discrete layers.
    if (showDecorativeLayers) {
      for (const panel of loadedPanels) drawScreenshotPanel(ctx, panel.image, panel.definition, canvas.width, canvas.height);
      drawTemplateStickers(ctx, loadedStickers, canvas.width, canvas.height);
    }
    if (showDecorativeLayers) {
      const defaultWidgetItems = template.floatingWidget ? [{ title: template.floatingWidget.title, subtitle: template.floatingWidget.detail }] : [];
      await drawFloatingWidget(ctx, template.floatingWidget, slide.floatingWidgetItems ?? defaultWidgetItems, canvas.width, canvas.height, cardFamily);
    }
    return canvas;
  } finally {
    loaded?.dispose();
    loadedPanels.forEach((panel) => panel.dispose());
    ctx.restore();
  }
}

function pastelFromBrand(color: string): string {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match) return "#f2f0ed";
  const value = Number.parseInt(match[1], 16);
  const channel = (shift: number) => Math.round(((value >> shift) & 0xff) * 0.12 + 255 * 0.88);
  return `#${[channel(16), channel(8), channel(0)].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

/** Compare intrinsic pixels, independent of CSS preview scaling. */
export function canvasesHaveSamePixels(left: HTMLCanvasElement, right: HTMLCanvasElement): boolean {
  if (left.width !== right.width || left.height !== right.height) return false;
  const leftContext = left.getContext("2d");
  const rightContext = right.getContext("2d");
  if (!leftContext || !rightContext) return false;
  const a = leftContext.getImageData(0, 0, left.width, left.height).data;
  const b = rightContext.getImageData(0, 0, right.width, right.height).data;
  return a.every((value, index) => value === b[index]);
}
