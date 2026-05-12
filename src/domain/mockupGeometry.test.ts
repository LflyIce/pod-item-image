import { describe, expect, it } from 'vitest';
import { axisAlignedRectFromQuad } from './mockupGeometry';

describe('mockup geometry', () => {
  it('detects axis-aligned quadrilateral destinations for direct rendering', () => {
    expect(axisAlignedRectFromQuad([
      { x: 154, y: 146 },
      { x: 296, y: 146 },
      { x: 296, y: 378 },
      { x: 154, y: 378 }
    ])).toEqual({ x: 154, y: 146, width: 142, height: 232 });
  });

  it('does not treat perspective quadrilaterals as rectangles', () => {
    expect(axisAlignedRectFromQuad([
      { x: 154, y: 146 },
      { x: 296, y: 132 },
      { x: 286, y: 378 },
      { x: 164, y: 388 }
    ])).toBeUndefined();
  });
});
