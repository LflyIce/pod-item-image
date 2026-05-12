import type { Rect } from './types';

export type Size = {
  width: number;
  height: number;
};

export type Crop = {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

export function coverCrop(source: Size, target: Size): Crop {
  if (source.width <= 0 || source.height <= 0 || target.width <= 0 || target.height <= 0) {
    throw new Error('Source and target sizes must be positive');
  }

  const sourceRatio = source.width / source.height;
  const targetRatio = target.width / target.height;

  if (sourceRatio > targetRatio) {
    const sourceWidth = source.height * targetRatio;
    return {
      sourceX: (source.width - sourceWidth) / 2,
      sourceY: 0,
      sourceWidth,
      sourceHeight: source.height
    };
  }

  const sourceHeight = source.width / targetRatio;
  return {
    sourceX: 0,
    sourceY: (source.height - sourceHeight) / 2,
    sourceWidth: source.width,
    sourceHeight
  };
}

export function scaleRect(rect: Rect, scale: number): Rect {
  return {
    x: roundPixel(rect.x * scale),
    y: roundPixel(rect.y * scale),
    width: roundPixel(rect.width * scale),
    height: roundPixel(rect.height * scale)
  };
}

function roundPixel(value: number) {
  return Math.round(value * 1000) / 1000;
}
