import { describe, expect, it } from 'vitest';
import { fitLayerToArea, setLayerTileMode } from './editorActions';
import type { ImageLayer, Rect } from './types';

const area: Rect = { x: 10, y: 20, width: 200, height: 300 };

const imageLayer: ImageLayer = {
  id: 'image_1',
  type: 'image',
  assetUrl: 'asset.png',
  naturalWidth: 1000,
  naturalHeight: 500,
  x: 80,
  y: 90,
  width: 100,
  height: 50,
  rotation: 0,
  scale: 1,
  opacity: 1,
  zIndex: 1
};

describe('editor toolbar actions', () => {
  it('stretches selected image to exactly fill the print area', () => {
    expect(fitLayerToArea(imageLayer, area, 'stretch')).toMatchObject({
      x: 10,
      y: 20,
      width: 200,
      height: 300,
      scale: 1
    });
  });

  it('maximizes selected image with cover sizing and centers overflow', () => {
    expect(fitLayerToArea(imageLayer, area, 'cover')).toMatchObject({
      x: -190,
      y: 20,
      width: 600,
      height: 300,
      scale: 1
    });
  });

  it('sets repeat mode for basic and mirror tiling', () => {
    expect(setLayerTileMode(imageLayer, 'basic').tileMode).toBe('basic');
    expect(setLayerTileMode(imageLayer, 'mirror').tileMode).toBe('mirror');
  });
});
