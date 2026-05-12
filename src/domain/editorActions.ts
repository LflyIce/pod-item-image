import type { DesignLayer, ImageLayer, Rect } from './types';

export function fitLayerToArea<T extends DesignLayer>(layer: T, area: Rect, mode: 'stretch' | 'cover'): T {
  if (mode === 'stretch' || layer.type !== 'image') {
    return {
      ...layer,
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
      scale: 1,
      rotation: 0
    };
  }

  const aspect = layer.naturalWidth / layer.naturalHeight;
  const areaAspect = area.width / area.height;
  const width = aspect > areaAspect ? area.height * aspect : area.width;
  const height = aspect > areaAspect ? area.height : area.width / aspect;

  return {
    ...layer,
    x: area.x + (area.width - width) / 2,
    y: area.y + (area.height - height) / 2,
    width,
    height,
    scale: 1,
    rotation: 0
  };
}

export function setLayerTileMode(layer: ImageLayer, tileMode: NonNullable<ImageLayer['tileMode']>): ImageLayer {
  return {
    ...layer,
    tileMode
  };
}
