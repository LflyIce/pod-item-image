import { Plus } from 'lucide-react';

const presetStyles = [
  { label: '大标题', text: '标题文字', fontSize: 48, fontWeight: '700', fill: '#0f172a' },
  { label: '副标题', text: '副标题文字', fontSize: 32, fontWeight: '700', fill: '#334155' },
  { label: '正文', text: '正文内容', fontSize: 20, fontWeight: '400', fill: '#475569' },
  { label: '白色大标题', text: 'WHITE TEXT', fontSize: 48, fontWeight: '700', fill: '#ffffff' },
  { label: '装饰文字', text: '✦ DECORATIVE ✦', fontSize: 28, fontWeight: '400', fill: '#6366f1' },
  { label: '描边标题', text: 'OUTLINE', fontSize: 40, fontWeight: '700', fill: '#334155' }
];

export function TextPanel({ onAddText }: { onAddText: (text: string, style?: Partial<{ fontSize: number; fontWeight: string; fill: string }>) => void }) {
  return (
    <div className="text-panel">
      <h3>文字</h3>
      <div className="text-quick-btns">
        <button onClick={() => onAddText('标题文字', { fontSize: 48, fontWeight: '700', fill: '#0f172a' })}>
          <Plus size={14} />
          添加标题
        </button>
        <button onClick={() => onAddText('副标题', { fontSize: 32, fontWeight: '700', fill: '#334155' })}>
          <Plus size={14} />
          添加副标题
        </button>
        <button onClick={() => onAddText('正文内容', { fontSize: 20, fontWeight: '400', fill: '#475569' })}>
          <Plus size={14} />
          添加正文
        </button>
      </div>
      <div className="text-presets">
        <h4>预设样式</h4>
        {presetStyles.map((preset, i) => (
          <button
            key={i}
            className="text-preset-item"
            onClick={() => onAddText(preset.text, { fontSize: preset.fontSize, fontWeight: preset.fontWeight, fill: preset.fill })}
          >
            <span style={{ fontSize: Math.min(preset.fontSize, 20), fontWeight: preset.fontWeight, color: preset.fill }}>
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
