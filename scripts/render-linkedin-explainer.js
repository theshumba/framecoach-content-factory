import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(process.env.HOME, 'Desktop', 'LinkedIn Carousel - What Is FrameCoach');

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
  ICON_SIZE: px(260), HEADLINE_SIZE: px(100), BODY_SIZE: px(34),
  BODY_MAX_WIDTH: px(820), WORDMARK_BOTTOM: px(72), WORDMARK_GAP: px(24),
  WORDMARK_SIZE: px(26), DOT_SIZE: px(10),
};

const slides = [
  {
    headline: 'WHAT IS\nFRAMECOACH?',
    body: 'The AI cinematography coach that connects to your camera and tells you exactly what to change, and why.',
  },
  {
    headline: 'THE PROBLEM.',
    body: 'You\'re on set. You know the shot you want. But you\'re stuck scrolling through ISO, aperture, shutter speed, and white balance instead of actually creating.',
  },
  {
    headline: 'HOW IT\nWORKS.',
    body: 'Connect your phone to your DSLR via WiFi. Describe the look you want in plain English. "Warm mood." "Shallow depth of field." "Protect highlights." FrameCoach does the rest.',
  },
  {
    headline: 'WHAT\nHAPPENS NEXT.',
    body: 'The app captures a live frame from your camera, analyses the scene using AI, and returns up to 3 prioritised actions ranked by the biggest impact on your shot.',
  },
  {
    headline: 'IT SEES\nWHAT YOU SEE.',
    body: 'FrameCoach detects subjects, lighting conditions, and composition automatically. It understands the difference between a blown out sky and a blown out face.',
  },
  {
    headline: 'ONE TAP\nTO APPLY.',
    body: 'Agree with the recommendation? Tap once. The settings go straight to your camera. No more menu diving. No more second guessing.',
  },
  {
    headline: 'WHO IT\'S\nFOR.',
    body: 'Indie filmmakers. Solo creators. Film students. Anyone who shoots without a dedicated DP but still wants cinema grade precision on every take.',
  },
  {
    headline: 'SO WHAT\'S\nSTOPPING\nYOU?',
    body: 'Your next shoot doesn\'t have to be a guessing game. Connect your camera. Describe your vision. Let FrameCoach handle the settings.',
  },
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
    console.log(`slide-${String(i + 1).padStart(2, '0')}.png — ${slides[i].headline.split('\n')[0]}`);
  }
  await browser.close();
  console.log(`\n${slides.length} slides → ${OUT}`);
}
main();
