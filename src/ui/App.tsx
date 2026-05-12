import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { SceneContext } from 'konva/lib/Context';
import {
  ArrowUp,
  Download,
  Grid3X3,
  ImagePlus,
  Layers,
  PanelLeft,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  Type,
  Upload
} from 'lucide-react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText, Transformer } from 'react-konva';
import { getProductById, getVariant } from '../domain/catalog';
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
import type { CartItem, DesignLayer, DesignProject, ImageLayer, Order, Product, TemplateLayer, TextLayer } from '../domain/types';

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
        .map((_, index) => {
          const x = 90 + (index % 4) * 230;
          const y = 100 + Math.floor(index / 4) * 230;
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
  }
];

const productTemplates: TemplateLayer[] = [
  {
    type: 'image',
    assetUrl: sampleAssets[0].src,
    naturalWidth: 900,
    naturalHeight: 1400,
    x: 32,
    y: 38,
    width: 366,
    height: 614,
    rotation: 0,
    scale: 1,
    opacity: 1,
    zIndex: 1
  },
  {
    type: 'text',
    text: 'WELCOME',
    x: 72,
    y: 540,
    width: 286,
    height: 64,
    rotation: 0,
    scale: 1,
    opacity: 1,
    zIndex: 2,
    fontSize: 42,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#ffffff',
    fontWeight: '700'
  }
];

type AssetItem = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

export function App() {
  const product = getProductById('door-curtain');
  const [project, setProject] = useState<DesignProject>(() => createBlankProject('door-curtain', 'curtain-white'));
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [assetTab, setAssetTab] = useState<'templates' | 'mine' | 'favorites'>('templates');
  const [myAssets, setMyAssets] = useState<AssetItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeVariant = getVariant(project.productId, project.variantId);
  const activeView = product.views[0];
  const layers = [...project.views.front.layers].sort((a, b) => a.zIndex - b.zIndex);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const quality = getQualityStatus(project);
  const previewUrl = useMemo(() => JSON.stringify(project), [project]);

  const addImageAsset = (asset: AssetItem) => {
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
        const asset = {
          id: `upload_${Date.now()}`,
          name: file.name,
          src: String(reader.result),
          width: image.naturalWidth,
          height: image.naturalHeight
        };
        setMyAssets((current) => [asset, ...current]);
        addImageAsset(asset);
        setAssetTab('mine');
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const addText = () => {
    const next = createTextLayer(project, 'WELCOME');
    setProject(next);
    setSelectedLayerId(next.views.front.layers.at(-1)?.id ?? null);
  };

  const applyDefaultTemplate = () => {
    const next = applyTemplate(project, productTemplates);
    setProject(next);
    setSelectedLayerId(next.views.front.layers.at(-1)?.id ?? null);
  };

  const updateLayerPosition = (layerId: string, x: number, y: number) => {
    setProject((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      views: {
        ...current.views,
        front: {
          layers: current.views.front.layers.map((layer) => (layer.id === layerId ? { ...layer, x, y } : layer))
        }
      }
    }));
  };

  const updateLayerGeometry = (
    layerId: string,
    geometry: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height' | 'scale' | 'rotation'>>
  ) => {
    setProject((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      views: {
        ...current.views,
        front: {
          layers: current.views.front.layers.map((layer) => (layer.id === layerId ? { ...layer, ...geometry } : layer))
        }
      }
    }));
  };

  const deleteSelected = () => {
    if (!selectedLayerId) return;
    setProject(removeLayer(project, selectedLayerId));
    setSelectedLayerId(null);
  };

  const scaleSelected = (scale: number) => {
    if (!selectedLayerId || !selectedLayer) return;
    setProject(resizeLayer(project, selectedLayerId, selectedLayer.scale + scale));
  };

  const updateSelectedLayer = (updater: (layer: DesignLayer) => DesignLayer) => {
    if (!selectedLayerId) return;
    setProject((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      views: {
        ...current.views,
        front: {
          layers: current.views.front.layers.map((layer) => (layer.id === selectedLayerId ? updater(layer) : layer))
        }
      }
    }));
  };

  const runToolbarAction = (action: 'maximize' | 'fill' | 'tile' | 'mirror') => {
    if (!selectedLayer) return;
    if (action === 'maximize') {
      updateSelectedLayer((layer) => {
        const next = fitLayerToArea(layer, activeView.printArea, 'cover');
        return next.type === 'image' ? { ...next, tileMode: 'none' } : next;
      });
    }
    if (action === 'fill') {
      updateSelectedLayer((layer) => {
        const next = fitLayerToArea(layer, activeView.printArea, 'stretch');
        return next.type === 'image' ? { ...next, tileMode: 'none' } : next;
      });
    }
    if (action === 'tile' && selectedLayer.type === 'image') {
      updateSelectedLayer((layer) => (layer.type === 'image' ? fitLayerToArea(setLayerTileMode(layer, 'basic'), activeView.printArea, 'stretch') : layer));
    }
    if (action === 'mirror' && selectedLayer.type === 'image') {
      updateSelectedLayer((layer) => (layer.type === 'image' ? fitLayerToArea(setLayerTileMode(layer, 'mirror'), activeView.printArea, 'stretch') : layer));
    }
  };

  const addToCart = () => {
    setCart(addCartItem(cart, project, 1, previewUrl));
  };

  const submitOrder = () => {
    if (cart.length === 0) return;
    const order = createOrderFromCart(cart, '测试客户');
    setOrders([order, ...orders]);
    setCart([]);
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

  const visibleAssets = assetTab === 'mine' ? myAssets : sampleAssets.map((asset) => ({ ...asset, width: 900, height: 1400 }));

  return (
    <main className="designer-app">
      <header className="designer-topbar">
        <div className="logo-mark">Hi</div>
        <span className="beta">BETA</span>
        <div className="divider" />
        <button className="icon-text" onClick={addText}>
          <Type size={16} />
          添加文字
        </button>
        <button className="icon-text" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} />
          上传图片
        </button>
        <div className="top-product">
          <img src="/assets/door-curtain-base.png" alt="" />
          <strong>门帘34x56in（两片拼接）</strong>
          <span style={{ backgroundColor: activeVariant.swatch }} />
          {activeVariant.name}
        </div>
        <button className="soft-button">去结算</button>
        <button className="soft-button" onClick={addToCart}>加入购物车</button>
        <button className="save-button"><Save size={15} />保存</button>
      </header>

      <section className="designer-workspace">
        <aside className="rail">
          <RailItem active icon={<ImagePlus size={22} />} label="图库" />
          <RailItem icon={<Sparkles size={22} />} label="AI作图" badge="NEW" />
          <RailItem icon={<Grid3X3 size={22} />} label="背景" />
          <div className="rail-spacer" />
          <RailItem icon={<Settings size={22} />} label="" />
        </aside>

        <aside className="asset-panel">
          <div className="asset-tabs">
            <button className={assetTab === 'templates' ? 'active' : ''} onClick={() => setAssetTab('templates')}>素材模板</button>
            <button className={assetTab === 'mine' ? 'active' : ''} onClick={() => setAssetTab('mine')}>我的图片</button>
            <button className={assetTab === 'favorites' ? 'active' : ''} onClick={() => setAssetTab('favorites')}>收藏图片</button>
          </div>
          <div className="search-row">
            <input placeholder="图片名称/编号/标签" />
            <button>分类</button>
          </div>
          <div className="sort-row">
            <button>综合排序</button>
            <button>上新时间</button>
            <PanelLeft size={16} />
          </div>
          <div className="material-grid">
            {visibleAssets.length === 0 ? (
              <div className="empty-material">上传图片后会显示在这里。</div>
            ) : (
              visibleAssets.map((asset) => (
                <button key={asset.id} className="material-card" onClick={() => addImageAsset(asset)}>
                  <img src={asset.src} alt={asset.name} />
                </button>
              ))
            )}
          </div>
          <button className="upload-strip" onClick={() => fileInputRef.current?.click()}>+ 上传本地图片</button>
          <button className="upload-strip" onClick={applyDefaultTemplate}>应用整套模板</button>
          <input ref={fileInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg" onChange={onUpload} />
        </aside>

        <section className="editor-stage">
          <div className="side-view-chip">A面</div>
          <div className="editor-toolbar">
            <button onClick={() => runToolbarAction('maximize')} disabled={!selectedLayerId}>最大化</button>
            <button onClick={() => runToolbarAction('fill')} disabled={!selectedLayerId}>铺满</button>
            <button onClick={() => runToolbarAction('tile')} disabled={selectedLayer?.type !== 'image'}>基础平铺</button>
            <button onClick={() => runToolbarAction('mirror')} disabled={selectedLayer?.type !== 'image'}>镜像平铺</button>
            <button onClick={() => setShowMoreActions((value) => !value)}>更多</button>
            {showMoreActions ? (
              <div className="more-menu">
                <button onClick={addText}>添加文字</button>
                <button onClick={deleteSelected} disabled={!selectedLayerId}>删除图层</button>
                <button onClick={() => fileInputRef.current?.click()}>上传替换</button>
              </div>
            ) : null}
          </div>
          <KonvaEditor
            product={product}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelect={setSelectedLayerId}
            onMove={updateLayerPosition}
            onTransform={updateLayerGeometry}
          />
          <div className="editor-bottom">
            <div className={`print-quality ${quality.label === '偏低' ? 'bad' : ''}`}>
              <strong>{quality.label}</strong>
              当前印刷质量
            </div>
            <span>推荐图片素材尺寸：{activeView.recommendedPixels.width}*{activeView.recommendedPixels.height}px</span>
            <div className="zoom-controls">
              <button onClick={() => scaleSelected(-0.1)} disabled={!selectedLayerId}>-</button>
              <button onClick={() => scaleSelected(0.1)} disabled={!selectedLayerId}>+</button>
              <button onClick={deleteSelected} disabled={!selectedLayerId}><Trash2 size={15} /></button>
            </div>
          </div>
          <LayerInspector
            layer={selectedLayer}
            onScaleUp={() => scaleSelected(0.1)}
            onScaleDown={() => scaleSelected(-0.1)}
            onTextChange={(updates) => selectedLayerId && setProject(updateTextLayer(project, selectedLayerId, updates))}
          />
        </section>

        <aside className="effect-panel">
          <div className="preview-switch">
            <span className="toggle-dot" />
            全部实时渲染
            <div className="mode-pill"><span>3D</span><b>2D</b></div>
          </div>
          <button className="effect-preview-button" onClick={() => setPreviewOpen(true)} aria-label="预览效果图">
            <ProductPreview product={product} layers={layers} />
          </button>
          <div className="effect-thumbs">
            <button className="active" onClick={() => setPreviewOpen(true)}><img src="/assets/door-curtain-base.png" alt="" /><span>效果图1</span></button>
            {sampleAssets.slice(0, 3).map((asset) => (
              <button key={asset.id}><img src={asset.src} alt="" /></button>
            ))}
            <button className="custom-board">自定义底板</button>
          </div>
          <div className="cart-box compact">
            {cart.length === 0 ? <p>购物车为空，完成设计后加入购物车。</p> : <p>购物车：{cart.length} 件</p>}
            <button className="save-button full" onClick={submitOrder} disabled={cart.length === 0}>提交订单</button>
          </div>
          {orders.map((order) => (
            <button key={order.id} className="download-order" onClick={() => downloadProductionJson(order)}>
              <Download size={15} /> 下载生产文件
            </button>
          ))}
        </aside>
      </section>
      {previewOpen ? (
        <div className="preview-modal-backdrop" onMouseDown={() => setPreviewOpen(false)}>
          <section className="preview-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="效果图预览">
            <button className="preview-modal-close" onClick={() => setPreviewOpen(false)} aria-label="关闭预览">×</button>
            <ProductPreview product={product} layers={layers} />
          </section>
        </div>
      ) : null}
    </main>
  );
}

function RailItem({ icon, label, active, badge }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return (
    <button className={active ? 'rail-item active' : 'rail-item'}>
      <span>{icon}</span>
      {badge ? <em>{badge}</em> : null}
      {label}
    </button>
  );
}

function KonvaEditor({
  product,
  layers,
  selectedLayerId,
  onSelect,
  onMove,
  onTransform
}: {
  product: Product;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  onSelect: (layerId: string | null) => void;
  onMove: (layerId: string, x: number, y: number) => void;
  onTransform: (
    layerId: string,
    geometry: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height' | 'scale' | 'rotation'>>
  ) => void;
}) {
  const view = product.views[0];
  return (
    <div className="print-canvas">
      <Stage width={view.canvas.width} height={view.canvas.height} onMouseDown={(event) => event.target === event.target.getStage() && onSelect(null)}>
        <Layer>
          <Rect width={view.canvas.width} height={view.canvas.height} fill="#ffffff" shadowBlur={18} shadowColor="rgba(15,23,42,.12)" />
          <Rect x={view.printArea.x} y={view.printArea.y} width={view.printArea.width} height={view.printArea.height} stroke="#b6c0cf" dash={[4, 4]} />
          {layers.map((layer) => (
            <EditableLayer
              key={layer.id}
              layer={layer}
              selected={layer.id === selectedLayerId}
              onSelect={() => onSelect(layer.id)}
              onMove={(x, y) => onMove(layer.id, x, y)}
              onTransform={(geometry) => onTransform(layer.id, geometry)}
            />
          ))}
          {layers.length === 0 ? <UploadPlaceholder x={view.printArea.x} y={view.printArea.y} width={view.printArea.width} height={view.printArea.height} /> : null}
        </Layer>
      </Stage>
    </div>
  );
}

function ProductPreview({ product, layers }: { product: Product; layers: DesignLayer[] }) {
  const view = product.views[0];
  const baseImage = useImageElement(product.mockup.baseImage);
  const textureImage = useImageElement(product.mockup.textureImage);
  const textureArea = product.mockup.textureArea ?? view.printArea;
  const texturePolygon = product.mockup.texturePolygon;
  const textureBlendMode = product.mockup.textureBlendMode ?? 'source-over';
  const textureOpacity = product.mockup.textureOpacity ?? 0.38;
  const scaleX = textureArea.width / view.printArea.width;
  const scaleY = textureArea.height / view.printArea.height;
  const clipFunc = (context: SceneContext) => {
    if (texturePolygon && texturePolygon.length >= 3) {
      context.beginPath();
      context.moveTo(texturePolygon[0].x, texturePolygon[0].y);
      for (const point of texturePolygon.slice(1)) {
        context.lineTo(point.x, point.y);
      }
      context.closePath();
      return;
    }
    context.rect(textureArea.x, textureArea.y, textureArea.width, textureArea.height);
  };

  return (
    <div className="effect-canvas">
      <Stage width={500} height={500}>
        <Layer>
          <Rect width={500} height={500} fill="#f1f5f9" />
          {baseImage ? <KonvaImage image={baseImage} width={500} height={500} listening={false} /> : null}
          <Group clipFunc={clipFunc} listening={false}>
            {layers.map((layer) => (
              <MappedPreviewLayer
                key={layer.id}
                layer={layer}
                originX={view.printArea.x}
                originY={view.printArea.y}
                targetX={textureArea.x}
                targetY={textureArea.y}
                scaleX={scaleX}
                scaleY={scaleY}
              />
            ))}
            {textureImage ? (
              <KonvaImage
                image={textureImage}
                width={500}
                height={500}
                opacity={textureOpacity}
                globalCompositeOperation={textureBlendMode}
                listening={false}
              />
            ) : null}
            <Rect
              x={textureArea.x}
              y={textureArea.y}
              width={textureArea.width}
              height={textureArea.height}
              fillLinearGradientStartPoint={{ x: textureArea.x, y: textureArea.y }}
              fillLinearGradientEndPoint={{ x: textureArea.x + textureArea.width, y: textureArea.y }}
              fillLinearGradientColorStops={[0, 'rgba(0,0,0,.3)', 0.22, 'rgba(255,255,255,.2)', 0.52, 'rgba(0,0,0,.16)', 0.75, 'rgba(255,255,255,.2)', 1, 'rgba(0,0,0,.28)']}
              opacity={textureImage ? 0.04 : 0.18}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

function EditableLayer({
  layer,
  selected,
  onSelect,
  onMove,
  onTransform
}: {
  layer: DesignLayer;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onTransform: (geometry: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height' | 'scale' | 'rotation'>>) => void;
}) {
  const image = useImageElement(layer.type === 'image' ? layer.assetUrl : undefined);
  const nodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (!selected || !nodeRef.current || !transformerRef.current) return;
    transformerRef.current.nodes([nodeRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [image, selected]);

  const commitTransform = () => {
    const node = nodeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const nextWidth = Math.max(24, node.width() * scaleX);
    const nextHeight = Math.max(24, node.height() * scaleY);
    node.scaleX(1);
    node.scaleY(1);
    onTransform({
      x: node.x(),
      y: node.y(),
      width: nextWidth,
      height: nextHeight,
      scale: 1,
      rotation: node.rotation()
    });
  };

  const common = {
    ref: nodeRef,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    scaleX: layer.scale,
    scaleY: layer.scale,
    opacity: layer.opacity,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (event: any) => onMove(event.target.x(), event.target.y()),
    onTransformEnd: commitTransform
  };
  return (
    <>
      {layer.type === 'image' && image && layer.tileMode && layer.tileMode !== 'none' ? (
        <TiledImageBlock image={image} layer={layer} common={common} />
      ) : null}
      {layer.type === 'image' && image && (!layer.tileMode || layer.tileMode === 'none') ? <KonvaImage image={image} {...common} /> : null}
      {layer.type === 'text' ? <KonvaText {...common} text={layer.text} fontSize={layer.fontSize} fontFamily={layer.fontFamily} fontStyle={layer.fontWeight === '700' ? 'bold' : 'normal'} fill={layer.fill} align="center" verticalAlign="middle" /> : null}
      {selected ? (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
          anchorSize={15}
          anchorCornerRadius={5}
          anchorStrokeWidth={2}
          borderStrokeWidth={2}
          borderStroke="#0b5cff"
          anchorFill="#ffffff"
          anchorStroke="#0b5cff"
          shouldOverdrawWholeArea
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 24 || newBox.height < 24) return oldBox;
            return newBox;
          }}
        />
      ) : null}
    </>
  );
}

function TiledImageBlock({
  image,
  layer,
  common
}: {
  image: HTMLImageElement;
  layer: ImageLayer;
  common: Record<string, unknown>;
}) {
  const tileWidth = Math.max(64, layer.width / 2);
  const tileHeight = Math.max(64, layer.height / 2);
  const cols = Math.ceil(layer.width / tileWidth) + 1;
  const rows = Math.ceil(layer.height / tileHeight) + 1;
  const tiles = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const mirrored = layer.tileMode === 'mirror' && (row + col) % 2 === 1;
      tiles.push(
        <KonvaImage
          key={`${row}-${col}`}
          image={image}
          x={mirrored ? (col + 1) * tileWidth : col * tileWidth}
          y={row * tileHeight}
          width={tileWidth}
          height={tileHeight}
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

function MappedPreviewLayer({
  layer,
  originX,
  originY,
  targetX,
  targetY,
  scaleX,
  scaleY
}: {
  layer: DesignLayer;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  scaleX: number;
  scaleY: number;
}) {
  const image = useImageElement(layer.type === 'image' ? layer.assetUrl : undefined);
  const x = targetX + (layer.x - originX) * scaleX;
  const y = targetY + (layer.y - originY) * scaleY;
  const width = layer.width * scaleX;
  const height = layer.height * scaleY;
  if (layer.type === 'image' && image && layer.tileMode && layer.tileMode !== 'none') {
    return (
      <TiledImageBlock
        image={image}
        layer={{ ...layer, x, y, width, height }}
        common={{
          x,
          y,
          width,
          height,
          opacity: layer.opacity,
          scaleX: layer.scale,
          scaleY: layer.scale,
          rotation: layer.rotation,
          listening: false
        }}
      />
    );
  }
  if (layer.type === 'image' && image) {
    return <KonvaImage image={image} x={x} y={y} width={width} height={height} opacity={layer.opacity} scaleX={layer.scale} scaleY={layer.scale} rotation={layer.rotation} />;
  }
  if (layer.type === 'text') {
    return <KonvaText x={x} y={y} width={width} height={height} text={layer.text} fontSize={Math.max(8, layer.fontSize * scaleY)} fontFamily={layer.fontFamily} fontStyle={layer.fontWeight === '700' ? 'bold' : 'normal'} fill={layer.fill} align="center" verticalAlign="middle" opacity={layer.opacity} scaleX={layer.scale} scaleY={layer.scale} />;
  }
  return null;
}

function UploadPlaceholder({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return (
    <Group x={x} y={y} listening={false}>
      <KonvaText y={height / 2 - 36} width={width} height={34} text="☁" fontSize={38} fill="#475569" align="center" />
      <KonvaText y={height / 2 + 4} width={width} height={28} text="将本地图片拖到此处" fontSize={15} fill="#334155" align="center" />
      <KonvaText y={height / 2 + 38} width={width} height={22} text="仅支持 30M 以内 JPG、JPEG、PNG 格式的图片" fontSize={12} fill="#94a3b8" align="center" />
    </Group>
  );
}

function LayerInspector({ layer, onScaleUp, onScaleDown, onTextChange }: { layer?: DesignLayer; onScaleUp: () => void; onScaleDown: () => void; onTextChange: (updates: Partial<Pick<TextLayer, 'text' | 'fill' | 'fontSize' | 'fontWeight'>>) => void }) {
  if (!layer) return null;
  return (
    <div className="floating-inspector">
      <strong>{layer.type === 'text' ? '文字图层' : '图片图层'}</strong>
      <button onClick={onScaleDown}>缩小</button>
      <span>{Math.round(layer.scale * 100)}%</span>
      <button onClick={onScaleUp}>放大</button>
      {layer.type === 'text' ? (
        <>
          <input value={layer.text} onChange={(event) => onTextChange({ text: event.target.value })} />
          <input type="color" value={layer.fill} onChange={(event) => onTextChange({ fill: event.target.value })} />
        </>
      ) : null}
    </div>
  );
}

function useImageElement(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    if (!src) {
      setImage(undefined);
      return;
    }
    const next = new window.Image();
    next.crossOrigin = 'anonymous';
    next.onload = () => setImage(next);
    next.src = src;
  }, [src]);
  return image;
}
