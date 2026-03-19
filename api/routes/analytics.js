/**
 * Analytics Aggregation Routes
 *
 * Aggregates analytics from the local content store + pulls live data
 * from TikTok and Instagram APIs when configured.
 *
 * Routes:
 *   GET  /api/analytics/overview          — Combined stats across all platforms
 *   GET  /api/analytics/top-performing    — Top 5 posts by engagement
 *   GET  /api/analytics/by-template       — Performance by template style
 *   GET  /api/analytics/by-category       — Performance by content category
 *   GET  /api/analytics/by-platform       — TikTok vs Instagram comparison
 *   GET  /api/analytics/recommendations   — AI-computed insights from the data
 *   POST /api/analytics/sync              — Pull latest analytics from live APIs
 *   GET  /api/analytics/hashtags          — Recommended hashtags for a category + platform
 *   GET  /api/analytics/hashtag-sets      — Pre-built hashtag sets for all categories and platforms
 */

import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { isConfigured as tiktokConfigured } from '../services/tiktok-service.js';
import { isConfigured as instagramConfigured, getMediaInsights, getAccountInsights } from '../services/instagram-service.js';
import { getHashtags, getHashtagSets, getDatabaseStats, PLATFORM_CONFIG } from '../../generator/hashtag-engine.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '..', 'data', 'content.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readData() {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  data.lastUpdated = new Date().toISOString();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Get only posted items with analytics data */
function getPostedWithAnalytics(items) {
  return items.filter(i => i.status === 'posted' && i.analytics);
}

/** Compute aggregate stats for a group of items */
function aggregateAnalytics(items) {
  const withAnalytics = items.filter(i => i.analytics);
  if (withAnalytics.length === 0) {
    return { count: items.length, postedCount: 0, impressions: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, engagements: 0, avgEngagementRate: 0 };
  }

  const agg = withAnalytics.reduce((acc, item) => {
    const a = item.analytics;
    acc.impressions += a.impressions || 0;
    acc.reach += a.reach || 0;
    acc.likes += a.likes || 0;
    acc.comments += a.comments || 0;
    acc.saves += a.saves || 0;
    acc.shares += a.shares || 0;
    acc.engagements += (a.likes || 0) + (a.comments || 0) + (a.saves || 0) + (a.shares || 0);
    acc.rateSum += a.engagementRate || 0;
    return acc;
  }, { impressions: 0, reach: 0, likes: 0, comments: 0, saves: 0, shares: 0, engagements: 0, rateSum: 0 });

  return {
    count: items.length,
    postedCount: withAnalytics.length,
    impressions: agg.impressions,
    reach: agg.reach,
    likes: agg.likes,
    comments: agg.comments,
    saves: agg.saves,
    shares: agg.shares,
    engagements: agg.engagements,
    avgEngagementRate: parseFloat((agg.rateSum / withAnalytics.length).toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// GET /api/analytics/overview
// ---------------------------------------------------------------------------
router.get('/overview', async (req, res, next) => {
  try {
    const data = await readData();
    const items = data.items;
    const posted = getPostedWithAnalytics(items);

    const allStats = aggregateAnalytics(posted);

    res.json({
      ok: true,
      overview: {
        totalContent: items.length,
        posted: items.filter(i => i.status === 'posted').length,
        queued: items.filter(i => i.status === 'queued').length,
        draft: items.filter(i => i.status === 'draft').length,
        ...allStats,
        platforms: {
          tiktok: { configured: tiktokConfigured(), postCount: items.filter(i => i.platform === 'tiktok' && i.status === 'posted').length },
          instagram: { configured: instagramConfigured(), postCount: items.filter(i => i.platform === 'instagram' && i.status === 'posted').length },
        },
        lastUpdated: data.lastUpdated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/top-performing
// ---------------------------------------------------------------------------
router.get('/top-performing', async (req, res, next) => {
  try {
    const data = await readData();
    const limit = Math.min(20, parseInt(req.query.limit) || 5);
    const metric = req.query.metric || 'engagementRate'; // impressions | likes | saves | engagementRate

    const validMetrics = ['engagementRate', 'impressions', 'reach', 'likes', 'comments', 'saves', 'shares'];
    const sortBy = validMetrics.includes(metric) ? metric : 'engagementRate';

    const withAnalytics = getPostedWithAnalytics(data.items);

    const sorted = withAnalytics
      .slice()
      .sort((a, b) => (b.analytics[sortBy] || 0) - (a.analytics[sortBy] || 0))
      .slice(0, limit);

    res.json({
      ok: true,
      sortedBy: sortBy,
      limit,
      topPerforming: sorted.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        template: item.template,
        platform: item.platform,
        postedAt: item.postedAt,
        platformUrl: item.platformUrl,
        analytics: item.analytics,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/by-template
// ---------------------------------------------------------------------------
router.get('/by-template', async (req, res, next) => {
  try {
    const data = await readData();
    const withAnalytics = getPostedWithAnalytics(data.items);

    // Group by template
    const grouped = {};
    for (const item of withAnalytics) {
      if (!grouped[item.template]) grouped[item.template] = [];
      grouped[item.template].push(item);
    }

    const breakdown = Object.entries(grouped).map(([template, items]) => ({
      template,
      ...aggregateAnalytics(items),
    }));

    // Sort by avgEngagementRate descending
    breakdown.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);

    res.json({ ok: true, byTemplate: breakdown });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/by-category
// ---------------------------------------------------------------------------
router.get('/by-category', async (req, res, next) => {
  try {
    const data = await readData();
    const withAnalytics = getPostedWithAnalytics(data.items);

    const grouped = {};
    for (const item of withAnalytics) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    const breakdown = Object.entries(grouped).map(([category, items]) => ({
      category,
      ...aggregateAnalytics(items),
    }));

    breakdown.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);

    res.json({ ok: true, byCategory: breakdown });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/by-platform
// ---------------------------------------------------------------------------
router.get('/by-platform', async (req, res, next) => {
  try {
    const data = await readData();
    const withAnalytics = getPostedWithAnalytics(data.items);

    const tiktokItems = withAnalytics.filter(i => i.platform === 'tiktok');
    const instagramItems = withAnalytics.filter(i => i.platform === 'instagram');

    const tiktokStats = aggregateAnalytics(tiktokItems);
    const instagramStats = aggregateAnalytics(instagramItems);

    // Compute deltas
    const engagementDelta = tiktokStats.avgEngagementRate && instagramStats.avgEngagementRate
      ? parseFloat(((tiktokStats.avgEngagementRate - instagramStats.avgEngagementRate) / instagramStats.avgEngagementRate * 100).toFixed(1))
      : null;

    const impressionsDelta = tiktokStats.impressions && instagramStats.impressions
      ? parseFloat(((tiktokStats.impressions - instagramStats.impressions) / instagramStats.impressions * 100).toFixed(1))
      : null;

    res.json({
      ok: true,
      byPlatform: {
        tiktok: { platform: 'tiktok', configured: tiktokConfigured(), ...tiktokStats },
        instagram: { platform: 'instagram', configured: instagramConfigured(), ...instagramStats },
      },
      comparison: {
        engagementRateDelta: engagementDelta !== null
          ? `TikTok engagement is ${Math.abs(engagementDelta)}% ${engagementDelta >= 0 ? 'higher' : 'lower'} than Instagram`
          : 'Not enough data to compare',
        impressionsDelta: impressionsDelta !== null
          ? `TikTok reach is ${Math.abs(impressionsDelta)}% ${impressionsDelta >= 0 ? 'higher' : 'lower'} than Instagram`
          : 'Not enough data to compare',
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/recommendations
// ---------------------------------------------------------------------------
/**
 * Compute AI-style insights from the data.
 * These are algorithmic observations — no external AI API call needed.
 * Examples:
 *   - "tip-card template performs 40% better than checklist"
 *   - "TikTok gets 2x more impressions than Instagram"
 *   - "Your best posting day is Tuesday"
 *   - "color-grading content gets the highest saves"
 */
router.get('/recommendations', async (req, res, next) => {
  try {
    const data = await readData();
    const withAnalytics = getPostedWithAnalytics(data.items);

    if (withAnalytics.length < 3) {
      return res.json({
        ok: true,
        recommendations: [],
        note: 'Need at least 3 posted items with analytics to generate recommendations.',
      });
    }

    const recommendations = [];

    // --- Template comparison ---
    const byTemplate = {};
    for (const item of withAnalytics) {
      if (!byTemplate[item.template]) byTemplate[item.template] = [];
      byTemplate[item.template].push(item.analytics.engagementRate || 0);
    }

    const templateAvgs = Object.entries(byTemplate).map(([t, rates]) => ({
      template: t,
      avg: rates.reduce((s, r) => s + r, 0) / rates.length,
      count: rates.length,
    })).sort((a, b) => b.avg - a.avg);

    if (templateAvgs.length >= 2) {
      const best = templateAvgs[0];
      const worst = templateAvgs[templateAvgs.length - 1];
      const delta = worst.avg > 0 ? Math.round(((best.avg - worst.avg) / worst.avg) * 100) : null;
      if (delta !== null) {
        recommendations.push({
          type: 'template',
          priority: 'high',
          insight: `"${best.template}" template performs ${delta}% better than "${worst.template}" by engagement rate.`,
          action: `Create more content using the "${best.template}" template format.`,
          data: { best, worst },
        });
      }
    }

    // --- Category comparison ---
    const byCategory = {};
    for (const item of withAnalytics) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    }

    const categoryStats = Object.entries(byCategory).map(([cat, items]) => ({
      category: cat,
      avgEngagement: items.reduce((s, i) => s + (i.analytics.engagementRate || 0), 0) / items.length,
      avgSaves: items.reduce((s, i) => s + (i.analytics.saves || 0), 0) / items.length,
      count: items.length,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);

    if (categoryStats.length >= 2) {
      const topCat = categoryStats[0];
      recommendations.push({
        type: 'category',
        priority: 'medium',
        insight: `"${topCat.category}" content gets the highest engagement rate (${topCat.avgEngagement.toFixed(1)}% avg).`,
        action: `Increase content frequency for "${topCat.category}" topics.`,
        data: topCat,
      });

      // Best saves category
      const topSaves = [...categoryStats].sort((a, b) => b.avgSaves - a.avgSaves)[0];
      if (topSaves.avgSaves > 0) {
        recommendations.push({
          type: 'saves',
          priority: 'medium',
          insight: `"${topSaves.category}" content gets the most saves (${Math.round(topSaves.avgSaves)} avg). Saves signal high-value content.`,
          action: `Use "${topSaves.category}" content as lead magnets — add CTAs like "Save this for your next shoot."`,
          data: topSaves,
        });
      }
    }

    // --- Platform comparison ---
    const tiktokItems = withAnalytics.filter(i => i.platform === 'tiktok');
    const igItems = withAnalytics.filter(i => i.platform === 'instagram');

    if (tiktokItems.length > 0 && igItems.length > 0) {
      const tiktokAvgImpressions = tiktokItems.reduce((s, i) => s + (i.analytics.impressions || 0), 0) / tiktokItems.length;
      const igAvgImpressions = igItems.reduce((s, i) => s + (i.analytics.impressions || 0), 0) / igItems.length;

      if (tiktokAvgImpressions !== igAvgImpressions) {
        const ratio = (Math.max(tiktokAvgImpressions, igAvgImpressions) / Math.min(tiktokAvgImpressions, igAvgImpressions)).toFixed(1);
        const leader = tiktokAvgImpressions > igAvgImpressions ? 'TikTok' : 'Instagram';
        recommendations.push({
          type: 'platform',
          priority: 'high',
          insight: `${leader} delivers ${ratio}x more impressions per post than the other platform.`,
          action: `Prioritize posting to ${leader} first. Cross-post to the other platform within 24 hours.`,
          data: { tiktokAvgImpressions: Math.round(tiktokAvgImpressions), igAvgImpressions: Math.round(igAvgImpressions) },
        });
      }
    }

    // --- Posting frequency recommendation ---
    if (withAnalytics.length >= 5) {
      const sortedByDate = withAnalytics
        .filter(i => i.postedAt)
        .sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));

      if (sortedByDate.length >= 2) {
        const firstPost = new Date(sortedByDate[0].postedAt);
        const lastPost = new Date(sortedByDate[sortedByDate.length - 1].postedAt);
        const daySpan = Math.max(1, (lastPost - firstPost) / (1000 * 60 * 60 * 24));
        const avgPerDay = (sortedByDate.length / daySpan).toFixed(1);

        recommendations.push({
          type: 'frequency',
          priority: 'low',
          insight: `Current posting frequency: ~${avgPerDay} posts/day over the tracked period.`,
          action: avgPerDay < 1
            ? 'Increase to at least 1 post/day to improve platform algorithm visibility.'
            : `Consistency is strong at ${avgPerDay} posts/day. Maintain this cadence.`,
          data: { avgPerDay: parseFloat(avgPerDay), totalPosts: sortedByDate.length, daySpan: Math.round(daySpan) },
        });
      }
    }

    res.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      basedOn: `${withAnalytics.length} posts with analytics data`,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/analytics/sync — Pull latest analytics from live APIs
// ---------------------------------------------------------------------------
/**
 * Fetches fresh analytics from TikTok and Instagram for all posted items
 * and updates content.json with the latest numbers.
 *
 * NOTE: This is a best-effort sync. Platform APIs may have delays.
 *       TikTok does not expose per-post analytics in the Content Posting API —
 *       you'd need the Research API or Creator Portal for detailed stats.
 *       Instagram insights are fully supported.
 */
router.post('/sync', async (req, res, next) => {
  try {
    const data = await readData();
    const postedItems = data.items.filter(i => i.status === 'posted' && i.platformPostId);

    const results = {
      instagram: { attempted: 0, updated: 0, errors: [] },
      tiktok: { attempted: 0, updated: 0, errors: [], note: 'TikTok per-post analytics not available via Content Posting API' },
    };

    if (!instagramConfigured()) {
      results.instagram.skipped = true;
      results.instagram.reason = 'Instagram not configured';
    } else {
      const igItems = postedItems.filter(i => i.platform === 'instagram');
      results.instagram.attempted = igItems.length;

      for (const item of igItems) {
        try {
          const insightsResponse = await getMediaInsights(item.platformPostId);
          // Parse the insights response (format: { data: [{ name, values }] })
          const insightsMap = {};
          if (insightsResponse.data) {
            for (const metric of insightsResponse.data) {
              insightsMap[metric.name] = metric.values?.[0]?.value ?? metric.value ?? 0;
            }
          }

          const idx = data.items.findIndex(i => i.id === item.id);
          if (idx !== -1) {
            const current = data.items[idx].analytics || {};
            data.items[idx].analytics = {
              ...current,
              impressions: insightsMap.impressions ?? current.impressions,
              reach: insightsMap.reach ?? current.reach,
              likes: insightsMap.like_count ?? current.likes,
              comments: insightsMap.comments_count ?? current.comments,
              saves: insightsMap.saved ?? current.saves,
              shares: insightsMap.shares ?? current.shares,
              syncedAt: new Date().toISOString(),
            };
            // Recalculate engagement rate
            const a = data.items[idx].analytics;
            if (a.impressions) {
              a.engagementRate = parseFloat((
                ((a.likes + a.comments + a.saves + a.shares) / a.impressions) * 100
              ).toFixed(2));
            }
            results.instagram.updated++;
          }
        } catch (err) {
          results.instagram.errors.push({ id: item.id, error: err.message });
        }
      }
    }

    if (results.instagram.updated > 0) {
      await writeData(data);
    }

    res.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      results,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics/hashtags
// ---------------------------------------------------------------------------
/**
 * Returns a randomised, platform-optimised hashtag set for a given content
 * category and platform.
 *
 * Query params:
 *   category  — 'app-promo' | 'brand-awareness' | 'film-education'  (default: 'brand-awareness')
 *   platform  — 'instagram' | 'tiktok'                               (default: 'instagram')
 *   type      — optional content sub-type for future expansion        (default: 'standard')
 *
 * Example: GET /api/analytics/hashtags?category=film-education&platform=tiktok
 */
router.get('/hashtags', (req, res) => {
  const VALID_CATEGORIES = ['app-promo', 'brand-awareness', 'film-education'];
  const VALID_PLATFORMS  = ['instagram', 'tiktok'];

  const category    = VALID_CATEGORIES.includes(req.query.category) ? req.query.category : 'brand-awareness';
  const platform    = VALID_PLATFORMS.includes(req.query.platform)   ? req.query.platform  : 'instagram';
  const contentType = req.query.type || 'standard';

  const result = getHashtags(category, platform, contentType);
  const cfg    = PLATFORM_CONFIG[platform];

  res.json({
    ok: true,
    request: { category, platform, contentType },
    recommendation: {
      hashtags:        result.hashtags,
      count:           result.count,
      optimalCount:    cfg.optimalCount,
      formattedString: result.formattedString,
      placement:       result.placement,
      placementNote:   cfg.placementNote,
      strategy:        result.strategy,
    },
    note: 'Each call returns a freshly randomised set from the hashtag pool. No two calls are identical.',
  });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/hashtag-sets
// ---------------------------------------------------------------------------
/**
 * Returns pre-built hashtag sets for every content category × platform
 * combination. Useful for bulk preview, dashboard display, or seeding a
 * scheduling UI with ready-to-use hashtag options.
 *
 * Also includes database stats and platform configuration for reference.
 *
 * Example: GET /api/analytics/hashtag-sets
 */
router.get('/hashtag-sets', (req, res) => {
  const sets  = getHashtagSets();
  const stats = getDatabaseStats();

  // Flatten the sets into a more API-friendly structure
  const formatted = {};
  for (const [platform, categories] of Object.entries(sets)) {
    formatted[platform] = {};
    for (const [category, result] of Object.entries(categories)) {
      formatted[platform][category] = {
        hashtags:        result.hashtags,
        count:           result.count,
        formattedString: result.formattedString,
        placement:       result.placement,
        strategy:        result.strategy,
      };
    }
  }

  res.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    note: 'Sets are randomised on each request. Refresh for fresh variation.',
    platformConfig: {
      instagram: {
        optimalCount: PLATFORM_CONFIG.instagram.optimalCount,
        maxCount:     PLATFORM_CONFIG.instagram.maxCount,
        placement:    PLATFORM_CONFIG.instagram.placement,
        strategy:     PLATFORM_CONFIG.instagram.strategy,
      },
      tiktok: {
        optimalCount: PLATFORM_CONFIG.tiktok.optimalCount,
        maxCount:     PLATFORM_CONFIG.tiktok.maxCount,
        placement:    PLATFORM_CONFIG.tiktok.placement,
        strategy:     PLATFORM_CONFIG.tiktok.strategy,
      },
    },
    databaseStats: stats,
    hashtagSets: formatted,
  });
});

export default router;
