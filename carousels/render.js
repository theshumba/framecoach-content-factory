#!/usr/bin/env node
/**
 * FrameCoach Carousel Renderer
 * Converts HTML carousel files → Instagram-ready PNG images (1080×1350, 4:5)
 *
 * Usage:
 *   node carousels/render.js                    → render all carousels
 *   node carousels/render.js 01-what-is         → render matching carousel(s)
 */

import puppeteer from 'puppeteer';
import { readdirSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────────────
const INPUT_DIR = '/Users/theshumba/Desktop/framecoach-carousels';
const OUTPUT_DIR = '/Users/theshumba/Desktop/FrameCoach Carousels';

// Instagram carousel: 1080×1350 (4:5)
const DESIGN_W = 420; // Original HTML layout width
const SCALE = 1080 / DESIGN_W; // ~2.571 → screenshot at 1080×1350

// ── Render one carousel ─────────────────────────────────────────────────────
async function renderCarousel(browser, htmlPath) {
  const name = basename(htmlPath, '.html');
  const outDir = join(OUTPUT_DIR, name);
  mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();

  // Layout at 420px (original design), capture at 1080px via deviceScaleFactor
  await page.setViewport({
    width: DESIGN_W,
    height: 900,
    deviceScaleFactor: SCALE,
  });

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts
  await page.evaluate(() => document.fonts.ready);

  // Check this is a standard carousel (has track element)
  const hasTrack = await page.evaluate(() => !!document.getElementById('tk'));
  if (!hasTrack) {
    console.log('  (skipped — non-standard format)');
    await page.close();
    return 0;
  }

  // Count slides
  const total = await page.evaluate(() =>
    document.querySelectorAll('.slide').length
  );

  // Remove swipe arrows (not useful in static images)
  await page.evaluate(() => {
    document.querySelectorAll('.slide').forEach(slide => {
      Array.from(slide.children).forEach(child => {
        const raw = child.getAttribute('style') || '';
        if (raw.includes('width:48px') && raw.includes('z-index:9')) {
          child.remove();
        }
      });
    });
  });

  for (let i = 0; i < total; i++) {
    // Jump to slide (no animation)
    await page.evaluate(idx => {
      const tk = document.getElementById('tk');
      tk.style.transition = 'none';
      tk.style.transform = `translateX(-${idx * 100}%)`;
    }, i);

    // Wait for repaint
    await page.evaluate(() =>
      new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    );

    // Screenshot just the carousel viewport (4:5 area)
    const el = await page.$('.carousel-viewport');
    const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
    await el.screenshot({
      path: join(outDir, fileName),
      type: 'png',
    });

    console.log(`  ${fileName}`);
  }

  await page.close();
  return total;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const filter = process.argv[2] || '';

  const files = readdirSync(INPUT_DIR)
    .filter(f =>
      f.endsWith('.html') &&
      !f.includes('reel') &&
      (!filter || f.includes(filter))
    )
    .sort()
    .map(f => join(INPUT_DIR, f));

  if (files.length === 0) {
    console.error(`No carousel HTML files found${filter ? ` matching "${filter}"` : ''}`);
    process.exit(1);
  }

  console.log(`\nFrameCoach Carousel Renderer`);
  console.log(`${files.length} carousels → PNG (1080x1350, 4:5)\n`);

  const browser = await puppeteer.launch({ headless: true });
  let totalImages = 0;

  for (const file of files) {
    console.log(basename(file, '.html'));
    const n = await renderCarousel(browser, file);
    totalImages += n;
  }

  await browser.close();
  console.log(`\nDone! ${totalImages} slides → ${OUTPUT_DIR}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
