import type { Point, Product } from './types';

export type MockupTemplate = {
  id: string;
  name: string;
  baseImage: string;
  surface: Point[];
  createdAt: string;
};

const defaultSurface: Point[] = [
  { x: 154, y: 147 },
  { x: 310, y: 143 },
  { x: 310, y: 402 },
  { x: 156, y: 400 }
];

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function createMockupTemplate(name: string, baseImage: string, surface: Point[] = defaultSurface): MockupTemplate {
  return {
    id: uid('mockup'),
    name,
    baseImage,
    surface: surface.map((point) => ({ ...point })),
    createdAt: new Date().toISOString()
  };
}

export function boundsFromSurface(surface: Point[]) {
  const xs = surface.map((point) => point.x);
  const ys = surface.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export function applyMockupTemplate(product: Product, template: MockupTemplate): Product {
  const textureArea = boundsFromSurface(template.surface);

  return {
    ...product,
    mockup: {
      frame: product.mockup.frame,
      background: product.mockup.background,
      baseImage: template.baseImage,
      textureArea,
      texturePolygon: template.surface.map((point) => ({ ...point })),
      warpPoints: {
        src: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ],
        dst: template.surface.map((point) => ({ ...point }))
      }
    }
  };
}
