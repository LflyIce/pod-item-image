import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown, Image, Type } from 'lucide-react';
import type { DesignLayer } from '../../domain/types';

export function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onDeleteLayer
}: LayersPanelProps) {
  const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="layers-panel">
      <h3>图层</h3>
      {sorted.length === 0 ? (
        <div className="layers-empty">暂无图层</div>
      ) : (
        <div className="layers-list">
          {sorted.map((layer) => (
            <div
              key={layer.id}
              className={`layer-item${selectedLayerId === layer.id ? ' selected' : ''}${(layer as any)._hidden ? ' hidden-layer' : ''}`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <span className="layer-icon">
                {layer.type === 'image' ? <Image size={14} /> : <Type size={14} />}
              </span>
              <span className="layer-name">
                {layer.type === 'text' ? (layer as any).text?.slice(0, 12) || '文字' : '图片'}
              </span>
              <div className="layer-actions">
                <button
                  className="layer-btn"
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                  title="显示/隐藏"
                >
                  {(layer as any)._hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  className="layer-btn"
                  onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                  title="锁定/解锁"
                >
                  {(layer as any)._locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
                <button
                  className="layer-btn"
                  onClick={(e) => { e.stopPropagation(); onMoveUp(layer.id); }}
                  title="上移"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  className="layer-btn"
                  onClick={(e) => { e.stopPropagation(); onMoveDown(layer.id); }}
                  title="下移"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  className="layer-btn danger"
                  onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                  title="删除"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface LayersPanelProps {
  layers: DesignLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
}
