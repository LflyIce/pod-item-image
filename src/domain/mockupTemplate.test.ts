import { describe, expect, it } from 'vitest';
import { applyMockupTemplate, boundsFromSurface, createMockupTemplate } from './mockupTemplate';
import { getProductById } from './catalog';

const surface = [
  { x: 120, y: 90 },
  { x: 360, y: 80 },
  { x: 340, y: 420 },
  { x: 110, y: 390 }
];

describe('mockup templates', () => {
  it('derives a texture area from the manually marked surface points', () => {
    expect(boundsFromSurface(surface)).toEqual({ x: 110, y: 80, width: 250, height: 340 });
  });

  it('creates an uploaded template with an editable default surface', () => {
    const template = createMockupTemplate('Beach mockup', 'data:image/png;base64,abc');

    expect(template.name).toBe('Beach mockup');
    expect(template.baseImage).toBe('data:image/png;base64,abc');
    expect(template.surface.length).toBe(4);
    expect(boundsFromSurface(template.surface).width).toBeGreaterThan(0);
  });

  it('applies a template as the product preview surface and perspective target', () => {
    const product = getProductById('door-curtain');
    const template = createMockupTemplate('Manual mockup', 'data:image/png;base64,abc', surface);
    const applied = applyMockupTemplate(product, template);

    expect(applied.mockup.baseImage).toBe(template.baseImage);
    expect(applied.mockup.texturePolygon).toEqual(surface);
    expect(applied.mockup.textureArea).toEqual({ x: 110, y: 80, width: 250, height: 340 });
    expect(applied.mockup.warpPoints?.dst).toEqual(surface);
    expect(applied.mockup.maskImage).toBeUndefined();
  });
});
