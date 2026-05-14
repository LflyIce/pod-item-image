# PSD.js 用于 POD 模板提取可行性分析

分析目标：判断能否用 `psd.js` 直接解析 Photoshop PSD 文件，并生成类似 POD Editor 的模板数据。

结论：`psd.js` 可以作为 PSD 资源提取器使用，但不能直接完整生成 POD Editor 所需的真实贴图模板。它能提取图层结构、尺寸、位置、透明图层、文字、部分蒙版和扁平预览图；但不能可靠还原 Photoshop 智能对象变形、扭曲、置换、图层效果和复杂混合渲染。

## POD 模板真正需要什么

根据本地复现项目 `D:\666\demo\pod-editor-repro` 的打包代码和资源结构，POD Editor 的一个可用模板通常需要这些数据：

```text
scene.jpg       场景底图
effect.png      顶层效果图，高光、褶皱、遮挡、边缘
mask.png        印刷区域遮罩
blade.png       编辑器刀版图
face.x/y/w/h    印刷面在高清模板中的裁切区域
face.ctrlPos    3x3 贝塞尔形变控制点
template.json   模板、场景、贴图面配置
```

其中 `scene/effect/mask/blade` 属于图像资源，`x/y/width/height` 属于图层几何信息，`ctrlPos` 属于曲面形变参数。

## psd.js 能直接拿到的内容

`psd.js` 的强项是读取 PSD 结构，而不是完整渲染 Photoshop。

可用能力：

| 能力 | 对 POD 模板的价值 |
| --- | --- |
| 文档宽高 | 可生成模板总尺寸 |
| 图层树/文件夹结构 | 可按分组组织模板、场景、面 |
| 图层名称 | 可用命名规则识别 `base/effect/mask/blade/face` |
| 图层位置和尺寸 | 可生成 `x/y/width/height` |
| 图层可见性和透明度 | 可决定是否导出或参与合成 |
| 部分文字数据 | 对文字模板有参考价值 |
| 部分矢量蒙版数据 | 可辅助生成 mask |
| 扁平化预览图 | 可导出 PSD 内置合成预览 |
| 图层像素数据 | 可导出部分 PNG 资源 |

适合用它做：

```text
PSD -> 读取图层树 -> 按命名规则分类 -> 导出 PNG/JSON 初稿
```

## psd.js 不能可靠解决的内容

POD 真实贴图里最关键的部分，`psd.js` 不能直接完成：

| 缺口 | 影响 |
| --- | --- |
| 智能对象内容替换 | 无法像 Photoshop Mockup 那样直接替换智能对象 |
| 智能对象 warp/扭曲参数 | 无法直接导出 POD 所需 `ctrlPos` |
| 透视变换完整还原 | 不能可靠得到可复用的前端变形数据 |
| 置换图/displacement | 无法自动复刻布纹、褶皱变形 |
| 图层样式完整渲染 | 阴影、内发光、颜色叠加等效果可能丢失 |
| 混合模式完整一致性 | 浏览器渲染和 Photoshop 不一定一致 |
| 内置高质量渲染器 | 它不是 Photoshop 引擎 |

所以如果 PSD 里是一个成熟 Photoshop Mockup，里面通过智能对象、图层样式、置换图、蒙版和混合模式实现真实效果，`psd.js` 无法一键把这些能力转成网页端模板。

## 推荐 PSD 分层规范

如果想让 PSD 能被程序稳定转换，建议不要依赖自由命名，而是约定图层/文件夹结构。

示例：

```text
Template_0001_法兰绒毛毯
  Scene_01
    base
    effect
    blade
    Face_01
      mask
      area
      preview
  Scene_02
    base
    effect
    blade
    Face_01
      mask
      area
```

也可以用更机器友好的命名：

```text
base__scene_01
effect__scene_01
blade__template
mask__scene_01__face_01
area__scene_01__face_01
```

命名规则建议：

| 名称 | 含义 |
| --- | --- |
| `base` | 场景底图，导出为 `scene/{templateId}/{sceneId}.jpg` |
| `effect` | 顶层高光/褶皱/遮挡，导出为 `scene/{templateId}/{sceneId}.png` |
| `mask` | 印刷区域遮罩，导出为 `*_mask.png` |
| `blade` | 编辑刀版，导出为 `blade.png` |
| `area` | 印刷面区域，用它的 bbox 生成 `x/y/width/height` |
| `face` | 一个可贴图面，可能包含 mask/area/参数 |

## 字段映射方案

从 PSD 到 POD Editor JSON，可以这样映射：

| POD 字段 | 来源 |
| --- | --- |
| `template.id` | PSD 文件名或根分组名 |
| `template.name` | PSD 文件名、根分组名或元数据 |
| `template.width` | 文档宽度或 blade/area 宽度 |
| `template.height` | 文档高度或 blade/area 高度 |
| `scene.id` | `Scene_01` 分组名 |
| `scene.effect` | 是否存在 `effect` 图层 |
| `face.mask` | `mask` 图层导出的 PNG 文件名 |
| `face.x` | `area` 或 `mask` 图层 left |
| `face.y` | `area` 或 `mask` 图层 top |
| `face.width` | `area` 或 `mask` 图层 width |
| `face.height` | `area` 或 `mask` 图层 height |
| `face.ctrlPos` | 不能从 psd.js 可靠自动得到，需要额外生成 |

## ctrlPos 如何生成

`ctrlPos` 是 3x3 贝塞尔曲面控制点，是 POD Editor 真实变形的核心。它决定用户图片如何弯曲贴到布料、杯身、桌旗等产品表面。

推荐三种来源：

### 方案 A：模板标点工具生成

做一个网页模板编辑器，加载 `base/effect/mask`，让模板制作人员拖 9 个控制点，保存为 `ctrlPos`。

优点：

- 最贴近 POD Editor 当前机制
- 前端即可完成
- 对 PSD 依赖低

缺点：

- 需要人工调点
- 模板制作需要一点经验

### 方案 B：Photoshop 脚本/UXP 导出辅助点

在 Photoshop 里写 JSX/UXP 插件，读取指定辅助点图层、路径点或标记图层，导出控制点 JSON。

优点：

- 模板师可以继续在 Photoshop 里工作
- 点位和图层一起维护

缺点：

- 需要 Photoshop 环境
- 插件开发复杂度更高

### 方案 C：从 mask/轮廓自动估算

根据 mask 的边界自动生成 3x3 控制点初稿。

优点：

- 自动化程度高
- 适合规则平面或轻微弯曲物体

缺点：

- 对布料褶皱、透视、杯身弧面不够准确
- 仍需要人工校正

推荐优先做方案 A，再补方案 C 作为“自动初稿”。

## 推荐工具链

完整工具链建议：

```text
PSD 文件
  -> psd.js 解析图层树
  -> 按命名规则识别 base/effect/mask/blade/area
  -> 导出 PNG/JPG 资源
  -> 生成 template.json 初稿
  -> 打开模板标点工具
  -> 人工调整 3x3 ctrlPos
  -> 保存最终 POD 模板
```

输出目录可以沿用当前 demo 结构：

```text
template/
  0001.jpg

scene/
  0001/
    01.jpg
    01.png
    01_mask.png
    blade.png

templates.json
```

## Node.js 伪代码

```js
const PSD = require("psd");

async function convertPsd(file) {
  const psd = await PSD.open(file);
  const tree = psd.tree().export();

  const doc = {
    width: tree.document.width,
    height: tree.document.height
  };

  const layers = flattenTree(tree.children);

  const base = findLayer(layers, "base");
  const effect = findLayer(layers, "effect");
  const blade = findLayer(layers, "blade");
  const faces = findFaceGroups(layers);

  // 实际实现中，需要根据 psd.js 的图层 image API 导出 PNG。
  await exportLayer(base, "scene/0001/01.jpg");
  await exportLayer(effect, "scene/0001/01.png");
  await exportLayer(blade, "scene/0001/blade.png");

  const template = {
    id: "0001",
    name: "模板名称",
    width: doc.width,
    height: doc.height,
    scenes: [
      {
        id: "01",
        effect: Boolean(effect),
        faces: faces.map(face => ({
          mask: `${face.id}_mask.png`,
          x: face.area.left,
          y: face.area.top,
          width: face.area.width,
          height: face.area.height,
          ctrlPos: defaultCtrlPos()
        }))
      }
    ]
  };

  return template;
}
```

这里的 `defaultCtrlPos()` 只能生成初始平面控制点，不能代表真实曲面。真实效果仍需要模板工具调整。

## 是否要用 @webtoon/psd 替代

可以考虑。`@webtoon/psd` 比老的 `psd.js` 更现代，偏 TypeScript，支持 PSD/PSB、图层像素数据、图层尺寸和偏移、文本、guides/slices 等。

但它也不是 Photoshop 渲染引擎。图层效果、智能对象变形、复杂混合模式同样不能指望一键完整还原。

选择建议：

| 选择 | 适合场景 |
| --- | --- |
| `psd.js` | 老项目、资料多、只做基础 PSD 解析 |
| `@webtoon/psd` | 新项目、希望类型更清晰、需要 PSD/PSB 和现代维护 |
| Photoshop UXP/JSX | 需要读取 Photoshop 内部智能对象、辅助点、路径等更复杂信息 |

## 最终建议

不要把 `psd.js` 当成“PSD Mockup 自动转网页模板”的完整方案。更稳的定位是：

```text
psd.js = PSD 图层和素材提取器
模板编辑器 = ctrlPos 和真实贴图参数生成器
前端渲染器 = Three.js 变形 + mask + multiply + effect 合成
```

这样可以把 PSD 的设计资产利用起来，同时避免试图在浏览器里完整复刻 Photoshop 的复杂渲染规则。

