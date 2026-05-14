import { ChangeEvent, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Download,
  Eye,
  Grid3X3,
  Lock,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  ShoppingCart,
  Trash2,
  Undo2,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText, Transformer } from 'react-konva';
import { getProductById, getVariant } from '../domain/catalog';
import { PerspectiveTransform } from '../domain/perspectiveTransform';
import { WarpMesh } from '../domain/meshRenderer';
import {
  applyTemplate,
  createBlankProject,
  createImageLayer,
  createTextLayer,
  getQualityStatus,
  removeLayer,
  resizeLayer,
  updateTextLayer
} from '../domain/design';
import { fitLayerToArea, setLayerTileMode } from '../domain/editorActions';
import { addCartItem, createOrderFromCart } from '../domain/order';
import { createHistory, pushState, undo as undoHistory, redo as redoHistory, canUndo, canRedo } from '../domain/history';
import { LeftPanel } from './left-panel/LeftPanel';
import type { LeftTab } from './left-panel/LeftPanel';
import { PropertyPanel } from './right-panel/PropertyPanel';
import type { CartItem, DesignLayer, DesignProject, ImageLayer, Order, Product, TemplateLayer, TextLayer } from '../domain/types';
import type { HistoryState } from '../domain/history';

/* ------------------------------------------------------------------ */
/*  Sample assets (inline SVG to avoid external dependencies)          */
/* ------------------------------------------------------------------ */
const sampleAssets = [
  {
    id: 'mountain',
    name: '山野晨雾',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset=".52" stop-color="#f8fafc"/><stop offset="1" stop-color="#bbf7d0"/></linearGradient></defs>
      <rect width="900" height="1400" fill="url(#g)"/><circle cx="720" cy="210" r="92" fill="#facc15" opacity=".75"/>
      <path d="M0 720 210 420 390 680 520 510 900 760v640H0z" fill="#334155"/><path d="M0 810 270 560 490 840 660 650 900 850v550H0z" fill="#64748b"/>
      <path d="M80 1030c190-130 360 95 740-80" fill="none" stroke="#16a34a" stroke-width="56" stroke-linecap="round"/></svg>`)
  },
  {
    id: 'duck',
    name: '水面小鸭',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <rect width="900" height="1400" fill="#dff7ff"/><circle cx="260" cy="250" r="58" fill="#fff" opacity=".8"/><circle cx="620" cy="360" r="72" fill="#fff" opacity=".8"/>
      <path d="M0 760c120-70 230 70 360 0s250-80 540 20v620H0z" fill="#38bdf8" opacity=".45"/>
      <ellipse cx="450" cy="710" rx="210" ry="130" fill="#facc15"/><circle cx="585" cy="610" r="82" fill="#fde047"/><path d="m655 615 96 38-96 36z" fill="#fb923c"/>
      <circle cx="610" cy="592" r="10" fill="#0f172a"/></svg>`)
  },
  {
    id: 'floral',
    name: '复古花纹',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <rect width="900" height="1400" fill="#fff7ed"/>
      ${Array.from({ length: 22 })
        .map((_, i) => {
          const x = 90 + (i % 4) * 230;
          const y = 100 + Math.floor(i / 4) * 230;
          return `<g transform="translate(${x} ${y})"><circle r="58" fill="#fb7185"/><circle cx="56" r="36" fill="#f97316"/><circle cx="-48" cy="16" r="34" fill="#facc15"/><path d="M0 64c-24 58-60 88-118 104" stroke="#16a34a" stroke-width="18" fill="none" stroke-linecap="round"/></g>`;
        })
        .join('')}</svg>`)
  },
  {
    id: 'black',
    name: '黑色经典',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <rect width="900" height="1400" fill="#020617"/><path d="M450 0v1400" stroke="#475569" stroke-width="10"/><path d="M90 80h720v1240H90z" fill="none" stroke="#1e293b" stroke-width="34"/>
      <path d="M210 360c160-120 320 120 480 0M210 760c160-120 320 120 480 0" stroke="#f8fafc" stroke-width="14" fill="none" opacity=".28"/></svg>`)
  },
  {
    id: 'sunset',
    name: '日落余晖',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".4" stop-color="#fdba74"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs>
      <rect width="900" height="1400" fill="url(#sg)"/><circle cx="450" cy="420" r="120" fill="#fbbf24" opacity=".9"/>
      <path d="M0 780 180 660 360 720 540 600 720 680 900 620v780H0z" fill="#334155" opacity=".8"/></svg>`)
  },
  {
    id: 'wave',
    name: '海浪蔚蓝',
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
      <rect width="900" height="1400" fill="#0c4a6e"/>
      <path d="M0 400c150-60 300 60 450 0s300-60 450 0v100H0z" fill="#0284c7" opacity=".6"/>
      <path d="M0 520c150-60 300 60 450 0s300-60 450 0v100H0z" fill="#0369a1" opacity=".7"/>
      <path d="M0 640c150-60 300 60 450 0s300-60 450 0v100H0z" fill="#075985" opacity=".8"/>
      <path d="M0 760c150-60 300 60 450 0s300-60 450 0v640H0z" fill="#0c4a6e"/></svg>`)
  }
];

/* ------------------------------------------------------------------ */
/*  Template presets                                                   */
/* ------------------------------------------------------------------ */
const productTemplates: TemplateLayer[] = [
  {
    type: 'image',
    assetUrl: sampleAssets[0].src,
    naturalWidth: 900,
    naturalHeight: 1400,
    x: 32, y: 38, width: 366, height: 614,
    rotation: 0, scale: 1, opacity: 1, zIndex: 1
  },
  {
    type: 'text',
    text: 'WELCOME',
    x: 72, y: 540, width: 286, height: 64,
    rotation: 0, scale: 1, opacity: 1, zIndex: 2,
    fontSize: 42, fontFamily: 'Inter, Arial, sans-serif', fill: '#ffffff', fontWeight: '700'
  }
];

type AssetItem = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export function App() {
  const product = getProductById('door-curtain');
  const [history, setHistory] = useState<HistoryState>(() =>
    createHistory(createBlankProject('door-curtain', 'curtain-white'))
  );
  const project = history.present;
  const setProject = useCallback((next: DesignProject) => {
    setHistory((h: HistoryState) => pushState(h, next));
  }, []);
  const setProjectFn = useCallback((fn: (curr: DesignProject) => DesignProject) => {
    setHistory((h: HistoryState) => pushState(h, fn(h.present)));
  }, []);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [myAssets, setMyAssets] = useState<AssetItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [canvasBg, setCanvasBg] = useState<string>('#ffffff');
  const [zoom, setZoom] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeVariant = getVariant(project.productId, project.variantId);
  const activeView = product.views[0];
  const layers = [...project.views.front.layers].sort((a, b) => a.zIndex - b.zIndex);
  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const quality = getQualityStatus(project);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          setHistory((h: HistoryState) => redoHistory(h));
        } else {
          setHistory((h: HistoryState) => undoHistory(h));
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        setHistory((h: HistoryState) => redoHistory(h));
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          setProject(removeLayer(project, selectedLayerId));
          setSelectedLayerId(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedLayerId, project, setProject]);

  /* ---- actions ---- */
  const handleUndo = () => setHistory((h: HistoryState) => undoHistory(h));
  const handleRedo = () => setHistory((h: HistoryState) => redoHistory(h));

  const addImageAsset = (asset: { src: string; width: number; height: number }) => {
    const next = createImageLayer(project, asset.src, { width: asset.width, height: asset.height });
    setProject(next);
    setSelectedLayerId(next.views.front.layers.at(-1)?.id ?? null);
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const asset: AssetItem = {
          id: `upload_${Date.now()}`,
          name: file.name,
          src: String(reader.result),
          width: image.naturalWidth,
          height: image.naturalHeight
        };
        setMyAssets(prev => [asset, ...prev]);
        addImageAsset(asset);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAddText = (text: string, style?: Partial<{ fontSize: number; fontWeight: string; fill: string }>) => {
    let next = createTextLayer(project, text);
    if (style) {
      const layerId = next.views.front.layers.at(-1)?.id;
      if (layerId) {
        next = updateTextLayer(next, layerId, {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight as '400' | '700',
          fill: style.fill
        });
      }
    }
    setProject(next);
    setSelectedLayerId(next.views.front.layers.at(-1)?.id ?? null);
  };

  const handleApplyTemplate = (tmpl: TemplateLayer[]) => {
    const next = applyTemplate(project, tmpl);
    setProject(next);
    setSelectedLayerId(next.views.front.layers.at(-1)?.id ?? null);
  };

  const updateLayerGeometry = (
    layerId: string,
    geometry: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height' | 'scale' | 'rotation' | 'opacity'>>
  ) => {
    setProjectFn((curr: DesignProject) => ({
      ...curr,
      updatedAt: new Date().toISOString(),
      views: {
        front: {
          layers: curr.views.front.layers.map((l: DesignLayer) => l.id === layerId ? { ...l, ...geometry } : l)
        }
      }
    }));
  };

  const handleUpdateSelectedLayer = (updates: Partial<DesignLayer>) => {
    if (!selectedLayerId) return;
    setProjectFn((curr: DesignProject) => ({
      ...curr,
      updatedAt: new Date().toISOString(),
      views: {
        front: {
          layers: curr.views.front.layers.map((l: DesignLayer) =>
            l.id === selectedLayerId ? { ...l, ...updates } as DesignLayer : l
          )
        }
      }
    }));
  };

  const deleteSelected = () => {
    if (!selectedLayerId) return;
    setProject(removeLayer(project, selectedLayerId));
    setSelectedLayerId(null);
  };

  const handleToggleVisibility = (id: string) => {
    setProjectFn((curr: DesignProject) => ({
      ...curr,
      updatedAt: new Date().toISOString(),
      views: {
        front: {
          layers: curr.views.front.layers.map((l: DesignLayer) =>
            l.id === id ? { ...l, opacity: l.opacity > 0 ? 0 : 1 } : l
          )
        }
      }
    }));
  };

  const handleToggleLock = (_id: string) => {
    // Lock/unlock is UI-only for now, stored as draggable flag
  };

  const handleMoveUp = (id: string) => {
    setProjectFn((curr: DesignProject) => {
      const ls = [...curr.views.front.layers];
      const idx = ls.findIndex((l: DesignLayer) => l.id === id);
      if (idx < 0 || idx >= ls.length - 1) return curr;
      [ls[idx], ls[idx + 1]] = [ls[idx + 1], ls[idx]];
      return {
        ...curr,
        updatedAt: new Date().toISOString(),
        views: { front: { layers: ls.map((l: DesignLayer, i: number) => ({ ...l, zIndex: i + 1 })) } }
      };
    });
  };

  const handleMoveDown = (id: string) => {
    setProjectFn((curr: DesignProject) => {
      const ls = [...curr.views.front.layers];
      const idx = ls.findIndex((l: DesignLayer) => l.id === id);
      if (idx <= 0) return curr;
      [ls[idx], ls[idx - 1]] = [ls[idx - 1], ls[idx]];
      return {
        ...curr,
        updatedAt: new Date().toISOString(),
        views: { front: { layers: ls.map((l: DesignLayer, i: number) => ({ ...l, zIndex: i + 1 })) } }
      };
    });
  };

  const addToCart = () => {
    setCart(addCartItem(cart, project, 1, JSON.stringify(project)));
  };

  const submitOrder = () => {
    if (cart.length === 0) return;
    const order = createOrderFromCart(cart, '测试客户');
    setOrders([order, ...orders]);
    setCart([]);
    setCartOpen(false);
  };

  const downloadProductionJson = (order: Order) => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.id}-production.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSetBackground = (color: string) => {
    setCanvasBg(color);
  };

  const handleExportDesign = () => {
    const stageEl = document.querySelector('.canvas-stage canvas') as HTMLCanvasElement | null;
    if (!stageEl) return;
    const dataURL = stageEl.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `design-${project.id}.png`;
    link.click();
  };

  /* ---- render ---- */
  return (
    <main className="designer-app">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onUpload} />

      {/* ---- Top Bar ---- */}
      <header className="designer-topbar">
        <div className="topbar-left">
          <div className="logo-mark">POD</div>
          <span className="beta">BETA</span>
          <div className="divider" />
          <div className="top-product">
            <strong>{product.name}</strong>
            <span style={{ backgroundColor: activeVariant.swatch, width: 14, height: 14, borderRadius: '50%', display: 'inline-block' }} />
            {activeVariant.name}
          </div>
        </div>
        <div className="topbar-center">
          <button className="topbar-btn" onClick={handleUndo} disabled={!canUndo(history)} title="撤销 (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button className="topbar-btn" onClick={handleRedo} disabled={!canRedo(history)} title="重做 (Ctrl+Y)">
            <Redo2 size={16} />
          </button>
          <div className="divider" />
          <button className="icon-text" onClick={() => handleAddText('标题文字', { fontSize: 32, fontWeight: '700', fill: '#0f172a' })}>
            文字
          </button>
          <button className="icon-text" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> 上传
          </button>
        </div>
        <div className="topbar-right">
          <button className="icon-text" onClick={() => setPreviewOpen(true)}>
            <Eye size={14} /> 预览
          </button>
          <button className="icon-text" onClick={handleExportDesign}>
            <Download size={14} /> 导出
          </button>
          <button className="icon-text" onClick={addToCart}>
            <ShoppingCart size={14} /> 加购
          </button>
          <button className="primary-btn" onClick={() => setCartOpen(true)}>
            <ShoppingCart size={14} /> 结算 ({cart.length})
          </button>
        </div>
      </header>

      {/* ---- Body ---- */}
      <section className="designer-body">
        {/* Left Panel */}
        <LeftPanel
          sampleAssets={sampleAssets}
          myAssets={myAssets}
          onAddImageAsset={addImageAsset}
          onUploadClick={() => fileInputRef.current?.click()}
          onApplyTemplate={handleApplyTemplate}
          onAddText={handleAddText}
          backgroundColor={canvasBg}
          onSetBackground={handleSetBackground}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDeleteLayer={(id) => { setProject(removeLayer(project, id)); if (id === selectedLayerId) setSelectedLayerId(null); }}
        />

        {/* Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-wrapper" style={{ transform: `scale(${zoom})` }}>
            <Stage
              className="canvas-stage"
              width={activeView.canvas.width}
              height={activeView.canvas.height}
              onClick={(e) => {
                if (e.target === e.target.getStage()) setSelectedLayerId(null);
              }}
            >
              <Layer>
                {/* Canvas background */}
                <Rect
                  x={0} y={0}
                  width={activeView.canvas.width}
                  height={activeView.canvas.height}
                  fill={canvasBg}
                />
                {/* Print area border */}
                <Rect
                  x={activeView.printArea.x}
                  y={activeView.printArea.y}
                  width={activeView.printArea.width}
                  height={activeView.printArea.height}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  dash={[4, 4]}
                  listening={false}
                />
                {/* Render layers */}
                {layers.map(layer => (
                  <DesignLayerRender
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    onChange={(geo) => updateLayerGeometry(layer.id, geo)}
                  />
                ))}
                {/* Transformer */}
                {selectedLayerId && (
                  <TransformerWrapper
                    selectedLayerId={selectedLayerId}
                    layers={layers}
                    onChange={updateLayerGeometry}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Right Panel */}
        <aside className="right-panel">
          <PropertyPanel
            layer={selectedLayer}
            product={product}
            onUpdateLayer={handleUpdateSelectedLayer}
          />
        </aside>
      </section>

      {/* ---- Bottom Bar ---- */}
      <footer className="designer-bottombar">
        <div className="bottombar-left">
          <button className="topbar-btn" onClick={() => setZoom(z => Math.max(0.25, z - 0.1))}><ZoomOut size={14} /></button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="topbar-btn" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn size={14} /></button>
          <button className="topbar-btn" onClick={() => setZoom(1)} title="重置缩放"><RotateCcw size={14} /></button>
        </div>
        <div className="bottombar-center">
          <span>画布 {activeView.canvas.width}×{activeView.canvas.height}</span>
          <span className="divider-v" />
          <span>印刷区 {activeView.printArea.width}×{activeView.printArea.height}</span>
          <span className="divider-v" />
          <span>推荐 {activeView.recommendedPixels.width}×{activeView.recommendedPixels.height}</span>
        </div>
        <div className="bottombar-right">
          <QualityBadge quality={quality} />
        </div>
      </footer>

      {/* ---- Preview Modal ---- */}
      {previewOpen && (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>设计预览</h3>
              <button onClick={() => setPreviewOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <PreviewCanvas project={project} product={product} canvasBg={canvasBg} />
            </div>
          </div>
        </div>
      )}

      {/* ---- Cart Drawer ---- */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="modal-content cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>购物车 ({cart.length})</h3>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <div className="cart-empty">购物车是空的</div>
              ) : (
                <>
                  <div className="cart-list">
                    {cart.map((item, i) => (
                      <div key={item.id} className="cart-item">
                        <span>{item.productId} - {item.variantId}</span>
                        <span>×{item.quantity}</span>
                        <button onClick={() => setCart(cart.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <button className="primary-btn full-width" onClick={submitOrder}>提交订单</button>
                </>
              )}
              {orders.length > 0 && (
                <div className="order-history">
                  <h4>历史订单</h4>
                  {orders.map(order => (
                    <div key={order.id} className="order-item">
                      <span>{order.id.slice(0, 12)}...</span>
                      <span>{order.items.length} 件</span>
                      <button onClick={() => downloadProductionJson(order)}><Download size={14} /> JSON</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function QualityBadge({ quality }: { quality: ReturnType<typeof getQualityStatus> }) {
  const color = quality.label === '优秀' ? '#22c55e' : quality.label === '可用' ? '#f59e0b' : '#ef4444';
  return (
    <div className="quality-badge" style={{ borderColor: color }}>
      <span className="quality-dot" style={{ backgroundColor: color }} />
      <span>{quality.label}</span>
      <span className="quality-score">{quality.score}</span>
    </div>
  );
}

function TransformerWrapper({
  selectedLayerId,
  layers,
  onChange
}: {
  selectedLayerId: string;
  layers: DesignLayer[];
  onChange: (layerId: string, geo: Partial<DesignLayer>) => void;
}) {
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (!trRef.current) return;
    const stage = trRef.current.getStage();
    if (!stage) return;
    const node = stage.findOne(`#${selectedLayerId}`);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayerId, layers]);

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) return oldBox;
        return newBox;
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange(selectedLayerId, {
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * node.scaleX()),
          height: Math.max(10, node.height() * node.scaleY()),
          scale: 1,
          rotation: node.rotation()
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function DesignLayerRender({
  layer,
  isSelected,
  onSelect,
  onChange
}: {
  layer: DesignLayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (geo: Partial<DesignLayer>) => void;
}) {
  if (layer.type === 'text') {
    return (
      <KonvaText
        id={layer.id}
        text={layer.text}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily}
        fontStyle={`${layer.fontWeight} ${layer.fontStyle || 'normal'}`}
        fill={layer.fill}
        align={layer.textAlign || 'center'}
        verticalAlign="middle"
        opacity={layer.opacity}
        rotation={layer.rotation}
        scaleX={layer.scale}
        scaleY={layer.scale}
        stroke={layer.strokeColor}
        strokeWidth={layer.strokeWidth || 0}
        shadowColor={layer.shadowColor}
        shadowBlur={layer.shadowBlur || 0}
        shadowOffsetX={layer.shadowOffsetX || 0}
        shadowOffsetY={layer.shadowOffsetY || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
      />
    );
  }

  // image layer
  return (
    <ImageLayerRender
      layer={layer}
      onSelect={onSelect}
      onChange={onChange}
    />
  );
}

function ImageLayerRender({
  layer,
  onSelect,
  onChange
}: {
  layer: ImageLayer;
  onSelect: () => void;
  onChange: (geo: Partial<DesignLayer>) => void;
}) {
  const image = useImageElement(layer.assetUrl);

  if (!image) return null;

  if (layer.tileMode && layer.tileMode !== 'none') {
    return (
      <TiledImageBlock
        image={image}
        layer={layer}
        common={{
          id: layer.id,
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          opacity: layer.opacity,
          scaleX: layer.scale,
          scaleY: layer.scale,
          rotation: layer.rotation,
          draggable: true,
          onClick: onSelect,
          onTap: onSelect,
          onDragEnd: (e: any) => onChange({ x: e.target.x(), y: e.target.y() })
        }}
      />
    );
  }

  return (
    <KonvaImage
      id={layer.id}
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
    />
  );
}

function TiledImageBlock({
  image,
  layer,
  common
}: {
  image: HTMLImageElement;
  layer: ImageLayer;
  common: any;
}) {
  const tileW = layer.naturalWidth;
  const tileH = layer.naturalHeight;
  const cols = Math.ceil(layer.width / tileW);
  const rows = Math.ceil(layer.height / tileH);

  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const mirrored = layer.tileMode === 'mirror' && (row + col) % 2 === 1;
      tiles.push(
        <KonvaImage
          key={`${row}-${col}`}
          image={image}
          x={mirrored ? (col + 1) * tileW : col * tileW}
          y={row * tileH}
          width={tileW}
          height={tileH}
          scaleX={mirrored ? -1 : 1}
        />
      );
    }
  }

  return (
    <Group {...common} clipX={0} clipY={0} clipWidth={layer.width} clipHeight={layer.height}>
      {tiles}
    </Group>
  );
}

/* ---- Preview with perspective warp ---- */
function PreviewCanvas({
  project,
  product,
  canvasBg
}: {
  project: DesignProject;
  product: Product;
  canvasBg: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const view = product.views[0];
  const mockup = product.mockup;
  const layers = project.views.front.layers;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, w, h);

    // Draw layers onto an offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = view.printArea.width;
    offscreen.height = view.printArea.height;
    const offCtx = offscreen.getContext('2d')!;

    // White background for print area
    offCtx.fillStyle = '#ffffff';
    offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Render each layer
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    for (const layer of sorted) {
      offCtx.save();
      offCtx.globalAlpha = layer.opacity;
      if (layer.type === 'text') {
        offCtx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
        offCtx.fillStyle = layer.fill;
        offCtx.textAlign = (layer.textAlign || 'center') as CanvasTextAlign;
        offCtx.textBaseline = 'middle';
        if (layer.strokeColor && layer.strokeWidth) {
          offCtx.strokeStyle = layer.strokeColor;
          offCtx.lineWidth = layer.strokeWidth;
          offCtx.strokeText(layer.text, layer.x - view.printArea.x + layer.width / 2, layer.y - view.printArea.y + layer.height / 2);
        }
        offCtx.fillText(layer.text, layer.x - view.printArea.x + layer.width / 2, layer.y - view.printArea.y + layer.height / 2);
      }
      offCtx.restore();
    }

    // If warpPoints defined, use perspective transform
    if (mockup.warpPoints) {
      const { src, dst } = mockup.warpPoints;
      const srcFlat = src.flatMap(p => [p.x * view.printArea.width, p.y * view.printArea.height]);
      const dstFlat = dst.flatMap(p => [p.x, p.y]);
      const transform = new PerspectiveTransform(new Float64Array(srcFlat), new Float64Array(dstFlat));
      const mesh = WarpMesh.create(
        view.printArea.width, view.printArea.height,
        view.printArea.width, view.printArea.height,
        transform, 16, 16
      );
      mesh.render(ctx, offscreen, view.printArea.width, view.printArea.height);
    } else {
      ctx.drawImage(offscreen, view.printArea.x, view.printArea.y);
    }
  }, [project, product, canvasBg]);

  return (
    <canvas
      ref={canvasRef}
      width={view.canvas.width}
      height={view.canvas.height}
      style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}
    />
  );
}

function useImageElement(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    if (!src) { setImage(undefined); return; }
    const next = new window.Image();
    next.crossOrigin = 'anonymous';
    next.onload = () => setImage(next);
    next.src = src;
  }, [src]);
  return image;
}
