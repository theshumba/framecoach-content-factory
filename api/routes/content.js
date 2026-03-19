/**
 * Content CRUD Routes
 *
 * File-based storage using api/data/content.json.
 * In production this could be swapped for a database (SQLite, Postgres, etc.)
 *
 * Routes:
 *   GET    /api/content              — list all (with filters)
 *   GET    /api/content/stats        — aggregate stats
 *   GET    /api/content/:id          — get single item
 *   POST   /api/content              — create item
 *   PUT    /api/content/:id          — update item
 *   DELETE /api/content/:id          — delete item
 *   POST   /api/content/:id/mark-posted — quick-mark as posted
 */

import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '..', 'data', 'content.json');
const MANIFEST_FILE = join(__dirname, '..', '..', 'output', 'content-manifest.json');

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

function applyFilters(items, query) {
  let filtered = [...items];

  if (query.status) {
    filtered = filtered.filter(i => i.status === query.status);
  }
  if (query.category) {
    filtered = filtered.filter(i => i.category === query.category);
  }
  if (query.format) {
    filtered = filtered.filter(i => i.format === query.format);
  }
  if (query.template) {
    filtered = filtered.filter(i => i.template === query.template);
  }
  if (query.platform) {
    filtered = filtered.filter(i => i.platform === query.platform);
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.caption?.toLowerCase().includes(q)
    );
  }

  // Sort
  const sortField = query.sort || 'createdAt';
  const sortDir = query.order === 'asc' ? 1 : -1;
  filtered.sort((a, b) => {
    const va = a[sortField] ?? '';
    const vb = b[sortField] ?? '';
    return va < vb ? -sortDir : va > vb ? sortDir : 0;
  });

  return filtered;
}

// ---------------------------------------------------------------------------
// GET /api/content/manifest — return generated content-manifest.json
// Must be declared BEFORE /:id
// ---------------------------------------------------------------------------
router.get('/manifest', async (req, res, next) => {
  try {
    const raw = await readFile(MANIFEST_FILE, 'utf-8');
    const manifest = JSON.parse(raw);
    res.json({ ok: true, ...manifest });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({
        ok: false,
        error: 'Manifest not found. Run: node generator/create-manifest.js',
      });
    }
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/content/manifest/:id — update a single manifest item
// Persists status, notes, datePosted, platformUrl changes back to manifest
// ---------------------------------------------------------------------------
router.put('/manifest/:id', async (req, res, next) => {
  try {
    const raw = await readFile(MANIFEST_FILE, 'utf-8');
    const manifest = JSON.parse(raw);

    const idx = manifest.items.findIndex(i => i.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Manifest item not found' });
    }

    // Only allow updating mutable fields — never overwrite content/captions
    const { status, notes, datePosted, platformUrl } = req.body;
    const allowed = {};
    if (status !== undefined)      allowed.status = status;
    if (notes !== undefined)       allowed.notes = notes;
    if (datePosted !== undefined)  allowed.datePosted = datePosted;
    if (platformUrl !== undefined) allowed.platformUrl = platformUrl;

    manifest.items[idx] = { ...manifest.items[idx], ...allowed };
    manifest.lastUpdated = new Date().toISOString();

    await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
    res.json({ ok: true, item: manifest.items[idx] });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({
        ok: false,
        error: 'Manifest not found. Run: node generator/create-manifest.js',
      });
    }
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/content/stats — must be declared BEFORE /:id
// ---------------------------------------------------------------------------
router.get('/stats', async (req, res, next) => {
  try {
    const data = await readData();
    const items = data.items;

    const stats = {
      total: items.length,
      byStatus: {},
      byPlatform: {},
      byCategory: {},
      byTemplate: {},
      byFormat: {},
      totalImpressions: 0,
      totalEngagements: 0,
      avgEngagementRate: 0,
    };

    let rateSum = 0;
    let rateCount = 0;

    for (const item of items) {
      // Status counts
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      // Platform counts
      if (item.platform) {
        stats.byPlatform[item.platform] = (stats.byPlatform[item.platform] || 0) + 1;
      }
      // Category counts
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      // Template counts
      stats.byTemplate[item.template] = (stats.byTemplate[item.template] || 0) + 1;
      // Format counts
      stats.byFormat[item.format] = (stats.byFormat[item.format] || 0) + 1;

      // Analytics aggregation
      if (item.analytics) {
        stats.totalImpressions += item.analytics.impressions || 0;
        stats.totalEngagements +=
          (item.analytics.likes || 0) +
          (item.analytics.comments || 0) +
          (item.analytics.saves || 0) +
          (item.analytics.shares || 0);
        if (item.analytics.engagementRate) {
          rateSum += item.analytics.engagementRate;
          rateCount++;
        }
      }
    }

    stats.avgEngagementRate = rateCount
      ? parseFloat((rateSum / rateCount).toFixed(2))
      : 0;

    res.json({ ok: true, stats });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/content
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const filtered = applyFilters(data.items, req.query);

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    res.json({
      ok: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items: paginated,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/content/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Content item not found' });
    res.json({ ok: true, item });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/content — Create
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      category,
      format,
      template,
      caption,
      hashtags,
      outputFile,
      platform,
      status = 'draft',
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ ok: false, error: 'title and category are required' });
    }

    const newItem = {
      id: `cnt_${randomUUID().replace(/-/g, '').slice(0, 8)}`,
      title,
      category,
      format: format || 'single',
      template: template || 'tip-card',
      status,
      platform: platform || null,
      platformPostId: null,
      platformUrl: null,
      caption: caption || '',
      hashtags: hashtags || [],
      outputFile: outputFile || null,
      createdAt: new Date().toISOString(),
      postedAt: null,
      analytics: null,
    };

    const data = await readData();
    data.items.unshift(newItem); // newest first
    await writeData(data);

    res.status(201).json({ ok: true, item: newItem });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/content/:id — Update
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const idx = data.items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Content item not found' });

    // Merge — disallow changing the id
    const { id: _drop, ...updates } = req.body;
    data.items[idx] = { ...data.items[idx], ...updates };
    await writeData(data);

    res.json({ ok: true, item: data.items[idx] });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/content/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const idx = data.items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Content item not found' });

    const [removed] = data.items.splice(idx, 1);
    await writeData(data);

    res.json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/content/:id/mark-posted — Quick action
// ---------------------------------------------------------------------------
router.post('/:id/mark-posted', async (req, res, next) => {
  try {
    const { platform, platformPostId, platformUrl } = req.body;
    if (!platform) {
      return res.status(400).json({ ok: false, error: 'platform is required' });
    }

    const data = await readData();
    const idx = data.items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Content item not found' });

    data.items[idx] = {
      ...data.items[idx],
      status: 'posted',
      platform,
      platformPostId: platformPostId || null,
      platformUrl: platformUrl || null,
      postedAt: new Date().toISOString(),
    };
    await writeData(data);

    res.json({ ok: true, item: data.items[idx] });
  } catch (err) {
    next(err);
  }
});

export default router;
