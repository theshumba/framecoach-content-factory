/**
 * Posting Queue Routes
 *
 * Manages an ordered list of content items to be posted next.
 * Queue state is persisted alongside content data in content.json.
 *
 * When process-next is called, it picks the next queued item,
 * posts it to its target platform, and marks it as posted.
 *
 * Routes:
 *   GET    /api/queue               — Get current queue
 *   POST   /api/queue/add           — Add item to queue
 *   PUT    /api/queue/reorder       — Reorder queue
 *   DELETE /api/queue/:id           — Remove from queue
 *   POST   /api/queue/process-next  — Post next item to its platform
 */

import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { isConfigured as tiktokConfigured, sendPhotoToTikTokDrafts } from '../services/tiktok-service.js';
import { isConfigured as instagramConfigured, publishSingleImage, publishCarousel } from '../services/instagram-service.js';

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

/**
 * Get all items currently in 'queued' status, sorted by scheduledFor (if set),
 * then by createdAt as a tiebreaker.
 */
function getQueuedItems(items) {
  return items
    .filter(i => i.status === 'queued')
    .sort((a, b) => {
      // Items with a scheduled time go first
      if (a.scheduledFor && b.scheduledFor) {
        return new Date(a.scheduledFor) - new Date(b.scheduledFor);
      }
      if (a.scheduledFor) return -1;
      if (b.scheduledFor) return 1;
      // Fall back to queue position, then creation date
      const posA = a.queuePosition ?? Infinity;
      const posB = b.queuePosition ?? Infinity;
      if (posA !== posB) return posA - posB;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

// ---------------------------------------------------------------------------
// GET /api/queue
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const queued = getQueuedItems(data.items);

    res.json({
      ok: true,
      queueLength: queued.length,
      platforms: {
        tiktok: { configured: tiktokConfigured(), itemsInQueue: queued.filter(i => i.platform === 'tiktok').length },
        instagram: { configured: instagramConfigured(), itemsInQueue: queued.filter(i => i.platform === 'instagram').length },
      },
      queue: queued.map((item, idx) => ({
        queuePosition: idx + 1,
        id: item.id,
        title: item.title,
        category: item.category,
        template: item.template,
        format: item.format,
        platform: item.platform,
        outputFile: item.outputFile,
        scheduledFor: item.scheduledFor || null,
        caption: item.caption,
        createdAt: item.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/queue/add — Add content item to the queue
// ---------------------------------------------------------------------------
/**
 * Body (JSON):
 *   {
 *     "contentId": "cnt_010",          — ID of an existing content item
 *     "platform": "instagram",         — Target platform (override item's platform)
 *     "scheduledFor": "2026-03-20T14:00:00Z"  — Optional: schedule for future
 *   }
 */
router.post('/add', async (req, res, next) => {
  try {
    const { contentId, platform, scheduledFor } = req.body;

    if (!contentId) {
      return res.status(400).json({ ok: false, error: 'contentId is required' });
    }

    const data = await readData();
    const idx = data.items.findIndex(i => i.id === contentId);

    if (idx === -1) {
      return res.status(404).json({ ok: false, error: `Content item "${contentId}" not found` });
    }

    const item = data.items[idx];

    if (item.status === 'posted') {
      return res.status(400).json({
        ok: false,
        error: 'This item has already been posted. Create a new draft to post again.',
      });
    }

    if (item.status === 'queued') {
      return res.status(400).json({ ok: false, error: 'Item is already in the queue' });
    }

    // Calculate queue position (append to end)
    const currentQueue = getQueuedItems(data.items);
    const nextPosition = currentQueue.length + 1;

    data.items[idx] = {
      ...item,
      status: 'queued',
      platform: platform || item.platform,
      scheduledFor: scheduledFor || null,
      queuePosition: nextPosition,
    };

    await writeData(data);

    res.json({
      ok: true,
      queuePosition: nextPosition,
      item: data.items[idx],
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/queue/reorder — Reorder queue items
// ---------------------------------------------------------------------------
/**
 * Body (JSON):
 *   {
 *     "order": ["cnt_009", "cnt_015", "cnt_008"]  — Array of content IDs in desired order
 *   }
 */
router.put('/reorder', async (req, res, next) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ ok: false, error: 'order must be a non-empty array of content IDs' });
    }

    const data = await readData();

    // Verify all IDs are in the queue
    const queuedIds = new Set(data.items.filter(i => i.status === 'queued').map(i => i.id));
    const invalidIds = order.filter(id => !queuedIds.has(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        ok: false,
        error: `These IDs are not in the queue: ${invalidIds.join(', ')}`,
      });
    }

    // Assign new queue positions
    order.forEach((id, idx) => {
      const itemIdx = data.items.findIndex(i => i.id === id);
      if (itemIdx !== -1) {
        data.items[itemIdx].queuePosition = idx + 1;
        data.items[itemIdx].scheduledFor = null; // Clear scheduled times when manually reordering
      }
    });

    await writeData(data);

    const updatedQueue = getQueuedItems(data.items);
    res.json({
      ok: true,
      queueLength: updatedQueue.length,
      queue: updatedQueue.map((item, idx) => ({ queuePosition: idx + 1, id: item.id, title: item.title, platform: item.platform })),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/queue/:id — Remove item from queue (back to draft)
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const idx = data.items.findIndex(i => i.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Content item not found' });
    }

    if (data.items[idx].status !== 'queued') {
      return res.status(400).json({ ok: false, error: 'Item is not in the queue' });
    }

    // Move back to draft
    data.items[idx] = {
      ...data.items[idx],
      status: 'draft',
      queuePosition: undefined,
      scheduledFor: undefined,
    };

    await writeData(data);

    res.json({ ok: true, message: 'Removed from queue. Item status is now "draft".', item: data.items[idx] });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/queue/process-next — Post the next queued item
// ---------------------------------------------------------------------------
/**
 * Takes the next item in the queue and posts it to its target platform.
 *
 * For TikTok: sends to drafts (user publishes from TikTok app).
 * For Instagram: publishes directly (requires public image URL).
 *
 * Body (JSON) — optional:
 *   {
 *     "publicBaseUrl": "https://xxxx.ngrok.io",  — Required for TikTok photo uploads
 *     "platform": "instagram"                    — Override: only process items for this platform
 *   }
 */
router.post('/process-next', async (req, res, next) => {
  try {
    const { publicBaseUrl, platform: platformFilter } = req.body;
    const data = await readData();

    let queue = getQueuedItems(data.items);

    // Apply platform filter if specified
    if (platformFilter) {
      queue = queue.filter(i => i.platform === platformFilter);
    }

    if (queue.length === 0) {
      return res.json({
        ok: true,
        processed: false,
        message: platformFilter
          ? `No items in queue for platform: ${platformFilter}`
          : 'Queue is empty',
      });
    }

    const nextItem = queue[0];

    // Check if it's scheduled for the future
    if (nextItem.scheduledFor) {
      const scheduledTime = new Date(nextItem.scheduledFor);
      if (scheduledTime > new Date()) {
        return res.json({
          ok: true,
          processed: false,
          message: `Next item "${nextItem.title}" is scheduled for ${nextItem.scheduledFor}. Too early to post.`,
          nextItem: { id: nextItem.id, title: nextItem.title, scheduledFor: nextItem.scheduledFor },
        });
      }
    }

    const targetPlatform = nextItem.platform;

    if (!targetPlatform) {
      return res.status(400).json({
        ok: false,
        error: `Queue item "${nextItem.id}" has no platform set. Update the item with a target platform first.`,
      });
    }

    let postResult;

    // ---- TikTok ----
    if (targetPlatform === 'tiktok') {
      if (!tiktokConfigured()) {
        return res.status(400).json({
          ok: false,
          error: 'TikTok not configured. Set credentials in .env first.',
          setupGuide: '/api/tiktok/auth',
        });
      }

      if (!publicBaseUrl) {
        return res.status(400).json({
          ok: false,
          error: 'publicBaseUrl is required to upload photos to TikTok (TikTok fetches from a public URL)',
          tip: 'Run ngrok and pass its URL as publicBaseUrl',
        });
      }

      postResult = await sendPhotoToTikTokDrafts(nextItem, publicBaseUrl);
      postResult.platformUrl = null; // Goes to drafts, no public URL yet
      postResult.platformPostId = postResult.publishId;
    }

    // ---- Instagram ----
    else if (targetPlatform === 'instagram') {
      if (!instagramConfigured()) {
        return res.status(400).json({
          ok: false,
          error: 'Instagram not configured. Set credentials in .env first.',
          setupGuide: '/api/instagram/auth',
        });
      }

      if (!publicBaseUrl && !nextItem.outputFile) {
        return res.status(400).json({
          ok: false,
          error: 'publicBaseUrl or a hosted image URL is required for Instagram publishing',
        });
      }

      const imageUrl = `${publicBaseUrl.replace(/\/$/, '')}/output/${nextItem.outputFile?.replace(/^output\//, '')}`;
      const caption = `${nextItem.caption || ''}\n\n${(nextItem.hashtags || []).join(' ')}`.trim();

      postResult = await publishSingleImage(imageUrl, caption);
    }

    else {
      return res.status(400).json({
        ok: false,
        error: `Unsupported platform: "${targetPlatform}". Supported: tiktok, instagram`,
      });
    }

    // Mark as posted
    const idx = data.items.findIndex(i => i.id === nextItem.id);
    data.items[idx] = {
      ...data.items[idx],
      status: 'posted',
      platform: targetPlatform,
      platformPostId: postResult.platformPostId || postResult.publishId || null,
      platformUrl: postResult.platformUrl || null,
      postedAt: new Date().toISOString(),
      queuePosition: undefined,
      scheduledFor: undefined,
    };

    await writeData(data);

    // Remaining queue
    const remainingQueue = getQueuedItems(data.items);

    res.json({
      ok: true,
      processed: true,
      postedItem: data.items[idx],
      platform: targetPlatform,
      postResult,
      remainingQueueLength: remainingQueue.length,
      nextInQueue: remainingQueue[0]
        ? { id: remainingQueue[0].id, title: remainingQueue[0].title, platform: remainingQueue[0].platform }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
