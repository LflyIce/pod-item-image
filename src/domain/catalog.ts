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
      textureArea: { x: 108, y: 62, width: 284, height: 426 },
      texturePolygon: [
        { x: 108, y: 62 },
        { x: 392, y: 62 },
        { x: 392, y: 488 },
        { x: 108, y: 488 }
      ],
      textureBlendMode: 'source-over',
      textureOpacity: 0.92,
      warpPoints: {
        src: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ],
        dst: [
          { x: 108, y: 62 },
          { x: 392, y: 62 },
          { x: 392, y: 488 },
          { x: 108, y: 488 }
        ]
      }
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

const newProducts: Product[] = [
  {
    id: 't-shirt',
    name: 'T恤',
    subtitle: '纯棉圆领短袖，舒适透气',
    description: '经典圆领T恤，适合个性图案和文字定制。',
    category: '服装定制',
    variants: [
      { id: 'tshirt-white', name: '白色', color: 'White', swatch: '#ffffff', price: 89 },
      { id: 'tshirt-black', name: '黑色', color: 'Black', swatch: '#1e293b', price: 89 },
      { id: 'tshirt-gray', name: '灰色', color: 'Gray', swatch: '#94a3b8', price: 89 }
    ],
    views: [{
      id: 'front',
      name: '正面',
      canvas: { width: 480, height: 580 },
      printArea: { x: 120, y: 100, width: 240, height: 320 },
      recommendedPixels: { width: 2400, height: 3200 }
    }],
    mockup: {
      frame: 'curtain',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)'
    }
  },
  {
    id: 'mug',
    name: '马克杯',
    subtitle: '陶瓷白杯，11oz经典款',
    description: '11oz经典白色陶瓷杯，适合照片和Logo定制。',
    category: '杯壶定制',
    variants: [
      { id: 'mug-white', name: '白色', color: 'White', swatch: '#ffffff', price: 39 }
    ],
    views: [{
      id: 'front',
      name: '正面',
      canvas: { width: 400, height: 400 },
      printArea: { x: 60, y: 60, width: 280, height: 280 },
      recommendedPixels: { width: 2000, height: 2000 }
    }],
    mockup: {
      frame: 'curtain',
      background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)'
    }
  },
  {
    id: 'phone-case',
    name: '手机壳',
    subtitle: 'iPhone/华为通用磨砂硬壳',
    description: '通用磨砂硬壳，支持多型号。',
    category: '数码配件',
    variants: [
      { id: 'case-matte', name: '磨砂黑', color: 'Matte Black', swatch: '#1e293b', price: 29 },
      { id: 'case-clear', name: '透明', color: 'Clear', swatch: '#f1f5f9', price: 29 }
    ],
    views: [{
      id: 'front',
      name: '正面',
      canvas: { width: 320, height: 620 },
      printArea: { x: 20, y: 80, width: 280, height: 460 },
      recommendedPixels: { width: 1400, height: 3000 }
    }],
    mockup: {
      frame: 'curtain',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)'
    }
  },
  {
    id: 'tote-bag',
    name: '帆布袋',
    subtitle: '加厚帆布，环保可重复使用',
    description: '加厚帆布手提袋，环保实用。',
    category: '箱包定制',
    variants: [
      { id: 'tote-natural', name: '原色', color: 'Natural', swatch: '#d6c7ad', price: 35 }
    ],
    views: [{
      id: 'front',
      name: '正面',
      canvas: { width: 420, height: 520 },
      printArea: { x: 70, y: 80, width: 280, height: 340 },
      recommendedPixels: { width: 2100, height: 2550 }
    }],
    mockup: {
      frame: 'curtain',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)'
    }
  }
];

export const ALL_PRODUCTS: Product[] = [...PRODUCTS, ...newProducts];

export function getProductById(productId: ProductId | string): Product {
  const product = ALL_PRODUCTS.find((item) => item.id === productId);
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
