/**
 * TikTok Integration Routes
 *
 * Implements TikTok Content Posting API v2.
 *
 * HOW IT WORKS:
 *   - Videos and photos go to the user's TikTok "inbox" (drafts).
 *   - The user opens TikTok, reviews the draft, and publishes from there.
 *   - This is the "MEDIA_UPLOAD" post_mode — no app review needed.
 *   - For direct publish (post goes live immediately), you need TikTok app review.
 *
 * REQUIRED SETUP:
 *   1. Create app at https://developers.tiktok.com/
 *   2. Add "Content Posting API" product
 *   3. Request scopes: video.upload, user.info.basic
 *   4. Complete OAuth via GET /api/tiktok/auth
 *   5. Store resulting tokens in .env
 *
 * API REFERENCE:
 *   https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * Routes:
 *   GET  /api/tiktok/auth                    — Redirect to TikTok OAuth
 *   GET  /api/tiktok/callback                — OAuth callback handler
 *   GET  /api/tiktok/status                  — Check if TikTok is configured
 *   POST /api/tiktok/upload                  — Upload content to TikTok drafts
 *   GET  /api/tiktok/status/:publish_id      — Check upload/publish status
 *   POST /api/tiktok/batch-upload            — Upload multiple items sequentially
 */

import { Router } from 'express';
import { statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  isConfigured,
  buildAuthUrl,
  exchangeCodeForToken,
  initVideoUpload,
  uploadVideoFile,
  uploadPhotoPost,
  checkPublishStatus,
  sendPhotoToTikTokDrafts,
  getCreatorInfo,
} from '../services/tiktok-service.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', '..', 'output');

// ---------------------------------------------------------------------------
// GET /api/tiktok/status — check configuration
// ---------------------------------------------------------------------------
router.get('/status', (req, res) => {
  const configured = isConfigured();
  res.json({
    ok: true,
    configured,
    message: configured
      ? 'TikTok credentials are set. You are ready to upload.'
      : 'TikTok not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_ACCESS_TOKEN in .env, then authorize via GET /api/tiktok/auth',
    setupUrl: configured ? null : '/api/tiktok/auth',
    docs: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
  });
});

// ---------------------------------------------------------------------------
// GET /api/tiktok/auth — Redirect to TikTok OAuth
// ---------------------------------------------------------------------------
router.get('/auth', (req, res) => {
  if (!process.env.TIKTOK_CLIENT_KEY) {
    return res.status(400).json({
      ok: false,
      error: 'TIKTOK_CLIENT_KEY not set in .env',
      steps: [
        '1. Go to https://developers.tiktok.com/ and create a developer app',
        '2. Add the "Content Posting API" product',
        '3. Copy Client Key and Client Secret to your .env file',
        '4. Set TIKTOK_REDIRECT_URI=http://localhost:3001/api/tiktok/callback in .env',
        '5. Restart the server and visit this URL again',
      ],
    });
  }

  try {
    const authUrl = buildAuthUrl();
    // In a browser-based flow this would do res.redirect(authUrl)
    // We return it as JSON so the dashboard can open it in a new tab
    res.json({
      ok: true,
      authUrl,
      message: 'Open authUrl in a browser to authorize TikTok access. After authorization, TikTok will redirect to /api/tiktok/callback',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/tiktok/callback — OAuth callback
// ---------------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({
      ok: false,
      error: `TikTok OAuth denied: ${error_description || error}`,
    });
  }

  if (!code) {
    return res.status(400).json({ ok: false, error: 'No authorization code received' });
  }

  try {
    const tokens = await exchangeCodeForToken(code);

    // In production, store tokens securely (database, encrypted storage)
    // For development, show them so you can add to .env
    res.json({
      ok: true,
      message: 'Authorization successful! Copy these tokens to your .env file.',
      tokens: {
        TIKTOK_ACCESS_TOKEN: tokens.access_token,
        TIKTOK_REFRESH_TOKEN: tokens.refresh_token,
        open_id: tokens.open_id,
        scope: tokens.scope,
        expires_in: tokens.expires_in,
        refresh_expires_in: tokens.refresh_expires_in,
      },
      nextStep: 'Add TIKTOK_ACCESS_TOKEN and TIKTOK_REFRESH_TOKEN to your .env file and restart the server.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/tiktok/upload — Upload content to TikTok drafts
// ---------------------------------------------------------------------------
/**
 * Upload a content item to TikTok drafts.
 *
 * Body (JSON):
 *   {
 *     "contentItemId": "cnt_001",         — from content.json (optional if providing file details)
 *     "type": "photo" | "video",          — media type
 *     "title": "...",                     — caption for the post
 *     "outputFile": "output/file.png",    — path relative to project root
 *     "publicBaseUrl": "https://..."      — base URL where files are publicly hosted
 *                                           (required for photos — Instagram pulls from URL)
 *   }
 *
 * NOTES:
 *   - Photos: TikTok fetches from a public URL. For local dev, use ngrok or similar.
 *   - Videos: file is read from disk and uploaded directly.
 */
router.post('/upload', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({
      ok: false,
      error: 'TikTok not configured',
      message: 'Set TIKTOK_CLIENT_KEY and TIKTOK_ACCESS_TOKEN in .env, then authorize via GET /api/tiktok/auth',
    });
  }

  const { type = 'photo', title, outputFile, publicBaseUrl } = req.body;

  if (!outputFile) {
    return res.status(400).json({ ok: false, error: 'outputFile is required' });
  }
  if (!title) {
    return res.status(400).json({ ok: false, error: 'title (caption) is required' });
  }

  try {
    if (type === 'photo') {
      // Photo upload — needs a public URL
      if (!publicBaseUrl) {
        return res.status(400).json({
          ok: false,
          error: 'publicBaseUrl is required for photo uploads (TikTok pulls from URL)',
          tip: 'Use ngrok or deploy to expose your local /output/ directory publicly',
        });
      }

      const photoUrl = `${publicBaseUrl.replace(/\/$/, '')}/output/${outputFile.replace(/^output\//, '')}`;
      const result = await uploadPhotoPost({ title, photoUrls: [photoUrl] });
      const statusResult = await checkPublishStatus(result.publishId);

      return res.json({
        ok: true,
        type: 'photo',
        publishId: result.publishId,
        ...statusResult,
        message: 'Photo sent to TikTok drafts/inbox. Open TikTok to review and publish.',
      });
    }

    if (type === 'video') {
      // Video upload — read file from disk
      const filePath = join(OUTPUT_DIR, outputFile.replace(/^output\//, ''));
      let fileStats;
      try {
        fileStats = statSync(filePath);
      } catch {
        return res.status(400).json({ ok: false, error: `File not found: ${filePath}` });
      }

      const fileSize = fileStats.size;
      const { publishId, uploadUrl } = await initVideoUpload({
        title,
        fileSize,
        mimeType: 'video/mp4',
      });

      await uploadVideoFile(uploadUrl, filePath, fileSize, 'video/mp4');
      const statusResult = await checkPublishStatus(publishId);

      return res.json({
        ok: true,
        type: 'video',
        publishId,
        ...statusResult,
        message: 'Video sent to TikTok drafts/inbox. Open TikTok to review and publish.',
      });
    }

    return res.status(400).json({ ok: false, error: 'type must be "photo" or "video"' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/tiktok/status/:publish_id — Check upload status
// ---------------------------------------------------------------------------
router.get('/status/:publish_id', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({ ok: false, error: 'TikTok not configured' });
  }

  try {
    const result = await checkPublishStatus(req.params.publish_id);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/tiktok/batch-upload — Upload multiple items sequentially
// ---------------------------------------------------------------------------
/**
 * Upload multiple content items to TikTok drafts in sequence.
 * Adds a 10-second delay between uploads to respect rate limits.
 *
 * Body (JSON):
 *   {
 *     "items": [
 *       { "type": "photo", "title": "...", "outputFile": "output/..." },
 *       ...
 *     ],
 *     "publicBaseUrl": "https://..."
 *   }
 */
router.post('/batch-upload', async (req, res) => {
  if (!isConfigured()) {
    return res.status(400).json({ ok: false, error: 'TikTok not configured' });
  }

  const { items, publicBaseUrl } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: 'items array is required' });
  }

  // Cap at 10 items per batch to respect rate limits
  const batch = items.slice(0, 10);
  const results = [];

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    try {
      if (item.type === 'photo') {
        if (!publicBaseUrl) throw new Error('publicBaseUrl required for photo uploads');
        const photoUrl = `${publicBaseUrl.replace(/\/$/, '')}/output/${item.outputFile.replace(/^output\//, '')}`;
        const uploadResult = await uploadPhotoPost({ title: item.title, photoUrls: [photoUrl] });
        const statusResult = await checkPublishStatus(uploadResult.publishId);
        results.push({ index: i, ok: true, publishId: uploadResult.publishId, ...statusResult });
      } else {
        results.push({ index: i, ok: false, error: 'Only photo uploads supported in batch mode currently' });
      }
    } catch (err) {
      results.push({ index: i, ok: false, error: err.message, item });
    }

    // 10-second delay between uploads (TikTok rate limits)
    if (i < batch.length - 1) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  const succeeded = results.filter(r => r.ok).length;
  res.json({
    ok: true,
    processed: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  });
});

export default router;
