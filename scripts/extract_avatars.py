"""
Extract high-resolution character sprites from the concept art sheet.
Target characters:
- Linguist - Runeguard (Kaelen) -> public/assets/avatars/linguist_runeguard.png
- Elena - Archivist (Lyanna / Elena) -> public/assets/avatars/elena_archivist.png
- Draconic Mentor - Glaurung (Ignisaur / Glaurung) -> public/assets/avatars/draconic_mentor.png
- Miniature Automaton - Trixie (Trixie) -> public/assets/avatars/miniature_automaton.png
"""

import os
import math
from collections import deque
from PIL import Image

SRC_PATH = r"C:/Users/Administrator/.gemini/antigravity/brain/95d04fa5-eee4-41eb-ab59-3c9e1d29acc3/.user_uploaded/media_1791220040125.png"
OUT_DIR = r"public/assets/avatars"
BG_R, BG_G, BG_B = 242, 236, 222

def color_dist(c):
    return math.sqrt((c[0] - BG_R)**2 + (c[1] - BG_G)**2 + (c[2] - BG_B)**2)

def extract_character(crop_box, mask_fn, inner_holes, out_name, keep_multiple_islands=False):
    img = Image.open(SRC_PATH).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Mask out neighbouring character regions
    for y in range(h):
        for x in range(w):
            if mask_fn(x, y):
                pixels[x, y] = (BG_R, BG_G, BG_B, 255)
                
    crop = img.crop(crop_box)
    cw, ch = crop.size
    cpixels = crop.load()
    
    visited = set()
    queue = deque()
    for x in range(cw):
        queue.append((x, 0))
        queue.append((x, ch - 1))
    for y in range(ch):
        queue.append((0, y))
        queue.append((cw - 1, y))
    for pt in inner_holes:
        if 0 <= pt[0] < cw and 0 <= pt[1] < ch:
            queue.append(pt)
            
    for x, y in list(queue):
        visited.add((x, y))
        
    exterior_bg = set()
    while queue:
        x, y = queue.popleft()
        c = cpixels[x, y]
        d = color_dist(c)
        if d < 46:
            exterior_bg.add((x, y))
            for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
                if 0 <= nx < cw and 0 <= ny < ch and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    nc = cpixels[nx, ny]
                    if color_dist(nc) < 52:
                        queue.append((nx, ny))
                        
    res = crop.copy()
    rpixels = res.load()
    for (x, y) in exterior_bg:
        c = cpixels[x, y]
        d = color_dist(c)
        if d < 20:
            rpixels[x, y] = (c[0], c[1], c[2], 0)
        else:
            alpha = int(((d - 20) / (52 - 20)) * 255)
            a_norm = max(alpha / 255.0, 0.05)
            fg_r = int(max(0, min(255, (c[0] - (1 - a_norm) * BG_R) / a_norm)))
            fg_g = int(max(0, min(255, (c[1] - (1 - a_norm) * BG_G) / a_norm)))
            fg_b = int(max(0, min(255, (c[2] - (1 - a_norm) * BG_B) / a_norm)))
            rpixels[x, y] = (fg_r, fg_g, fg_b, alpha)
            
    # Clean disconnected speckles
    rw, rh = res.size
    respix = res.load()
    vis = set()
    islands = []
    for y in range(rh):
        for x in range(rw):
            if respix[x, y][3] > 10 and (x, y) not in vis:
                island = []
                q = deque([(x, y)])
                vis.add((x, y))
                while q:
                    cx, cy = q.popleft()
                    island.append((cx, cy))
                    for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1),
                                  (cx+1, cy+1), (cx-1, cy-1), (cx+1, cy-1), (cx-1, cy+1)]:
                        if 0 <= nx < rw and 0 <= ny < rh and (nx, ny) not in vis:
                            if respix[nx, ny][3] > 10:
                                vis.add((nx, ny))
                                q.append((nx, ny))
                islands.append(island)
                
    islands.sort(key=len, reverse=True)
    if islands:
        # keep_multiple_islands: for Kaelen, keep the flying fox familiar (island size > 3000)
        for isl in islands[1:]:
            if keep_multiple_islands and len(isl) > 2000:
                continue
            for (x, y) in isl:
                respix[x, y] = (0, 0, 0, 0)
                
    # Auto-crop bounding box of non-zero alpha pixels + 8px padding
    bbox = res.getbbox()
    if bbox:
        pad = 8
        bx1 = max(0, bbox[0] - pad)
        by1 = max(0, bbox[1] - pad)
        bx2 = min(cw, bbox[2] + pad)
        by2 = min(ch, bbox[3] + pad)
        res = res.crop((bx1, by1, bx2, by2))
        
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, out_name)
    res.save(out_path, optimize=True)
    print(f"Saved {out_path} ({res.size[0]}x{res.size[1]})")

def main():
    print("Extracting avatars...")
    # 1. Kaelen
    extract_character(
        crop_box=(25, 95, 320, 500),
        mask_fn=lambda x, y: (y >= 225 and x > 284) or (y > 285 and x > 288),
        inner_holes=[(10, 10), (10, 390), (85, 300), (155, 330), (115, 140)],
        out_name="linguist_runeguard.png",
        keep_multiple_islands=True
    )
    # 2. Elena
    extract_character(
        crop_box=(280, 115, 555, 500),
        mask_fn=lambda x, y: (y < 225 and x < 322) or (y >= 285 and x < 290) or (y > 350 and x > 548),
        inner_holes=[(10, 10), (260, 10), (220, 150), (225, 230), (230, 280), (105, 365)],
        out_name="elena_archivist.png",
        keep_multiple_islands=False
    )
    # 3. Glaurung
    extract_character(
        crop_box=(525, 15, 860, 500),
        mask_fn=lambda x, y: (x < 552 and y < 195) or (x < 536 and y >= 195) or (x > 840 and y >= 322),
        inner_holes=[(10, 10), (320, 10), (20, 200), (310, 440)],
        out_name="draconic_mentor.png",
        keep_multiple_islands=False
    )
    # 4. Trixie
    extract_character(
        crop_box=(825, 318, 995, 500),
        mask_fn=lambda x, y: (y < 324) or (x < 848),
        inner_holes=[(10, 10), (150, 10), (55, 155)],
        out_name="miniature_automaton.png",
        keep_multiple_islands=False
    )
    print("Avatar extraction complete!")

if __name__ == "__main__":
    main()
