# Gallery V2 — TikTok Slideshow Viewer + Instagram Metadata + Dedup + TikTok Captions

## Problem

1. TikTok section shows 432 individual images (duplicated across 3 formats). No slideshow viewer — just a single preview per item.
2. Instagram section is missing status tracking, copy caption/hashtags, platform URL, and notes.
3. TikTok captions don't follow TikTok's format rules (title ≤87 chars, long description, max 5 hashtags).
4. No TikTok API integration prep.

## Solution

### 1. TikTok Section — Deduplicate + Slideshow Viewer

**Dedup:** Keep only carousel format (1080x1350) images. Drop story (1080x1920) and feed (1080x1080). 432 → 144 items.

**Group by content:** 24 content pieces × 6 template styles = 24 groups. Each group shows as a card (first template as thumbnail). Click → opens CarouselViewer showing all 6 template variations as slides. Social media manager picks the style she wants and downloads it.

**Card display:** Show content headline, category badge, slide count (6). Same grid layout as Instagram section.

**Viewer:** Reuse CarouselViewer component. Add:
- TikTok title (short, ≤87 chars)
- TikTok description (long-form)
- TikTok hashtags (max 5)
- Copy buttons for each
- Download current slide / download all slides as zip
- Status tracking (Pending/Scheduled/Posted)
- Platform URL + notes fields
- Save button

### 2. Instagram Section — Add Metadata Features

Add to CarouselViewer sidebar:
- Copy caption + hashtags button (already has caption + copy)
- Status selector (Pending/Scheduled/Posted/Analyzed)
- Platform URL input
- Notes input
- Save button

Persist status/URL/notes in localStorage (same pattern as existing TikTok status overrides in contentStore.js).

### 3. TikTok Caption Format

Regenerate all TikTok metadata in the manifest:
- **Title**: ≤87 characters. Short, punchy, hook-style.
- **Description**: Long-form (200-500 chars). Descriptive, keyword-rich. TikTok says long descriptions get 3x more views.
- **Hashtags**: Exactly 5 per post. Mix of broad (#filmmaking) and niche (#cinematographytips).

Update `content-manifest.json` with new `tiktok` fields:
```json
{
  "tiktok": {
    "title": "Stop guessing your camera settings 🎬",
    "description": "Every filmmaker knows the frustration of menu diving...",
    "hashtags": ["#filmmaking", "#cinematography", "#filmmaker", "#filmtips", "#framecoach"]
  }
}
```

### 4. TikTok API Prep

Add to Settings page:
- TikTok API Client Key field
- TikTok API Client Secret field
- Save to localStorage (existing pattern)
- "Connect TikTok" button (disabled until keys entered, placeholder for OAuth flow)

### 5. Data Changes

**content-manifest.json** — Update each of 24 content items with:
- `tiktok.title` (≤87 chars)
- `tiktok.description` (200-500 chars)
- `tiktok.hashtags` (exactly 5)

**contentStore.js** — Add:
- `loadTikTokGroups()` — loads manifest, filters to carousel format only, groups by content piece (matching by headline)
- `updateInstagramCarousel(id, updates)` — persist Instagram carousel status/notes
- Status overrides for Instagram carousels in localStorage

### 6. Component Changes

**CarouselViewer.jsx** — Add optional metadata panel:
- Status selector
- Platform URL input
- Notes input
- Save button
- Props: `showStatus`, `onSave`

**GalleryPage.jsx** — TikTok tab:
- Load via `loadTikTokGroups()` instead of `loadManifest()`
- Show 24 grouped cards instead of 432 individual cards
- Click → CarouselViewer with 6 template slides + TikTok metadata
- Search/filter by headline, category

**GalleryPage.jsx** — Instagram tab:
- Add status/metadata to CarouselViewer via props
- Persist via `updateInstagramCarousel()`

## File Changes

- Modify: `dashboard/src/components/CarouselViewer.jsx` — add status/metadata panel
- Modify: `dashboard/src/pages/GalleryPage.jsx` — TikTok grouped cards + Instagram metadata
- Modify: `dashboard/src/store/contentStore.js` — add TikTok grouping + Instagram status persistence
- Modify: `dashboard/public/content-manifest.json` (or regenerate) — add TikTok title/description/hashtags
- Modify: `dashboard/src/pages/SettingsPage.jsx` — add TikTok API key fields

## Tech
- Same stack (React 19, Tailwind CSS v4, JSZip, lucide-react)
- No new dependencies
