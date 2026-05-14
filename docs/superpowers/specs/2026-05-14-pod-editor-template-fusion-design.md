# POD Editor Template Fusion Design

## Goal

Upgrade the current POD customizer so it can use the demo's realistic POD Editor template model: scene base images, print masks, top effect overlays, multi-face templates, and 3x3 Bezier surface control points.

## Current Context

The project already supports a Konva-based design editor and a 2D preview pipeline with base images, masks, highlights, normal displacement, and four-point perspective warping. The demo under `demo/pod-editor-repro` adds a richer template model:

- A template has multiple scenes.
- A scene has one base JPG, an optional effect PNG, and one or more faces.
- Each face has a mask, a crop rectangle in design space, and nine `ctrlPos` control points.
- User artwork is rendered into each face crop, warped through a Bezier surface mesh, clipped with the face mask, blended into the base image, then covered by the effect layer.

## Recommended Approach

Add the demo template model alongside the existing product mockup model. Keep the existing four-point and layered preview modes as fallbacks, then add a new POD template mode when `product.mockup.podTemplate` is present.

This keeps current door-curtain behavior stable while allowing imported demo templates to use realistic multi-face rendering. The first integration will use template data extracted from the bundled demo and assets copied into `public/assets/pod-editor`.

## Architecture

- `src/domain/podTemplate.ts` defines template, scene, face, and control point types plus path helpers.
- `src/domain/bezierSurface.ts` evaluates 3x3 Bezier control grids and creates canvas-renderable mesh points.
- `src/domain/previewCompositing.ts` recognizes the new render mode.
- `src/ui/App.tsx` adds demo template selection and routes preview rendering into the POD template pipeline.
- `public/assets/pod-editor` contains copied demo assets for templates, scenes, and example images.

## Data Flow

1. The editor still stores user layers in the existing `DesignProject`.
2. The preview renderer draws the selected design layers to an offscreen design canvas.
3. For each scene face, the renderer crops the design canvas according to `face.x/y/width/height`.
4. The cropped face canvas is warped through the 3x3 Bezier surface mesh.
5. The warped face is clipped by its mask and blended over the scene base with multiply-style shading.
6. The scene effect PNG is drawn last when present.

## Error Handling

- Missing POD template data falls back to the existing preview modes.
- Missing scene/effect/mask images skip only that layer instead of breaking the whole preview.
- Invalid control point arrays fall back to a flat 3x3 grid so the user still gets a visible preview.

## Testing

- Unit tests cover Bezier basis behavior, center interpolation, mesh size, template path generation, and render-mode selection.
- Existing preview and mockup tests should continue to pass.
- Build verification confirms TypeScript and Vite accept the new pipeline.

