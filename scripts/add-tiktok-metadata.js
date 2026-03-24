/**
 * add-tiktok-metadata.js
 *
 * Adds tiktokTitle, tiktokDescription, and tiktokHashtags to every entry
 * in the content manifest. Items sharing the same headline get identical
 * TikTok metadata (they are template/format variations of the same content).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, '../output/content-manifest.json');

// ── TikTok metadata keyed by headline ──────────────────────────────────
const TIKTOK_META = {
  // ── App Promo (12) ───────────────────────────────────────────────────
  "STOP GUESSING.\nSTART SHOOTING.": {
    tiktokTitle: "Stop guessing your camera settings \uD83C\uDFAC",
    tiktokDescription:
      "Most indie filmmakers waste precious set time second-guessing exposure and white balance instead of actually directing their scenes. FrameCoach eliminates technical anxiety by giving you precise, data-driven camera settings in real-time so you can focus on storytelling. If you have ever frozen on set wondering whether your ISO is right, this app was built for you. Download FrameCoach today and turn every shoot into a confident one.",
    tiktokHashtags: ["#filmmaking", "#camerasettings", "#indiefilmmaker", "#setlife", "#framecoach"],
  },

  "BE YOUR\nOWN DP.": {
    tiktokTitle: "You don't need a DP to shoot like one \uD83C\uDFA5",
    tiktokDescription:
      "Not every indie filmmaker can afford a dedicated director of photography, but that does not mean your footage has to look amateurish. FrameCoach translates your creative vision directly into prioritized technical actions so you can be your own DP on any shoot. Describe the mood, get the settings. It is that simple. Perfect for solo filmmakers, run-and-gun docs, and micro-budget productions.",
    tiktokHashtags: ["#filmmaker", "#cinematography", "#directorofphotography", "#indiefilm", "#framecoach"],
  },

  "PRECISION OVER\nGUESSWORK.": {
    tiktokTitle: "Precision beats guesswork every single time \uD83C\uDFAF",
    tiktokDescription:
      "Costly reshoots happen when you rely on gut feeling instead of data. FrameCoach ensures technical consistency across every scene and lighting condition by giving you precise, calculated camera parameters. No more hoping your exposure looks right in post. Whether you are shooting golden hour exteriors or dimly lit interiors, FrameCoach keeps your footage technically flawless from the first take.",
    tiktokHashtags: ["#filmmaking", "#cinematographer", "#cameraoperator", "#filmtips", "#framecoach"],
  },

  "SPEAK VISION.\nGET SETTINGS.": {
    tiktokTitle: "Just describe the look you want \uD83D\uDDE3\uFE0F",
    tiktokDescription:
      "Imagine telling your camera exactly what mood you are going for and getting the precise settings back instantly. That is what FrameCoach does. Translate your creative intent into camera adjustments without diving into complex menus or memorizing technical charts. Say what you see in your head, and FrameCoach turns it into exposure, focus, and framing settings you can dial in immediately.",
    tiktokHashtags: ["#filmmaking", "#cameragear", "#filmtok", "#indiefilmmaker", "#framecoach"],
  },

  "THE RIGHT\nACTION. NOW.": {
    tiktokTitle: "Your top 3 actions ranked by impact \u26A1",
    tiktokDescription:
      "On a fast-moving set there is no time to scroll through manuals or forums. FrameCoach shows you the top three technical actions ranked by impact so you can make the biggest improvement to your shot in seconds. It prioritizes what matters most for your current scene, whether that is adjusting exposure, shifting focus, or reframing. Speed and precision, exactly when you need them.",
    tiktokHashtags: ["#filmmaking", "#onset", "#filmhacks", "#setlife", "#framecoach"],
  },

  "STOP MENU\nDIVING.": {
    tiktokTitle: "Stop scrolling through camera menus \uD83D\uDE45",
    tiktokDescription:
      "Every second you spend buried in your camera menu is a second your actors lose momentum and your crew loses patience. FrameCoach gives you precise, natural language recommendations for exposure, focus, and framing in real-time so you never have to pause a scene to hunt for a setting. It is like having a knowledgeable first AC whispering in your ear, but faster and always available.",
    tiktokHashtags: ["#filmmaking", "#cameralife", "#filmmaker", "#filmtok", "#framecoach"],
  },

  "KNOW YOUR\nEXPOSURE,\nINSTANTLY.": {
    tiktokTitle: "Know your exact exposure in seconds \uD83D\uDCA1",
    tiktokDescription:
      "Exposure is the foundation of every great shot, and getting it wrong means hours of correction in post or unusable footage. FrameCoach provides the precise, data-driven parameters your shot requires right now, no light meter math or histogram guessing needed. Whether you are shooting in harsh sunlight or low-light interiors, you will always know your ISO, shutter speed, and aperture are locked in.",
    tiktokHashtags: ["#exposure", "#filmmaking", "#cinematography", "#cameratips", "#framecoach"],
  },

  "TOTAL\nCREATIVE\nCONTROL.": {
    tiktokTitle: "Take total creative control of your shots \uD83C\uDFA8",
    tiktokDescription:
      "Your shot list is your blueprint, but turning it into reality requires bridging the gap between creative vision and technical execution. FrameCoach transforms your shot list into camera-ready settings with professional-level precision. Every frame matches your intention because every setting is calculated, not guessed. This is how serious filmmakers shoot, with full control over every single parameter.",
    tiktokHashtags: ["#filmmaking", "#shotlist", "#filmdirector", "#creativecontrol", "#framecoach"],
  },

  "YOUR CAMERA.\nYOUR RULES.": {
    tiktokTitle: "Your camera should follow your rules \uD83D\uDCF7",
    tiktokDescription:
      "Technical uncertainty kills creative momentum. When you are unsure about settings, you play it safe, and safe means generic-looking footage. FrameCoach translates your creative intent into exact camera settings so you never have to compromise your vision because of a knowledge gap. Shoot bold. Shoot different. Shoot on your own terms. Your camera, your rules, your story.",
    tiktokHashtags: ["#filmmaking", "#filmmaker", "#camerasetup", "#indiefilm", "#framecoach"],
  },

  "NAIL THE\nSHOT. EVERY\nTIME.": {
    tiktokTitle: "Nail the shot on every single take \uD83C\uDFAC",
    tiktokDescription:
      "Consistency is what separates hobbyist footage from professional cinema. FrameCoach delivers consistent, professional results without a dedicated DP on every shoot by providing repeatable, data-driven camera settings tailored to your scene. No more lucky takes or hoping it looked okay on the monitor. Nail the exposure, nail the focus, nail the shot, every single time you press record.",
    tiktokHashtags: ["#filmmaking", "#filmtips", "#cinematographer", "#professionallook", "#framecoach"],
  },

  "FROM VISION\nTO FRAME.": {
    tiktokTitle: "From your vision to the perfect frame \u2728",
    tiktokDescription:
      "The gap between what you see in your head and what ends up on screen is usually a technical one. FrameCoach bridges that gap by letting you describe the look you want and delivering the exact camera settings to achieve it. No more trial and error. No more settling for close enough. From the mood in your mind to the frame on your monitor, every shot matches your creative intent.",
    tiktokHashtags: ["#filmmaking", "#visualstorytelling", "#filmmaker", "#cinematography", "#framecoach"],
  },

  "SHOOT\nFEARLESSLY.": {
    tiktokTitle: "Shoot fearlessly on every single set \uD83D\uDD25",
    tiktokDescription:
      "Fear of getting it wrong technically is the number one reason indie filmmakers play it safe creatively. FrameCoach removes the doubt so you can focus entirely on the story. Confidence in every setting means you can experiment with bold angles, push your exposure, and try unconventional framing without worrying about wasted footage. This is what fearless filmmaking looks like.",
    tiktokHashtags: ["#filmmaking", "#indiefilmmaker", "#filmconfidence", "#setlife", "#framecoach"],
  },

  // ── Brand Awareness (6) ──────────────────────────────────────────────
  "FRAMECOACH:\nTHE DIRECTOR'S\nEDGE.": {
    tiktokTitle: "The edge every director needs on set \uD83C\uDFAC",
    tiktokDescription:
      "FrameCoach is the director's edge, the tool that lets you focus entirely on your creative vision while it handles the technical translation. No more splitting your brain between storytelling and camera settings. Whether you are directing your first short or your tenth feature, FrameCoach gives you the confidence to shoot on your terms and deliver professional-grade footage every time.",
    tiktokHashtags: ["#filmmaking", "#director", "#indiefilm", "#filmtech", "#framecoach"],
  },

  "BUILT FOR\nFILMMAKERS.": {
    tiktokTitle: "This app was actually built for filmmakers \uD83C\uDFA5",
    tiktokDescription:
      "Most camera apps are designed for photographers, not filmmakers. FrameCoach is different. It was purpose-built for directors, DPs, and indie filmmakers who need real-time technical guidance on set. It understands cinematic workflows, scene-based shooting, and the specific challenges of motion picture production. If you shoot film, not stills, this is the only camera intelligence app worth using.",
    tiktokHashtags: ["#filmmaking", "#filmmakerlife", "#indiefilmmaker", "#cameraapp", "#framecoach"],
  },

  "THE FUTURE\nOF ON-SET\nDECISIONS.": {
    tiktokTitle: "This is the future of on-set decisions \uD83E\uDD16",
    tiktokDescription:
      "AI is transforming every industry, and filmmaking is next. FrameCoach brings AI-powered camera intelligence to your set, understanding filmmaking, not just photography. It processes your scene context and delivers tailored technical recommendations faster than any human reference chart. The future of on-set decision-making is not guesswork or experience alone, it is intelligent, real-time assistance.",
    tiktokHashtags: ["#filmmaking", "#AIfilmmaking", "#filmtech", "#futureoffilm", "#framecoach"],
  },

  "TRUSTED BY\nINDIE\nFILMMAKERS.": {
    tiktokTitle: "Thousands of filmmakers already use this \uD83E\uDD2B",
    tiktokDescription:
      "Join thousands of indie creators who have upgraded from guesswork to precision. FrameCoach is trusted by filmmakers around the world who are tired of wasting time on technical uncertainty and want reliable, data-driven camera settings on every shoot. Whether you are a film student, a weekend warrior, or a working professional, FrameCoach levels up your technical execution immediately.",
    tiktokHashtags: ["#filmmaking", "#indiefilm", "#filmcommunity", "#filmmakertools", "#framecoach"],
  },

  "CINEMA-GRADE\nINTELLIGENCE.": {
    tiktokTitle: "Cinema-grade intelligence in your pocket \uD83C\uDF1F",
    tiktokDescription:
      "Professional-level technical guidance used to require years of experience or an expensive crew. Now it fits in your pocket. FrameCoach provides cinema-grade intelligence accessible to every filmmaker, from first-time directors to seasoned DPs. It analyzes your scene and delivers the precise settings that give your footage that polished, professional look audiences expect from the big screen.",
    tiktokHashtags: ["#filmmaking", "#cinematography", "#cinematic", "#filmlook", "#framecoach"],
  },

  "YOUR SECRET\nWEAPON\nON SET.": {
    tiktokTitle: "The app filmmakers don't want you to know about \uD83E\uDD2B",
    tiktokDescription:
      "The edge that separates amateur from professional is not just talent, it is tools. FrameCoach is your secret weapon on set, the invisible advantage that makes your footage look leagues ahead of the competition. While others are fumbling with settings, you are nailing every shot with confidence. This is the kind of tool that changes careers, and most filmmakers do not know it exists yet.",
    tiktokHashtags: ["#filmmaking", "#secretweapon", "#filmhack", "#filmmaker", "#framecoach"],
  },

  // ── Film Education (6) ───────────────────────────────────────────────
  "GOLDEN HOUR\nISN'T MAGIC.": {
    tiktokTitle: "Golden hour isn't magic, it's physics \u2600\uFE0F",
    tiktokDescription:
      "Everyone loves golden hour footage but most filmmakers do not actually know how to meter for it properly. You only get about 20 minutes of perfect light, and if your settings are wrong, you have wasted the best shooting window of the day. Learn exactly how to expose for golden hour so every second of that magical light ends up on screen looking exactly how you imagined it.",
    tiktokHashtags: ["#filmmaking", "#goldenhour", "#lightingtips", "#cinematography", "#framecoach"],
  },

  "STOP\nCHIMPING.": {
    tiktokTitle: "Stop checking your LCD after every take \uD83D\uDC40",
    tiktokDescription:
      "Chimping, constantly checking your LCD screen after every shot, wastes time and breaks your creative flow. The best filmmakers trust their settings and stay in the moment. If you find yourself reviewing every take on the monitor before moving on, your settings are not dialed in properly. Learn how to set exposure and focus with confidence so you can keep shooting without interruption.",
    tiktokHashtags: ["#filmmaking", "#filmtips", "#onset", "#cameratechnique", "#framecoach"],
  },

  "THE EXPOSURE\nTRIANGLE\nSIMPLIFIED.": {
    tiktokTitle: "The exposure triangle finally makes sense \uD83D\uDD3A",
    tiktokDescription:
      "ISO, shutter speed, aperture, three variables with infinite combinations that confuse almost every beginner filmmaker. But understanding the exposure triangle does not have to be complicated. Once you learn how these three settings interact and when to prioritize each one, you will have complete control over your image. Here is the simple framework that makes exposure click for good.",
    tiktokHashtags: ["#filmmaking", "#exposuretriangle", "#learnfilmmaking", "#cameratips", "#framecoach"],
  },

  "DEPTH OF\nFIELD IS\nSTORYTELLING.": {
    tiktokTitle: "What you blur matters as much as what you focus on \uD83C\uDFAC",
    tiktokDescription:
      "Depth of field is not just a technical setting, it is a storytelling tool. What you choose to blur says as much about your scene as what you keep in sharp focus. Shallow depth of field isolates your subject and creates intimacy. Deep focus puts your audience inside the world. Master selective focus and you control exactly where your viewer looks and how they feel in every frame.",
    tiktokHashtags: ["#filmmaking", "#depthoffield", "#cinematography", "#visualstorytelling", "#framecoach"],
  },

  "COLOUR\nTEMPERATURE\nMATTERS.": {
    tiktokTitle: "This is why your shots look amateur \uD83D\uDCA1",
    tiktokDescription:
      "The difference between amateur and cinematic footage often comes down to one overlooked setting: colour temperature. Understanding Kelvin values and how different light sources interact is what gives professional films their consistent, polished look. If your whites look orange indoors or blue outdoors, your colour temperature is off. Learn how to nail white balance and instantly upgrade your footage.",
    tiktokHashtags: ["#filmmaking", "#colourtemperature", "#whitebalance", "#filmlook", "#framecoach"],
  },

  "FRAME\nLIKE A\nMASTER.": {
    tiktokTitle: "Rule of thirds is just the beginning \uD83D\uDDBC\uFE0F",
    tiktokDescription:
      "Everyone knows the rule of thirds, but master filmmakers use dozens of composition techniques to guide the viewer's eye through every frame. Leading lines, negative space, frame within a frame, Dutch angles, symmetry, and depth layering are all tools in the visual storytelling toolkit. Learn the composition principles that separate forgettable shots from frames that audiences remember forever.",
    tiktokHashtags: ["#filmmaking", "#composition", "#framing", "#cinematography", "#framecoach"],
  },
};

// ── Main ───────────────────────────────────────────────────────────────
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

let updated = 0;
let skipped = 0;

for (const item of manifest.items) {
  const meta = TIKTOK_META[item.headline];
  if (meta) {
    item.tiktokTitle = meta.tiktokTitle;
    item.tiktokDescription = meta.tiktokDescription;
    item.tiktokHashtags = meta.tiktokHashtags;
    updated++;
  } else {
    skipped++;
    console.warn(`⚠ No TikTok metadata for headline: ${JSON.stringify(item.headline)}`);
  }
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Done. Updated ${updated} items, skipped ${skipped}.`);
console.log(`Unique headlines covered: ${Object.keys(TIKTOK_META).length}`);
