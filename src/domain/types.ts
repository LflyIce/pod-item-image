export type ProductId = 'door-curtain' | 'floor-mat' | 't-shirt' | 'mug' | 'phone-case' | 'tote-bag';

export type ProductVariant = {
  id: string;
  name: string;
  color: string;
  swatch: string;
  price: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type ProductView = {
  id: 'front';
  name: string;
  canvas: {
    width: number;
    height: number;
  };
  printArea: Rect;
  recommendedPixels: {
    width: number;
    height: number;
  };
};

export type Product = {
  id: ProductId;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  variants: ProductVariant[];
  views: ProductView[];
  mockup: {
    frame: 'curtain' | 'mat';
    background: string;
    baseImage?: string;
    textureImage?: string;
    textureArea?: Rect;
    texturePolygon?: Point[];
    textureBlendMode?: 'source-over' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
    textureOpacity?: number;
    /** 4-point perspective warp: maps source rect corners to destination quad on the base image */
    warpPoints?: {
      src: Point[];  // 4 corners of the source (editor print area) – usually a rectangle
      dst: Point[];  // 4 corners on the product base image – may be a non-rectangular quad
    };
  };
};

export type BaseLayer = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

export type TextLayer = BaseLayer & {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: '400' | '700';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

export type ImageLayer = BaseLayer & {
  type: 'image';
  assetUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  tileMode?: 'none' | 'basic' | 'mirror';
};

export type DesignLayer = TextLayer | ImageLayer;

export type TemplateLayer = Omit<TextLayer, 'id'> | Omit<ImageLayer, 'id'>;

export type DesignViewState = {
  layers: DesignLayer[];
};

export type DesignProject = {
  id: string;
  productId: ProductId;
  variantId: string;
  activeViewId: 'front';
  views: Record<'front', DesignViewState>;
  updatedAt: string;
};

export type QualityStatus = {
  label: '优秀' | '可用' | '偏低';
  score: number;
  message: string;
};

export type CartItem = {
  id: string;
  project: DesignProject;
  productId: ProductId;
  variantId: string;
  quantity: number;
  previewUrl: string;
};

export type Order = {
  id: string;
  customerName: string;
  createdAt: string;
  status: 'pending-production';
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  productId: ProductId;
  variantId: string;
  quantity: number;
  previewUrl: string;
  production: {
    status: 'ready';
    designJson: DesignProject;
    fileName: string;
  };
};
