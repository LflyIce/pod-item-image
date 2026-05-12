import type { DesignLayer } from './types';

export function shouldRenderSurfaceEffects(layers: DesignLayer[]) {
  return layers.some((layer) => layer.opacity > 0 && layer.width > 0 && layer.height > 0);
}
