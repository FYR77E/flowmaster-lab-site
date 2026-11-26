#!/usr/bin/env python3
"""Decode public/**/*.b64 sidecars into binary files next to them (for CI)."""
import base64
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "public"
count = 0
for src in sorted(root.rglob("*.b64")):
    dest = src.with_name(src.name[:-4])  # strip .b64
    dest.write_bytes(base64.b64decode(src.read_text()))
    count += 1
    print(f"decoded {src.relative_to(root)} -> {dest.relative_to(root)} ({dest.stat().st_size} bytes)")
if count == 0:
    raise SystemExit("no .b64 assets found")
print(f"decoded {count} files")
