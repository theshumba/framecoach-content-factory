/**
 * Instagram Graph API Routes
 *
 * Implements Instagram content publishing via the Meta Graph API.
 *
 * HOW IT WORKS:
 *   - Images must be hosted at a publicly accessible HTTPS URL.
 *   - Two-step process: (1) Create media container → (2) Publish
 *   - For carousels: create children → create carousel container → publish
 *
 * REQUIRED SETUP:
 *   1. Instagram Business or Creator account
 *   2. Facebook Page connected to your Instagram account
 *   3. Meta Developer App at https://developers.facebook.com/
 *   4. Add Instagram Graph API product, get permissions:
 *      - instagram_basic
 *      - instagram_content_publish
 *      - instagram_manage_insights (for analytics)
 *      - pages_read_engagement
 *   5. Generate access token in Meta Graph API Explorer or Business Suite
 *   6. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env
 *
 * RATE LIMITS:
 *   - 25 posts per 24 hours per Instagram account
 *   - Use /api/instagram/account-insights sparingly (quota applies)
 *
 * API REFERENCE:
 *   https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *
 * Routes:
 *   GET  /api/instagram/auth                      — Setup instructions
 *   GET  /api/instagram/status                    — Check if Instagram is configured
 *   POST /api/instagram/publish                   — Publish single image
 *   POST /api/instagram/carousel                  — Publish carousel
 *   GET  /api/instagram/insights/:media_id        — Get post insights
 *   GET  /api/instagram/account-insights          — Get account insights
 */

import { Router } from 'express';
import {
  isConfigured,
  getAccountInfo,
  publishSingleImage,
  publishCarousel,
  getMediaInsights,
  getAccountInsights,
  getMediaContainerStatus,
} from '../services/instagram-service.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/instagram/status
// ---------------------------------------------------------------------------
router.get('/status', (req, res) => {
  const configured = isConfigured();
  res.json({
    ok: true,
    configured,
    message: configured
      ? 'Instagram credentials are set. You are ready to publish.'
      : 'Instagram not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env',
    setupGuide: '/api/instagram/auth',
    docs: 'https://developers.facebook.com/docs/instagram-api/guides/content-publishing',
  });
});

// ---------------------------------------------------------------------------
// GET /api/instagram/auth — Setup instructions
// ---------------------------------------------------------------------------
router.get('/auth', (req, res) => {
  res.json({
    ok: true,
    title: 'Instagram Graph API Setup Guide',
    steps: [
      {
        step: 1,
        title: 'Create a Meta Developer App',
        url: 'https://developers.facebook.com/apps/create/',
        details: 'Select "Business" as the app type. Give it a name.',
      },
      {
        step: 2,
        title: 'Add Instagram Graph API product',
        details: 'In your app dashboard → Add Product → Instagram Graph API.',
      },
      {
        step: 3,
        title: 'Connect your Instagram Business Account',
        details: [
          'Go to https://www.facebook.com/business/ and create a Business Portfolio.',
          'Connect your Instagram account to a Facebook Page.',
          'Both must be linked in the same Meta Business Suite.',
        ],
      },
      {
        step: 4,
        title: 'Get a Page Access Token',
        url: 'https://developers.facebook.com/tools/explorer/',
        details: [
          'Open Graph API Explorer.',
          'Select your app.',
          'Click "Generate Access Token" with these permissions:',
          '  - instagram_basic',
          '  - instagram_content_publish',
          '  - instagram_manage_insights',
          '  - pages_read_engagement',
          'Extend to a long-lived token via the token debugger.',
        ],
      },
      {
        step: 5,
        title: 'Find your Instagram Business Account ID',
        details: 'GET /me/accounts → get Page ID → GET /{page-id}?fields=instagram_business_account → copy the id',
        apiCall: 'GET https://graph.facebook.com/v19.0/me/accounts?access_token=YOUR_TOKEN',
      },
      {
        step: 6,
        title: 'Set environment variables',
        envVars: {
          INSTAGRAM_ACCESS_TOKEN: '<your long-lived page access token>',
          INSTAGRAM_BUSINESS_ACCOUNT_ID: '<your Instagram business account id>',
        },
      },
      {
        step: 7,
        title: 'Restart the server and verify',
        check: 'GET /api/instagram/status',
      },
    ],
    note: 'Images must be at a publicly accessible HTTPS URL when publishing. Use a CDN or ngrok for local development.',
  });
});

// ---------------------------------------------------------------------------
// POST /api/instagram/publish — Publish single image
// ---------------------------------------------------------------------------
/**
 * Publish a single image post to Instagram.
 *
 * Body (JSON):
 *   {
 *     "imageUrl": "https://...",    — Public HTTPS URL to the image (required)
 *     "caption": "Your caption..."  — Caption with hashtags (optional)
 *   }
 *
 * NOTE: Instagram fetches the image from the URL. For local dev, use ngrok.
 * Example: ngrok http 3001 → use https://xxxx.ngrok.io/output/filename.png
 */
router.post('/publish', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({
      ok: false,
      error: 'Instagram not configured',
      message: 'Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env',
      setupGuide: '/api/instagram/auth',
    });
  }

  const { imageUrl, caption = '' } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ ok: false, error: 'imageUrl is required (must be a public HTTPS URL)' });
  }

  if (!imageUrl.startsWith('https://')) {
    return res.status(400).json({
      ok: false,
      error: 'imageUrl must start with https:// — Instagram requires a publicly accessible HTTPS URL',
    });
  }

  try {
    const result = await publishSingleImage(imageUrl, caption);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/instagram/carousel — Publish carousel post
// ---------------------------------------------------------------------------
/**
 * Publish a multi-image carousel post to Instagram.
 *
 * Body (JSON):
 *   {
 *     "imageUrls": ["https://...", "https://...", ...],  — 2-20 public HTTPS URLs
 *     "caption": "Your caption..."
 *   }
 */
router.post('/carousel', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({
      ok: false,
      error: 'Instagram not configured',
      setupGuide: '/api/instagram/auth',
    });
  }

  const { imageUrls, caption = '' } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length < 2) {
    return res.status(400).json({ ok: false, error: 'imageUrls must be an array of at least 2 URLs' });
  }

  if (imageUrls.length > 20) {
    return res.status(400).json({ ok: false, error: 'Carousel supports max 20 images' });
  }

  const invalidUrls = imageUrls.filter(url => !url.startsWith('https://'));
  if (invalidUrls.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'All imageUrls must be public HTTPS URLs',
      invalid: invalidUrls,
    });
  }

  try {
    const result = await publishCarousel(imageUrls, caption);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/instagram/insights/:media_id — Post insights
// ---------------------------------------------------------------------------
/**
 * Get performance insights for a specific published post.
 * Returns: impressions, reach, engagement, saves, likes, comments, shares
 *
 * Requires instagram_manage_insights permission on the access token.
 */
router.get('/insights/:media_id', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({ ok: false, error: 'Instagram not configured' });
  }

  try {
    const data = await getMediaInsights(req.params.media_id);
    res.json({ ok: true, mediaId: req.params.media_id, insights: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/instagram/account-insights — Account-level insights
// ---------------------------------------------------------------------------
/**
 * Get account-wide analytics: impressions, reach, follower count, profile views, etc.
 *
 * Query params:
 *   period  — 'day' | 'week' | 'month' | 'lifetime' (default: 'week')
 *   since   — start date (YYYY-MM-DD or Unix timestamp)
 *   until   — end date (YYYY-MM-DD or Unix timestamp)
 */
router.get('/account-insights', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({ ok: false, error: 'Instagram not configured' });
  }

  const { period = 'week', since, until } = req.query;
  const validPeriods = ['day', 'week', 'month', 'lifetime'];

  if (!validPeriods.includes(period)) {
    return res.status(400).json({
      ok: false,
      error: `period must be one of: ${validPeriods.join(', ')}`,
    });
  }

  try {
    const data = await getAccountInsights(period, since, until);
    res.json({ ok: true, period, insights: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/instagram/account — Verify account info
// ---------------------------------------------------------------------------
router.get('/account', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({ ok: false, error: 'Instagram not configured' });
  }

  try {
    const info = await getAccountInfo();
    res.json({ ok: true, account: info });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
