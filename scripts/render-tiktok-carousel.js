import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(process.env.HOME, 'Desktop', 'TikTok Carousel - 5 Reasons');

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

// TikTok carousel = 1080x1350 (same as Instagram carousel)
const WIDTH = 1080;
const HEIGHT = 1350;

// Load the real brand-icon template
const TEMPLATE = readFileSync(join(ROOT, 'generator', 'templates', 'brand-icon.html'), 'utf8');

// Scale vars for 1080x1350 (carousel scale = 0.85 of story base)
const scale = 0.85;
const px = (n) => Math.round(n * scale);

const VARS = {
  WIDTH, HEIGHT,
  PAD:           px(80),
  CORNER_SIZE:   px(70),
  CORNER_OFFSET: px(48),
  GAP:           px(54),
  ICON_SIZE:     px(260),
  HEADLINE_SIZE: px(112),
  BODY_SIZE:     px(34),
  BODY_MAX_WIDTH: px(820),
  WORDMARK_BOTTOM: px(72),
  WORDMARK_GAP:  px(24),
  WORDMARK_SIZE: px(26),
  DOT_SIZE:      px(10),
};

// 7 slides that tell ONE story
const slides = [
  {
    headline: '5 REASONS\nFILMMAKERS ARE\nSWITCHING TO\nFRAMECOACH',
    body: 'Swipe to find out why creators are choosing a smarter way to learn.',
  },
  {
    headline: 'NO MORE\nRANDOM\nTUTORIALS.',
    body: 'Follow a clear path from beginner to advanced cinematography. Every lesson builds on the last.',
  },
  {
    headline: 'LEARN IN\n5 MINUTES\nA DAY.',
    body: 'Perfect for busy creators who still want to grow. Open, learn, done.',
  },
  {
    headline: 'REAL-WORLD\nEXERCISES,\nNOT THEORY.',
    body: 'Apply what you learn with hands-on challenges — not just lectures.',
  },
  {
    headline: 'MADE BY\nPEOPLE WHO\'VE\nBEEN ON SET.',
    body: 'Built by directors and DPs who understand the craft, not just tech developers.',
  },
  {
    headline: 'COMPLETELY\nFREE TO\nSTART.',
    body: 'No credit card. No trial period. No catch. Just start learning right now.',
  },
  {
    headline: 'READY TO\nLEVEL UP?',
    body: 'Join filmmakers already learning with FrameCoach. Link in bio.',
  },
];

function render(headline, body) {
  let html = TEMPLATE;
  html = html.replace(/\{\{HEADLINE\}\}/g, headline);
  html = html.replace(/\{\{BODY\}\}/g, body);
  for (const [key, value] of Object.entries(VARS)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return html;
}

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  for (let i = 0; i < slides.length; i++) {
    const html = render(slides[i].headline, slides[i].body);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));
    const path = join(OUT, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path, type: 'png' });
    console.log(`slide-${String(i + 1).padStart(2, '0')}.png — ${slides[i].headline.split('\n')[0]}`);
  }

  await browser.close();
  console.log(`\n${slides.length} slides → ${OUT}`);
}

main();
