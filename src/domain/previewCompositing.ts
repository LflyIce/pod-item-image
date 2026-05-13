import type { DesignLayer, Point, Product } from './types';

export type PreviewRenderMode = 'perspective-2d' | 'layered-2d' | 'mapped-2d';

export type Pixel = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export function shouldRenderSurfaceEffects(layers: DesignLayer[]) {
  return layers.some((layer) => layer.opacity > 0 && layer.width > 0 && layer.height > 0);
}

export function getPreviewRenderMode(product: Product): PreviewRenderMode {
  if (product.mockup.warpPoints?.dst.length === 4) {
    return 'perspective-2d';
  }
  return product.mockup.baseImage && product.mockup.textureArea ? 'layered-2d' : 'mapped-2d';
}

export function getPreviewSurfacePath(product: Product): Point[] {
  if (product.mockup.texturePolygon?.length) {
    return product.mockup.texturePolygon;
  }

  const area = product.mockup.textureArea ?? product.views[0].printArea;
  return [
    { x: area.x, y: area.y },
    { x: area.x + area.width, y: area.y },
    { x: area.x + area.width, y: area.y + area.height },
    { x: area.x, y: area.y + area.height }
  ];
}

export function shadeDesignPixel(design: Pixel, base: Pixel, neutralLuminance = 226): Pixel {
  if (design.a === 0 || base.a === 0) return design;

  const baseLuminance = 0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b;
  const neutralFabric = Math.max(24, Math.min(246, neutralLuminance));

  if (baseLuminance < neutralFabric) {
    const shadow = (neutralFabric - baseLuminance) / neutralFabric;
    const factor = 1 - shadow * 0.34;
    return {
      r: clampChannel(design.r * factor),
      g: clampChannel(design.g * factor),
      b: clampChannel(design.b * factor),
      a: design.a
    };
  }

  const highlight = Math.min(1, (baseLuminance - neutralFabric) / Math.max(1, 255 - neutralFabric));
  const amount = Math.min(0.14, highlight * 0.12);
  return {
    r: clampChannel(design.r + (255 - design.r) * amount),
    g: clampChannel(design.g + (255 - design.g) * amount),
    b: clampChannel(design.b + (255 - design.b) * amount),
    a: design.a
  };
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Apply a highlight overlay (screen blend) clipped to the product surface.
 * This simulates specular highlights on the fabric.
 */
export function applyHighlightOverlay(
  ctx: CanvasRenderingContext2D,
  highlightImage: HTMLImageElement,
  surfacePath: Point[],
  width: number,
  height: number,
  opacity: number
) {
  if (opacity <= 0) return;
  ctx.save();
  clipToPreviewSurface(ctx, surfacePath);
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(highlightImage, 0, 0, width, height);
  ctx.restore();
}

function clipToPreviewSurface(
  context: CanvasRenderingContext2D,
  surfacePath: Array<{ x: number; y: number }>
) {
  context.beginPath();
  context.moveTo(surfacePath[0].x, surfacePath[0].y);
  for (const point of surfacePath.slice(1)) {
    context.lineTo(point.x, point.y);
  }
  context.closePath();
  context.clip();
}
