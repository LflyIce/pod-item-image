import type { PodControlPoint } from './podTemplate';

export type BezierMeshPoint = {
  x: number;
  y: number;
  z: number;
  u: number;
  v: number;
};

export type BezierMeshTriangle = {
  i0: number;
  i1: number;
  i2: number;
};

export type BezierSurfaceMesh = {
  points: BezierMeshPoint[];
  triangles: BezierMeshTriangle[];
};

export function quadraticBernstein(index: 0 | 1 | 2, t: number) {
  if (index === 0) return (1 - t) * (1 - t);
  if (index === 1) return 2 * (1 - t) * t;
  return t * t;
}

export function evaluateBezierSurface(ctrlPos: PodControlPoint[], u: number, v: number): PodControlPoint {
  const controlPoints = ctrlPos.length === 9 ? ctrlPos : [];
  if (controlPoints.length !== 9) {
    return { x: 0, y: 0, z: 0 };
  }

  let x = 0;
  let y = 0;
  let z = 0;

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const point = controlPoints[row * 3 + col];
      const weight = quadraticBernstein(col as 0 | 1 | 2, u) * quadraticBernstein(row as 0 | 1 | 2, v);
      x += point.x * weight;
      y += point.y * weight;
      z += point.z * weight;
    }
  }

  return {
    x: roundMeshValue(x),
    y: roundMeshValue(y),
    z: roundMeshValue(z)
  };
}

export function createBezierSurfaceMesh(
  ctrlPos: PodControlPoint[],
  gridX: number,
  gridY: number,
  width: number,
  height: number
): BezierSurfaceMesh {
  const points: BezierMeshPoint[] = [];
  const triangles: BezierMeshTriangle[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const scaleX = width / 200;
  const scaleY = height / 200;

  for (let gy = 0; gy <= gridY; gy += 1) {
    for (let gx = 0; gx <= gridX; gx += 1) {
      const u = gx / gridX;
      const v = gy / gridY;
      const point = evaluateBezierSurface(ctrlPos, u, v);
      points.push({
        x: roundMeshValue(centerX + point.x * scaleX),
        y: roundMeshValue(centerY - point.y * scaleY),
        z: point.z,
        u,
        v
      });
    }
  }

  const cols = gridX + 1;
  for (let gy = 0; gy < gridY; gy += 1) {
    for (let gx = 0; gx < gridX; gx += 1) {
      const tl = gy * cols + gx;
      const tr = tl + 1;
      const bl = tl + cols;
      const br = bl + 1;
      triangles.push({ i0: tl, i1: tr, i2: bl });
      triangles.push({ i0: tr, i1: br, i2: bl });
    }
  }

  return { points, triangles };
}

function roundMeshValue(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
