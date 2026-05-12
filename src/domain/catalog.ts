import type { Product, ProductId } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'door-curtain',
    name: '门帘',
    subtitle: '适合玄关、厨房、卧室的长幅布艺定制',
    description: '竖版大画幅，适合插画、品牌海报、节日图案和欢迎语。',
    category: '家居软装',
    variants: [
      { id: 'curtain-white', name: '白色布基', color: 'White', swatch: '#f8fafc', price: 69 },
      { id: 'curtain-linen', name: '亚麻米色', color: 'Linen', swatch: '#d8c3a5', price: 79 }
    ],
    views: [
      {
        id: 'front',
        name: '正面',
        canvas: { width: 430, height: 690 },
        printArea: { x: 32, y: 38, width: 366, height: 614 },
        recommendedPixels: { width: 3324, height: 5652 }
      }
    ],
    mockup: {
      frame: 'curtain',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 44%, #e0f2fe 100%)',
      baseImage: '/assets/door-curtain-base.png',
      textureImage: '/assets/door-curtain-folds.png',
      textureArea: { x: 154, y: 146, width: 142, height: 232 },
      texturePolygon: [
        { x: 154, y: 146 },
        { x: 296, y: 146 },
        { x: 294, y: 378 },
        { x: 158, y: 378 }
      ],
      textureBlendMode: 'source-over',
      textureOpacity: 0.92
    }
  },
  {
    id: 'floor-mat',
    name: '地垫',
    subtitle: '适合入户、浴室、厨房的横幅吸水地垫',
    description: '横版设计，适合欢迎语、品牌标识、图案满铺和节日主题。',
    category: '家居日用',
    variants: [
      { id: 'mat-charcoal', name: '炭灰底', color: 'Charcoal', swatch: '#334155', price: 59 },
      { id: 'mat-sand', name: '浅砂底', color: 'Sand', swatch: '#d6c7ad', price: 59 }
    ],
    views: [
      {
        id: 'front',
        name: '正面',
        canvas: { width: 560, height: 360 },
        printArea: { x: 56, y: 52, width: 448, height: 256 },
        recommendedPixels: { width: 3200, height: 2200 }
      }
    ],
    mockup: {
      frame: 'mat',
      background: 'linear-gradient(135deg, #f4f4f5 0%, #e7e5e4 55%, #dbeafe 100%)'
    }
  }
];

export function getProductById(productId: ProductId | string): Product {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Unsupported product: ${productId}`);
  }
  return product;
}

export function getVariant(productId: ProductId, variantId: string) {
  const product = getProductById(productId);
  const variant = product.variants.find((item) => item.id === variantId);
  if (!variant) {
    throw new Error(`Unsupported variant: ${variantId}`);
  }
  return variant;
}
