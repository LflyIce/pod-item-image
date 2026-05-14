import { useState } from 'react';

const quickColors = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#0f172a', '#1e293b', '#334155', '#64748b',
  '#ef4444', '#f97316', '#facc15', '#22c55e',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
];

const gradients = [
  { name: '晨曦', value: 'linear-gradient(135deg, #dbeafe, #fce7f3)' },
  { name: '海洋', value: 'linear-gradient(135deg, #e0f2fe, #ccfbf1)' },
  { name: '暮色', value: 'linear-gradient(135deg, #fde68a, #fca5a5)' },
  { name: '森林', value: 'linear-gradient(135deg, #bbf7d0, #a5f3fc)' },
  { name: '紫霞', value: 'linear-gradient(135deg, #e9d5ff, #fbcfe8)' },
  { name: '暗夜', value: 'linear-gradient(135deg, #1e293b, #334155)' }
];

export function BackgroundPanel({ backgroundColor, onSetBackground }: { backgroundColor: string; onSetBackground: (color: string) => void }) {
  const [customColor, setCustomColor] = useState(backgroundColor);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    onSetBackground(e.target.value);
  };

  return (
    <div className="background-panel">
      <h3>背景</h3>
      <div className="bg-section">
        <h4>纯色</h4>
        <div className="color-grid">
          {quickColors.map((c) => (
            <button
              key={c}
              className={`color-swatch${backgroundColor === c ? ' active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onSetBackground(c)}
              title={c}
            />
          ))}
        </div>
        <div className="custom-color">
          <label>自定义</label>
          <input type="color" value={customColor} onChange={handleCustomChange} />
        </div>
      </div>
      <div className="bg-section">
        <h4>渐变</h4>
        <div className="gradient-grid">
          {gradients.map((g) => (
            <button
              key={g.name}
              className="gradient-swatch"
              style={{ background: g.value }}
              onClick={() => {
                // Convert gradient to solid color (use the first color stop)
                const match = g.value.match(/#[0-9a-f]{6}/i);
                if (match) onSetBackground(match[0]);
              }}
              title={g.name}
            >
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
