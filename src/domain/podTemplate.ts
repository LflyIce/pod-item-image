export type PodControlPoint = {
  x: number;
  y: number;
  z: number;
};

export type PodFace = {
  mask: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ctrlPos: PodControlPoint[];
};

export type PodScene = {
  id: string;
  effect?: boolean;
  faces: PodFace[];
};

export type PodTemplate = {
  id: string;
  name: string;
  width: number;
  height: number;
  scenes: PodScene[];
};

const POD_ASSET_ROOT = '/assets/pod-editor';

export function podTemplateAssetPath(folder: 'template' | 'images', fileName: string) {
  return `${POD_ASSET_ROOT}/${folder}/${fileName}`;
}

export function podTemplateScenePath(templateId: string, fileName: string) {
  return `${POD_ASSET_ROOT}/scene/${templateId}/${fileName}`;
}

export function createFlatCtrlPos(): PodControlPoint[] {
  return [
    { x: -100, y: 100, z: 0 },
    { x: 0, y: 100, z: 0 },
    { x: 100, y: 100, z: 0 },
    { x: -100, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 100, y: 0, z: 0 },
    { x: -100, y: -100, z: 0 },
    { x: 0, y: -100, z: 0 },
    { x: 100, y: -100, z: 0 }
  ];
}

const flatCtrlPos = createFlatCtrlPos();

export const DEMO_POD_TEMPLATES: PodTemplate[] = [
  {
    id: '0001',
    name: '法兰绒毛毯',
    width: 1207,
    height: 1600,
    scenes: [
      {
        id: '01',
        effect: true,
        faces: [
          {
            mask: '01_mask.png',
            x: 196.5,
            y: 0,
            width: 1207,
            height: 1600,
            ctrlPos: [
              { x: -66.50365505797483, y: 85.08557381959098, z: 0 },
              { x: 2.444950285078182, y: 73.8386318261904, z: 0 },
              { x: 69.68214638990136, y: 84.59657816644285, z: 0 },
              { x: -62.34720599654697, y: 6.356971471588103, z: 0 },
              { x: 0, y: 0.48900124928061717, z: 0 },
              { x: 65.28116872317075, y: 1.4669925555768681, z: 0 },
              { x: -64.54769482991227, y: -85.81908688577688, z: 0 },
              { x: -3.6674813889421767, y: -91.4425285027816, z: 0 },
              { x: 68.94865011211292, y: -88.0195757191422, z: 0 }
            ]
          }
        ]
      },
      {
        id: '02',
        effect: true,
        faces: [
          {
            mask: '02_mask.png',
            x: 196.5,
            y: 0,
            width: 1207,
            height: 1600,
            ctrlPos: [
              { x: -73.10514394260069, y: 94.62102543084065, z: 0 },
              { x: 5.378980165291847, y: 66.99266749952041, z: 0 },
              { x: 72.86063772182789, y: 94.8655288535472, z: 0 },
              { x: -68.94865011211292, y: -0.9779913062962534, z: 0 },
              { x: 0, y: 0, z: 0 },
              { x: 68.94865011211293, y: -0.7335074700534161, z: 0 },
              { x: -69.68214638990135, y: -92.9095210583585, z: 0 },
              { x: -0.7334962777884355, y: -92.90952105835848, z: 0 },
              { x: 74.08314644116193, y: -91.44255088731158, z: 0 }
            ]
          }
        ]
      },
      {
        id: '03',
        effect: true,
        faces: [
          {
            mask: '03_mask.png',
            x: 196.5,
            y: 0,
            width: 1207,
            height: 1600,
            ctrlPos: [
              { x: -64.54768363764728, y: 66.74816967294635, z: 0 },
              { x: -9.535429226719696, y: 70.90464951310288, z: 0 },
              { x: 43.03177416874489, y: 64.54767804151479, z: 0 },
              { x: -44.987790358132344, y: -10.513442917545914, z: 0 },
              { x: 12.2249305016306, y: -4.400977666730612, z: 0 },
              { x: 60.88021344097008, y: 17.84842807996023, z: 0 },
              { x: -74.81663152668538, y: -88.01955333461224, z: 0 },
              { x: 25.91685355883807, y: -84.35207194567006, z: 0 },
              { x: 134.7188088922993, y: -55.25672705490545, z: 0 }
            ]
          }
        ]
      },
      {
        id: '04',
        effect: true,
        faces: [
          {
            mask: '04_mask.png',
            x: 196.5,
            y: 0,
            width: 1207,
            height: 1600,
            ctrlPos: [
              { x: -94.62103102697313, y: 81.17359740214098, z: 0 },
              { x: -60.63570722019729, y: 87.53056047953035, z: 0 },
              { x: -7.090456557111551, y: 83.12958561086599, z: 0 },
              { x: -73.83864022038912, y: 7.090467749376533, z: 0 },
              { x: 0, y: 0, z: 0 },
              { x: 115.15891561278434, y: 72.61613709718759, z: 0 },
              { x: -63.56968113908606, y: -91.68705710808437, z: 0 },
              { x: 44.74327294509456, y: -98.77751366519594, z: 0 },
              { x: 101.9559826125925, y: -42.54279530399423, z: 0 }
            ]
          }
        ]
      },
      {
        id: '05',
        effect: true,
        faces: [
          {
            mask: '05_mask.png',
            x: 196.5,
            y: 0,
            width: 1207,
            height: 1600,
            ctrlPos: [
              { x: 62.724025275117604, y: 33.33332239513329, z: 0 },
              { x: 119.71323977234542, y: 2.9868614716341995, z: 0 },
              { x: 164.27721686687948, y: -108.12423323217686, z: 0 },
              { x: -17.08482311617944, y: 40.382314155605954, z: 0 },
              { x: -1.672647674451163, y: 1.6726367362511199, z: 0 },
              { x: -2.2700046552979365, y: -43.249697668150766, z: 0 },
              { x: -100.7168458781362, y: 37.15650770399305, z: 0 },
              { x: -112.54479192918348, y: 5.854234045978942, z: 0 },
              { x: -105.49584392151098, y: -24.492194062920017, z: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '0002',
    name: '仿亚麻平角桌旗',
    width: 1600,
    height: 302,
    scenes: [
      {
        id: '04',
        effect: true,
        faces: [{ mask: '04_mask.png', x: 364.912281, y: 649, width: 875.78, height: 302, ctrlPos: flatCtrlPos }]
      }
    ]
  },
  {
    id: '0003',
    name: '白瓷花盆带底座',
    width: 1600,
    height: 900,
    scenes: [
      {
        id: '01',
        faces: [{ mask: '01_mask.png', x: 0, y: 350, width: 1600, height: 900, ctrlPos: flatCtrlPos }]
      }
    ]
  }
];

export function getDemoPodTemplate(templateId: string) {
  return DEMO_POD_TEMPLATES.find((template) => template.id === templateId);
}

