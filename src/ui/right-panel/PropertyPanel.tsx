import type { DesignLayer, Product, TextLayer } from '../../domain/types';
import { TextPropertyEditor } from './TextPropertyEditor';
import { ImagePropertyEditor } from './ImagePropertyEditor';

export function PropertyPanel({
  layer,
  product,
  onUpdateLayer
}: {
  layer: DesignLayer | undefined;
  product: Product;
  onUpdateLayer: (updates: Partial<DesignLayer>) => void;
}) {
  if (!layer) {
    const view = product.views[0];
    return (
      <div className="property-panel">
        <h3>画布信息</h3>
        <div className="prop-info">
          <div className="prop-row">
            <label>产品</label>
            <span>{product.name}</span>
          </div>
          <div className="prop-row">
            <label>画布尺寸</label>
            <span>{view.canvas.width} × {view.canvas.height}</span>
          </div>
          <div className="prop-row">
            <label>印刷区域</label>
            <span>{view.printArea.width} × {view.printArea.height}</span>
          </div>
          <div className="prop-row">
            <label>推荐像素</label>
            <span>{view.recommendedPixels.width} × {view.recommendedPixels.height}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-panel">
      <h3>{layer.type === 'text' ? '文字属性' : '图片属性'}</h3>
      {layer.type === 'text' ? (
        <TextPropertyEditor layer={layer} onUpdate={(updates) => onUpdateLayer(updates)} />
      ) : (
        <ImagePropertyEditor layer={layer} onUpdate={(updates) => onUpdateLayer(updates)} />
      )}
    </div>
  );
}
