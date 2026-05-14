import { useState } from 'react';
import { Search, Upload } from 'lucide-react';

export function AssetLibrary({ sampleAssets, myAssets, onAddImageAsset, onUploadClick }: AssetLibraryProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'library' | 'mine'>('library');

  const assets = tab === 'mine' ? myAssets : sampleAssets.map((a) => ({ ...a, width: 900, height: 1400 }));
  const filtered = search
    ? assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : assets;

  return (
    <div className="asset-library">
      <div className="asset-lib-tabs">
        <button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>素材库</button>
        <button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>我的图片</button>
      </div>
      <div className="asset-search">
        <Search size={14} />
        <input placeholder="搜索素材..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="asset-grid">
        {filtered.length === 0 ? (
          <div className="asset-empty">{tab === 'mine' ? '上传图片后会显示在这里' : '没有找到素材'}</div>
        ) : (
          filtered.map((asset) => (
            <button key={asset.id} className="asset-card" onClick={() => onAddImageAsset(asset)}>
              <img src={asset.src} alt={asset.name} />
              <span>{asset.name}</span>
            </button>
          ))
        )}
      </div>
      <button className="upload-btn" onClick={onUploadClick}>
        <Upload size={16} />
        上传图片
      </button>
    </div>
  );
}

export interface AssetLibraryProps {
  sampleAssets: Array<{ id: string; name: string; src: string }>;
  myAssets: Array<{ id: string; name: string; src: string; width: number; height: number }>;
  onAddImageAsset: (asset: { src: string; width: number; height: number }) => void;
  onUploadClick: () => void;
}
