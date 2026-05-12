import { describe, expect, it } from 'vitest';
import { normalOffset } from './normalDisplacement';

describe('normal displacement', () => {
  it('keeps neutral normal pixels stationary', () => {
    expect(normalOffset(128, 128, 4)).toEqual({ x: 0, y: 0 });
  });

  it('maps normal red and green channels to signed offsets', () => {
    expect(normalOffset(255, 0, 4).x).toBeCloseTo(3.97, 2);
    expect(normalOffset(255, 0, 4).y).toBeCloseTo(-4, 2);
  });
});
