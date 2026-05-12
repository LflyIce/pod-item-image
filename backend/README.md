# Mockup Analyzer Backend

This backend generates the product-surface assets consumed by the Konva preview:

- mask image: printable surface alpha
- shadow image: transparent black fold/shadow layer
- highlight image: transparent white highlight layer
- normal image: RGB normal-like map for future displacement/shader work
- metadata JSON: texture area, polygon, warp points, and blend parameters

Run the local fallback generator:

```bash
pip install -r backend/requirements.txt
python backend/mockup_analyzer.py --base public/assets/door-curtain-base.png --out public/assets --prefix door-curtain --box 154 143 310 402 --mask-name curtain-mask.png
```

The fallback uses the provided box as the segmentation prompt. A SAM2 or ONNX adapter can replace `build_box_mask` without changing the frontend contract.

Run as an API:

```bash
uvicorn backend.mockup_analyzer:app --reload --port 8787
```
