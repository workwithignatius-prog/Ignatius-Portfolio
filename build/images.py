#!/usr/bin/env python3
"""Makes smaller WebP copies of the site's photos, so pages load quickly on phones.

Usage: python3 build/images.py site [another/site ...]   (needs Pillow: pip install pillow)

For every JPEG under <site>/assets it writes <name>-<width>w.webp next to the photo: one for each
width in WIDTHS that is smaller than the photo, plus one at the photo's own width (WebP is much lighter
than JPEG at the same size). Copies that are already up to date are skipped. The build (build/build.mjs)
lists whichever copies exist in each image's srcset, so a browser downloads the smallest one that still
looks sharp on its screen. Without the copies, pages use the original photos.

The deploy workflow runs this before every build, so the copies are never committed (see .gitignore).
"""
import pathlib
import sys

from PIL import Image, ImageOps

WIDTHS = [160, 480, 800, 1200, 1600]


def main(roots):
    made = 0
    for root in roots:
        for src in sorted(pathlib.Path(root, "assets").rglob("*")):
            if src.suffix.lower() not in (".jpg", ".jpeg"):
                continue
            with Image.open(src) as opened:
                im = ImageOps.exif_transpose(opened).convert("RGB")
            for w in [w for w in WIDTHS if w < im.width] + [im.width]:
                out = src.with_name(f"{src.stem}-{w}w.webp")
                if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
                    continue
                im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
                made += 1
    print(f"Made {made} smaller photo cop{'y' if made == 1 else 'ies'}")


if __name__ == "__main__":
    main(sys.argv[1:] or ["site"])
