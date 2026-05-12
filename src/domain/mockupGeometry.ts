import type { Point, Rect } from './types';

export function axisAlignedRectFromQuad(points: Point[]): Rect | undefined {
  if (points.length !== 4) return undefined;
  const [topLeft, topRight, bottomRight, bottomLeft] = points;
  const epsilon = 0.001;
  const isAxisAligned =
    nearlyEqual(topLeft.y, topRight.y, epsilon) &&
    nearlyEqual(bottomLeft.y, bottomRight.y, epsilon) &&
    nearlyEqual(topLeft.x, bottomLeft.x, epsilon) &&
    nearlyEqual(topRight.x, bottomRight.x, epsilon);

  if (!isAxisAligned) return undefined;
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: topRight.x - topLeft.x,
    height: bottomLeft.y - topLeft.y
  };
}

function nearlyEqual(left: number, right: number, epsilon: number) {
  return Math.abs(left - right) <= epsilon;
}
