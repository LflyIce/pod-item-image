import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { getProductById, PRODUCTS } from './catalog';

describe('product catalog', () => {
  it('ships exactly the first two MVP products: door curtain and floor mat', () => {
    expect(PRODUCTS.map((product) => product.id)).toEqual(['door-curtain', 'floor-mat']);
    expect(PRODUCTS[0].name).toBe('门帘');
    expect(PRODUCTS[1].name).toBe('地垫');
  });

  it('defines print areas and recommended output pixels for every product view', () => {
    for (const product of PRODUCTS) {
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.views.length).toBeGreaterThan(0);
      for (const view of product.views) {
        expect(view.printArea.width).toBeGreaterThan(0);
        expect(view.printArea.height).toBeGreaterThan(0);
        expect(view.recommendedPixels.width).toBeGreaterThanOrEqual(1800);
        expect(view.recommendedPixels.height).toBeGreaterThanOrEqual(1800);
      }
    }
  });

  it('uses the provided door curtain image as an effect template with a mapped curtain area', () => {
    const product = getProductById('door-curtain');

    expect(product.mockup.baseImage).toBe('/assets/door-curtain-base.png');
    expect(product.mockup.textureArea).toEqual({ x: 154, y: 143, width: 156, height: 259 });
    expect(product.mockup.texturePolygon).toEqual([
      { x: 154, y: 147 },
      { x: 310, y: 143 },
      { x: 310, y: 402 },
      { x: 156, y: 400 }
    ]);
    expect(product.mockup.textureImage).toBe('/assets/door-curtain-folds.png');
    expect(product.mockup.textureBlendMode).toBe('soft-light');
    expect(product.mockup.textureOpacity).toBeGreaterThan(0.18);
    expect(product.mockup.textureOpacity).toBeLessThanOrEqual(0.45);
    expect(existsSync('public/assets/door-curtain-folds.png')).toBe(true);
    expect(product.mockup.maskImage).toBe('/assets/curtain-mask.png');
    expect(product.mockup.shadowImage).toBe('/assets/door-curtain-shadow.png');
    expect(product.mockup.highlightImage).toBe('/assets/door-curtain-highlight.png');
    expect(product.mockup.normalImage).toBe('/assets/door-curtain-normal.png');
    expect(product.mockup.warpPoints?.dst).toEqual(product.mockup.texturePolygon);
    expect(product.mockup.warpPanels).toEqual([
      {
        source: { x: 0, y: 0, width: 0.5, height: 1 },
        dst: [
          { x: 154, y: 147 },
          { x: 234, y: 145 },
          { x: 235, y: 402 },
          { x: 156, y: 400 }
        ]
      },
      {
        source: { x: 0.5, y: 0, width: 0.5, height: 1 },
        dst: [
          { x: 234, y: 145 },
          { x: 310, y: 143 },
          { x: 310, y: 402 },
          { x: 235, y: 402 }
        ]
      }
    ]);
    expect(existsSync('public/assets/curtain-mask.png')).toBe(true);
    expect(existsSync('public/assets/door-curtain-shadow.png')).toBe(true);
    expect(existsSync('public/assets/door-curtain-highlight.png')).toBe(true);
    expect(existsSync('public/assets/door-curtain-normal.png')).toBe(true);
  });

  it('looks products up by id and throws for unsupported product ids', () => {
    expect(getProductById('door-curtain').name).toBe('门帘');
    expect(() => getProductById('unknown')).toThrow('Unsupported product: unknown');
  });
});
