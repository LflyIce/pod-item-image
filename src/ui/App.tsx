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
  SlidersHorizontal,
  Trash2,
  Type,
  Upload
} from 'lucide-react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText, Transformer } from 'react-konva';
import { getProductById, getVariant } from '../domain/catalog';
import { createBezierSurfaceMesh } from '../domain/bezierSurface';
import { normalOffset } from '../domain/normalDisplacement';
import { PerspectiveTransform } from '../domain/perspectiveTransform';
import { DEMO_POD_TEMPLATES, getDemoPodTemplate, podTemplateAssetPath, podTemplateScenePath, type PodFace } from '../domain/podTemplate';
import { applyHighlightOverlay, getPreviewRenderMode, getPreviewSurfacePath, shadeDesignPixel, shouldRenderSurfaceEffects } from '../domain/previewCompositing';
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
import { applyMockupTemplate, createMockupTemplate, type MockupTemplate } from '../domain/mockupTemplate';
import { addCartItem, createOrderFromCart } from '../domain/order';
import type { CartItem, DesignLayer, DesignProject, ImageLayer, Order, Point, Product, TemplateLayer, TextLayer } from '../domain/types';

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
  },
  {
    id: 'pod-demo-0001',
    name: 'POD示例 0001',
    src: podTemplateAssetPath('images', '0001.jpg')
  },
  {
    id: 'pod-demo-0002',
    name: 'POD示例 0002',
    src: podTemplateAssetPath('images', '0002.jpg')
  },
  {
    id: 'pod-demo-0003',
    name: 'POD示例 0003',
    src: podTemplateAssetPath('images', '0003.jpg')
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
  const baseProduct = getProductById('door-curtain');
  const [activeScreen, setActiveScreen] = useState<'designer' | 'template-manager'>('designer');
  const [mockupTemplates, setMockupTemplates] = useState<MockupTemplate[]>([]);
  const [activeMockupTemplateId, setActiveMockupTemplateId] = useState<string | null>(null);
  const [activePodTemplateId, setActivePodTemplateId] = useState<string | null>('0001');
  const [activePodSceneId, setActivePodSceneId] = useState<string>('01');
  const [project, setProject] = useState<DesignProject>(() => createBlankProject('door-curtain', 'curtain-white'));
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [assetTab, setAssetTab] = useState<'templates' | 'mine' | 'favorites'>('templates');
  const [myAssets, setMyAssets] = useState<AssetItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const product = useMemo(() => {
    const activeTemplate = mockupTemplates.find((template) => template.id === activeMockupTemplateId);
    const mockupProduct = activeTemplate ? applyMockupTemplate(baseProduct, activeTemplate) : baseProduct;
    if (!activePodTemplateId) return mockupProduct;
    return {
      ...mockupProduct,
      mockup: {
        ...mockupProduct.mockup,
        podTemplate: {
          templateId: activePodTemplateId,
          sceneId: activePodSceneId
        }
      }
    };
  }, [activeMockupTemplateId, activePodSceneId, activePodTemplateId, baseProduct, mockupTemplates]);

  const activeVariant = getVariant(project.productId, project.variantId);
  const activeView = product.views[0];
  const layers = [...project.views.front.layers].sort((a, b) => a.zIndex - b.zIndex);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const quality = getQualityStatus(project);
  const previewUrl = useMemo(() => JSON.stringify(project), [project]);
  const activePodTemplate = activePodTemplateId ? getDemoPodTemplate(activePodTemplateId) : undefined;

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

  const updateMockupTemplate = (templateId: string, updates: Partial<Pick<MockupTemplate, 'name' | 'surface'>>) => {
    setMockupTemplates((current) =>
      current.map((template) => (template.id === templateId ? { ...template, ...updates } : template))
    );
  };

  if (activeScreen === 'template-manager') {
    return (
      <TemplateManager
        templates={mockupTemplates}
        activeTemplateId={activeMockupTemplateId}
        onBack={() => setActiveScreen('designer')}
        onCreateTemplate={(template) => {
          setMockupTemplates((current) => [template, ...current]);
          setActiveMockupTemplateId(template.id);
        }}
        onSelectTemplate={setActiveMockupTemplateId}
        onUpdateTemplate={updateMockupTemplate}
        onApplyTemplate={(templateId) => {
          setActiveMockupTemplateId(templateId);
          setActiveScreen('designer');
        }}
      />
    );
  }

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
        <button className="icon-text" onClick={() => setActiveScreen('template-manager')}>
          <SlidersHorizontal size={16} />
          模板管理
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
          <div className="pod-template-picker">
            <button
              className={!activePodTemplateId ? 'active' : ''}
              onClick={() => setActivePodTemplateId(null)}
            >
              默认
            </button>
            {DEMO_POD_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className={activePodTemplateId === template.id ? 'active' : ''}
                onClick={() => {
                  setActivePodTemplateId(template.id);
                  setActivePodSceneId(template.scenes[0]?.id ?? '01');
                }}
              >
                {template.id}
              </button>
            ))}
          </div>
          {activePodTemplate ? (
            <div className="pod-scene-picker">
              {activePodTemplate.scenes.map((scene) => (
                <button
                  key={scene.id}
                  className={activePodSceneId === scene.id ? 'active' : ''}
                  onClick={() => setActivePodSceneId(scene.id)}
                >
                  {scene.id}
                </button>
              ))}
            </div>
          ) : null}
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

function TemplateManager({
  templates,
  activeTemplateId,
  onBack,
  onCreateTemplate,
  onSelectTemplate,
  onUpdateTemplate,
  onApplyTemplate
}: {
  templates: MockupTemplate[];
  activeTemplateId: string | null;
  onBack: () => void;
  onCreateTemplate: (template: MockupTemplate) => void;
  onSelectTemplate: (templateId: string | null) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<Pick<MockupTemplate, 'name' | 'surface'>>) => void;
  onApplyTemplate: (templateId: string) => void;
}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [dragPoint, setDragPoint] = useState<number | null>(null);
  const activeTemplate = templates.find((template) => template.id === activeTemplateId);

  const onUploadTemplate = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCreateTemplate(createMockupTemplate(file.name, String(reader.result)));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const updatePointFromPointer = (event: React.PointerEvent<SVGSVGElement>, pointIndex: number) => {
    if (!activeTemplate) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(500, ((event.clientX - rect.left) / rect.width) * 500));
    const y = Math.max(0, Math.min(500, ((event.clientY - rect.top) / rect.height) * 500));
    const surface = activeTemplate.surface.map((point, index) => (index === pointIndex ? { x: Math.round(x), y: Math.round(y) } : point));
    onUpdateTemplate(activeTemplate.id, { surface });
  };

  const resetSurface = () => {
    if (!activeTemplate) return;
    onUpdateTemplate(activeTemplate.id, {
      surface: [
        { x: 154, y: 147 },
        { x: 310, y: 143 },
        { x: 310, y: 402 },
        { x: 156, y: 400 }
      ]
    });
  };

  return (
    <main className="template-manager-app">
      <header className="template-manager-header">
        <div>
          <strong>模板管理</strong>
          <span>上传效果图模板，并手动标记固定贴图区域</span>
        </div>
        <div className="template-manager-actions">
          <button className="soft-button" onClick={() => uploadRef.current?.click()}>
            <Upload size={16} />
            上传模板图
          </button>
          <button className="save-button" onClick={onBack}>返回设计器</button>
        </div>
        <input ref={uploadRef} className="hidden-input" type="file" accept="image/png,image/jpeg" onChange={onUploadTemplate} />
      </header>

      <section className="template-manager-layout">
        <aside className="template-list-panel">
          <button className={!activeTemplateId ? 'template-list-item active' : 'template-list-item'} onClick={() => onSelectTemplate(null)}>
            <strong>默认门帘模板</strong>
            <span>使用内置样机参数</span>
          </button>
          {templates.map((template) => (
            <button
              key={template.id}
              className={template.id === activeTemplate?.id ? 'template-list-item active' : 'template-list-item'}
              onClick={() => onSelectTemplate(template.id)}
            >
              <strong>{template.name}</strong>
              <span>{new Date(template.createdAt).toLocaleString()}</span>
            </button>
          ))}
        </aside>

        <section className="template-editor-panel">
          {activeTemplate ? (
            <>
              <div className="template-editor-toolbar">
                <input
                  value={activeTemplate.name}
                  onChange={(event) => onUpdateTemplate(activeTemplate.id, { name: event.target.value })}
                  aria-label="模板名称"
                />
                <button className="soft-button" onClick={resetSurface}>重置区域</button>
                <button className="save-button" onClick={() => onApplyTemplate(activeTemplate.id)}>应用到设计器</button>
              </div>
              <div className="surface-editor">
                <img src={activeTemplate.baseImage} alt="" />
                <svg
                  viewBox="0 0 500 500"
                  onPointerMove={(event) => dragPoint !== null && updatePointFromPointer(event, dragPoint)}
                  onPointerUp={() => setDragPoint(null)}
                  onPointerLeave={() => setDragPoint(null)}
                >
                  <polygon points={activeTemplate.surface.map((point) => `${point.x},${point.y}`).join(' ')} />
                  {activeTemplate.surface.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="8"
                        onPointerDown={(event) => {
                          event.currentTarget.setPointerCapture(event.pointerId);
                          setDragPoint(index);
                        }}
                      />
                      <text x={point.x + 12} y={point.y - 10}>{index + 1}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="surface-hint">
                拖动四个蓝色点标记贴图区域。素材会被限制在这个区域内，再按该区域透视到效果图里。
              </div>
            </>
          ) : (
            <div className="template-empty-state">
              <strong>选择或上传自定义模板</strong>
              <span>上传一张商品效果图模板后，就可以手动标记固定贴图区域。</span>
              <button className="save-button" onClick={() => uploadRef.current?.click()}>上传模板图</button>
            </div>
          )}
        </section>
      </section>
    </main>
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

          <Group
            clipX={view.printArea.x}
            clipY={view.printArea.y}
            clipWidth={view.printArea.width}
            clipHeight={view.printArea.height}
          >
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
          </Group>
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
  const maskImage = useImageElement(product.mockup.maskImage);
  const highlightImage = useImageElement(product.mockup.highlightImage);
  const normalImage = useImageElement(product.mockup.normalImage);
  const textureArea = product.mockup.textureArea ?? view.printArea;
  const texturePolygon = product.mockup.texturePolygon;
  const previewSurfacePath = useMemo(() => getPreviewSurfacePath(product), [product]);
  const textureBlendMode = product.mockup.textureBlendMode ?? 'source-over';
  const textureOpacity = product.mockup.textureOpacity ?? 0.38;
  const highlightOpacity = product.mockup.highlightOpacity ?? 0.28;
  const normalStrength = product.mockup.normalStrength ?? 0.16;
  const warpPoints = product.mockup.warpPoints;
  const renderMode = getPreviewRenderMode(product);
  const renderSurfaceEffects = shouldRenderSurfaceEffects(layers);
  const podTemplate = product.mockup.podTemplate ? getDemoPodTemplate(product.mockup.podTemplate.templateId) : undefined;
  const podScene = podTemplate?.scenes.find((scene) => scene.id === product.mockup.podTemplate?.sceneId) ?? podTemplate?.scenes[0];
  const podBaseImage = useImageElement(podTemplate && podScene ? podTemplateScenePath(podTemplate.id, `${podScene.id}.jpg`) : undefined);
  const podEffectImage = useImageElement(
    podTemplate && podScene?.effect ? podTemplateScenePath(podTemplate.id, `${podScene.id}.png`) : undefined
  );
  const podMaskSrcs = useMemo(
    () => (podTemplate && podScene ? podScene.faces.map((face) => podTemplateScenePath(podTemplate.id, face.mask)) : []),
    [podScene, podTemplate]
  );
  const { images: podMaskImages, loadCount: podMaskLoadCount } = useImageElements(podMaskSrcs);

  const layersJson = useMemo(() => JSON.stringify(layers.map(l => ({
    id: l.id, type: l.type, x: l.x, y: l.y, width: l.width, height: l.height,
    rotation: l.rotation, scale: l.scale, opacity: l.opacity, zIndex: l.zIndex,
    assetUrl: l.type === 'image' ? l.assetUrl : undefined,
    tileMode: l.type === 'image' ? l.tileMode : undefined,
    text: l.type === 'text' ? l.text : undefined,
    fontSize: l.type === 'text' ? l.fontSize : undefined,
    fontFamily: l.type === 'text' ? l.fontFamily : undefined,
    fill: l.type === 'text' ? l.fill : undefined,
    fontWeight: l.type === 'text' ? l.fontWeight : undefined,
  }))), [layers]);

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const previewImage = useImageElement(previewDataUrl || undefined);

  const [loadCount, setLoadCount] = useState(0);
  const loadedImages = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageLayers = layers.filter((l): l is ImageLayer => l.type === 'image');

  useEffect(() => {
    let changed = false;
    const currentIds = new Set(imageLayers.map(l => l.id));
    for (const key of loadedImages.current.keys()) {
      if (!currentIds.has(key)) { loadedImages.current.delete(key); changed = true; }
    }
    for (const layer of imageLayers) {
      if (!loadedImages.current.has(layer.id) || loadedImages.current.get(layer.id)!.src !== layer.assetUrl) {
        changed = true;
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { setLoadCount(c => c + 1); };
        img.src = layer.assetUrl;
        loadedImages.current.set(layer.id, img);
      }
    }
    if (changed) setLoadCount(c => c + 1);
  }, [imageLayers.map(l => l.id).join(','), imageLayers.map(l => l.assetUrl).join(',')]);

  const allImagesReady = imageLayers.every(l => {
    const img = loadedImages.current.get(l.id);
    return img && img.complete && img.naturalWidth > 0;
  });
  const podImagesReady =
    renderMode !== 'pod-template-2d' ||
    Boolean(
      podTemplate &&
        podScene &&
        podBaseImage &&
        (!podScene.effect || podEffectImage) &&
        podMaskSrcs.every((src) => {
          const image = podMaskImages.get(src);
          return image && image.complete && image.naturalWidth > 0;
        })
    );

  // ===== Rendering Pipeline: layered design surface + mask + lighting fusion =====
  useEffect(() => {
    if (!allImagesReady && imageLayers.length > 0) return;
    if (renderMode !== 'layered-2d' && renderMode !== 'perspective-2d' && renderMode !== 'pod-template-2d') return;
    if (renderMode !== 'pod-template-2d' && !baseImage && product.mockup.baseImage) return;
    if (renderMode === 'pod-template-2d' && !podImagesReady) return;

    const PVW = 500;
    const PVH = 500;
    const srcW = view.printArea.width;
    const srcH = view.printArea.height;

    if (renderMode === 'pod-template-2d' && podTemplate && podScene && podBaseImage) {
      const designCanvas = renderDesignLayersToCanvas(layers, loadedImages.current, view.printArea, podTemplate.width, podTemplate.height);
      const canvas = document.createElement('canvas');
      canvas.width = PVW;
      canvas.height = PVH;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, PVW, PVH);
      ctx.drawImage(podBaseImage, 0, 0, PVW, PVH);

      for (const face of podScene.faces) {
        const faceCanvas = cropDesignFace(designCanvas, face);
        const warpedCanvas = document.createElement('canvas');
        warpedCanvas.width = PVW;
        warpedCanvas.height = PVH;
        const warpedContext = warpedCanvas.getContext('2d')!;
        renderBezierSurface(warpedContext, faceCanvas, face.ctrlPos, PVW, PVH);
        const mask = podMaskImages.get(podTemplateScenePath(podTemplate.id, face.mask));
        if (mask) {
          applyAlphaMask(warpedContext, mask, PVW, PVH);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(warpedCanvas, 0, 0);
        ctx.restore();
      }

      if (podEffectImage) {
        ctx.drawImage(podEffectImage, 0, 0, PVW, PVH);
      }

      setPreviewDataUrl(canvas.toDataURL());
      return;
    }

    // Step 1: Render design layers to offscreen canvas
    const designCanvas = renderDesignLayersToCanvas(layers, loadedImages.current, view.printArea, srcW, srcH);

    // Step 2: Hicustom-style layered preview: one full design image clipped into the product surface.
    const surfaceCanvas = document.createElement('canvas');
    surfaceCanvas.width = PVW;
    surfaceCanvas.height = PVH;
    const surfaceContext = surfaceCanvas.getContext('2d')!;

    if (renderMode === 'perspective-2d' && warpPoints?.dst.length === 4) {
      renderPerspectiveSurface(surfaceContext, designCanvas, srcW, srcH, warpPoints.dst);
    } else {
      surfaceContext.save();
      clipToPreviewSurface(surfaceContext, previewSurfacePath);
      surfaceContext.drawImage(designCanvas, textureArea.x, textureArea.y, textureArea.width, textureArea.height);
      surfaceContext.restore();
    }

    if (maskImage) {
      applyPanelMask(surfaceContext, maskImage, PVW, PVH, 1.5);
    }

    featherSurfaceEdges(surfaceContext, PVW, PVH, 1);

    // Step 3: Normal displacement for subtle depth
    if (renderSurfaceEffects && normalImage) {
      applyNormalDisplacement(surfaceContext, normalImage, PVW, PVH, normalStrength);
    }

    // Fallback: when no dedicated shadow/highlight assets, use base image lighting
    if (baseImage && !highlightImage && !textureImage) {
      applyBaseImageLighting(surfaceContext, baseImage, PVW, PVH);
    }

    // Step 5: Composite everything onto final canvas
    const canvas = document.createElement('canvas');
    canvas.width = PVW;
    canvas.height = PVH;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, PVW, PVH);

    // Base product image (frame + empty curtain)
    if (baseImage) {
      ctx.drawImage(baseImage, 0, 0, PVW, PVH);
    }

    // Overlay the blended design surface
    ctx.drawImage(surfaceCanvas, 0, 0);

    // Step 6: Highlight overlay (screen blend) for specular light on the design
    if (renderSurfaceEffects && highlightImage) {
      applyHighlightOverlay(ctx, highlightImage, previewSurfacePath, PVW, PVH, highlightOpacity);
    }

    // Cloth texture overlay
    if (renderSurfaceEffects && textureImage) {
      ctx.save();
      clipToPreviewSurface(ctx, previewSurfacePath);
      ctx.globalAlpha = textureOpacity;
      ctx.globalCompositeOperation = textureBlendMode;
      ctx.drawImage(textureImage, 0, 0, PVW, PVH);
      ctx.restore();
    }

    setPreviewDataUrl(canvas.toDataURL());
  }, [
    layersJson, loadCount, baseImage, textureImage, maskImage, highlightImage, normalImage,
    podBaseImage, podEffectImage, podImagesReady, podMaskImages, podMaskLoadCount, podScene, podTemplate,
    textureBlendMode, textureOpacity, highlightOpacity, normalStrength, renderMode, warpPoints,
    renderSurfaceEffects, previewSurfacePath, view.printArea.x, view.printArea.y, view.printArea.width, view.printArea.height,
    allImagesReady, imageLayers.length
  ]);

  // If warp is not configured, fall back to Konva rendering
  if (!warpPoints) {
    const scaleX = textureArea.width / view.printArea.width;
    const scaleY = textureArea.height / view.printArea.height;
    const clipFunc = (context: SceneContext) => {
      if (previewSurfacePath.length >= 3) {
        context.beginPath();
        context.moveTo(previewSurfacePath[0].x, previewSurfacePath[0].y);
        for (const point of previewSurfacePath.slice(1)) {
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
              {renderSurfaceEffects && textureImage ? (
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
                opacity={renderSurfaceEffects && textureImage ? 0.04 : 0.18}
              />
            </Group>
          </Layer>
        </Stage>
      </div>
    );
  }

  // Warp mode: render via composited canvas image
  return (
    <div className="effect-canvas">
      <Stage width={500} height={500}>
        <Layer>
          <Rect width={500} height={500} fill="#f1f5f9" />
          {previewImage ? (
            <KonvaImage
              image={previewImage}
              width={500}
              height={500}
              listening={false}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}

function renderDesignLayersToCanvas(
  layers: DesignLayer[],
  loadedImages: Map<string, HTMLImageElement>,
  printArea: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d')!;
  const scaleX = outputWidth / printArea.width;
  const scaleY = outputHeight / printArea.height;

  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of sorted) {
    context.save();
    context.globalAlpha = layer.opacity;
    const lx = (layer.x - printArea.x) * scaleX;
    const ly = (layer.y - printArea.y) * scaleY;
    const width = layer.width * scaleX;
    const height = layer.height * scaleY;
    const cx = lx + width / 2;
    const cy = ly + height / 2;
    context.translate(cx, cy);
    context.rotate((layer.rotation * Math.PI) / 180);
    context.scale(layer.scale, layer.scale);
    if (layer.type === 'image') {
      const img = loadedImages.get(layer.id);
      if (img && img.complete && img.naturalWidth > 0) {
        context.drawImage(img, -width / 2, -height / 2, width, height);
      }
    } else if (layer.type === 'text') {
      context.font = `${layer.fontWeight === '700' ? 'bold' : 'normal'} ${layer.fontSize * scaleY}px ${layer.fontFamily}`;
      context.fillStyle = layer.fill;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(layer.text, 0, 0);
    }
    context.restore();
  }

  return canvas;
}

function cropDesignFace(designCanvas: HTMLCanvasElement, face: PodFace) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(face.width));
  canvas.height = Math.max(1, Math.round(face.height));
  const context = canvas.getContext('2d')!;
  context.drawImage(designCanvas, face.x, face.y, face.width, face.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function renderBezierSurface(
  context: CanvasRenderingContext2D,
  sourceImage: HTMLCanvasElement,
  ctrlPos: PodFace['ctrlPos'],
  width: number,
  height: number
) {
  const mesh = createBezierSurfaceMesh(ctrlPos, 28, 28, width, height);
  const srcW = sourceImage.width;
  const srcH = sourceImage.height;

  for (const triangle of mesh.triangles) {
    const p0 = mesh.points[triangle.i0];
    const p1 = mesh.points[triangle.i1];
    const p2 = mesh.points[triangle.i2];
    const s0x = p0.u * srcW;
    const s0y = p0.v * srcH;
    const s1x = p1.u * srcW;
    const s1y = p1.v * srcH;
    const s2x = p2.u * srcW;
    const s2y = p2.v * srcH;
    const det = s0x * (s1y - s2y) + s1x * (s2y - s0y) + s2x * (s0y - s1y);
    if (Math.abs(det) < 1e-10) continue;
    const invDet = 1 / det;

    const a = (p0.x * (s1y - s2y) + p1.x * (s2y - s0y) + p2.x * (s0y - s1y)) * invDet;
    const c = (p0.x * (s2x - s1x) + p1.x * (s0x - s2x) + p2.x * (s1x - s0x)) * invDet;
    const e = (p0.x * (s1x * s2y - s2x * s1y) + p1.x * (s2x * s0y - s0x * s2y) + p2.x * (s0x * s1y - s1x * s0y)) * invDet;
    const b = (p0.y * (s1y - s2y) + p1.y * (s2y - s0y) + p2.y * (s0y - s1y)) * invDet;
    const d = (p0.y * (s2x - s1x) + p1.y * (s0x - s2x) + p2.y * (s1x - s0x)) * invDet;
    const f = (p0.y * (s1x * s2y - s2x * s1y) + p1.y * (s2x * s0y - s0x * s2y) + p2.y * (s0x * s1y - s1x * s0y)) * invDet;

    context.save();
    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.lineTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.closePath();
    context.clip();
    context.setTransform(a, b, c, d, e, f);
    context.drawImage(sourceImage, -0.5, -0.5, srcW + 1, srcH + 1);
    context.restore();
  }

  context.setTransform(1, 0, 0, 1, 0, 0);
}

function applyAlphaMask(
  context: CanvasRenderingContext2D,
  maskImage: HTMLImageElement,
  width: number,
  height: number
) {
  const source = context.getImageData(0, 0, width, height);
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) return;
  maskContext.drawImage(maskImage, 0, 0, width, height);
  const mask = maskContext.getImageData(0, 0, width, height);

  for (let index = 0; index < source.data.length; index += 4) {
    source.data[index + 3] = Math.round((source.data[index + 3] * mask.data[index + 3]) / 255);
  }

  context.putImageData(source, 0, 0);
}

function applyNormalDisplacement(
  context: CanvasRenderingContext2D,
  normalImage: HTMLImageElement,
  width: number,
  height: number,
  strength: number
) {
  const source = context.getImageData(0, 0, width, height);
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalContext = normalCanvas.getContext('2d');
  if (!normalContext) return;
  normalContext.drawImage(normalImage, 0, 0, width, height);
  const normal = normalContext.getImageData(0, 0, width, height);
  const displaced = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = source.data[index + 3];
      if (alpha === 0 || normal.data[index + 3] === 0) {
        displaced.data[index + 3] = alpha;
        continue;
      }
      const offset = normalOffset(normal.data[index], normal.data[index + 1], strength * 4);
      const sx = Math.max(0, Math.min(width - 1, Math.round(x - offset.x)));
      const sy = Math.max(0, Math.min(height - 1, Math.round(y - offset.y)));
      const sourceIndex = (sy * width + sx) * 4;
      displaced.data[index] = source.data[sourceIndex];
      displaced.data[index + 1] = source.data[sourceIndex + 1];
      displaced.data[index + 2] = source.data[sourceIndex + 2];
      displaced.data[index + 3] = source.data[sourceIndex + 3];
    }
  }

  context.putImageData(displaced, 0, 0);
}

function applyBaseImageLighting(
  context: CanvasRenderingContext2D,
  baseImage: HTMLImageElement,
  width: number,
  height: number
) {
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseContext = baseCanvas.getContext('2d');
  if (!baseContext) return;

  baseContext.drawImage(baseImage, 0, 0, width, height);
  const surface = context.getImageData(0, 0, width, height);
  const base = baseContext.getImageData(0, 0, width, height);
  const neutralLuminance = getSurfaceNeutralLuminance(surface, base);

  for (let index = 0; index < surface.data.length; index += 4) {
    const alpha = surface.data[index + 3];
    if (alpha === 0) continue;

    const shaded = shadeDesignPixel(
      {
        r: surface.data[index],
        g: surface.data[index + 1],
        b: surface.data[index + 2],
        a: alpha
      },
      {
        r: base.data[index],
        g: base.data[index + 1],
        b: base.data[index + 2],
        a: base.data[index + 3]
      },
      neutralLuminance
    );

    surface.data[index] = shaded.r;
    surface.data[index + 1] = shaded.g;
    surface.data[index + 2] = shaded.b;
    surface.data[index + 3] = shaded.a;
  }

  context.putImageData(surface, 0, 0);
}

function featherSurfaceEdges(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  passes: number
) {
  for (let pass = 0; pass < passes; pass += 1) {
    const image = context.getImageData(0, 0, width, height);
    const next = new Uint8ClampedArray(image.data);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = (y * width + x) * 4;
        const alpha = image.data[index + 3];
        if (alpha === 0) continue;

        const minNeighborAlpha = Math.min(
          image.data[index - 4 + 3],
          image.data[index + 4 + 3],
          image.data[index - width * 4 + 3],
          image.data[index + width * 4 + 3]
        );

        if (minNeighborAlpha < alpha) {
          next[index + 3] = Math.max(minNeighborAlpha, Math.round(alpha * 0.82));
        }
      }
    }

    context.putImageData(new ImageData(next, width, height), 0, 0);
  }
}

function getSurfaceNeutralLuminance(surface: ImageData, base: ImageData) {
  let total = 0;
  let count = 0;

  for (let index = 0; index < surface.data.length; index += 4) {
    if (surface.data[index + 3] === 0 || base.data[index + 3] === 0) continue;
    total += luminance(base.data[index], base.data[index + 1], base.data[index + 2]);
    count += 1;
  }

  return count > 0 ? total / count : 226;
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function applyPanelMask(
  context: CanvasRenderingContext2D,
  maskImage: HTMLImageElement,
  width: number,
  height: number,
  blurRadius: number
) {
  const source = context.getImageData(0, 0, width, height);
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) return;

  maskContext.drawImage(maskImage, 0, 0, width, height);
  const mask = maskContext.getImageData(0, 0, width, height);
  const maskAlpha = maskContext.createImageData(width, height);
  for (let index = 0; index < mask.data.length; index += 4) {
    const panelAlpha = 255 - mask.data[index + 3];
    maskAlpha.data[index] = 255;
    maskAlpha.data[index + 1] = 255;
    maskAlpha.data[index + 2] = 255;
    maskAlpha.data[index + 3] = panelAlpha;
  }
  maskContext.putImageData(maskAlpha, 0, 0);

  const blurredCanvas = document.createElement('canvas');
  blurredCanvas.width = width;
  blurredCanvas.height = height;
  const blurredContext = blurredCanvas.getContext('2d');
  if (!blurredContext) return;
  blurredContext.filter = `blur(${blurRadius}px)`;
  blurredContext.drawImage(maskCanvas, 0, 0);
  blurredContext.filter = 'none';
  const softened = blurredContext.getImageData(0, 0, width, height);

  for (let index = 0; index < source.data.length; index += 4) {
    source.data[index + 3] = Math.round((source.data[index + 3] * softened.data[index + 3]) / 255);
  }

  context.putImageData(source, 0, 0);
}

function renderPerspectiveSurface(
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  sourceWidth: number,
  sourceHeight: number,
  destination: Array<{ x: number; y: number }>
) {
  const transform = new PerspectiveTransform(
    [0, 0, sourceWidth, 0, sourceWidth, sourceHeight, 0, sourceHeight],
    destination.flatMap((point) => [point.x, point.y])
  );
  const sourceContext = source.getContext('2d');
  if (!sourceContext) return;

  const bounds = getQuadBounds(destination, context.canvas.width, context.canvas.height);
  const sourceData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
  const output = context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);

  for (let y = 0; y < bounds.height; y += 1) {
    for (let x = 0; x < bounds.width; x += 1) {
      const dx = bounds.x + x;
      const dy = bounds.y + y;
      const coverage = getQuadCoverage(dx, dy, destination);
      if (coverage === 0) continue;

      const [sx, sy] = transform.transformInverse(dx + 0.5, dy + 0.5);
      if (sx < 0 || sx >= sourceWidth || sy < 0 || sy >= sourceHeight) continue;

      const sampled = sampleBilinear(sourceData, sourceWidth, sourceHeight, sx, sy);
      const outputIndex = (y * bounds.width + x) * 4;
      output.data[outputIndex] = sampled.r;
      output.data[outputIndex + 1] = sampled.g;
      output.data[outputIndex + 2] = sampled.b;
      output.data[outputIndex + 3] = Math.round(sampled.a * coverage);
    }
  }

  context.putImageData(output, bounds.x, bounds.y);
}

function getQuadBounds(points: Array<{ x: number; y: number }>, canvasWidth: number, canvasHeight: number) {
  const minX = Math.max(0, Math.floor(Math.min(...points.map((point) => point.x))));
  const minY = Math.max(0, Math.floor(Math.min(...points.map((point) => point.y))));
  const maxX = Math.min(canvasWidth, Math.ceil(Math.max(...points.map((point) => point.x))));
  const maxY = Math.min(canvasHeight, Math.ceil(Math.max(...points.map((point) => point.y))));

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY)
  };
}

function getQuadCoverage(x: number, y: number, quad: Array<{ x: number; y: number }>) {
  const sampleOffsets = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75]
  ];
  let hits = 0;
  for (const [offsetX, offsetY] of sampleOffsets) {
    if (pointInQuad(x + offsetX, y + offsetY, quad)) hits += 1;
  }
  return hits / sampleOffsets.length;
}

function pointInQuad(x: number, y: number, quad: Array<{ x: number; y: number }>) {
  let inside = false;
  for (let i = 0, j = quad.length - 1; i < quad.length; j = i, i += 1) {
    const current = quad[i];
    const previous = quad[j];
    const crosses = current.y > y !== previous.y > y;
    if (!crosses) continue;
    const intersectionX = ((previous.x - current.x) * (y - current.y)) / (previous.y - current.y) + current.x;
    if (x < intersectionX) inside = !inside;
  }
  return inside;
}

function sampleBilinear(image: ImageData, width: number, height: number, x: number, y: number) {
  const x0 = Math.max(0, Math.min(width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const x1 = Math.max(0, Math.min(width - 1, x0 + 1));
  const y1 = Math.max(0, Math.min(height - 1, y0 + 1));
  const tx = x - x0;
  const ty = y - y0;
  const topLeft = getPixel(image, width, x0, y0);
  const topRight = getPixel(image, width, x1, y0);
  const bottomLeft = getPixel(image, width, x0, y1);
  const bottomRight = getPixel(image, width, x1, y1);

  return {
    r: mix(mix(topLeft.r, topRight.r, tx), mix(bottomLeft.r, bottomRight.r, tx), ty),
    g: mix(mix(topLeft.g, topRight.g, tx), mix(bottomLeft.g, bottomRight.g, tx), ty),
    b: mix(mix(topLeft.b, topRight.b, tx), mix(bottomLeft.b, bottomRight.b, tx), ty),
    a: mix(mix(topLeft.a, topRight.a, tx), mix(bottomLeft.a, bottomRight.a, tx), ty)
  };
}

function getPixel(image: ImageData, width: number, x: number, y: number) {
  const index = (y * width + x) * 4;
  return {
    r: image.data[index],
    g: image.data[index + 1],
    b: image.data[index + 2],
    a: image.data[index + 3]
  };
}

function mix(left: number, right: number, amount: number) {
  return Math.round(left + (right - left) * amount);
}

function clipToPreviewSurface(
  context: CanvasRenderingContext2D,
  surfacePath: Array<{ x: number; y: number }>
) {
  context.beginPath();
  context.moveTo(surfacePath[0].x, surfacePath[0].y);
  for (const point of surfacePath.slice(1)) {
    context.lineTo(point.x, point.y);
  }
  context.closePath();
  context.clip();
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

function useImageElements(srcs: string[]) {
  const [loadCount, setLoadCount] = useState(0);
  const images = useRef<Map<string, HTMLImageElement>>(new Map());
  const srcKey = srcs.join('|');

  useEffect(() => {
    const expected = new Set(srcs);
    let changed = false;
    for (const key of images.current.keys()) {
      if (!expected.has(key)) {
        images.current.delete(key);
        changed = true;
      }
    }
    for (const src of srcs) {
      if (!images.current.has(src)) {
        const image = new window.Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => setLoadCount((count) => count + 1);
        image.src = src;
        images.current.set(src, image);
        changed = true;
      }
    }
    if (changed) setLoadCount((count) => count + 1);
  }, [srcKey]);

  return { images: images.current, loadCount };
}
