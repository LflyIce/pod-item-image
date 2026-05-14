import { describe, expect, it } from 'vitest';
import { createBezierSurfaceMesh, evaluateBezierSurface, quadraticBernstein } from './bezierSurface';
import { createFlatCtrlPos } from './podTemplate';

describe('Bezier surface renderer math', () => {
  it('evaluates quadratic Bernstein basis at the center', () => {
    expect(quadraticBernstein(0, 0.5)).toBeCloseTo(0.25);
    expect(quadraticBernstein(1, 0.5)).toBeCloseTo(0.5);
    expect(quadraticBernstein(2, 0.5)).toBeCloseTo(0.25);
  });

  it('maps the center of a flat control grid to the center destination', () => {
    expect(evaluateBezierSurface(createFlatCtrlPos(), 0.5, 0.5)).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('creates a renderable grid mesh with two triangles per cell', () => {
    const mesh = createBezierSurfaceMesh(createFlatCtrlPos(), 2, 2, 500, 500);

    expect(mesh.points).toHaveLength(9);
    expect(mesh.triangles).toHaveLength(8);
    expect(mesh.points[0]).toMatchObject({ x: 0, y: 0, u: 0, v: 0 });
    expect(mesh.points[8]).toMatchObject({ x: 500, y: 500, u: 1, v: 1 });
  });
});
