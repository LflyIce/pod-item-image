# POD Editor Template Fusion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add POD Editor-style multi-scene, multi-face, Bezier-surface mockup rendering using the demo templates and assets.

**Architecture:** Keep the existing mockup renderer as the default fallback and add a new POD template branch when `product.mockup.podTemplate` is configured. Domain modules hold the template shape and Bezier math; `App.tsx` only selects templates and invokes the preview pipeline.

**Tech Stack:** Vite, React, TypeScript, Vitest, Canvas 2D, existing Konva editor.

---

## File Structure

- Create `src/domain/podTemplate.ts`: POD template types, demo template data, asset path helpers, flat fallback control grid.
- Create `src/domain/podTemplate.test.ts`: template data and path tests.
- Create `src/domain/bezierSurface.ts`: Bernstein basis, 3x3 Bezier evaluation, mesh creation.
- Create `src/domain/bezierSurface.test.ts`: Bezier and mesh tests.
- Modify `src/domain/types.ts`: add optional POD template metadata to `Product.mockup`.
- Modify `src/domain/previewCompositing.ts`: add `pod-template-2d` render mode.
- Modify `src/domain/previewCompositing.test.ts`: cover the new mode.
- Modify `src/ui/App.tsx`: template selector state, preview rendering path, image loading for scene/mask/effect assets.
- Copy demo assets into `public/assets/pod-editor`.

### Task 1: POD Template Domain

**Files:**
- Create: `src/domain/podTemplate.test.ts`
- Create: `src/domain/podTemplate.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/podTemplate.test.ts`
Expected: FAIL because `src/domain/podTemplate.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create the exported POD template types, helper functions, and the demo template constants extracted from the bundled demo JS for templates `0001`, `0002`, and `0003`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/podTemplate.test.ts`
Expected: PASS.

### Task 2: Bezier Surface Domain

**Files:**
- Create: `src/domain/bezierSurface.test.ts`
- Create: `src/domain/bezierSurface.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { createBezierSurfaceMesh, evaluateBezierSurface, quadraticBernstein } from './bezierSurface';
import { createFlatCtrlPos } from './podTemplate';

describe('Bezier surface renderer math', () => {
  it('evaluates quadratic Bernstein basis at the center', () => {
    expect(quadraticBernstein(0, 0.5)).toBeCloseTo(0.25);
    expect(quadraticBernstein(1, 0.5)).toBeCloseTo(0.5);
    expect(quadraticBernstein(2, 0.5)).toBeCloseTo(0.25);
  });

  it('maps the center of a flat control grid to the center destination', () => {
    expect(evaluateBezierSurface(createFlatCtrlPos(), 0.5, 0.5)).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('creates a renderable grid mesh with two triangles per cell', () => {
    const mesh = createBezierSurfaceMesh(createFlatCtrlPos(), 2, 2, 500, 500);

    expect(mesh.points).toHaveLength(9);
    expect(mesh.triangles).toHaveLength(8);
    expect(mesh.points[0]).toMatchObject({ u: 0, v: 0 });
    expect(mesh.points[8]).toMatchObject({ u: 1, v: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/bezierSurface.test.ts`
Expected: FAIL because `src/domain/bezierSurface.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement `quadraticBernstein`, `evaluateBezierSurface`, and `createBezierSurfaceMesh`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/bezierSurface.test.ts`
Expected: PASS.

### Task 3: Render Mode and Type Integration

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/previewCompositing.ts`
- Modify: `src/domain/previewCompositing.test.ts`

- [ ] **Step 1: Write the failing test**

Add a test asserting that a product with `mockup.podTemplate` uses `pod-template-2d`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/previewCompositing.test.ts`
Expected: FAIL because the render mode type and branch do not exist.

- [ ] **Step 3: Write minimal implementation**

Add an optional `podTemplate` field and return `pod-template-2d` before checking `warpPoints`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/previewCompositing.test.ts`
Expected: PASS.

### Task 4: UI and Preview Pipeline

**Files:**
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/styles.css` if selector styling is needed.

- [ ] **Step 1: Write a compile-focused failing test through the build**

Run: `npm run build`
Expected before implementation: TypeScript fails when UI references new renderer helpers that have not yet been wired.

- [ ] **Step 2: Implement the preview branch**

Add template selection state, draw selected template scene base, render warped faces from the design canvas, apply masks, blend with multiply-like opacity, and draw effect PNG last.

- [ ] **Step 3: Run tests and build**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

### Task 5: Assets and Browser Verification

**Files:**
- Copy: `demo/pod-editor-repro/template/*` to `public/assets/pod-editor/template/`
- Copy: `demo/pod-editor-repro/scene/0001`, `0002`, `0003` to `public/assets/pod-editor/scene/`
- Copy: selected `demo/pod-editor-repro/images/*` to `public/assets/pod-editor/images/`

- [ ] **Step 1: Copy assets**

Use PowerShell `Copy-Item` into `public/assets/pod-editor`.

- [ ] **Step 2: Run app locally**

Run: `npm run dev -- --port 5173`
Expected: Vite starts on `http://127.0.0.1:5173/`.

- [ ] **Step 3: Verify in browser**

Open the local app, select a demo template, apply a sample image, and confirm a nonblank preview with base, artwork, mask, and effect layers visible.

