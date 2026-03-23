# Gallery Page Rebuild — Instagram Carousels + TikTok Downloads

## Problem

The Gallery page only shows 144 single promotional images (Set B). The 30 multi-slide Instagram carousels (Set A) aren't in the dashboard at all. There's no download functionality for either set. The user needs to browse and download both sets to AirDrop to their phone for manual posting.

## Solution

Rebuild the Gallery page with two tabs:

### Tab 1: Instagram Carousels
- Shows the 30 carousels from `~/Desktop/FrameCoach Carousels/`
- Each carousel displayed as a card showing slide 1
- Click a card → opens slideshow modal with prev/next arrows, dot indicators
- Download button per carousel (downloads all slides as a zip)
- Download button per individual slide
- Search/filter by carousel name

### Tab 2: TikTok Content
- Shows the existing 144 promotional images from `output/`
- Scrollable grid (keep current card layout)
- Click a card → opens image modal with caption/hashtags (keep existing modal features)
- Download button per image
- Bulk download (select multiple → download zip)
- Keep existing filters (format, category, template, status)

## Data Changes

### Instagram carousel manifest
- Generate a new `instagram-carousel-manifest.json` that maps each of the 30 carousels to its slides
- Copy slide images from Desktop into `dashboard/public/instagram-carousels/` so they deploy with the site
- Structure: `{ id, name, slides: ["slide-01.png", ...], caption, hashtags }`
- Pull caption/hashtags from `carousels/generate.js` carousel data

### TikTok content
- Use existing `content-manifest.json` — no changes needed
- Just add download functionality to the existing UI

## Components

### New
- `CarouselCard` — Shows first slide thumbnail, carousel name, slide count badge
- `CarouselViewer` — Full-screen slideshow modal with prev/next, dots, slide counter, download buttons
- `DownloadButton` — Reusable download button (single file or zip)

### Modified
- `GalleryPage` — Add tab bar (Instagram / TikTok), render appropriate section per tab
- `ContentModal` — Add download button to existing TikTok image modal
- `contentStore.js` — Add `loadInstagramCarousels()` function

## Download Implementation
- Single images: Direct `<a download>` link
- Zip downloads: Use JSZip library in-browser to bundle multiple PNGs into a zip
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
  src/
    components/
      CarouselCard.jsx       (new)
      CarouselViewer.jsx     (new)
      DownloadButton.jsx     (new)
    pages/
      GalleryPage.jsx        (rebuilt with tabs)
    store/
      contentStore.js        (add instagram carousel loading)
    data/
      instagram-carousels.json (new — generated manifest)
```

## Build Script
- `scripts/sync-carousels.js` — Copies slides from Desktop into `dashboard/public/instagram-carousels/` and generates the manifest JSON with captions/hashtags from `carousels/generate.js`

## Tech
- React 19 + Tailwind CSS v4 (existing stack)
- JSZip (new dependency) for zip downloads
- Lucide React icons (existing)
- No API server needed — everything works from static files on GitHub Pages
