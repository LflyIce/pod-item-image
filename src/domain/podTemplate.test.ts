import { describe, expect, it } from 'vitest';
import { DEMO_POD_TEMPLATES, createFlatCtrlPos, getPodTemplatePrintRect, podTemplateAssetPath, podTemplateScenePath } from './podTemplate';

describe('POD Editor templates', () => {
  it('ships the demo blanket template with five scene faces', () => {
    const template = DEMO_POD_TEMPLATES.find((item) => item.id === '0001');

    expect(template?.name).toBe('法兰绒毛毯');
    expect(template?.width).toBe(1207);
    expect(template?.height).toBe(1600);
    expect(template?.scenes).toHaveLength(5);
    expect(template?.scenes[0].faces[0].ctrlPos).toHaveLength(9);
  });

  it('ships complete demo scene definitions for table runner and flower pot templates', () => {
    const tableRunner = DEMO_POD_TEMPLATES.find((item) => item.id === '0002');
    const flowerPot = DEMO_POD_TEMPLATES.find((item) => item.id === '0003');

    expect(tableRunner?.scenes.map((scene) => scene.id)).toEqual(['01', '02', '03', '04']);
    expect(tableRunner?.scenes.map((scene) => scene.faces.length)).toEqual([3, 2, 2, 1]);
    expect(flowerPot?.scenes.map((scene) => scene.id)).toEqual(['01', '02', '03', '04']);
    expect(flowerPot?.scenes.map((scene) => scene.faces.length)).toEqual([1, 1, 1, 1]);
    expect(flowerPot?.scenes[1].faces[0].ctrlPos).toHaveLength(9);
  });

  it('builds stable public asset paths', () => {
    expect(podTemplateAssetPath('template', '0001.jpg')).toBe('/assets/pod-editor/template/0001.jpg');
    expect(podTemplateScenePath('0001', '01.jpg')).toBe('/assets/pod-editor/scene/0001/01.jpg');
  });

  it('uses the union of POD face source rectangles as the print placement area', () => {
    const blanket = DEMO_POD_TEMPLATES.find((item) => item.id === '0001')!;
    const tableRunner = DEMO_POD_TEMPLATES.find((item) => item.id === '0002')!;

    expect(getPodTemplatePrintRect(blanket)).toEqual({ x: 196.5, y: 0, width: 1207, height: 1600 });
    expect(getPodTemplatePrintRect(tableRunner)).toEqual({ x: 0, y: 649, width: 1600.5, height: 302 });
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

