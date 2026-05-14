# POD Editor 真实贴图原理分析

分析对象：`D:\666\demo\pod-editor-repro`

线上 demo 公开的是 Vite 打包后的静态产物，不是原始 Vue 源码。下面内容基于本地镜像中的 `assets/index-b50f9d42.js`、`assets/index-12811203.css` 和 `scene/` 素材结构反推。

## 结论

它不是简单把用户图片盖到模板上，而是用了类似 Photoshop 智能对象的分层合成思路：

1. 用户图在编辑器里先被拖拽、缩放、旋转。
2. 按模板印刷区域裁出一张临时设计图。
3. 用 Three.js 把临时设计图贴到一个高细分平面上。
4. 用 3x3 控制点和贝塞尔曲面算法把平面弯曲。
5. 导出弯曲后的透明 PNG。
6. 在预览图上用 `mask-image` 裁切到产品区域。
7. 用 `mix-blend-mode: multiply` 让图案吃进原图的阴影、褶皱和材质。
8. 再覆盖一张高光/纹理 PNG，让细节回到最上层。

真实感主要来自三件事：形变准确、遮罩精准、明暗纹理保留。

## 资源分层

以 `scene/0001/01` 为例：

```text
scene/0001/01.jpg       场景底图，1600x1600
scene/0001/01.png       顶层效果图，带透明通道，1600x1600
scene/0001/01_mask.png  印刷区域遮罩，带透明通道，1600x1600
scene/0001/blade.png    编辑器里的裁切/刀版提示图，1207x1600
```

这些资源对应的角色：

| 文件 | 作用 |
| --- | --- |
| `*.jpg` | 场景原图，保留产品、人物、环境和基础阴影 |
| `*_mask.png` | 控制用户图只显示在产品可印刷区域 |
| `*.png` | 顶层覆盖层，通常包含褶皱、高光、边缘、遮挡物等细节 |
| `blade.png` | 编辑时显示在画布上，帮助用户对齐印刷区域 |

所以最终画面大致是：

```text
底层：场景 JPG
中层：变形后的用户图，用 mask 裁切，并设置 multiply 混合
顶层：效果 PNG，补回褶皱、高光、遮挡和边缘
```

## 模板数据结构

打包 JS 里有一组模板配置，结构类似：

```js
{
  id: "0001",
  name: "法兰绒毛毯",
  width: 1207,
  height: 1600,
  scenes: [
    {
      id: "01",
      effect: true,
      faces: [
        {
          mask: "01_mask.png",
          x: 196.5,
          y: 0,
          width: 1207,
          height: 1600,
          ctrlPos: [
            { x: -66.5, y: 85.1, z: 0 },
            { x: 2.4, y: 73.8, z: 0 },
            { x: 69.7, y: 84.6, z: 0 },
            ...
          ]
        }
      ]
    }
  ]
}
```

重点是 `faces`。一个场景可以有多个贴图面，比如桌旗可能分成左、中、右三个面，每个面独立变形、独立遮罩。

每个 face 里最关键的是：

| 字段 | 作用 |
| --- | --- |
| `x/y/width/height` | 从用户设计画布中裁取对应区域 |
| `mask` | 当前面的裁切遮罩 |
| `ctrlPos` | 3x3 形变控制点，用来生成弯曲曲面 |

## 编辑阶段：Konva 负责用户图操作

用户点击左侧图片后，代码把图片放进 Konva Stage：

```js
new Konva.Image({
  x,
  y,
  image,
  width,
  height,
  draggable: true
})
```

然后给它挂上 `Transformer`，让用户可以缩放、旋转、拖拽。代码监听的是 `dragend` 和 `transformend`，每次操作结束都会重新生成预览。

这一步只负责记录用户图的位置状态：

```text
x, y, width, height, scaleX, scaleY, rotation, image
```

## 裁图阶段：从用户图生成 face 输入图

打包代码里有一个 `SA.create(face, imageAttrs)` 方法。它会创建一张临时 canvas：

```js
canvas.width = face.width
canvas.height = face.height
```

然后把用户图片按当前拖拽、缩放、旋转状态画进去。

关键细节：代码中有一个固定比例 `v = 4`。这是因为编辑器画布是 400px，而场景/预览素材通常按 1600px 制作，比例正好是 4 倍。

简化伪代码：

```js
function cropFace(face, imageAttrs) {
  const canvas = document.createElement("canvas");
  canvas.width = face.width;
  canvas.height = face.height;

  const scale = 4;
  const drawX = imageAttrs.x * scale - face.x;
  const drawY = imageAttrs.y * scale - face.y;
  const drawW = imageAttrs.width * imageAttrs.scaleX * scale;
  const drawH = imageAttrs.height * imageAttrs.scaleY * scale;

  ctx.translate(drawX, drawY);
  ctx.rotate(imageAttrs.rotation * Math.PI / 180);
  ctx.translate(-drawX, -drawY);
  ctx.drawImage(imageAttrs.image, drawX, drawY, drawW, drawH);

  return canvas.toDataURL("image/png");
}
```

这一步输出的是“当前印刷面应该看到的用户图”，但还没有弯曲。

## 形变阶段：Three.js 细分平面 + 贝塞尔曲面

真实贴合的核心在这里。

代码创建了一个 Three.js 场景，加载上一步输出的设计图作为纹理，再创建一个 `PlaneGeometry(200, 200, 32, 32)`。也就是说，它不是四个角拉伸，而是把平面切成 32x32 的网格。

然后根据 `ctrlPos` 的 3x3 控制点，用 Bernstein 多项式计算每个网格点的新位置。代码里有类似这样的函数：

```js
bernstein(n, i, t) =
  factorial(n) / (factorial(i) * factorial(n - i))
  * Math.pow(1 - t, n - i)
  * Math.pow(t, i)
```

二维曲面插值的简化形式：

```js
for each vertex(u, v):
  position = sum(
    controlPoint[i][j]
    * bernstein(2, i, u)
    * bernstein(2, j, v)
  )
```

这就是它能贴合布料弯曲、杯身弧面、桌旗透视的原因。普通四点透视只能处理平面倾斜，这里用 3x3 控制点可以表达中间鼓起、边缘下垂、左右弯曲等非线性形变。

Three.js 渲染完成后，代码调用：

```js
renderer.domElement.toDataURL("image/png")
```

得到一张透明 PNG，赋值给当前 face 的 `url`。

## 合成阶段：CSS mask + multiply

预览 DOM 的层级可以简化成：

```html
<div class="preview-item">
  <img src="./scene/0001/01.jpg">
  <div
    class="mask"
    style="
      background: url(变形后的用户图);
      mask-image: url(./scene/0001/01_mask.png);
    "
  ></div>
  <img src="./scene/0001/01.png">
</div>
```

对应 CSS 关键规则：

```css
.mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply !important;
  mask-repeat: no-repeat !important;
  mask-position: center !important;
  mask-size: cover !important;
  background-size: contain !important;
}
```

`mask-image` 负责让用户图只出现在毛毯、花盆、桌旗等产品区域。

`mix-blend-mode: multiply` 是真实感的另一个关键。它会把用户图和底图做正片叠底混合，底图上的阴影会压到用户图上，所以图案看起来像印在材质里，而不是浮在表面。

最后的 `01.png` 顶层覆盖会把褶皱、高光、遮挡边缘再盖回来。比如毛毯的布纹、人物手臂遮挡、杯子高光，都可以通过这层恢复。

## 为什么效果看起来真实

### 1. 形状贴合

`ctrlPos` 定义了产品表面的弯曲形态，Three.js 细分网格负责把图案弯过去。相比 CSS transform 或四点透视，它能表达更复杂的曲面。

### 2. 边界精准

`*_mask.png` 是按场景图人工或工具生成的 alpha 遮罩。用户图不会溢出到人物、桌面或产品外部。

### 3. 明暗保留

`multiply` 会保留底图阴影，使图案自然融进原图。顶层 PNG 又补回高光和褶皱，所以不会显得像一张干净图片硬贴上去。

### 4. 多面拆分

复杂产品会拆成多个 face，每个 face 有自己的遮罩和控制点。这样可以分别处理不同方向、不同透视、不同曲率的表面。

## 如果要自己复现

最小可行方案：

1. 准备三层素材：
   - 场景底图 `scene.jpg`
   - 印刷区域遮罩 `mask.png`
   - 顶层高光/褶皱图 `effect.png`
2. 给每个印刷区域配置：
   - 裁切位置 `x/y/width/height`
   - 3x3 控制点 `ctrlPos`
3. 用 Konva 或 Canvas 实现用户图拖拽、缩放、旋转。
4. 把用户图按 face 裁成临时 canvas。
5. 用 Three.js：
   - `PlaneGeometry(200, 200, 32, 32)`
   - 用户图作为 texture
   - 根据 3x3 贝塞尔控制点重写每个顶点坐标
   - 渲染成透明 PNG
6. 在 DOM 或 Canvas 中合成：
   - 先画底图
   - 画变形图，并用 mask 裁切
   - 使用 multiply 混合
   - 再画顶层 effect

## 关键代码骨架

```js
async function renderFace(previewEl, face, userImageAttrs) {
  const cropped = cropFace(face, userImageAttrs);
  const warped = await warpByBezierSurface(previewEl, face.ctrlPos, cropped);
  face.url = warped;
}

function composePreview(scene) {
  return `
    <div class="preview-item">
      <img src="./scene/${scene.templateId}/${scene.id}.jpg">
      ${scene.faces.map(face => `
        <div
          class="mask"
          style="
            background:url(${face.url});
            mask-image:url(./scene/${scene.templateId}/${face.mask});
          "
        ></div>
      `).join("")}
      ${scene.effect ? `<img src="./scene/${scene.templateId}/${scene.id}.png">` : ""}
    </div>
  `;
}
```

## 注意点

- 控制点不是自动算出来的，通常需要模板制作工具或人工调整。
- `mask.png` 的精度直接决定边缘是否真实。
- 顶层 `effect.png` 决定材质感，尤其是布料褶皱、高光、遮挡关系。
- 只用 `multiply` 会让图案偏暗，生产级系统通常还会提供亮度、对比度、透明度或其他混合模式调节。
- 如果要导出高清生产图，不能只拿 400px 预览，需要按原始模板尺寸重新渲染一次。

