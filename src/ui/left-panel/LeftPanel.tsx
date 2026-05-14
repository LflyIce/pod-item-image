import { useState } from 'react';
import { Image, LayoutTemplate, Type, Palette, Layers } from 'lucide-react';
import { AssetLibrary } from './AssetLibrary';
import { TemplateList } from './TemplateList';
import { TextPanel } from './TextPanel';
import { BackgroundPanel } from './BackgroundPanel';
import { LayersPanel } from './LayersPanel';

export type LeftTab = 'assets' | 'templates' | 'text' | 'background' | 'layers';

const tabs: { id: LeftTab; icon: typeof Image; label: string }[] = [
  { id: 'assets', icon: Image, label: '图库' },
  { id: 'templates', icon: LayoutTemplate, label: '模板' },
  { id: 'text', icon: Type, label: '文字' },
  { id: 'background', icon: Palette, label: '背景' },
  { id: 'layers', icon: Layers, label: '图层' }
];

export function LeftPanel(props: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTab>('assets');

  const tabIcon = tabs.map((tab) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        className={`left-tab-btn${activeTab === tab.id ? ' active' : ''}`}
        onClick={() => setActiveTab(tab.id)}
        title={tab.label}
      >
        <Icon size={20} />
        <span>{tab.label}</span>
      </button>
    );
  });

  let content: React.ReactNode;
  switch (activeTab) {
    case 'assets':
      content = <AssetLibrary {...props} />;
      break;
    case 'templates':
      content = <TemplateList onApplyTemplate={props.onApplyTemplate} />;
      break;
    case 'text':
      content = <TextPanel onAddText={props.onAddText} />;
      break;
    case 'background':
      content = <BackgroundPanel backgroundColor={props.backgroundColor} onSetBackground={props.onSetBackground} />;
      break;
    case 'layers':
      content = (
        <LayersPanel
          layers={props.layers}
          selectedLayerId={props.selectedLayerId}
          onSelectLayer={props.onSelectLayer}
          onToggleVisibility={props.onToggleVisibility}
          onToggleLock={props.onToggleLock}
          onMoveUp={props.onMoveUp}
          onMoveDown={props.onMoveDown}
          onDeleteLayer={props.onDeleteLayer}
        />
      );
      break;
  }

  return (
    <aside className="left-panel">
      <div className="left-tab-bar">{tabIcon}</div>
      <div className="left-tab-content">{content}</div>
    </aside>
  );
}

export interface LeftPanelProps {
  sampleAssets: Array<{ id: string; name: string; src: string }>;
  myAssets: Array<{ id: string; name: string; src: string; width: number; height: number }>;
  onAddImageAsset: (asset: { src: string; width: number; height: number }) => void;
  onUploadClick: () => void;
  onApplyTemplate: (templateLayers: Array<any>) => void;
  onAddText: (text: string, style?: Partial<{ fontSize: number; fontWeight: string; fill: string }>) => void;
  backgroundColor: string;
  onSetBackground: (color: string) => void;
  layers: Array<any>;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDeleteLayer: (id: string) => void;
}
