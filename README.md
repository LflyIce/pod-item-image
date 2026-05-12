# pod-item-image

2D POD product customizer MVP for door curtains and floor mats.

## Features

- Vite + React + TypeScript frontend
- Konva-based image editing canvas
- Real-time door-curtain mockup preview
- Product/material library, upload flow, text layer, tiling, resizing, cart/order mock flow

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
npm run analyze:mockup
```

## Mockup asset pipeline

The preview compositor consumes precomputed product-surface assets:

- `maskImage` limits replacement to the printable surface.
- `shadowImage` and `highlightImage` preserve folds, shadows, and highlights.
- `normalImage` is reserved for displacement/normal-map shading.
- `warpPoints` drive perspective transform before Konva renders the preview image.

Install backend dependencies with `pip install -r backend/requirements.txt`, then run `npm run analyze:mockup` to regenerate the door-curtain assets.
