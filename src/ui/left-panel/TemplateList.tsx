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

interface TemplateDef {
  id: string;
  name: string;
  category: string;
  layers: Array<any>;
}

const templates: TemplateDef[] = [
  {
    id: 'curtain-welcome',
    name: '门帘 - 欢迎回家',
    category: '门帘',
    layers: [
      { type: 'image', assetUrl: sampleAssets[0].src, naturalWidth: 900, naturalHeight: 1400, x: 32, y: 38, width: 366, height: 614, rotation: 0, scale: 1, opacity: 1, zIndex: 1 },
      { type: 'text', text: 'WELCOME', x: 72, y: 540, width: 286, height: 64, rotation: 0, scale: 1, opacity: 1, zIndex: 2, fontSize: 42, fontFamily: 'Inter, Arial, sans-serif', fill: '#ffffff', fontWeight: '700' }
    ]
  },
  {
    id: 'curtain-floral',
    name: '门帘 - 复古花卉',
    category: '门帘',
    layers: [
      { type: 'image', assetUrl: sampleAssets[2].src, naturalWidth: 900, naturalHeight: 1400, x: 32, y: 38, width: 366, height: 614, rotation: 0, scale: 1, opacity: 1, zIndex: 1 }
    ]
  },
  {
    id: 'mat-simple',
    name: '地垫 - 简约欢迎',
    category: '地垫',
    layers: [
      { type: 'text', text: 'WELCOME', x: 80, y: 200, width: 300, height: 80, rotation: 0, scale: 1, opacity: 1, zIndex: 1, fontSize: 56, fontFamily: 'Georgia, serif', fill: '#334155', fontWeight: '700' },
      { type: 'text', text: 'My Home', x: 120, y: 290, width: 220, height: 40, rotation: 0, scale: 1, opacity: 0.8, zIndex: 2, fontSize: 24, fontFamily: 'Inter, Arial, sans-serif', fill: '#64748b', fontWeight: '400' }
    ]
  },
  {
    id: 'mat-duck',
    name: '地垫 - 可爱小鸭',
    category: '地垫',
    layers: [
      { type: 'image', assetUrl: sampleAssets[1].src, naturalWidth: 900, naturalHeight: 1400, x: 32, y: 38, width: 366, height: 614, rotation: 0, scale: 1, opacity: 1, zIndex: 1 }
    ]
  },
  {
    id: 'general-dark',
    name: '通用 - 暗黑经典',
    category: '通用',
    layers: [
      { type: 'image', assetUrl: sampleAssets[3].src, naturalWidth: 900, naturalHeight: 1400, x: 32, y: 38, width: 366, height: 614, rotation: 0, scale: 1, opacity: 1, zIndex: 1 }
    ]
  },
  {
    id: 'general-minimal',
    name: '通用 - 极简文字',
    category: '通用',
    layers: [
      { type: 'text', text: 'Hello\nWorld', x: 100, y: 200, width: 260, height: 120, rotation: 0, scale: 1, opacity: 1, zIndex: 1, fontSize: 48, fontFamily: 'Inter, Arial, sans-serif', fill: '#0f172a', fontWeight: '700' }
    ]
  },
  {
    id: 'tshirt-beyourself',
    name: 'T恤 - BE YOURSELF',
    category: 'T恤',
    layers: [
      { type: 'text', text: 'BE YOURSELF', x: 140, y: 200, width: 220, height: 80, rotation: 0, scale: 1, opacity: 1, zIndex: 1, fontSize: 36, fontFamily: 'Inter, Arial, sans-serif', fill: '#ffffff', fontWeight: '700' }
    ]
  },
  {
    id: 'mug-mountain',
    name: '马克杯 - 山野晨雾',
    category: '马克杯',
    layers: [
      { type: 'image', assetUrl: sampleAssets[0].src, naturalWidth: 900, naturalHeight: 1400, x: 60, y: 60, width: 280, height: 280, rotation: 0, scale: 1, opacity: 1, zIndex: 1 }
    ]
  },
  {
    id: 'phonecase-wave',
    name: '手机壳 - 海浪蔚蓝',
    category: '手机壳',
    layers: [
      { type: 'image', assetUrl: sampleAssets[4].src, naturalWidth: 900, naturalHeight: 1400, x: 20, y: 80, width: 280, height: 460, rotation: 0, scale: 1, opacity: 1, zIndex: 1 }
    ]
  },
  {
    id: 'totebag-love',
    name: '帆布袋 - LOVE',
    category: '帆布袋',
    layers: [
      { type: 'text', text: 'LOVE', x: 110, y: 180, width: 200, height: 120, rotation: 0, scale: 1, opacity: 1, zIndex: 1, fontSize: 72, fontFamily: 'Georgia, serif', fill: '#e11d48', fontWeight: '700' }
    ]
  }
];

export function TemplateList({ onApplyTemplate }: { onApplyTemplate: (layers: Array<any>) => void }) {
  return (
    <div className="template-list">
      <h3>模板</h3>
      <div className="template-grid">
        {templates.map((t) => (
          <button key={t.id} className="template-card" onClick={() => onApplyTemplate(t.layers)}>
            <div className="template-thumb">
              <img src={t.layers[0]?.type === 'image' ? t.layers[0].assetUrl : ''} alt="" />
            </div>
            <div className="template-info">
              <strong>{t.name}</strong>
              <span>{t.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
