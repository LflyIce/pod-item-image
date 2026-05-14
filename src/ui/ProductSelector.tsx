import { ALL_PRODUCTS } from '../domain/catalog';
import type { ProductId } from '../domain/types';

const productIcons: Record<ProductId, { emoji: string; bgColor: string }> = {
  'door-curtain': { emoji: '🏠', bgColor: '#eef2ff' },
  'floor-mat': { emoji: '🧹', bgColor: '#f0fdf4' },
  't-shirt': { emoji: '👕', bgColor: '#f0f9ff' },
  'mug': { emoji: '☕', bgColor: '#fefce8' },
  'phone-case': { emoji: '📱', bgColor: '#faf5ff' },
  'tote-bag': { emoji: '👜', bgColor: '#fef3c7' }
};

interface ProductSelectorProps {
  onSelect: (productId: ProductId) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const products = ALL_PRODUCTS;

  return (
    <div className="product-selector">
      <header className="selector-header">
        <div className="selector-logo">POD 定制平台</div>
        <p className="selector-subtitle">选择产品，开始定制你的专属好物</p>
      </header>
      <div className="product-grid">
        {products.map((product) => {
          const meta = productIcons[product.id];
          const minPrice = Math.min(...product.variants.map((v) => v.price));
          return (
            <button
              key={product.id}
              className="product-card"
              onClick={() => onSelect(product.id)}
            >
              <div
                className="product-icon-area"
                style={{ backgroundColor: meta.bgColor }}
              >
                <span className="product-emoji">{meta.emoji}</span>
              </div>
              <div className="product-card-body">
                <strong className="product-card-name">{product.name}</strong>
                <span className="product-card-subtitle">{product.subtitle}</span>
                <span className="product-card-price">¥{minPrice}起</span>
              </div>
              <div className="product-card-swatches">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="product-swatch"
                    style={{ backgroundColor: v.swatch }}
                    title={v.name}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
