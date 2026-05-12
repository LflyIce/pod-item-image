from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

import numpy as np
from PIL import Image, ImageFilter


def clamp(value: np.ndarray | float, minimum: float, maximum: float):
    return np.minimum(np.maximum(value, minimum), maximum)


def luminance(rgb: np.ndarray) -> np.ndarray:
    return (0.2126 * rgb[..., 0]) + (0.7152 * rgb[..., 1]) + (0.0722 * rgb[..., 2])


def build_box_mask(size: tuple[int, int], box: tuple[int, int, int, int]) -> Image.Image:
    width, height = size
    x1, y1, x2, y2 = box
    alpha = np.zeros((height, width), dtype=np.uint8)
    alpha[max(0, y1):min(height, y2), max(0, x1):min(width, x2)] = 255
    alpha = np.array(Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=1.2)))
    rgba = np.zeros((height, width, 4), dtype=np.uint8)
    rgba[..., 0:3] = 255
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, mode="RGBA")


def build_lighting_assets(base: Image.Image, mask: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    rgb = np.array(base.convert("RGB"), dtype=np.float32)
    mask_arr = np.array(mask.convert("L"), dtype=np.float32) / 255.0
    lum = luminance(rgb)
    active = mask_arr > 0.12
    mean = float(lum[active].mean()) if np.any(active) else float(lum.mean())
    delta = lum - mean

    shadow_alpha = clamp((-delta - 2.0) * 1.45, 0, 115) * mask_arr
    highlight_alpha = clamp((delta - 3.0) * 1.15, 0, 96) * mask_arr

    shadow = np.zeros((*lum.shape, 4), dtype=np.uint8)
    shadow[..., 3] = shadow_alpha.astype(np.uint8)

    highlight = np.zeros((*lum.shape, 4), dtype=np.uint8)
    highlight[..., 0:3] = 255
    highlight[..., 3] = highlight_alpha.astype(np.uint8)

    gy, gx = np.gradient(lum)
    nx = clamp(128 - gx * 0.7, 0, 255)
    ny = clamp(128 - gy * 0.7, 0, 255)
    normal = np.zeros((*lum.shape, 4), dtype=np.uint8)
    normal[..., 0] = nx.astype(np.uint8)
    normal[..., 1] = ny.astype(np.uint8)
    normal[..., 2] = 255
    normal[..., 3] = (mask_arr * 255).astype(np.uint8)

    return (
        Image.fromarray(shadow, mode="RGBA"),
        Image.fromarray(highlight, mode="RGBA"),
        Image.fromarray(normal, mode="RGBA"),
    )


def analyze_mockup(
    base_path: Path,
    out_dir: Path,
    prefix: str,
    box: tuple[int, int, int, int],
    mask_name: str | None = None,
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    base = Image.open(base_path).convert("RGBA")
    mask = build_box_mask(base.size, box)
    shadow, highlight, normal = build_lighting_assets(base, mask)

    x1, y1, x2, y2 = box
    polygon = [
        {"x": x1, "y": y1},
        {"x": x2, "y": y1},
        {"x": x2, "y": y2},
        {"x": x1, "y": y2},
    ]

    mask_file = mask_name or f"{prefix}-mask.png"
    files = {
        "maskImage": mask_file,
        "shadowImage": f"{prefix}-shadow.png",
        "highlightImage": f"{prefix}-highlight.png",
        "normalImage": f"{prefix}-normal.png",
    }

    mask.save(out_dir / files["maskImage"])
    shadow.save(out_dir / files["shadowImage"])
    highlight.save(out_dir / files["highlightImage"])
    normal.save(out_dir / files["normalImage"])

    metadata = {
        "textureArea": {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1},
        "texturePolygon": polygon,
        "maskImage": f"/assets/{files['maskImage']}",
        "shadowImage": f"/assets/{files['shadowImage']}",
        "shadowOpacity": 0.26,
        "highlightImage": f"/assets/{files['highlightImage']}",
        "highlightOpacity": 0.2,
        "normalImage": f"/assets/{files['normalImage']}",
        "normalStrength": 0.16,
        "textureBlendMode": "soft-light",
        "textureOpacity": 0.32,
        "warpPoints": {
            "src": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 1, "y": 1}, {"x": 0, "y": 1}],
            "dst": polygon,
        },
    }
    (out_dir / f"{prefix}-mockup.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def parse_box(values: Iterable[str]) -> tuple[int, int, int, int]:
    items = tuple(int(value) for value in values)
    if len(items) != 4:
        raise argparse.ArgumentTypeError("--box requires x1 y1 x2 y2")
    return items


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate POD mockup segmentation and lighting assets.")
    parser.add_argument("--base", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--box", required=True, nargs=4)
    parser.add_argument("--mask-name")
    args = parser.parse_args()

    metadata = analyze_mockup(
        base_path=args.base,
        out_dir=args.out,
        prefix=args.prefix,
        box=parse_box(args.box),
        mask_name=args.mask_name,
    )
    print(json.dumps(metadata, indent=2))


try:
    from fastapi import FastAPI
    from pydantic import BaseModel

    class AnalyzeRequest(BaseModel):
        base: str
        out: str = "public/assets"
        prefix: str
        box: tuple[int, int, int, int]
        maskName: str | None = None

    app = FastAPI(title="POD Mockup Analyzer")

    @app.post("/api/mockup/analyze")
    def analyze(request: AnalyzeRequest):
        return analyze_mockup(
            base_path=Path(request.base),
            out_dir=Path(request.out),
            prefix=request.prefix,
            box=request.box,
            mask_name=request.maskName,
        )
except Exception:
    app = None


if __name__ == "__main__":
    main()
