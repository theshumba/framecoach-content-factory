/**
 * FrameCoach Hashtag Recommendation Engine
 *
 * Research-backed hashtag database and selection logic for Instagram and TikTok.
 *
 * Key findings from 2025–2026 research:
 *   - Instagram: 3–5 highly relevant hashtags per post (algorithm now penalises spam
 *     stacking). Caption placement outperforms first-comment placement, especially for
 *     accounts under 100K followers (up to 36% reach boost in caption).
 *   - TikTok: 3–5 strategically chosen hashtags. Hashtag stuffing actively reduces
 *     distribution. Mix community (#filmtok) with broad (#fyp) and niche topic tags.
 *   - Both platforms now treat captions as indexable text, so keyword-rich captions
 *     matter more than raw hashtag count.
 *   - Mix strategy: 2–3 broad (1M+ posts) + 2–3 medium (100K–1M) + 2–3 niche
 *     (10K–100K) + 1–2 micro (<10K, highest engagement rate) + branded tags.
 */

// ---------------------------------------------------------------------------
// Hashtag Database
// ---------------------------------------------------------------------------

export const HASHTAG_DB = {

  // ── Filmmaking core ──────────────────────────────────────────────────────
  filmmaking: {
    // Broad: 1M+ posts — maximum discovery, high competition
    broad: [
      '#filmmaking',
      '#filmmaker',
      '#cinema',
      '#film',
      '#cinematography',
      '#director',
      '#movies',
      '#video',
      '#videography',
      '#filmphotography',
    ],
    // Medium: 100K–1M — good reach, more targeted community
    medium: [
      '#indiefilm',
      '#shortfilm',
      '#filmproduction',
      '#cinematographer',
      '#setlife',
      '#behindthescenes',
      '#indiefilmmaker',
      '#filmdirector',
      '#filmcommunity',
      '#cinematic',
      '#directorofphotography',
      '#filmfestival',
      '#moviemaking',
      '#independentfilm',
    ],
    // Niche: 10K–100K — lower competition, stronger community engagement
    niche: [
      '#filmset',
      '#filmcrew',
      '#onset',
      '#indiefilmmaking',
      '#filmlife',
      '#filmmakerslife',
      '#filmmakersworld',
      '#dp',
      '#dop',
      '#cinematips',
      '#filmtips',
      '#directorlife',
      '#shortfilmmaker',
      '#filmproducer',
      '#filmediting',
    ],
    // Micro: <10K — niche community, highest engagement-to-follower ratio
    micro: [
      '#dplife',
      '#independentdirector',
      '#filmmakersofinsta',
      '#cinephilecommunity',
      '#makeindiefilm',
      '#lowbudgetfilm',
      '#solofilmmaker',
      '#framegrabs',
    ],
  },

  // ── Camera & technical ───────────────────────────────────────────────────
  tech: {
    broad: [
      '#camera',
      '#photography',
      '#photo',
    ],
    medium: [
      '#camerawork',
      '#shootingfilm',
      '#videoproduction',
      '#filmgear',
      '#cameraoperator',
    ],
    niche: [
      '#exposuretriangle',
      '#depthoffield',
      '#colorgrading',
      '#colorgrade',
      '#colourgrading',
      '#cinemalens',
      '#anamorphic',
      '#rawfootage',
      '#filmscanner',
    ],
    micro: [
      '#exposuretips',
      '#cameralife',
      '#cinematiccolor',
      '#framerates',
      '#neutraldensity',
    ],
  },

  // ── Education & learning ─────────────────────────────────────────────────
  education: {
    broad: [
      '#filmschool',
      '#learnfilmmaking',
      '#howto',
    ],
    medium: [
      '#filmtips',
      '#filmlessons',
      '#filmadvice',
      '#cinematographytips',
      '#directortips',
    ],
    niche: [
      '#filmmakingtips',
      '#filmschoolonline',
      '#shotcomposition',
      '#lightingtips',
      '#storytellingtips',
      '#filmtechnique',
      '#cinematographylesson',
    ],
    micro: [
      '#learncinema',
      '#filmacademy',
      '#filmstudy',
      '#directoradvice',
    ],
  },

  // ── App & tech tools ─────────────────────────────────────────────────────
  appPromo: {
    broad: [
      '#app',
      '#tech',
      '#technology',
    ],
    medium: [
      '#filmapp',
      '#creativetools',
      '#aitools',
      '#productivityapp',
      '#mobileapp',
    ],
    niche: [
      '#filmtechnology',
      '#cameraapp',
      '#aishooting',
      '#smartfilm',
      '#filmtech',
      '#filmprotools',
    ],
    micro: [
      '#filmstart',
      '#shootsmarter',
      '#directorapp',
    ],
  },

  // ── Motivation & mindset ─────────────────────────────────────────────────
  motivation: {
    broad: [
      '#motivation',
      '#inspiration',
      '#creative',
      '#art',
    ],
    medium: [
      '#creativemindset',
      '#filmlife',
      '#filmerslife',
      '#createeveryday',
      '#contentcreator',
    ],
    niche: [
      '#filmerspirit',
      '#shooteveryday',
      '#filmersunite',
      '#visualstorytelling',
      '#storydrivenfilm',
    ],
    micro: [
      '#filmmakermindset',
      '#filmhustle',
      '#shoottoedit',
    ],
  },

  // ── TikTok-specific community tags ───────────────────────────────────────
  tiktokCommunity: {
    broad: [
      '#fyp',
      '#foryoupage',
      '#foryou',
      '#viral',
    ],
    medium: [
      '#filmtok',
      '#filmstudenttok',
      '#cinematiktok',
      '#learntok',
    ],
    niche: [
      '#filmmakingtiktok',
      '#directortok',
      '#cameranerds',
      '#filmschoolgrad',
    ],
    micro: [
      '#smallfilmmaker',
      '#indiemovieclips',
    ],
  },

  // ── Branded ──────────────────────────────────────────────────────────────
  branded: [
    '#FrameCoach',
    '#FrameCoachApp',
    '#TheDirectorsEdge',
  ],
};

// ---------------------------------------------------------------------------
// Platform Configuration
// ---------------------------------------------------------------------------

export const PLATFORM_CONFIG = {
  instagram: {
    /**
     * Optimal count per 2025–2026 algorithm research.
     * Instagram's own guidance (2025): use 3–5 highly relevant hashtags.
     * Data studies show 4–5 hashtags perform best for accounts under 100K followers.
     * Avoid the old 20–30 spray-and-pray approach — it now signals spam.
     */
    optimalCount: 5,
    maxCount: 30,
    placement: 'caption',
    placementNote: 'Add hashtags directly in the caption for accounts under 100K followers. Instagram captions are indexable, so placement in caption gets processed instantly with the rest of the post metadata.',
    strategy: 'Mix 2 broad + 2 medium + 1 niche + branded. Keep total at 5. Prioritise relevance over reach. Instagram now rewards topical precision over volume.',
    avoidPattern: 'Do NOT use 20–30 generic hashtags. Instagram\'s Explore algorithm deprioritises posts that appear to be hashtag-stuffing.',
  },
  tiktok: {
    /**
     * Optimal count per 2025–2026 TikTok algorithm research.
     * TikTok 2026 algorithm update: 3–5 hashtags recommended. Hashtag stuffing actively
     * reduces distribution. Community tags (#filmtok) + niche topic + 1–2 broad (#fyp) +
     * branded. Total of 5 slots: 1 broad discovery + 1 community + 1 medium topic +
     * 1 niche + 1 branded (always #FrameCoach). The engine uses 2 branded slots so
     * effective non-branded selection stays at 4.
     */
    optimalCount: 6,
    maxCount: 8,
    placement: 'caption',
    placementNote: 'Hashtags go in the caption. TikTok reads the full caption as context — include relevant keywords naturally in addition to hashtags.',
    strategy: 'Always include #fyp or #foryou (broad discovery). Add 1–2 community tags (#filmtok, #cinematiktok). Add 1–2 niche topic tags. Add branded tag. Total: 4–5.',
    avoidPattern: 'Avoid filling the caption with 20+ hashtags. TikTok\'s 2026 algorithm treats this as low-quality signal.',
  },
};

// ---------------------------------------------------------------------------
// Content category → hashtag pool mapping
// ---------------------------------------------------------------------------

/**
 * Maps content categories (from brand-config.js) to relevant hashtag pool keys.
 * Each category gets a curated blend of pools appropriate to the content intent.
 */
const CATEGORY_POOL_MAP = {
  'app-promo': {
    primary: 'appPromo',
    secondary: ['filmmaking', 'motivation'],
    weights: { broad: 2, medium: 2, niche: 1, micro: 0 },
  },
  'brand-awareness': {
    primary: 'filmmaking',
    secondary: ['motivation', 'appPromo'],
    weights: { broad: 2, medium: 2, niche: 1, micro: 0 },
  },
  'film-education': {
    primary: 'education',
    secondary: ['filmmaking', 'tech'],
    weights: { broad: 1, medium: 2, niche: 2, micro: 0 },
  },
  // Fallback for any unrecognised category
  'default': {
    primary: 'filmmaking',
    secondary: ['motivation'],
    weights: { broad: 2, medium: 2, niche: 1, micro: 0 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Shuffle an array using Fisher-Yates (returns a new array).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `n` unique items from an array, randomised each call.
 */
function pick(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/**
 * Merge hashtag pools from multiple DB categories (deduplicated).
 */
function mergePools(categoryKeys, tier) {
  const seen = new Set();
  const merged = [];
  for (const key of categoryKeys) {
    const pool = HASHTAG_DB[key]?.[tier] || [];
    for (const tag of pool) {
      if (!seen.has(tag)) {
        seen.add(tag);
        merged.push(tag);
      }
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Core export: getHashtags()
// ---------------------------------------------------------------------------

/**
 * Returns an optimised, randomised hashtag set for a given piece of content.
 *
 * @param {string} category   - Content category: 'app-promo' | 'brand-awareness' | 'film-education'
 * @param {string} platform   - Target platform: 'instagram' | 'tiktok'
 * @param {string} [contentType] - Optional sub-type for future expansion (e.g. 'reel', 'carousel')
 * @returns {{ hashtags: string[], count: number, platform: string, category: string, strategy: string }}
 */
export function getHashtags(category, platform, contentType = null) {
  const platformCfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
  const poolConfig = CATEGORY_POOL_MAP[category] || CATEGORY_POOL_MAP['default'];

  const { primary, secondary, weights } = poolConfig;

  // ── Build tier pools ──────────────────────────────────────────────────────
  // Broad pool draws ONLY from the primary category to avoid generic bleed
  // (e.g. #art, #technology) from secondary support categories.
  // Medium and niche merge primary + secondary for richer variety.
  const broadPool  = mergePools([primary], 'broad');
  const mediumPool = mergePools([primary, ...secondary], 'medium');
  const nichePool  = mergePools([primary, ...secondary], 'niche');
  const microPool  = mergePools([primary, ...secondary], 'micro');

  // ── Platform-specific overrides ───────────────────────────────────────────
  let selected = [];

  if (platform === 'tiktok') {
    // TikTok: always lead with #fyp-tier broad discovery + a community tag
    // (#filmtok, #cinematiktok etc.), then 1 medium topic tag + 1 niche.
    const broadTags     = pick(mergePools(['tiktokCommunity'], 'broad'), 1);     // #fyp / #foryoupage
    const communityTags = pick(mergePools(['tiktokCommunity'], 'medium'), 1);    // #filmtok etc.
    const mediumTags    = pick(mediumPool, 1);
    const nicheTags     = pick(nichePool, 1);

    selected = [
      ...broadTags,
      ...communityTags,
      ...mediumTags,
      ...nicheTags,
    ];
  } else {
    // Instagram: relevance-first mix from primary broad + merged medium/niche
    const broadTags  = pick(broadPool,  weights.broad);
    const mediumTags = pick(mediumPool, weights.medium);
    const nicheTags  = pick(nichePool,  weights.niche);
    const microTags  = weights.micro > 0 ? pick(microPool, weights.micro) : [];

    selected = [
      ...broadTags,
      ...mediumTags,
      ...nicheTags,
      ...microTags,
    ];
  }

  // ── Always append branded tags ────────────────────────────────────────────
  // Use primary branded tag + one additional (randomised)
  const branded = [
    HASHTAG_DB.branded[0],                                  // #FrameCoach (always)
    ...pick(HASHTAG_DB.branded.slice(1), 1),                // #FrameCoachApp or #TheDirectorsEdge
  ];

  // ── Deduplicate and trim to platform optimal count ────────────────────────
  const targetCount = platformCfg.optimalCount;
  // Reserve 2 slots for branded; fill rest from selected
  const contentSlots = Math.max(0, targetCount - branded.length);
  const trimmed = [...new Set(selected)].slice(0, contentSlots);

  const final = [...trimmed, ...branded];

  return {
    hashtags: final,
    count: final.length,
    platform,
    category,
    contentType: contentType || 'standard',
    strategy: platformCfg.strategy,
    placement: platformCfg.placement,
    formattedString: final.join(' '),
  };
}

// ---------------------------------------------------------------------------
// Bulk export: getHashtagSets()
// ---------------------------------------------------------------------------

/**
 * Returns pre-built hashtag sets for every content category × platform combination.
 * Useful for batch preview, API responses, or seeding a UI picker.
 *
 * @returns {Object} Nested object: { [platform]: { [category]: hashtagResult } }
 */
export function getHashtagSets() {
  const platforms = ['instagram', 'tiktok'];
  const categories = ['app-promo', 'brand-awareness', 'film-education'];

  const sets = {};

  for (const platform of platforms) {
    sets[platform] = {};
    for (const category of categories) {
      sets[platform][category] = getHashtags(category, platform);
    }
  }

  return sets;
}

// ---------------------------------------------------------------------------
// Stats export: getDatabaseStats()
// ---------------------------------------------------------------------------

/**
 * Returns a summary of the hashtag database — useful for the strategy guide
 * and for verifying coverage at runtime.
 */
export function getDatabaseStats() {
  const stats = {};
  let totalUnique = 0;

  for (const [catKey, catVal] of Object.entries(HASHTAG_DB)) {
    if (Array.isArray(catVal)) {
      // branded array
      stats[catKey] = { total: catVal.length };
      totalUnique += catVal.length;
      continue;
    }
    const tierCounts = {};
    let catTotal = 0;
    for (const [tier, tags] of Object.entries(catVal)) {
      tierCounts[tier] = tags.length;
      catTotal += tags.length;
    }
    stats[catKey] = { ...tierCounts, total: catTotal };
    totalUnique += catTotal;
  }

  return {
    categories: Object.keys(HASHTAG_DB).length,
    totalHashtags: totalUnique,
    breakdown: stats,
    platformConfigs: Object.keys(PLATFORM_CONFIG),
  };
}
