import { describe, expect, it } from 'vitest';
import { coverCrop, scaleRect } from './textureMapping';

describe('texture mapping helpers', () => {
  it('cover-crops landscape artwork into a tall product print area', () => {
    const crop = coverCrop({ width: 1600, height: 900 }, { width: 170, height: 205 });

    expect(crop.sourceWidth).toBeCloseTo(746.34, 1);
    expect(crop.sourceHeight).toBe(900);
    expect(crop.sourceX).toBeCloseTo(426.83, 1);
    expect(crop.sourceY).toBe(0);
  });

  it('cover-crops portrait artwork into a wide product print area', () => {
    const crop = coverCrop({ width: 900, height: 1600 }, { width: 448, height: 256 });

    expect(crop.sourceWidth).toBe(900);
    expect(crop.sourceHeight).toBeCloseTo(514.29, 1);
    expect(crop.sourceX).toBe(0);
    expect(crop.sourceY).toBeCloseTo(542.86, 1);
  });

  it('scales product mapping coordinates for responsive canvas display', () => {
    expect(scaleRect({ x: 152, y: 151, width: 174, height: 205 }, 0.8)).toEqual({
      x: 121.6,
      y: 120.8,
      width: 139.2,
      height: 164
    });
  });
});
