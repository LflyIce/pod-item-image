import { getProductById } from './catalog';
import type { DesignLayer, DesignProject, ImageLayer, ProductId, QualityStatus, TemplateLayer, TextLayer } from './types';

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function createBlankProject(productId: ProductId, variantId: string): DesignProject {
  getProductById(productId);

  return {
    id: uid('project'),
    productId,
    variantId,
    activeViewId: 'front',
    views: {
      front: {
        layers: []
      }
    },
    updatedAt: now()
  };
}

export function createTextLayer(project: DesignProject, text: string): DesignProject {
  const product = getProductById(project.productId);
  const area = product.views[0].printArea;
  const layer: TextLayer = {
    id: uid('text'),
    type: 'text',
    text,
    x: area.x + area.width * 0.18,
    y: area.y + area.height * 0.42,
    width: area.width * 0.64,
    height: 58,
    rotation: 0,
    scale: 1,
    opacity: 1,
    zIndex: project.views.front.layers.length + 1,
    fontSize: product.id === 'door-curtain' ? 24 : 40,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#0f172a',
    fontWeight: '700'
  };

  return appendLayer(project, layer);
}

export function createImageLayer(
  project: DesignProject,
  assetUrl: string,
  naturalSize: { width: number; height: number }
): DesignProject {
  const product = getProductById(project.productId);
  const area = product.views[0].printArea;
  const layer: ImageLayer = {
    id: uid('image'),
    type: 'image',
    assetUrl,
    naturalWidth: naturalSize.width,
    naturalHeight: naturalSize.height,
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    rotation: 0,
    scale: 1,
    opacity: 1,
    zIndex: project.views.front.layers.length + 1
  };

  return appendLayer(project, layer);
}

export function appendLayer(project: DesignProject, layer: DesignLayer): DesignProject {
  return {
    ...project,
    updatedAt: now(),
    views: {
      ...project.views,
      front: {
        layers: [...project.views.front.layers, layer]
      }
    }
  };
}

export function removeLayer(project: DesignProject, layerId: string): DesignProject {
  return updateLayers(project, (layers) => layers.filter((layer) => layer.id !== layerId));
}

export function moveLayer(project: DesignProject, layerId: string, deltaX: number, deltaY: number): DesignProject {
  return updateLayer(project, layerId, (layer) => ({
    ...layer,
    x: layer.x + deltaX,
    y: layer.y + deltaY
  }));
}

export function resizeLayer(project: DesignProject, layerId: string, scale: number): DesignProject {
  return updateLayer(project, layerId, (layer) => ({
    ...layer,
    scale: Math.max(0.2, Math.min(3, scale))
  }));
}

export function updateTextLayer(
  project: DesignProject,
  layerId: string,
  updates: Partial<Pick<TextLayer, 'text' | 'fill' | 'fontSize' | 'fontWeight'>>
): DesignProject {
  return updateLayer(project, layerId, (layer) => {
    if (layer.type !== 'text') return layer;
    return { ...layer, ...updates };
  });
}

export function bringLayerForward(project: DesignProject, layerId: string): DesignProject {
  const layers = [...project.views.front.layers];
  const index = layers.findIndex((layer) => layer.id === layerId);
  if (index < 0 || index === layers.length - 1) return project;
  [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
  return updateLayers(project, () => layers.map((layer, idx) => ({ ...layer, zIndex: idx + 1 })));
}

export function applyTemplate(project: DesignProject, templateLayers: Array<TemplateLayer | DesignLayer>): DesignProject {
  return {
    ...project,
    updatedAt: now(),
    views: {
      ...project.views,
      front: {
        layers: templateLayers.map((layer, index): DesignLayer => ({
          ...layer,
          id: uid(layer.type),
          zIndex: index + 1
        }))
      }
    }
  };
}

export function getQualityStatus(project: DesignProject, imageSize?: { width: number; height: number }): QualityStatus {
  const product = getProductById(project.productId);
  const recommended = product.views[0].recommendedPixels;
  const largestUploaded = imageSize ?? getLargestImageLayer(project);

  if (!largestUploaded) {
    return { label: '可用', score: 72, message: '添加高清图片后可评估印刷质量' };
  }

  const widthRatio = largestUploaded.width / recommended.width;
  const heightRatio = largestUploaded.height / recommended.height;
  const ratio = Math.min(widthRatio, heightRatio);

  if (ratio >= 0.9) {
    return { label: '优秀', score: 96, message: '图片尺寸接近推荐规格，适合生产' };
  }
  if (ratio >= 0.58) {
    return { label: '可用', score: 78, message: '图片可用于生产，局部细节可能略有损耗' };
  }
  return { label: '偏低', score: 46, message: '建议上传更高清图片，避免印刷发虚' };
}

function getLargestImageLayer(project: DesignProject) {
  const images = project.views.front.layers.filter((layer): layer is ImageLayer => layer.type === 'image');
  return images
    .map((layer) => ({ width: layer.naturalWidth, height: layer.naturalHeight }))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0];
}

function updateLayer(
  project: DesignProject,
  layerId: string,
  updater: (layer: DesignLayer) => DesignLayer
): DesignProject {
  return updateLayers(project, (layers) => layers.map((layer) => (layer.id === layerId ? updater(layer) : layer)));
}

function updateLayers(project: DesignProject, updater: (layers: DesignLayer[]) => DesignLayer[]): DesignProject {
  return {
    ...project,
    updatedAt: now(),
    views: {
      ...project.views,
      front: {
        layers: updater(project.views.front.layers)
      }
    }
  };
}
