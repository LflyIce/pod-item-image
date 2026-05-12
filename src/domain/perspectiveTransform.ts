/**
 * 4-point perspective (projective) transform.
 *
 * Given 4 source points and 4 destination points, computes the 8-parameter
 * homography matrix that maps  (srcX, srcY) → (dstX, dstY).
 *
 * Forward:   dst = (M · src_homogeneous) projected back to 2-D
 *   dstX = (a*x + b*y + c) / (g*x + h*y + 1)
 *   dstY = (d*x + e*y + f) / (g*x + h*y + 1)
 *
 * Coefficients stored as [a, b, c, d, e, f, g, h].
 */

export class PerspectiveTransform {
  private fwd: number[]; // forward coefficients
  private inv: number[]; // inverse coefficients

  constructor(srcPts: ArrayLike<number>, dstPts: ArrayLike<number>) {
    // srcPts / dstPts are flat arrays: [x0,y0, x1,y1, x2,y2, x3,y3]
    this.fwd = solveHomography(srcPts, dstPts);
    this.inv = solveHomography(dstPts, srcPts);
  }

  /** Forward: source → destination */
  transform(x: number, y: number): [number, number] {
    const [a, b, c, d, e, f, g, h] = this.fwd;
    const w = g * x + h * y + 1;
    return [(a * x + b * y + c) / w, (d * x + e * y + f) / w];
  }

  /** Inverse: destination → source */
  transformInverse(x: number, y: number): [number, number] {
    const [a, b, c, d, e, f, g, h] = this.inv;
    const w = g * x + h * y + 1;
    return [(a * x + b * y + c) / w, (d * x + e * y + f) / w];
  }
}

/**
 * Solve for 8 homography parameters that map 4 source points → 4 destination points.
 *
 * Each point pair gives two equations:
 *   a*xi + b*yi + c - gi*xi*ui - hi*yi*ui = ui
 *   d*xi + e*yi + f - gi*xi*vi - hi*yi*vi = vi
 *
 * where (xi, yi) = source, (ui, vi) = destination.
 *
 * We set up the 8×8 linear system  A · p = B  and solve via Cramer-like
 * Gaussian elimination with partial pivoting.
 */
function solveHomography(src: ArrayLike<number>, dst: ArrayLike<number>): number[] {
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i * 2];
    const sy = src[i * 2 + 1];
    const dx = dst[i * 2];
    const dy = dst[i * 2 + 1];

    // row 1: a*sx + b*sy + c + 0 + 0 + 0 - dx*sx*g - dx*sy*h = dx
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    B.push(dx);
    // row 2: 0 + 0 + 0 + d*sx + e*sy + f - dy*sx*g - dy*sy*h = dy
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    B.push(dy);
  }

  return solveLinearSystem(A, B);
}

/**
 * Solve n×n linear system via Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], B: number[]): number[] {
  const n = B.length;
  // augmented matrix
  const aug = A.map((row, i) => [...row, B[i]]);

  for (let col = 0; col < n; col++) {
    // partial pivot
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(aug[row][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = row;
      }
    }
    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    }

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      throw new Error('PerspectiveTransform: singular matrix – points may be degenerate');
    }

    for (let j = col; j <= n; j++) aug[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  return aug.map((row) => row[n]);
}
