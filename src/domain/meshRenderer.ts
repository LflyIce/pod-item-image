/**
 * Mesh-based perspective warp renderer.
 *
 * Creates a grid mesh over the source image, applies a PerspectiveTransform to
 * every vertex, then renders each triangle via Canvas 2D drawImage with
 * affine transforms (setTransform).
 */

import { PerspectiveTransform } from './perspectiveTransform';

export interface MeshPoint {
  x: number;  // destination x (on product base image)
  y: number;  // destination y
  u: number;  // source u (0-1 normalised)
  v: number;  // source v (0-1 normalised)
}

export interface MeshTriangle {
  i0: number;
  i1: number;
  i2: number;
}

export class WarpMesh {
  points: MeshPoint[];
  triangles: MeshTriangle[];

  constructor(points: MeshPoint[], triangles: MeshTriangle[]) {
    this.points = points;
    this.triangles = triangles;
  }

  /**
   * Create a uniform grid mesh covering [0,0]→[w,h] in source space,
   * then warp every vertex through the given PerspectiveTransform so that
   * source (0,0)→(w,h) maps to the destination quadrilateral.
   */
  static create(
    srcW: number,
    srcH: number,
    dstW: number,
    dstH: number,
    transform: PerspectiveTransform,
    gridX = 16,
    gridY = 16
  ): WarpMesh {
    const points: MeshPoint[] = [];
    const triangles: MeshTriangle[] = [];

    // build grid vertices
    for (let gy = 0; gy <= gridY; gy++) {
      for (let gx = 0; gx <= gridX; gx++) {
        const u = gx / gridX;
        const v = gy / gridY;
        const sx = u * srcW;
        const sy = v * srcH;
        const [dx, dy] = transform.transform(sx, sy);
        points.push({ x: dx, y: dy, u, v });
      }
    }

    // build triangles (two per cell)
    const cols = gridX + 1;
    for (let gy = 0; gy < gridY; gy++) {
      for (let gx = 0; gx < gridX; gx++) {
        const tl = gy * cols + gx;
        const tr = tl + 1;
        const bl = tl + cols;
        const br = bl + 1;
        triangles.push({ i0: tl, i1: tr, i2: bl });
        triangles.push({ i0: tr, i1: br, i2: bl });
      }
    }

    return new WarpMesh(points, triangles);
  }

  /**
   * Render the warped mesh onto a Canvas 2D context.
   *
   * For each triangle we compute an affine mapping from the source image
   * patch to the destination triangle and use `ctx.setTransform` + `ctx.drawImage`.
   */
  render(
    ctx: CanvasRenderingContext2D,
    sourceImage: HTMLImageElement | HTMLCanvasElement,
    srcW: number,
    srcH: number
  ): void {
    // Source image actual pixel dimensions
    const imgW = sourceImage instanceof HTMLImageElement
      ? (sourceImage.naturalWidth || sourceImage.width)
      : sourceImage.width;
    const imgH = sourceImage instanceof HTMLImageElement
      ? (sourceImage.naturalHeight || sourceImage.height)
      : sourceImage.height;

    // Ratio from the normalised (0-1) UV space to actual image pixels
    const pxW = imgW / srcW;
    const pxH = imgH / srcH;

    for (const tri of this.triangles) {
      const p0 = this.points[tri.i0];
      const p1 = this.points[tri.i1];
      const p2 = this.points[tri.i2];

      // Source triangle in actual image pixel coordinates
      const s0x = p0.u * srcW * pxW;
      const s0y = p0.v * srcH * pxH;
      const s1x = p1.u * srcW * pxW;
      const s1y = p1.v * srcH * pxH;
      const s2x = p2.u * srcW * pxW;
      const s2y = p2.v * srcH * pxH;

      // Destination triangle on output canvas
      const d0x = p0.x;
      const d0y = p0.y;
      const d1x = p1.x;
      const d1y = p1.y;
      const d2x = p2.x;
      const d2y = p2.y;

      // Solve 2D affine: T(s) = d  for three point pairs
      //   [a c e] [s0x]   [d0x]
      //   [b d f] [s0y] = [d0y]
      //   [0 0 1] [ 1 ]   [ 1 ]
      const det = s0x * (s1y - s2y) + s1x * (s2y - s0y) + s2x * (s0y - s1y);
      if (Math.abs(det) < 1e-10) continue;
      const invDet = 1 / det;

      const a = (d0x * (s1y - s2y) + d1x * (s2y - s0y) + d2x * (s0y - s1y)) * invDet;
      const c = (d0x * (s2x - s1x) + d1x * (s0x - s2x) + d2x * (s1x - s0x)) * invDet;
      const e = (d0x * (s1x * s2y - s2x * s1y) + d1x * (s2x * s0y - s0x * s2y) + d2x * (s0x * s1y - s1x * s0y)) * invDet;
      const b = (d0y * (s1y - s2y) + d1y * (s2y - s0y) + d2y * (s0y - s1y)) * invDet;
      const d = (d0y * (s2x - s1x) + d1y * (s0x - s2x) + d2y * (s1x - s0x)) * invDet;
      const f = (d0y * (s1x * s2y - s2x * s1y) + d1y * (s2x * s0y - s0x * s2y) + d2y * (s0x * s1y - s1x * s0y)) * invDet;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(d0x, d0y);
      ctx.lineTo(d1x, d1y);
      ctx.lineTo(d2x, d2y);
      ctx.closePath();
      ctx.clip();
      ctx.setTransform(a, b, c, d, e, f);
      ctx.drawImage(sourceImage, -0.5, -0.5, imgW + 1, imgH + 1);
      ctx.restore();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
