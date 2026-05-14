import type { ImageLayer } from '../../domain/types';

const blendModes: Array<{ value: ImageLayer['tileMode'] extends any ? string : never; label: string }> = [
  { value: 'source-over', label: '正常' },
  { value: 'multiply', label: '正片叠底' },
  { value: 'screen', label: '滤色' },
  { value: 'overlay', label: '叠加' },
  { value: 'soft-light', label: '柔光' }
];

const tileModes: Array<{ value: string; label: string }> = [
  { value: 'none', label: '无' },
  { value: 'basic', label: '基础平铺' },
  { value: 'mirror', label: '镜像平铺' }
];

export function ImagePropertyEditor({ layer, onUpdate }: { layer: ImageLayer; onUpdate: (updates: Partial<ImageLayer>) => void }) {
  return (
    <div className="prop-editor">
      <div className="prop-group">
        <label>透明度: {Math.round(layer.opacity * 100)}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(layer.opacity * 100)}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 })}
        />
      </div>

      <div className="prop-group">
        <label>平铺模式</label>
        <select
          value={layer.tileMode || 'none'}
          onChange={(e) => onUpdate({ tileMode: e.target.value as ImageLayer['tileMode'] })}
        >
          {tileModes.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="prop-group">
        <label>旋转: {Math.round(layer.rotation)}°</label>
        <input
          type="range"
          min={-180}
          max={180}
          value={layer.rotation}
          onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
        />
      </div>

      <div className="prop-info-section">
        <div className="prop-row">
          <label>原始尺寸</label>
          <span>{layer.naturalWidth} × {layer.naturalHeight}</span>
        </div>
        <div className="prop-row">
          <label>当前尺寸</label>
          <span>{Math.round(layer.width)} × {Math.round(layer.height)}</span>
        </div>
        <div className="prop-row">
          <label>缩放</label>
          <span>{Math.round(layer.scale * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
