import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(process.env.HOME, 'Desktop', 'TikTok Carousel - 3 Shots Every Filmmaker Must Know');

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

const WIDTH = 1080;
const HEIGHT = 1350;
const TEMPLATE = readFileSync(join(ROOT, 'generator', 'templates', 'brand-icon.html'), 'utf8');

const scale = 0.85;
const px = (n) => Math.round(n * scale);
const VARS = {
  WIDTH, HEIGHT,
  PAD: px(80), CORNER_SIZE: px(70), CORNER_OFFSET: px(48), GAP: px(54),
  ICON_SIZE: px(260), HEADLINE_SIZE: px(112), BODY_SIZE: px(34),
  BODY_MAX_WIDTH: px(820), WORDMARK_BOTTOM: px(72), WORDMARK_GAP: px(24),
  WORDMARK_SIZE: px(26), DOT_SIZE: px(10),
};

const slides = [
  { headline: '3 SHOTS EVERY\nFILMMAKER\nMUST KNOW', body: 'Master these and your films will never look the same. Swipe to learn all three.' },
  { headline: 'THE\nCLOSE-UP.', body: 'Captures raw emotion and intimate detail. Use it to draw the audience into a character\'s world.' },
  { headline: 'THE\nWIDE SHOT.', body: 'Establishes location and scale. Sets the scene so viewers know exactly where they are.' },
  { headline: 'THE\nPOV SHOT.', body: 'Puts the audience inside the character\'s eyes. Creates instant empathy and immersion.' },
  { headline: 'COMBINE\nALL THREE.', body: 'Wide to set the scene. Close-up for emotion. POV for immersion. That\'s cinematic storytelling.' },
  { headline: 'READY TO\nMASTER YOUR\nSHOTS?', body: 'FrameCoach teaches you every shot type with hands-on exercises. Link in bio.' },
];

function render(headline, body) {
  let html = TEMPLATE;
  html = html.replace(/\{\{HEADLINE\}\}/g, headline);
  html = html.replace(/\{\{BODY\}\}/g, body);
  for (const [k, v] of Object.entries(VARS)) html = html.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
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
    console.log(`slide-${String(i + 1).padStart(2, '0')}.png`);
  }
  await browser.close();
  console.log(`\n${slides.length} slides → ${OUT}`);
}
main();
