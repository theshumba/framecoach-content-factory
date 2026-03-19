/**
 * FrameCoach Content Generator
 * Renders HTML templates to PNG images via Puppeteer
 * Usage:
 *   node generator/generate.js            → all 432 images
 *   node generator/generate.js --quick    → 144 images (story format only)
 *   node generator/generate.js --template brand-icon  → 72 images (one template, all formats/content)
 *   node generator/generate.js --quick --template gradient-slide  → 24 images (one template, story only)
 */

import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { BRAND, CONTENT, TEMPLATES } from '../brand-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ─── CLI flags ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const TEMPLATE_FLAG_IDX = args.indexOf('--template');
const TEMPLATE_FILTER = TEMPLATE_FLAG_IDX !== -1 ? args[TEMPLATE_FLAG_IDX + 1] : null;

// ─── Formats ────────────────────────────────────────────────────────────────
const FORMATS = QUICK
  ? { story: BRAND.formats.story }
  : BRAND.formats;

// ─── Content ────────────────────────────────────────────────────────────────
const ALL_CONTENT = [
  ...BRAND_CONTENT('appPromo'),
  ...BRAND_CONTENT('brandAwareness'),
  ...BRAND_CONTENT('filmEducation'),
];

function BRAND_CONTENT(category) {
  return CONTENT[category].map((item, i) => ({
    ...item,
    category,
    index: i + 1,
  }));
}

// ─── Templates ──────────────────────────────────────────────────────────────
const TEMPLATE_NAMES = TEMPLATE_FILTER
  ? TEMPLATES.filter(t => t === TEMPLATE_FILTER)
  : TEMPLATES;

// ─── Dimension helpers ──────────────────────────────────────────────────────

/**
 * Build a CSS variable map for a given {width, height} format.
 * Each template has its own set of design tokens scaled proportionally.
 */
function getVars(templateName, width, height) {
  const isStory    = height > width;     // 1080×1920
  const isSquare   = width === height;   // 1080×1080
  const isCarousel = !isStory && !isSquare; // 1080×1350

  // Base scale: everything is designed at story (1080×1920).
  // For square and carousel, scale typography/spacing proportionally.
  const scale = isStory ? 1.0 : isCarousel ? 0.85 : 0.78;

  const px = (n) => Math.round(n * scale);

  const common = {
    WIDTH:  width,
    HEIGHT: height,
  };

  switch (templateName) {
    case 'brand-icon': return {
      ...common,
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

    case 'gradient-slide': return {
      ...common,
      PAD:            px(80),
      LOGO_TOP:       px(80),
      LOGO_GAP:       px(18),
      LOGO_SIZE:      px(52),
      LOGO_LABEL_SIZE: px(28),
      HEADLINE_SIZE:  px(136),
      DIVIDER_WIDTH:  px(120),
      DIVIDER_HEIGHT: px(3),
      DIVIDER_MARGIN: px(40),
      BODY_BOTTOM:    px(190),
      BODY_SIZE:      px(34),
      URL_BOTTOM:     px(72),
      URL_SIZE:       px(26),
      CHEV_GAP:       px(10),
      CHEV_SIZE:      px(40),
    };

    case 'statement-card': return {
      ...common,
      OUTER_PAD:     px(60),
      BORDER_WIDTH:  px(3),
      CARD_RADIUS:   px(24),
      CARD_PAD:      px(80),
      GAP:           px(50),
      GLOW_SIZE:     px(60),
      VF_SIZE:       px(180),
      HEADLINE_SIZE: px(108),
      RULE_WIDTH:    px(200),
      BODY_SIZE:     px(32),
      BODY_MAX_WIDTH: px(820),
      WM_BOTTOM:     px(40),
      WM_RIGHT:      px(80),
      WM_SIZE:       px(22),
    };

    case 'bold-typography': return {
      ...common,
      PAD:            px(80),
      ACCENT_TOP:     px(-60),
      ACCENT_RIGHT:   px(-80),
      ACCENT_W:       px(500),
      ACCENT_H:       px(700),
      TOP_RULE_Y:     px(100),
      TOP_RULE_W:     px(80),
      HEADLINE_TOP:   px(160),
      HEADLINE_SIZE:  px(200),
      HEADLINE_SPACING: 0.01,
      BOTTOM_PAD:     px(80),
      BOTTOM_GAP:     px(28),
      BOTTOM_RULE_W:  px(920),
      BODY_SIZE:      px(34),
      BODY_MAX_WIDTH: px(800),
      WM_SIZE:        px(26),
      URL_SIZE:       px(24),
    };

    case 'asset-feature': return {
      ...common,
      PAD:           px(80),
      GAP:           px(44),
      GLOW_SIZE:     px(700),
      TL_OFFSET:     px(48),
      BRACKET_SIZE:  px(64),
      ASSET_SIZE:    px(220),
      HEADLINE_SIZE: px(112),
      DIV_W:         px(160),
      BODY_SIZE:     px(32),
      BODY_MAX_WIDTH: px(820),
      BB_BOTTOM:     px(72),
      CHEV_GAP:      px(8),
      CHEV_SIZE:     px(38),
      URL_SIZE:      px(26),
    };

    case 'minimal-dark': return {
      ...common,
      PAD:           px(80),
      GLOW_W:        px(700),
      GLOW_H:        px(700),
      RULE_TOP:      px(152),
      LOGO_GAP:      px(18),
      LOGO_MB:       px(8),
      LOGO_SIZE:     px(50),
      LOGO_TEXT_SIZE: px(24),
      DOT_SIZE:      px(10),
      RULE_LEFT:     px(80),
      RULE_TOP_PX:   px(200),
      RULE_BOTTOM_PX: px(260),
      HEADLINE_SIZE: px(128),
      HEADLINE_PL:   px(32),
      BOTTOM_GAP:    px(24),
      BODY_SIZE:     px(32),
      BODY_MAX_WIDTH: px(820),
      META_GAP:      px(16),
      META_DOT:      px(8),
      URL_SIZE:      px(24),
    };

    default: return common;
  }
}

// ─── Template renderer ───────────────────────────────────────────────────────

function loadTemplate(templateName) {
  const tplPath = join(__dirname, 'templates', `${templateName}.html`);
  return readFileSync(tplPath, 'utf8');
}

function renderTemplate(html, vars, headline, body) {
  let out = html;

  // Inject content
  // Headline: replace \n with actual newlines for pre-line CSS
  out = out.replace(/\{\{HEADLINE\}\}/g, headline.replace(/\\n/g, '\n'));
  out = out.replace(/\{\{BODY\}\}/g, body);
  out = out.replace(/\{\{FORMAT\}\}/g, '');

  // Inject numeric vars — must be done AFTER content (content may contain braces in edge cases)
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return out;
}

// ─── Output paths ────────────────────────────────────────────────────────────

const FORMAT_DIR = { story: 'stories', feed: 'feed', carousel: 'carousel' };

function ensureOutputDirs() {
  for (const dir of Object.values(FORMAT_DIR)) {
    const p = join(ROOT, 'output', dir);
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
  }
}

function categorySlug(category) {
  switch (category) {
    case 'appPromo':       return 'app-promo';
    case 'brandAwareness': return 'brand-awareness';
    case 'filmEducation':  return 'film-edu';
    default:               return category.toLowerCase();
  }
}

function buildFilename(contentItem, templateName, formatKey) {
  const cat  = categorySlug(contentItem.category);
  const idx  = String(contentItem.index).padStart(2, '0');
  const tmpl = templateName;
  const fmt  = formatKey === 'story' ? 'story' : formatKey === 'feed' ? 'feed' : 'carousel';
  return `${cat}-${idx}-${tmpl}-${fmt}.png`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  ensureOutputDirs();

  const jobs = [];

  for (const [formatKey, formatDef] of Object.entries(FORMATS)) {
    for (const templateName of TEMPLATE_NAMES) {
      const tplHtml = loadTemplate(templateName);
      const vars    = getVars(templateName, formatDef.width, formatDef.height);

      for (const contentItem of ALL_CONTENT) {
        const html     = renderTemplate(tplHtml, vars, contentItem.headline, contentItem.body);
        const filename = buildFilename(contentItem, templateName, formatKey);
        const outPath  = join(ROOT, 'output', FORMAT_DIR[formatKey], filename);
        jobs.push({ html, width: formatDef.width, height: formatDef.height, outPath, filename });
      }
    }
  }

  const total = jobs.length;
  console.log(`\nFrameCoach Content Generator`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Mode:      ${QUICK ? 'quick (story only)' : 'full (all formats)'}`);
  console.log(`Templates: ${TEMPLATE_NAMES.join(', ')}`);
  console.log(`Formats:   ${Object.keys(FORMATS).join(', ')}`);
  console.log(`Content:   ${ALL_CONTENT.length} items`);
  console.log(`Total:     ${total} images\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  // Process in batches to avoid memory pressure
  const BATCH_SIZE = 6;
  let done = 0;
  let errors = 0;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (job) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setViewport({ width: job.width, height: job.height, deviceScaleFactor: 1 });

        // Set content — use domcontentloaded so we don't block on network forever
        await page.setContent(job.html, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for fonts to load (Google Fonts or fallback system fonts)
        await page.evaluate(() =>
          Promise.race([
            document.fonts.ready,
            new Promise((res) => setTimeout(res, 5000)), // max 5s font wait
          ])
        );

        await page.screenshot({
          path: job.outPath,
          type: 'png',
          clip: { x: 0, y: 0, width: job.width, height: job.height },
        });

        done++;
        const pct = Math.round((done / total) * 100);
        process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ${done}/${total}  ${job.filename.padEnd(60)}`);
      } catch (err) {
        errors++;
        console.error(`\n  ERROR: ${job.filename} — ${err.message}`);
      } finally {
        if (page) await page.close();
      }
    }));
  }

  await browser.close();

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Done! ${done} images generated${errors > 0 ? `, ${errors} errors` : ' (no errors)'}.`);
  console.log(`Output: ${join(ROOT, 'output')}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
