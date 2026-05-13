import { describe, expect, it } from 'vitest';
import { shadeDesignPixel, getPreviewRenderMode, getPreviewSurfacePath, shouldRenderSurfaceEffects } from './previewCompositing';
import type { DesignLayer, Product } from './types';

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

  it('uses perspective 2D compositing when a mockup has warp points', () => {
    const product: Product = {
      id: 'door-curtain',
      name: 'Door curtain',
      subtitle: '',
      description: '',
      category: '',
      variants: [],
      views: [],
      mockup: {
        frame: 'curtain',
        background: '#fff',
        baseImage: '/base.png',
        textureArea: { x: 10, y: 20, width: 100, height: 200 },
        textureImage: '/texture.png',
        warpPoints: {
          src: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 }
          ],
          dst: [
            { x: 10, y: 20 },
            { x: 100, y: 15 },
            { x: 105, y: 220 },
            { x: 5, y: 210 }
          ]
        }
      }
    };

    expect(getPreviewRenderMode(product)).toBe('perspective-2d');
  });

  it('uses the explicit texture polygon as the fixed clipping surface', () => {
    const product: Product = {
      id: 'door-curtain',
      name: 'Door curtain',
      subtitle: '',
      description: '',
      category: '',
      variants: [],
      views: [
        {
          id: 'front',
          name: 'Front',
          canvas: { width: 500, height: 500 },
          printArea: { x: 50, y: 60, width: 200, height: 300 },
          recommendedPixels: { width: 2000, height: 3000 }
        }
      ],
      mockup: {
        frame: 'curtain',
        background: '#fff',
        textureArea: { x: 10, y: 20, width: 100, height: 200 },
        texturePolygon: [
          { x: 12, y: 25 },
          { x: 108, y: 20 },
          { x: 104, y: 220 },
          { x: 11, y: 215 }
        ]
      }
    };

    expect(getPreviewSurfacePath(product)).toEqual(product.mockup.texturePolygon);
  });

  it('darkens design pixels with the underlying template shadow', () => {
    const shaded = shadeDesignPixel(
      { r: 180, g: 90, b: 60, a: 255 },
      { r: 120, g: 120, b: 120, a: 255 }
    );

    expect(shaded.r).toBeLessThan(180);
    expect(shaded.g).toBeLessThan(90);
    expect(shaded.b).toBeLessThan(60);
    expect(shaded.a).toBe(255);
  });

  it('keeps bright fabric highlights visible without washing out the artwork', () => {
    const shaded = shadeDesignPixel(
      { r: 120, g: 80, b: 40, a: 220 },
      { r: 252, g: 252, b: 252, a: 255 }
    );

    expect(shaded.r).toBeGreaterThan(120);
    expect(shaded.g).toBeGreaterThan(80);
    expect(shaded.b).toBeGreaterThan(40);
    expect(shaded.r).toBeLessThan(180);
    expect(shaded.a).toBe(220);
  });

  it('does not darken an uploaded mockup just because its fabric area is globally gray', () => {
    const shaded = shadeDesignPixel(
      { r: 180, g: 90, b: 60, a: 255 },
      { r: 125, g: 125, b: 125, a: 255 },
      125
    );

    expect(shaded.r).toBeCloseTo(180, 0);
    expect(shaded.g).toBeCloseTo(90, 0);
    expect(shaded.b).toBeCloseTo(60, 0);
  });

  it('keeps local fold shadows when using an uploaded mockup brightness baseline', () => {
    const shaded = shadeDesignPixel(
      { r: 180, g: 90, b: 60, a: 255 },
      { r: 80, g: 80, b: 80, a: 255 },
      125
    );

    expect(shaded.r).toBeLessThan(180);
    expect(shaded.r).toBeGreaterThan(130);
  });
});
