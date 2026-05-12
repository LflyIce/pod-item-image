import { describe, expect, it } from 'vitest';
import { shouldRenderSurfaceEffects } from './previewCompositing';
import type { DesignLayer } from './types';

const imageLayer: DesignLayer = {
  id: 'image-1',
  type: 'image',
  assetUrl: 'asset.png',
  naturalWidth: 1000,
  naturalHeight: 1000,
  x: 0,
  y: 0,
  width: 300,
  height: 300,
  rotation: 0,
  scale: 1,
  opacity: 1,
  zIndex: 1
};

describe('preview compositing', () => {
  it('does not render mask or lighting overlays without a design layer', () => {
    expect(shouldRenderSurfaceEffects([])).toBe(false);
  });

  it('renders surface effects once a design layer exists', () => {
    expect(shouldRenderSurfaceEffects([imageLayer])).toBe(true);
  });
});
