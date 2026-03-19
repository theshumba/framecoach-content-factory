/**
 * FrameCoach Content Factory — Manifest Generator
 *
 * Scans output/stories/, output/feed/, output/carousel/ for PNG files,
 * maps each file to its brand-config content, generates platform-specific
 * captions, and writes output/content-manifest.json.
 *
 * Usage: node generator/create-manifest.js
 */

import { readdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Brand content — mirrors brand-config.js (CommonJS-safe inline copy)
// ---------------------------------------------------------------------------

const CONTENT = {
  'app-promo': [
    { headline: 'STOP GUESSING.\nSTART SHOOTING.', body: 'Move past technical anxiety. Achieve your creative vision with objective data.' },
    { headline: 'BE YOUR\nOWN DP.', body: 'Translate your creative vision directly into prioritized technical actions.' },
    { headline: 'PRECISION OVER\nGUESSWORK.', body: 'Avoid costly reshoots. Ensure technical consistency across every scene and lighting condition.' },
    { headline: 'SPEAK VISION.\nGET SETTINGS.', body: 'Translate your creative intent into precise camera adjustments without diving into complex menus.' },
    { headline: 'THE RIGHT\nACTION. NOW.', body: 'See your top three actions, ranked by impact, to achieve your desired shot quickly and accurately.' },
    { headline: 'STOP MENU\nDIVING.', body: 'Get precise, natural language recommendations for exposure, focus, and framing in real-time.' },
    { headline: 'KNOW YOUR\nEXPOSURE,\nINSTANTLY.', body: 'FrameCoach provides the precise, data-driven parameters your shot requires, right now.' },
    { headline: 'TOTAL\nCREATIVE\nCONTROL.', body: 'Transform your shot list into technical reality with professional-level precision.' },
    { headline: 'YOUR CAMERA.\nYOUR RULES.', body: 'No more compromising your vision because of technical uncertainty. FrameCoach translates intent to settings.' },
    { headline: 'NAIL THE\nSHOT. EVERY\nTIME.', body: 'Consistent, professional results without a dedicated DP on every shoot.' },
    { headline: 'FROM VISION\nTO FRAME.', body: 'Describe the look you want. Get the exact camera settings to achieve it.' },
    { headline: 'SHOOT\nFEARLESSLY.', body: 'Confidence in every setting. FrameCoach removes the doubt so you can focus on the story.' },
  ],
  'brand-awareness': [
    { headline: "FRAMECOACH:\nTHE DIRECTOR'S\nEDGE.", body: 'Focus on your vision. We handle the technical translation. Shoot on your terms.' },
    { headline: 'BUILT FOR\nFILMMAKERS.', body: 'Not another generic camera app. Purpose-built for directors, DPs, and indie filmmakers.' },
    { headline: 'THE FUTURE\nOF ON-SET\nDECISIONS.', body: "AI-powered camera intelligence that understands filmmaking, not just photography." },
    { headline: 'TRUSTED BY\nINDIE\nFILMMAKERS.', body: "Join thousands of creators who've upgraded from guesswork to precision." },
    { headline: 'CINEMA-GRADE\nINTELLIGENCE.', body: 'Professional-level technical guidance, accessible to every filmmaker.' },
    { headline: 'YOUR SECRET\nWEAPON\nON SET.', body: "The edge that separates amateur from professional isn't talent — it's tools." },
  ],
  'film-edu': [
    { headline: "GOLDEN HOUR\nISN'T MAGIC.", body: "It's physics. Learn exactly how to meter for the 20 minutes that make or break your shot." },
    { headline: 'STOP\nCHIMPING.', body: 'Constantly checking your LCD wastes time and breaks your flow. Trust your settings instead.' },
    { headline: 'THE EXPOSURE\nTRIANGLE\nSIMPLIFIED.', body: "ISO, shutter speed, aperture — three variables, infinite combinations. Here's how to think about it." },
    { headline: 'DEPTH OF\nFIELD IS\nSTORYTELLING.', body: 'What you blur says as much as what you focus on. Master selective focus.' },
    { headline: 'COLOUR\nTEMPERATURE\nMATTERS.', body: 'The difference between amateur and cinematic often comes down to understanding Kelvin.' },
    { headline: 'FRAME\nLIKE A\nMASTER.', body: "Rule of thirds is just the beginning. Learn the composition techniques that guide the viewer's eye." },
  ],
};

// ---------------------------------------------------------------------------
// Captions — unique per content item, per platform
// ---------------------------------------------------------------------------

const CAPTIONS = {
  'app-promo': [
    // 1 — Stop Guessing. Start Shooting.
    {
      instagram: "Camera settings should serve your story, not block it. Most indie filmmakers spend more time second-guessing their exposure than actually directing their scenes. FrameCoach gives you the precise, data-driven settings you need so you can put your attention where it belongs — behind the lens. Download FrameCoach at framecoach.io.",
      tiktok: "POV: You stop guessing your camera settings and actually start directing. FrameCoach gives you precise exposure data in real-time. No more anxiety on set. FrameCoach app — link in bio.",
    },
    // 2 — Be Your Own DP.
    {
      instagram: "You have a creative vision. The technical gap between that vision and your camera settings shouldn't hold you back. FrameCoach translates exactly what you see in your head into prioritized, actionable camera settings — no DP required. Try FrameCoach free at framecoach.io.",
      tiktok: "That moment when you realize you don't need a dedicated DP to get professional shots. FrameCoach translates your creative vision directly into camera settings. Filmmakers will understand. FrameCoach — link in bio.",
    },
    // 3 — Precision Over Guesswork.
    {
      instagram: "Reshoots are expensive. Inconsistency across scenes costs you in post. FrameCoach ensures your technical settings stay consistent from setup to setup, eliminating the guesswork that turns a one-day shoot into a three-day problem. Link in bio to try FrameCoach.",
      tiktok: "Filmmakers will understand the pain of inconsistent exposure across a scene. FrameCoach locks in your technical settings so you never deal with mismatched footage again. Link in bio.",
    },
    // 4 — Speak Vision. Get Settings.
    {
      instagram: "Describing a shot should be enough. 'I want it to feel cold and overexposed, like a memory' — FrameCoach understands your creative language and returns the exact camera adjustments to match. No menu diving, no technical translation required. Download FrameCoach at framecoach.io.",
      tiktok: "POV: You tell your camera app 'I want it moody and underexposed' and it actually understands you. That's FrameCoach. Creative language, technical output. Link in bio.",
    },
    // 5 — The Right Action. Now.
    {
      instagram: "On set, every second counts. FrameCoach doesn't give you a list of everything you could adjust — it gives you the top three actions, ranked by impact, to achieve your desired shot right now. Faster decisions, better results. Try FrameCoach free at framecoach.io.",
      tiktok: "That moment when your camera app ranks what to adjust first, second, and third for your shot. No more paralysis from too many settings. FrameCoach — link in bio.",
    },
    // 6 — Stop Menu Diving.
    {
      instagram: "Deep camera menus break your flow and pull you out of director mode. FrameCoach surfaces the exact exposure, focus, and framing recommendations in natural language — so you never have to dig through sub-menus mid-shot again. Download FrameCoach at framecoach.io.",
      tiktok: "POV: You stop losing your shot because you're buried in camera menus. FrameCoach gives you natural language recommendations in real-time. Link in bio.",
    },
    // 7 — Know Your Exposure, Instantly.
    {
      instagram: "Nail your exposure on the first take. FrameCoach reads your current conditions and provides the precise, data-driven parameters your shot demands — so you stop relying on guesswork and start trusting your process. Link in bio to try FrameCoach.",
      tiktok: "Filmmakers will understand staring at your histogram and still not being sure. FrameCoach gives you the exact exposure parameters your shot needs, instantly. Link in bio.",
    },
    // 8 — Total Creative Control.
    {
      instagram: "A shot list is a creative document. FrameCoach is the bridge between that document and the actual camera settings that bring it to life — with professional-level precision, on every single setup. Try FrameCoach free at framecoach.io.",
      tiktok: "POV: Your shot list actually translates into camera settings without you having to do all the math. Total creative control, finally. FrameCoach — link in bio.",
    },
    // 9 — Your Camera. Your Rules.
    {
      instagram: "Technical uncertainty is one of the main reasons filmmakers compromise their creative vision on set. FrameCoach removes that uncertainty — so the camera does exactly what you intend it to do, every time. No compromises. Download FrameCoach at framecoach.io.",
      tiktok: "That moment when you stop making creative compromises because of technical uncertainty. Your camera, your rules. FrameCoach translates your intent into settings. Link in bio.",
    },
    // 10 — Nail The Shot. Every Time.
    {
      instagram: "Consistency separates professional work from amateur footage. FrameCoach helps you achieve the same standard of technical precision on every shoot — whether you have a full crew or you're running solo. Link in bio for FrameCoach.",
      tiktok: "Filmmakers will understand the difference between getting the shot and hoping you got the shot. FrameCoach means you nail it every time, no dedicated DP needed. Link in bio.",
    },
    // 11 — From Vision To Frame.
    {
      instagram: "The gap between what you imagine and what ends up on screen is a technical problem. FrameCoach solves it — describe the visual look you're going for, and get the exact settings to achieve it. Download FrameCoach at framecoach.io.",
      tiktok: "POV: You describe the look you want and your camera app gives you the exact settings to achieve it. Vision to frame, no guesswork. FrameCoach — link in bio.",
    },
    // 12 — Shoot Fearlessly.
    {
      instagram: "The best directors aren't second-guessing their exposure mid-scene. FrameCoach removes the technical doubt so you can direct with full confidence — focused on performance, story, and light rather than settings menus. Try FrameCoach free at framecoach.io.",
      tiktok: "That moment when you stop second-guessing every camera setting and just shoot with confidence. FrameCoach removes the doubt. Filmmakers — link in bio.",
    },
  ],
  'brand-awareness': [
    // 1 — FrameCoach: The Director's Edge.
    {
      instagram: "The technical side of filmmaking shouldn't compete with the creative side. FrameCoach handles the translation between your vision and your camera settings — so you can focus entirely on directing. Your terms, your vision, your film. Learn more at framecoach.io.",
      tiktok: "POV: You stop thinking about camera settings and just direct. FrameCoach is the director's edge — vision in, settings out. Link in bio.",
    },
    // 2 — Built For Filmmakers.
    {
      instagram: "There are dozens of camera apps. None of them were built for how filmmakers actually think. FrameCoach was built from the ground up for directors, DPs, and indie filmmakers — with the vocabulary and workflow of real production in mind. Download FrameCoach at framecoach.io.",
      tiktok: "Filmmakers will understand the frustration of camera apps built for photographers. FrameCoach was built specifically for us. Link in bio.",
    },
    // 3 — The Future Of On-Set Decisions.
    {
      instagram: "AI on set used to mean automated presets and generic recommendations. FrameCoach brings genuine camera intelligence to production — understanding the language of filmmaking, not just photography. The future of on-set decisions is here. Try FrameCoach free at framecoach.io.",
      tiktok: "POV: AI that actually understands filmmaking, not just photography. FrameCoach is the future of on-set decisions. Link in bio.",
    },
    // 4 — Trusted By Indie Filmmakers.
    {
      instagram: "Thousands of indie filmmakers have replaced guesswork with precision using FrameCoach. Whether you're shooting a short, a documentary, or a feature on a micro-budget — the technical bar just got higher. Join them at framecoach.io.",
      tiktok: "That moment when thousands of indie filmmakers are using an app you haven't tried yet. FrameCoach — upgrading from guesswork to precision. Link in bio.",
    },
    // 5 — Cinema-Grade Intelligence.
    {
      instagram: "Professional-grade technical guidance used to require a seasoned DP on every set. FrameCoach makes that level of precision accessible to every filmmaker, regardless of crew size or budget. Cinema-grade intelligence, in your pocket. Download FrameCoach at framecoach.io.",
      tiktok: "Filmmakers will understand wanting cinema-grade results without cinema-grade crew budgets. FrameCoach makes it possible. Link in bio.",
    },
    // 6 — Your Secret Weapon On Set.
    {
      instagram: "The difference between amateur and professional work isn't always talent or budget — it's tools. FrameCoach is the on-set edge that helps you show up prepared, shoot with precision, and deliver results that look like you had a bigger team. Try FrameCoach free at framecoach.io.",
      tiktok: "POV: You show up to set with an edge most filmmakers don't have. FrameCoach is the tool that separates good from professional. Link in bio.",
    },
  ],
  'film-edu': [
    // 1 — Golden Hour Isn't Magic.
    {
      instagram: "Golden hour doesn't just look good by accident — it's a specific set of light physics you can learn to read and meter for. The filmmakers who get the best golden hour footage are the ones who know exactly how to expose for it, not just the ones who happen to be standing there. Download FrameCoach to take your technical skills further at framecoach.io.",
      tiktok: "POV: You learn that golden hour is physics, not luck, and your footage levels up immediately. Learn to meter for the 20 minutes that make the shot. FrameCoach — link in bio.",
    },
    // 2 — Stop Chimping.
    {
      instagram: "Constantly checking your LCD after every shot is a habit that costs you in ways you don't realize — broken concentration, missed moments, and a disrupted flow state. Learn to trust your settings, commit to the exposure, and stay present in the scene. Try FrameCoach free at framecoach.io.",
      tiktok: "Filmmakers will understand: stop chimping. Every time you check your LCD mid-scene, you lose the moment. Trust your settings. FrameCoach helps you get there — link in bio.",
    },
    // 3 — The Exposure Triangle Simplified.
    {
      instagram: "ISO, shutter speed, aperture — three variables with infinite combinations. The exposure triangle isn't complicated once you understand the relationships between them. Learn to think in stops rather than numbers, and every lighting situation becomes manageable. Download FrameCoach at framecoach.io.",
      tiktok: "POV: The exposure triangle finally makes sense and you stop treating camera settings like a mystery. ISO, shutter, aperture — here's how to actually think about it. FrameCoach — link in bio.",
    },
    // 4 — Depth Of Field Is Storytelling.
    {
      instagram: "What you choose to blur is a creative decision, not just a technical one. Selective focus directs attention, creates emotion, and separates your subject from the world around them. Master depth of field and you master one of cinema's most powerful storytelling tools. Learn more at framecoach.io.",
      tiktok: "That moment when you realize bokeh isn't just an aesthetic — it's a storytelling choice. What you blur says as much as what you focus on. FrameCoach — link in bio.",
    },
    // 5 — Colour Temperature Matters.
    {
      instagram: "Most amateur footage has a subtle wrongness to it that's hard to pin down — and it's often colour temperature. Understanding Kelvin, mixed light sources, and how your camera renders warmth versus cool tones is one of the fastest ways to make your work feel more cinematic. Try FrameCoach free at framecoach.io.",
      tiktok: "Filmmakers will understand: colour temperature is the difference between footage that feels off and footage that feels like cinema. Learn your Kelvin values. FrameCoach — link in bio.",
    },
    // 6 — Frame Like A Master.
    {
      instagram: "Rule of thirds is the beginning of composition, not the whole story. Master filmmakers use leading lines, negative space, frame-within-frame, and deliberate visual tension to guide the viewer's eye without them realizing it. Composition is direction. Download FrameCoach at framecoach.io.",
      tiktok: "POV: You go beyond rule of thirds and start framing like a cinematographer. Composition is direction — here's how the masters think about it. FrameCoach — link in bio.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Hashtags — per category
// ---------------------------------------------------------------------------

const HASHTAGS = {
  'app-promo': {
    instagram: ['#filmmaking', '#cinematography', '#indiefilm', '#filmmaker', '#cameraoperator', '#filmdirector', '#setlife', '#indiefilmmaker', '#DP', '#framecoach'],
    tiktok: ['#filmmaking', '#filmmaker', '#indiefilm', '#cinematography', '#cameralife', '#setlife', '#filmdirector', '#filmtok', '#framecoach'],
  },
  'brand-awareness': {
    instagram: ['#framecoach', '#filmmaking', '#indiefilmmaker', '#filmdirector', '#cinematography', '#cameraapp', '#filmtech', '#directorlife', '#setlife', '#filmtools'],
    tiktok: ['#framecoach', '#filmmaking', '#filmmaker', '#indiefilm', '#filmdirector', '#filmtok', '#cinematography', '#cameraapp', '#setlife'],
  },
  'film-edu': {
    instagram: ['#filmtips', '#filmmaking', '#cinematography', '#filmschool', '#learncamera', '#cameraoperator', '#filmtechnique', '#indiefilm', '#directorlife', '#framecoach'],
    tiktok: ['#filmtips', '#filmmaking', '#filmmaker', '#cinematography', '#filmschool', '#cameralife', '#filmtok', '#framecoach', '#learnfilmmaking'],
  },
};

// ---------------------------------------------------------------------------
// Category label mapping (filename prefix → display name)
// ---------------------------------------------------------------------------

const CATEGORY_LABELS = {
  'app-promo': 'App Promo',
  'brand-awareness': 'Brand Awareness',
  'film-edu': 'Film Education',
};

// ---------------------------------------------------------------------------
// Parse filename
// e.g. "app-promo-01-brand-icon-story.png"
//       category    idx  template     format
// ---------------------------------------------------------------------------

function parseFilename(filename) {
  // Strip .png
  const base = filename.replace(/\.png$/, '');

  // Detect format (last segment)
  const formatMatch = base.match(/-(story|feed|carousel)$/);
  if (!formatMatch) return null;
  const format = formatMatch[1];
  const withoutFormat = base.slice(0, base.length - format.length - 1);

  // Detect category prefix
  let category = null;
  for (const cat of ['app-promo', 'brand-awareness', 'film-edu']) {
    if (withoutFormat.startsWith(cat + '-')) {
      category = cat;
      break;
    }
  }
  if (!category) return null;

  const afterCategory = withoutFormat.slice(category.length + 1); // "01-brand-icon"
  // Index is first two-digit number
  const indexMatch = afterCategory.match(/^(\d{2})-(.+)$/);
  if (!indexMatch) return null;

  const contentIndex = parseInt(indexMatch[1], 10);
  const template = indexMatch[2]; // "brand-icon"

  return { category, contentIndex, template, format };
}

// ---------------------------------------------------------------------------
// Scan a directory for PNG files
// ---------------------------------------------------------------------------

async function scanDir(dir, formatLabel) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  return files
    .filter(f => f.endsWith('.png'))
    .map(f => ({ filename: f, formatLabel }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const today = new Date().toISOString().split('T')[0];

  const storiesDir = join(ROOT, 'output', 'stories');
  const feedDir    = join(ROOT, 'output', 'feed');
  const carouselDir = join(ROOT, 'output', 'carousel');

  const allFiles = [
    ...(await scanDir(storiesDir, 'story')).map(f => ({ ...f, subdir: 'stories' })),
    ...(await scanDir(feedDir, 'feed')).map(f => ({ ...f, subdir: 'feed' })),
    ...(await scanDir(carouselDir, 'carousel')).map(f => ({ ...f, subdir: 'carousel' })),
  ];

  const items = [];

  for (const { filename, subdir } of allFiles) {
    const parsed = parseFilename(filename);
    if (!parsed) {
      console.warn(`  Skipping unrecognized filename: ${filename}`);
      continue;
    }

    const { category, contentIndex, template, format } = parsed;

    const contentArr = CONTENT[category];
    if (!contentArr) {
      console.warn(`  Unknown category: ${category}`);
      continue;
    }

    const zeroIdx = contentIndex - 1;
    const contentItem = contentArr[zeroIdx];
    if (!contentItem) {
      console.warn(`  No content for ${category} index ${contentIndex}`);
      continue;
    }

    const captionArr = CAPTIONS[category];
    const captionItem = captionArr ? captionArr[zeroIdx] : null;
    const hashtagItem = HASHTAGS[category] || {};

    const id = filename.replace(/\.png$/, '');

    items.push({
      id,
      filename,
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      contentIndex,
      template,
      format,
      headline: contentItem.headline,
      body: contentItem.body,
      caption: captionItem || {
        instagram: contentItem.body,
        tiktok: contentItem.body,
      },
      hashtags: hashtagItem,
      imageUrl: `/${subdir}/${filename}`,
      status: 'pending',
      dateCreated: today,
      datePosted: null,
      platformUrl: null,
      notes: '',
    });
  }

  // Sort: category → contentIndex → template → format
  items.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.contentIndex !== b.contentIndex) return a.contentIndex - b.contentIndex;
    if (a.template !== b.template) return a.template.localeCompare(b.template);
    return a.format.localeCompare(b.format);
  });

  const manifest = {
    generated: new Date().toISOString(),
    total: items.length,
    items,
  };

  const outPath = join(ROOT, 'output', 'content-manifest.json');
  await writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n FrameCoach Content Manifest`);
  console.log(` Generated ${items.length} items`);
  console.log(` Written to: ${outPath}\n`);

  // Summary by category
  const catCounts = {};
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`   ${CATEGORY_LABELS[cat] || cat}: ${count} items`);
  }
  console.log('');
}

main().catch(err => {
  console.error('Manifest generation failed:', err);
  process.exit(1);
});
