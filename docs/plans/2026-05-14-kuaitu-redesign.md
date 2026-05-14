# POD 定制平台重设计 — 对标快图设计

## 目标
将现有 pod-item-image MVP 改造为类似快图设计（kuaitu.cc）的完整 POD 定制平台。

## 技术栈
- React 19 + Konva（保留）
- Vite + TypeScript
- CSS（不用 UI 库，自写组件，保持轻量）
- 纯前端（localStorage 持久化，后端后续加）

## 整体布局（对标快图）

```
┌─────────────────────────────────────────────────────────┐
│  顶栏: Logo | 产品选择 | 保存 | 预览 | 加入购物车 | 下载  │
├──────┬──────────────────────────────┬───────────────────┤
│      │                              │                   │
│ 左侧 │     中间画布编辑区              │   右侧属性面板     │
│ 工具栏 │    (Konva Stage)             │   图层/文字/图片   │
│      │                              │   属性编辑         │
│ 图库  │                              │                   │
│ 模板  │                              │                   │
│ 文字  │                              │                   │
│ 背景  │                              │                   │
│ 素材  │                              │                   │
│ 图层  │                              │                   │
├──────┴──────────────────────────────┴───────────────────┤
│  底部: 缩放控制 | 画布尺寸信息 | 质量指示器                    │
└─────────────────────────────────────────────────────────┘
```

## 实现计划（按任务拆分）

### Task 1: UI 重设计 — 布局与样式
**目标**: 三栏布局 + 顶栏 + 底栏，整体风格对标 Figma/Canva/快图

文件改动:
- `src/ui/styles.css` — 完全重写
- `src/ui/App.tsx` — 布局结构重构

UI 设计规范:
- 深色左侧栏 (#1e293b 背景)
- 白色中间画布区
- 浅灰右侧属性面板 (#f8fafc)
- 顶栏: 白底，底部1px边框
- 圆角按钮、hover 效果、过渡动画
- 配色: 主色 slate-700，强调色 indigo-500

### Task 2: 左侧面板 — 图库/模板/文字/背景/素材/图层
**目标**: 6个 Tab 的左侧资源面板

新增文件:
- `src/ui/left-panel/AssetLibrary.tsx` — 图库 Tab（示例素材 + 上传）
- `src/ui/left-panel/TemplateList.tsx` — 模板 Tab（预设模板列表）
- `src/ui/left-panel/TextPanel.tsx` — 文字 Tab（预设文字样式 + 添加文字）
- `src/ui/left-panel/BackgroundPanel.tsx` — 背景 Tab（纯色/渐变/图片背景）
- `src/ui/left-panel/LayersPanel.tsx` — 图层面板（图层列表、排序、锁定、隐藏）
- `src/ui/left-panel/LeftPanel.tsx` — 面板容器（Tab 切换）

### Task 3: 右侧属性面板
**目标**: 选中元素后显示对应属性编辑器

新增文件:
- `src/ui/right-panel/PropertyPanel.tsx` — 属性面板容器
- `src/ui/right-panel/TextPropertyEditor.tsx` — 文字属性（字体/大小/颜色/粗细/对齐/描边/阴影）
- `src/ui/right-panel/ImagePropertyEditor.tsx` — 图片属性（透明度/混合模式/平铺）
- `src/ui/right-panel/CanvasPropertyEditor.tsx` — 画布属性（尺寸/背景）
- `src/ui/right-panel/ProductPropertyEditor.tsx` — 产品属性（变体切换）

### Task 4: 编辑器增强 — 撤销/重做/对齐/网格/快捷键
**目标**: 编辑器核心功能完善

新增/修改文件:
- `src/domain/history.ts` — 历史记录系统（undo/redo）
- `src/domain/alignment.ts` — 对齐工具（左/中/右/上/中/下对齐、分布）
- `src/domain/editorActions.ts` — 扩展（网格吸附、多选、锁定、隐藏）
- `src/ui/hooks/useHotkeys.ts` — 快捷键 Hook（Ctrl+Z/Y/C/V/Delete）
- `src/ui/hooks/useHistory.ts` — 历史记录 Hook

### Task 5: 文字编辑增强
**目标**: 丰富的文字编辑功能

修改:
- `src/domain/types.ts` — TextLayer 增加 strokeColor/strokeWidth/shadowColor/shadowBlur/textAlign/lineHeight
- `src/domain/design.ts` — 文字创建/更新逻辑
- Konva 文字渲染增加描边/阴影/对齐

### Task 6: 模板系统
**目标**: 预设模板 + JSON 存储 + 一键应用

新增文件:
- `src/domain/templates.ts` — 模板数据（10+ 预设模板）
- `src/ui/left-panel/TemplateCard.tsx` — 模板卡片组件

模板覆盖产品: 门帘(3)、地垫(3)、T恤(2)、马克杯(2)

### Task 7: 更多产品类型
**目标**: 新增 T恤、马克杯、手机壳、帆布袋

修改:
- `src/domain/catalog.ts` — 新增 4 个产品定义
- `src/domain/types.ts` — ProductId 联合类型扩展
- `public/assets/` — 新增产品底图/蒙版图

### Task 8: 预览系统 + 效果图生成
**目标**: 设计预览 + 透视变换效果图导出

增强:
- 预览弹窗（保留现有透视变换 + 蒙版融合）
- 导出高清设计图（Canvas toDataURL/toBlob）
- 导出生产 JSON

### Task 9: 购物车 + 订单增强
**目标**: 完整的购物车/结算/订单管理

新增:
- `src/ui/CartDrawer.tsx` — 购物车抽屉
- `src/ui/OrderHistory.tsx` — 订单历史
- localStorage 持久化

### Task 10: 产品选择页（首页）
**目标**: 用户进入后先选产品

新增:
- `src/ui/ProductSelector.tsx` — 产品选择网格页
- 路由: 首页 → 选产品 → 编辑器

## 执行顺序

Batch 1（核心 UI + 编辑器）: Task 1 + 2 + 3 + 5
Batch 2（功能增强）: Task 4 + 6 + 8
Batch 3（产品扩展 + 完整闭环）: Task 7 + 9 + 10

每个 Batch 派一个子代理执行，完成后验证 build。
