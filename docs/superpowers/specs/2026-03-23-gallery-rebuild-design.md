# Gallery Page Rebuild — Instagram Carousels + TikTok Downloads

## Problem

The Gallery page only shows 144 single promotional images (Set B). The 30 multi-slide Instagram carousels (Set A) aren't in the dashboard at all. There's no download functionality for either set. The user needs to browse and download both sets to AirDrop to their phone for manual posting.

## Solution

Rebuild the Gallery page with two tabs:

### Tab 1: Instagram Carousels
- Shows the 30 carousels from `~/Desktop/FrameCoach Carousels/` (201 slide PNGs, ~24MB total)
- Each carousel displayed as a card showing slide 1
- Click a card → opens slideshow modal with prev/next arrows, dot indicators, keyboard nav (left/right/escape)
- Download button per carousel (downloads all slides as a zip)
- Download button per individual slide
- Caption + hashtags shown below the slideshow
- Search/filter by carousel name

### Tab 2: TikTok Content
- Shows all 432 promotional images from `output/` across 3 formats (story 1080x1920, feed 1080x1080, carousel 1080x1350)
- Scrollable grid (keep current card layout)
- Click a card → opens image modal with caption/hashtags (keep existing modal features)
- Download button per image
- Bulk download (select multiple → download zip)
- Keep existing filters (format, category, template, status)

## Data Changes

### Instagram carousel manifest
- Generate a new `instagram-carousels.json` that maps each of the 30 carousels to its slides
- Copy slide images from Desktop into `dashboard/public/instagram-carousels/` so they deploy with the site (~24MB, ~120KB avg per slide — fine for Git)
- Structure: `{ id, name, slideCount, slides: ["slide-01.png", ...], caption, hashtags }`
- Extract caption/hashtags by importing the carousel data array from `carousels/generate.js` (ESM export)

### TikTok content
- Use existing `content-manifest.json` — no changes needed
- Just add download functionality to the existing UI

## Components

### New
- `CarouselCard` — Shows first slide thumbnail, carousel name, slide count badge
- `CarouselViewer` — Full-screen slideshow modal with:
  - Prev/next arrows + dot indicators + slide counter (e.g. "3/7")
  - Keyboard navigation (left/right arrows, Escape to close)
  - Download current slide button
  - Download all slides as zip button
  - Caption + hashtags display with copy buttons
- `DownloadButton` — Reusable download button (single file or zip with loading spinner)

### Modified
- `GalleryPage` — Add tab bar (Instagram / TikTok), render appropriate section per tab. Active tab saved in URL hash.
- `ContentModal` — Add download button to existing TikTok image modal
- `contentStore.js` — Add `loadInstagramCarousels()` function

## Download Implementation
- Single images: Direct `<a download>` link
- Zip downloads: Use JSZip library in-browser to bundle multiple PNGs into a zip
- Show spinner on download button while zip is being created
- All downloads work client-side, no API needed

## File Structure (new/modified)
```
dashboard/
  public/
    instagram-carousels/
      01-what-is-framecoach/
        slide-01.png ... slide-07.png
      02-5-reasons-to-try/
        slide-01.png ... slide-07.png
      ... (30 folders)
    instagram-carousels.json
  src/
    components/
      CarouselCard.jsx       (new)
      CarouselViewer.jsx     (new)
      DownloadButton.jsx     (new)
    pages/
      GalleryPage.jsx        (rebuilt with tabs)
    store/
      contentStore.js        (add instagram carousel loading)
```

## Build Script
- `scripts/sync-carousels.js` — Copies slides from `~/Desktop/FrameCoach Carousels/` into `dashboard/public/instagram-carousels/` and generates the manifest JSON by importing carousel data from `carousels/generate.js`

## Tech
- React 19 + Tailwind CSS v4 (existing stack)
- JSZip (new dependency) for zip downloads
- Lucide React icons (existing)
- No API server needed — everything works from static files on GitHub Pages
