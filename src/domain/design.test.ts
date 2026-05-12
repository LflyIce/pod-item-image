import { describe, expect, it } from 'vitest';
import { createBlankProject, createTextLayer, getQualityStatus, moveLayer, resizeLayer } from './design';

describe('design projects', () => {
  it('creates a blank project for the selected product and variant', () => {
    const project = createBlankProject('door-curtain', 'curtain-white');

    expect(project.productId).toBe('door-curtain');
    expect(project.variantId).toBe('curtain-white');
    expect(project.activeViewId).toBe('front');
    expect(project.views.front.layers).toEqual([]);
  });

  it('adds text layers inside the active printable area', () => {
    const project = createBlankProject('floor-mat', 'mat-charcoal');
    const next = createTextLayer(project, '欢迎回家');
    const layer = next.views.front.layers[0];

    expect(layer.type).toBe('text');
    if (layer.type !== 'text') throw new Error('Expected a text layer');
    expect(layer.x).toBeGreaterThanOrEqual(0);
    expect(layer.y).toBeGreaterThanOrEqual(0);
    expect(layer.text).toBe('欢迎回家');
  });

  it('moves and resizes selected layers without mutating the original project', () => {
    const project = createTextLayer(createBlankProject('door-curtain', 'curtain-white'), '你好');
    const layerId = project.views.front.layers[0].id;
    const moved = moveLayer(project, layerId, 24, -12);
    const resized = resizeLayer(moved, layerId, 1.25);

    expect(project.views.front.layers[0].x).not.toBe(moved.views.front.layers[0].x);
    expect(moved.views.front.layers[0].x).toBe(project.views.front.layers[0].x + 24);
    expect(resized.views.front.layers[0].scale).toBeCloseTo(1.25);
  });

  it('reports image quality from uploaded pixel dimensions against the product recommendation', () => {
    const project = createBlankProject('door-curtain', 'curtain-white');

    expect(getQualityStatus(project, { width: 3400, height: 5800 }).label).toBe('优秀');
    expect(getQualityStatus(project, { width: 2400, height: 3600 }).label).toBe('可用');
    expect(getQualityStatus(project, { width: 900, height: 1200 }).label).toBe('偏低');
  });
});
