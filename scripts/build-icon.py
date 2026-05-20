#!/usr/bin/env python3
"""Render media/icon.png (128x128) from the same geometry as media/icon.svg.

Renders at 4x with antialiasing, downsamples via LANCZOS. Run when palette
or geometry changes; the PNG is checked in.
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "media" / "icon.png"
SIZE = 128
SCALE = 4

BG = "#0a1929"
BG_RADIUS = 24
INSET = 12
BAR_H = 8.62
Y_STEP = 13.54
BAR_RADIUS = 3.69

BARS = [
    (103.38, "#0c5e87"),
    ( 94.05, "#0c5e87"),
    ( 73.05, "#0d7eaa"),
    ( 56.22, "#0d7eaa"),
    ( 55.30, "#2099c6"),
    ( 65.83, "#4fd1c5"),
    ( 78.95, "#4fd1c5"),
    ( 84.78, "#7cc8e2"),
]


def render(scale: int) -> Image.Image:
    s = SIZE * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=BG_RADIUS * scale, fill=BG)
    x0 = INSET * scale
    y0 = INSET * scale
    for i, (w, color) in enumerate(BARS):
        x1 = x0 + w * scale
        y_top = y0 + i * Y_STEP * scale
        y_bot = y_top + BAR_H * scale
        d.rounded_rectangle([x0, y_top, x1, y_bot], radius=BAR_RADIUS * scale, fill=color)
    return img


def main() -> None:
    big = render(SCALE)
    out = big.resize((SIZE, SIZE), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
