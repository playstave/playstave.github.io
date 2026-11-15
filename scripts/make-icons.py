#!/usr/bin/env python3
"""
Draws Stave's app icons (the logo mark: a note head on a fragment of staff)
as PNG files, with no image libraries — so they can be regenerated anywhere.

    python3 scripts/make-icons.py

Writes to public/icons/. Shapes match public/favicon.svg (32-unit grid).
"""
import math, os, struct, zlib

INK = (0x1d, 0x1b, 0x17)
PAPER = (0xf4, 0xef, 0xe4)
ACCENT = (0xd6, 0x51, 0x2f)
LINE_ALPHA = 0.55
SS = 4  # supersampling per axis


def png(path, w, h, rgba):
    raw = b''.join(b'\x00' + bytes(rgba[y * w * 4:(y + 1) * w * 4]) for y in range(h))
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(data)


def in_round_rect(x, y, x0, y0, x1, y1, r):
    if x < x0 or x > x1 or y < y0 or y > y1:
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def mark_colour(u, v):
    """Colour of the logo at logo coordinates (u, v) in 0..32, or None outside artwork, ignoring the tile."""
    # note head: ellipse centre (14,19.5) rx 4.4 ry 3.1 rotated -22deg
    a = math.radians(22)
    du, dv = u - 14, v - 19.5
    eu = du * math.cos(a) - dv * math.sin(a)
    ev = du * math.sin(a) + dv * math.cos(a)
    if (eu / 4.4) ** 2 + (ev / 3.1) ** 2 <= 1:
        return ACCENT, 1.0
    # stem: x=18, y 6.5..18.6, width 2, round caps
    if abs(u - 18) <= 1 and 6.5 <= v <= 18.6 or (u - 18) ** 2 + (v - 6.5) ** 2 <= 1 or (u - 18) ** 2 + (v - 18.6) ** 2 <= 1:
        return ACCENT, 1.0
    # staff lines y = 9.5, 13.5, 17.5, 21.5 from x 6..26, width 1.4
    if 6 <= u <= 26 and any(abs(v - ly) <= 0.7 for ly in (9.5, 13.5, 17.5, 21.5)):
        return PAPER, LINE_ALPHA
    return None


def render(size, *, rounded, art_scale=1.0):
    """rounded: draw the dark tile with corner radius (transparent corners); else full-bleed square.
    art_scale: shrink the artwork toward the centre (for maskable safe zone)."""
    out = bytearray(size * size * 4)
    for py in range(size):
        for px in range(size):
            acc = [0.0, 0.0, 0.0, 0.0]
            for sy in range(SS):
                for sx in range(SS):
                    x = (px + (sx + 0.5) / SS) / size * 32
                    y = (py + (sy + 0.5) / SS) / size * 32
                    if rounded and not in_round_rect(x, y, 0, 0, 32, 32, 7):
                        continue
                    col = list(INK)
                    u = 16 + (x - 16) / art_scale
                    v = 16 + (y - 16) / art_scale
                    m = mark_colour(u, v)
                    if m:
                        c, al = m
                        col = [col[i] * (1 - al) + c[i] * al for i in range(3)]
                    acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3] += 255
            n = SS * SS
            i = (py * size + px) * 4
            alpha = acc[3] / n
            if alpha:
                out[i:i + 3] = bytes(int(round(acc[k] / (acc[3] / 255))) for k in range(3))
            out[i + 3] = int(round(alpha))
    return out


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    dest = os.path.join(here, '..', 'public', 'icons')
    os.makedirs(dest, exist_ok=True)
    jobs = [
        ('icon-192.png', 192, dict(rounded=True)),
        ('icon-512.png', 512, dict(rounded=True)),
        # Maskable: full-bleed background, artwork inside the central 80% safe zone.
        ('icon-maskable-512.png', 512, dict(rounded=False, art_scale=0.78)),
        # iOS adds its own rounded corners; no transparency allowed.
        ('apple-touch-icon.png', 180, dict(rounded=False, art_scale=0.92)),
    ]
    for name, size, opts in jobs:
        png(os.path.join(dest, name), size, size, render(size, **opts))
        print('wrote', name)


if __name__ == '__main__':
    main()
