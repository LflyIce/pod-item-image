import type { TextLayer } from '../../domain/types';

const fontOptions = ['Inter, Arial, sans-serif', 'Arial, sans-serif', 'Georgia, serif', 'Courier New, monospace'];

export function TextPropertyEditor({ layer, onUpdate }: { layer: TextLayer; onUpdate: (updates: Partial<TextLayer>) => void }) {
  return (
    <div className="prop-editor">
      <div className="prop-group">
        <label>文本内容</label>
        <textarea
          value={layer.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          rows={3}
        />
      </div>

      <div className="prop-group">
        <label>字体</label>
        <select value={layer.fontFamily} onChange={(e) => onUpdate({ fontFamily: e.target.value })}>
          {fontOptions.map((f) => (
            <option key={f} value={f}>{f.split(',')[0]}</option>
          ))}
        </select>
      </div>

      <div className="prop-group">
        <label>字号: {layer.fontSize}px</label>
        <input
          type="range"
          min={8}
          max={120}
          value={layer.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
        />
      </div>

      <div className="prop-group">
        <label>颜色</label>
        <input
          type="color"
          value={layer.fill}
          onChange={(e) => onUpdate({ fill: e.target.value })}
        />
      </div>

      <div className="prop-group inline">
        <label>粗体</label>
        <button
          className={`toggle-btn${layer.fontWeight === '700' ? ' active' : ''}`}
          onClick={() => onUpdate({ fontWeight: layer.fontWeight === '700' ? '400' : '700' })}
        >
          B
        </button>
        <label>斜体</label>
        <button
          className={`toggle-btn${layer.fontStyle === 'italic' ? ' active' : ''}`}
          onClick={() => onUpdate({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
        >
          <em>I</em>
        </button>
      </div>

      <div className="prop-group">
        <label>对齐</label>
        <div className="align-btns">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              className={`toggle-btn${layer.textAlign === align ? ' active' : ''}`}
              onClick={() => onUpdate({ textAlign: align })}
            >
              {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
            </button>
          ))}
        </div>
      </div>

      <div className="prop-group">
        <label>描边颜色</label>
        <input
          type="color"
          value={layer.strokeColor || '#000000'}
          onChange={(e) => onUpdate({ strokeColor: e.target.value })}
        />
      </div>

      <div className="prop-group">
        <label>描边宽度: {layer.strokeWidth || 0}</label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={layer.strokeWidth || 0}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
        />
      </div>

      <div className="prop-group">
        <label>阴影颜色</label>
        <input
          type="color"
          value={layer.shadowColor || '#000000'}
          onChange={(e) => onUpdate({ shadowColor: e.target.value })}
        />
      </div>

      <div className="prop-group">
        <label>阴影模糊: {layer.shadowBlur || 0}</label>
        <input
          type="range"
          min={0}
          max={20}
          value={layer.shadowBlur || 0}
          onChange={(e) => onUpdate({ shadowBlur: Number(e.target.value) })}
        />
      </div>

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
        <label>旋转: {Math.round(layer.rotation)}°</label>
        <input
          type="range"
          min={-180}
          max={180}
          value={layer.rotation}
          onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
