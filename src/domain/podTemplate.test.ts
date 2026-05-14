import { describe, expect, it } from 'vitest';
import { DEMO_POD_TEMPLATES, createFlatCtrlPos, podTemplateAssetPath, podTemplateScenePath } from './podTemplate';

describe('POD Editor templates', () => {
  it('ships the demo blanket template with five scene faces', () => {
    const template = DEMO_POD_TEMPLATES.find((item) => item.id === '0001');

    expect(template?.name).toBe('法兰绒毛毯');
    expect(template?.width).toBe(1207);
    expect(template?.height).toBe(1600);
    expect(template?.scenes).toHaveLength(5);
    expect(template?.scenes[0].faces[0].ctrlPos).toHaveLength(9);
  });

  it('builds stable public asset paths', () => {
    expect(podTemplateAssetPath('template', '0001.jpg')).toBe('/assets/pod-editor/template/0001.jpg');
    expect(podTemplateScenePath('0001', '01.jpg')).toBe('/assets/pod-editor/scene/0001/01.jpg');
  });

  it('creates a flat 3x3 control grid when template control points are invalid', () => {
    expect(createFlatCtrlPos()).toEqual([
      { x: -100, y: 100, z: 0 },
      { x: 0, y: 100, z: 0 },
      { x: 100, y: 100, z: 0 },
      { x: -100, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 },
      { x: -100, y: -100, z: 0 },
      { x: 0, y: -100, z: 0 },
      { x: 100, y: -100, z: 0 }
    ]);
  });
});

