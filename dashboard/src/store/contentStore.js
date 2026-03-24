/**
 * FrameCoach Content Factory — Content Store
 *
 * Loads real generated content from the manifest API (http://localhost:3001/api/content/manifest).
 * Status overrides (posted/pending etc.) are persisted in localStorage and merged on load.
 * Falls back to localStorage cache if the API is unavailable.
 */

// Auto-detect: use API if running, otherwise load bundled manifest from public/
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STATUS_KEY = 'fc_status_overrides_v1';
const CACHE_KEY  = 'fc_manifest_cache_v1';
const SETTINGS_KEY = 'fc_settings_v1';

// ---------------------------------------------------------------------------
// Status override helpers (localStorage)
// ---------------------------------------------------------------------------

function getStatusOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStatusOverride(id, updates) {
  const overrides = getStatusOverrides();
  overrides[id] = { ...(overrides[id] || {}), ...updates };
  localStorage.setItem(STATUS_KEY, JSON.stringify(overrides));
}

// ---------------------------------------------------------------------------
// Merge manifest items with local status overrides
// ---------------------------------------------------------------------------

function mergeWithOverrides(items) {
  const overrides = getStatusOverrides();
  return items.map(item => {
    const override = overrides[item.id];
    if (!override) return item;
    return { ...item, ...override };
  });
}

// ---------------------------------------------------------------------------
// Normalize a manifest item to the shape the dashboard expects
// ---------------------------------------------------------------------------

function normalizeItem(item) {
  return {
    // Core identity
    id: item.id,
    headline: item.headline.replace(/\n/g, ' '),
    headlineRaw: item.headline,
    body: item.body,
    category: item.categoryLabel || item.category,
    categorySlug: item.category,
    template: item.template,
    format: item.format.charAt(0).toUpperCase() + item.format.slice(1), // "story" → "Story"
    formatSlug: item.format,

    // Content
    caption: item.caption,
    hashtags: item.hashtags,

    // Image — works both with API server and standalone (bundled in public/output/)
    imageUrl: item.imageUrl ? `${import.meta.env.BASE_URL || '/'}output${item.imageUrl}` : null,
    filename: item.filename,

    // Status (may be overridden from localStorage)
    status: item.status === 'pending' ? 'Pending'
           : item.status === 'posted' ? 'Posted'
           : item.status === 'scheduled' ? 'Scheduled'
           : item.status === 'analyzed' ? 'Analyzed'
           : item.status,
    platform: item.platform || null,
    dateCreated: item.dateCreated,
    datePosted: item.datePosted || null,
    platformUrl: item.platformUrl || null,
    notes: item.notes || '',

    // Engagement (empty for fresh manifest items)
    engagement: item.engagement || { views: 0, likes: 0, comments: 0, shares: 0 },
  };
}

// ---------------------------------------------------------------------------
// Public: loadManifest — fetches from API, caches, merges overrides
// ---------------------------------------------------------------------------

export async function loadManifest() {
  // Try API first, then bundled manifest, then localStorage cache
  const base = import.meta.env.BASE_URL || '/';
  const sources = [
    () => fetch(`${API_BASE}/api/content/manifest`).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    () => fetch(`${base}content-manifest.json`).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
  ];

  for (const source of sources) {
    try {
      const data = await source();
      const raw = data.items || (Array.isArray(data) ? data : []);
      if (raw.length === 0) continue;

      localStorage.setItem(CACHE_KEY, JSON.stringify(raw));
      return mergeWithOverrides(raw).map(normalizeItem);
    } catch {
      continue;
    }
  }

  // Fall back to localStorage cache
  console.warn('[contentStore] No API or bundled manifest, using cache');
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const raw = JSON.parse(cached);
    return mergeWithOverrides(raw).map(normalizeItem);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Public: updateContent — updates status in localStorage + API manifest
// ---------------------------------------------------------------------------

export function updateContent(id, updates) {
  // Persist to local overrides immediately (optimistic)
  const localUpdates = {};
  if (updates.status !== undefined) {
    // Normalize back to lowercase for manifest storage
    localUpdates.status = updates.status.toLowerCase();
  }
  if (updates.datePosted !== undefined) localUpdates.datePosted = updates.datePosted;
  if (updates.platformUrl !== undefined) localUpdates.platformUrl = updates.platformUrl;
  if (updates.notes !== undefined) localUpdates.notes = updates.notes;

  saveStatusOverride(id, localUpdates);

  // Fire-and-forget API update (best effort)
  fetch(`${API_BASE}/api/content/manifest/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localUpdates),
  }).catch(() => {
    // API might not be running — localStorage override already saved
  });
}

// ---------------------------------------------------------------------------
// Legacy sync helpers (used by pages that haven't been updated yet)
// ---------------------------------------------------------------------------

export function getContent() {
  // Return from cache + overrides synchronously
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const raw = JSON.parse(cached);
      return mergeWithOverrides(raw).map(normalizeItem);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveContent(items) {
  // No-op: state is managed via loadManifest + updateContent
  // Kept for backwards compatibility
}

export function addContent(item) {
  // Not applicable for manifest-based workflow
  return getContent();
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function getStats() {
  const items = getContent();
  const total = items.length;
  const posted = items.filter(i => i.status === 'Posted' || i.status === 'Analyzed').length;
  const scheduled = items.filter(i => i.status === 'Scheduled').length;
  const pending = items.filter(i => i.status === 'Pending').length;

  const totalViews = items.reduce((sum, i) => sum + (i.engagement?.views || 0), 0);
  const totalLikes = items.reduce((sum, i) => sum + (i.engagement?.likes || 0), 0);
  const avgEngagement = posted > 0
    ? Math.round((totalLikes / Math.max(totalViews, 1)) * 100 * 10) / 10
    : 0;

  const performanceScore = Math.min(100, Math.round(
    (posted / Math.max(total, 1)) * 40 +
    Math.min(40, avgEngagement * 8) +
    (scheduled > 0 ? 20 : 0)
  ));

  return { total, posted, scheduled, pending, totalViews, totalLikes, avgEngagement, performanceScore };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

const PLATFORMS = ['TikTok', 'Instagram'];
const FORMATS = ['Story', 'Feed', 'Carousel'];
const CATEGORIES = ['App Promo', 'Brand Awareness', 'Film Education'];
const TEMPLATES = ['brand-icon', 'gradient-slide', 'statement-card', 'bold-typography', 'asset-feature', 'minimal-dark'];

export function getAnalytics() {
  const items = getContent();
  const postedItems = items.filter(i => i.status === 'Posted' || i.status === 'Analyzed');

  const platformData = PLATFORMS.map(platform => {
    const platformItems = postedItems.filter(i => i.platform === platform);
    const views = platformItems.reduce((sum, i) => sum + (i.engagement?.views || 0), 0);
    const likes = platformItems.reduce((sum, i) => sum + (i.engagement?.likes || 0), 0);
    return { name: platform, views, likes, count: platformItems.length };
  });

  const formatData = FORMATS.map(format => {
    const formatItems = items.filter(i => i.format === format);
    const postedFormatItems = formatItems.filter(i => i.status === 'Posted' || i.status === 'Analyzed');
    const avgViews = postedFormatItems.length > 0
      ? Math.round(postedFormatItems.reduce((sum, i) => sum + (i.engagement?.views || 0), 0) / postedFormatItems.length)
      : 0;
    return { name: format, count: formatItems.length, posted: postedFormatItems.length, avgViews };
  });

  const categoryData = CATEGORIES.map(cat => {
    const catItems = postedItems.filter(i => i.category === cat);
    const views = catItems.reduce((sum, i) => sum + (i.engagement?.views || 0), 0);
    return { name: cat, count: catItems.length, views };
  });

  const topContent = [...postedItems]
    .sort((a, b) => (b.engagement?.views || 0) - (a.engagement?.views || 0))
    .slice(0, 5);

  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekItems = postedItems.filter(item => {
      if (!item.datePosted) return false;
      const d = new Date(item.datePosted);
      return d >= weekStart && d <= weekEnd;
    });
    return {
      week: `W${8 - i}`,
      posted: weekItems.length,
      views: weekItems.reduce((sum, i) => sum + (i.engagement?.views || 0), 0),
    };
  }).reverse();

  const templateData = TEMPLATES.map(tpl => {
    const tplItems = postedItems.filter(i => i.template === tpl);
    const avgEngagement = tplItems.length > 0
      ? Math.round(tplItems.reduce((sum, i) => sum + (i.engagement?.likes || 0), 0) / tplItems.length)
      : 0;
    return { name: tpl, count: tplItems.length, avgEngagement };
  });

  return { platformData, formatData, categoryData, topContent, weeklyData, templateData };
}

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

export function getRecentActivity() {
  const items = getContent();
  return items
    .filter(i => i.datePosted)
    .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
    .slice(0, 10)
    .map(item => ({
      id: item.id,
      text: `Posted "${item.headline}" to ${item.platform || 'platform'}`,
      time: item.datePosted,
      platform: item.platform,
      status: item.status,
    }));
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    return {
      tiktokApiKey: '',
      instagramApiKey: '',
      defaultFormat: 'Story',
      postingFrequency: 2,
      tiktokConnected: false,
      instagramConnected: false,
    };
  }
  return JSON.parse(data);
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

export function exportToJSON() {
  const items = getContent();
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `framecoach-content-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV() {
  const items = getContent();
  const headers = ['ID', 'Headline', 'Format', 'Category', 'Template', 'Status', 'Date Created', 'Date Posted', 'Platform URL'];
  const rows = items.map(i => [
    i.id, `"${i.headline}"`, i.format, i.category, i.template, i.status,
    i.dateCreated || '', i.datePosted?.split('T')[0] || '', i.platformUrl || '',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `framecoach-content-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Instagram Carousels ─────────────────────────────────────────────────
let _instagramCarousels = null;

export async function loadInstagramCarousels() {
  if (_instagramCarousels) return _instagramCarousels;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}instagram-carousels.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _instagramCarousels = await res.json();
    const igOverrides = JSON.parse(localStorage.getItem('fc_ig_carousel_status_v1') || '{}');
    for (const c of _instagramCarousels) {
      if (igOverrides[c.id]) {
        Object.assign(c, igOverrides[c.id]);
      }
    }
    return _instagramCarousels;
  } catch (err) {
    console.error('Failed to load Instagram carousels:', err);
    return [];
  }
}

// ─── TikTok Content Groups ───────────────────────────────────────────────
let _tiktokGroups = null;

export async function loadTikTokGroups() {
  if (_tiktokGroups) return _tiktokGroups;
  const items = await loadManifest();

  // Only keep carousel format (1080x1350)
  const carouselItems = items.filter(item => item.format === 'Carousel');

  // Group by headline (same content, different templates)
  const groups = {};
  for (const item of carouselItems) {
    const key = item.headline;
    if (!groups[key]) {
      groups[key] = {
        id: item.id.replace(/-[^-]+-carousel$/, ''),
        name: item.headline.replace(/\n/g, ' '),
        subtitle: item.category,
        slides: [],
        slideCount: 0,
        caption: item.caption?.tiktok || item.caption?.instagram || '',
        tiktokTitle: item.tiktokTitle || '',
        tiktokDescription: item.tiktokDescription || '',
        tiktokHashtags: item.tiktokHashtags || [],
        templateNames: [],
      };
    }
    groups[key].slides.push(item.imageUrl);
    groups[key].templateNames.push(item.template);
    groups[key].slideCount++;
  }

  _tiktokGroups = Object.values(groups);

  // Load status overrides
  const overrides = JSON.parse(localStorage.getItem('fc_tiktok_status_v1') || '{}');
  for (const group of _tiktokGroups) {
    if (overrides[group.id]) {
      Object.assign(group, overrides[group.id]);
    }
  }

  return _tiktokGroups;
}

export function updateTikTokGroup(id, updates) {
  const overrides = JSON.parse(localStorage.getItem('fc_tiktok_status_v1') || '{}');
  overrides[id] = { ...(overrides[id] || {}), ...updates };
  localStorage.setItem('fc_tiktok_status_v1', JSON.stringify(overrides));
}

// ─── Instagram Carousel Status ───────────────────────────────────────────
export function updateInstagramCarousel(id, updates) {
  const overrides = JSON.parse(localStorage.getItem('fc_ig_carousel_status_v1') || '{}');
  overrides[id] = { ...(overrides[id] || {}), ...updates };
  localStorage.setItem('fc_ig_carousel_status_v1', JSON.stringify(overrides));
}

export function getInstagramCarouselStatus(id) {
  const overrides = JSON.parse(localStorage.getItem('fc_ig_carousel_status_v1') || '{}');
  return overrides[id] || {};
}
