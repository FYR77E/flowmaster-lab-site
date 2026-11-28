#!/usr/bin/env python3
"""Render resume/cv.html to public/cv/mikhail-brovkin-cv.pdf (+ .b64 sidecar).

Needs: python3 scripts/decode-assets.py (fonts), pip install playwright, a Chromium/Chrome.
Usage: python3 resume/render.py [path-to-chrome]
"""
import asyncio, base64, sys
from pathlib import Path
from playwright.async_api import async_playwright

here = Path(__file__).resolve().parent
out = here.parent / "public" / "cv" / "mikhail-brovkin-cv.pdf"

async def main():
    async with async_playwright() as p:
        kw = {"executable_path": sys.argv[1]} if len(sys.argv) > 1 else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page()
        await page.goto((here / "cv.html").as_uri(), wait_until="networkidle")
        await page.pdf(path=str(out), format="A4", print_background=True, prefer_css_page_size=True)
        await browser.close()
    out.with_name(out.name + ".b64").write_text(base64.b64encode(out.read_bytes()).decode())
    print("wrote", out)

asyncio.run(main())
