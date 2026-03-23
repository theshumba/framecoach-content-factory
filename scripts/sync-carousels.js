import { cpSync, mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DESKTOP_CAROUSELS = join(process.env.HOME, 'Desktop', 'FrameCoach Carousels');
const PUBLIC_DIR = join(ROOT, 'dashboard', 'public', 'instagram-carousels');

const CAROUSEL_META = {
  '01-what-is-framecoach': { name: 'What Is FrameCoach', sub: 'Filmmaker Education App', caption: 'Your filmmaking coach, in your pocket. Learn cinematography, composition & storytelling \u2014 one bite-sized lesson at a time. Link in bio. #filmmaking #cinematography #filmmaker #filmschool #contentcreator' },
  '02-5-reasons-to-try': { name: '5 Reasons to Try FrameCoach', sub: 'App Promotion', caption: '5 reasons filmmakers are switching to FrameCoach. Which one resonates? Drop a number below \u2b07\ufe0f #filmmaking #filmmaker #learnfilm' },
  '03-framecoach-vs-youtube': { name: 'FrameCoach vs YouTube', sub: 'App Promotion', caption: 'FrameCoach vs YouTube tutorials \u2014 structured learning wins every time. Stop scrolling, start growing. Link in bio. #filmmaking #filmmaker #videography' },
  '04-your-first-week': { name: 'Your First Week', sub: 'App Promotion', caption: "Here's what your first week with FrameCoach looks like. Day 1 to Day 7 \u2014 real progress, real fast. #filmmaking #filmmaker #cinematography" },
  '05-free-toolkit': { name: 'Free Toolkit', sub: 'App Promotion', caption: "Every tool you need to grow as a filmmaker \u2014 and it won't cost you a thing. Tap the link. #filmmaking #filmmaker #filmtools" },
  '06-stop-learning-the-hard-way': { name: 'Stop Learning the Hard Way', sub: 'App Promotion', caption: 'Most filmmakers learn through years of trial and error. There\'s a faster way. #filmmaking #filmmaker #filmtips' },
  '07-five-minutes-a-day': { name: 'Five Minutes a Day', sub: 'App Promotion', caption: '5 minutes a day is all it takes to become a better filmmaker. Here\'s how. #filmmaking #filmmaker #dailypractice' },
  '08-what-filmmakers-say': { name: 'What Filmmakers Say', sub: 'Social Proof', caption: 'Don\'t take our word for it. Here\'s what filmmakers are saying about FrameCoach. #filmmaking #filmmaker #reviews' },
  '09-before-and-after': { name: 'Before and After FrameCoach', sub: 'App Promotion', caption: 'Your filmmaking before vs after FrameCoach. The glow-up is real. #filmmaking #filmmaker #glowup' },
  '10-not-a-film-school': { name: "It's Not a Film School", sub: 'App Promotion', caption: 'FrameCoach isn\'t a film school. It\'s better. Here\'s why. #filmmaking #filmmaker #filmschool' },
  '11-the-framecoach-manifesto': { name: 'The FrameCoach Manifesto', sub: 'Our Beliefs', caption: 'This is what we believe. This is why we built FrameCoach. #filmmaking #filmmaker #manifesto' },
  '12-frame-your-story': { name: 'Frame Your Story', sub: 'Brand', caption: 'Every story deserves to be framed beautifully. Here\'s how we help. #filmmaking #storytelling #cinematography' },
  '13-built-by-filmmakers': { name: 'Built by Filmmakers', sub: 'Our Story', caption: 'FrameCoach was built by filmmakers, for filmmakers. This is our story. #filmmaking #filmmaker #indiefilm' },
  '14-what-makes-a-great-filmmaker': { name: 'What Makes a Great Filmmaker', sub: 'Filmmaker Mindset', caption: 'What separates good filmmakers from great ones? It\'s not what you think. #filmmaking #filmmaker #mindset' },
  '15-every-frame-tells-a-story': { name: 'Every Frame Tells a Story', sub: 'Cinematic Thinking', caption: 'Every single frame tells a story. Are you making yours count? #filmmaking #cinematography #storytelling' },
  '16-the-creators-mindset': { name: "The Creator's Mindset", sub: 'Mindset', caption: 'The mindset that separates creators from consumers. Which one are you? #filmmaking #creator #mindset' },
  '17-why-we-built-framecoach': { name: 'Why We Built FrameCoach', sub: 'Origin Story', caption: 'The real reason we built FrameCoach. It wasn\'t for the money. #filmmaking #filmmaker #startup' },
  '18-your-content-deserves-better': { name: 'Your Content Deserves Better', sub: 'Level Up', caption: 'Your content deserves better production quality. Level up with FrameCoach. #filmmaking #contentcreator #levelup' },
  '19-5-composition-rules': { name: '5 Composition Rules', sub: 'Composition Series', caption: '5 composition rules every filmmaker needs to know. Save this for your next shoot. #filmmaking #composition #cinematography' },
  '20-one-light-cinematography': { name: 'One-Light Cinematography', sub: 'Lighting Series', caption: 'You don\'t need expensive lighting. One light is all it takes. Here\'s how. #filmmaking #lighting #cinematography' },
  '21-essential-shot-types': { name: 'Essential Shot Types', sub: 'Shot Guide', caption: 'Every filmmaker needs these shots in their toolkit. How many do you use? #filmmaking #cinematography #shots' },
  '22-color-grading-mistakes': { name: 'Color Grading Mistakes', sub: 'Colour Series', caption: 'Stop making these color grading mistakes. Your footage will thank you. #filmmaking #colorgrading #cinematography' },
  '23-camera-movements': { name: 'Camera Movements', sub: 'Movement Series', caption: 'Master these camera movements and your films will never look the same. #filmmaking #camerawork #cinematography' },
  '24-180-degree-rule': { name: '180 Degree Rule', sub: 'Filmmaking 101', caption: 'The 180-degree rule explained in seconds. Never confuse your audience again. #filmmaking #directing #filmtips' },
  '25-cinematic-b-roll': { name: 'Cinematic B-Roll', sub: 'B-Roll Tips', caption: 'B-roll is what makes your film feel cinematic. Here\'s how to nail it every time. #filmmaking #broll #cinematography' },
  '26-focal-lengths-explained': { name: 'Focal Lengths Explained', sub: 'Lens Guide', caption: 'Focal lengths explained simply. Choose the right lens for every scene. #filmmaking #lenses #cinematography' },
  '27-3-point-lighting': { name: '3-Point Lighting', sub: 'Lighting Setup', caption: 'The 3-point lighting setup every filmmaker should master. Here\'s how. #filmmaking #lighting #filmtips' },
  '28-audio-tips': { name: 'Audio Tips', sub: 'Audio Series', caption: 'Bad audio ruins good films. Here are the tips that will save your sound. #filmmaking #audio #filmtips' },
  '29-directing-non-actors': { name: 'Directing Non-Actors', sub: 'Directing Tips', caption: 'Not everyone on set is an actor. Here\'s how to direct non-actors like a pro. #filmmaking #directing #filmtips' },
  '30-story-in-60-seconds': { name: 'Story in 60 Seconds', sub: 'Short-Form Series', caption: 'Tell a complete story in 60 seconds. The short-form filmmaker\'s guide. #filmmaking #shortfilm #storytelling' },
};

if (!existsSync(DESKTOP_CAROUSELS)) {
  console.error(`Source not found: ${DESKTOP_CAROUSELS}`);
  process.exit(1);
}

if (existsSync(PUBLIC_DIR)) {
  rmSync(PUBLIC_DIR, { recursive: true });
}
mkdirSync(PUBLIC_DIR, { recursive: true });

const folders = readdirSync(DESKTOP_CAROUSELS).filter(f =>
  !f.startsWith('.') && existsSync(join(DESKTOP_CAROUSELS, f))
).sort();

const manifest = [];

for (const folder of folders) {
  const srcDir = join(DESKTOP_CAROUSELS, folder);
  const destDir = join(PUBLIC_DIR, folder);
  cpSync(srcDir, destDir, { recursive: true });

  const slides = readdirSync(destDir).filter(f => f.endsWith('.png')).sort();

  if (slides.length === 0) {
    console.log(`Skipping ${folder} (0 slides)`);
    rmSync(destDir, { recursive: true });
    continue;
  }

  const meta = CAROUSEL_META[folder] || { name: folder, sub: '', caption: '' };
  manifest.push({
    id: folder,
    name: meta.name,
    subtitle: meta.sub,
    caption: meta.caption,
    slideCount: slides.length,
    slides: slides,
  });
  console.log(`${folder} (${slides.length} slides)`);
}

const manifestPath = join(ROOT, 'dashboard', 'public', 'instagram-carousels.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nManifest: ${manifestPath}`);
console.log(`${manifest.length} carousels, ${manifest.reduce((s, c) => s + c.slideCount, 0)} total slides`);
