![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Remotion](https://img.shields.io/badge/Remotion-4-0B84F3?logo=react&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-24-40B5A4?logo=puppeteer&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-Private-lightgrey)

# FrameCoach Content Factory

Automated content generation pipeline for [FrameCoach](https://framecoach.io) — the camera intelligence app for filmmakers. Generates Instagram carousels, short-form video reels, and story images from a single brand configuration, ready for posting.

## Architecture

```
framecoach-content-factory/
├── generator/          # Story & social image generator (Puppeteer)
│   ├── templates/      # 6 HTML templates (brand-icon, gradient-slide, etc.)
│   ├── generate.js     # Renders templates → PNG across 3 formats
│   └── hashtag-engine  # Research-backed hashtag selection for IG & TikTok
├── carousels/          # Instagram carousel generator
│   ├── generate.js     # 30 carousel topics → self-contained HTML files
│   └── render.js       # HTML → PNG slides (1080×1350, 4:5)
├── reels/              # Short-form video generator (Remotion)
│   └── src/
│       ├── scenes/     # Hook, Point, Bold, Text, CTA scene components
│       ├── components/ # Background, Corners, Logo, ProgressBar, SFX
│       └── data/       # 15 reel scripts with per-scene timing
├── api/                # Express server for dashboard + posting integrations
│   └── routes/         # content, queue, analytics, tiktok, instagram
├── dashboard/          # React + Vite management UI
├── scripts/            # Cross-platform rendering utilities
└── brand-config.js     # Centralized brand tokens (colors, fonts, copy)
```

## Modules

### Story & Social Image Generator

Renders 6 HTML templates across 3 output formats (story 1080x1920, feed 1080x1080, carousel 1080x1350) using Puppeteer. Content is pulled from the brand config — 24 headlines across app promo, brand awareness, and film education categories. Includes a hashtag recommendation engine with category-aware selection for Instagram and TikTok.

```bash
node generator/generate.js              # all images (~432)
node generator/generate.js --quick      # story format only (~144)
node generator/generate.js --template bold-typography
```

### Carousel Generator

Produces 30 self-contained HTML carousel files covering topics from "What is FrameCoach" to composition techniques. Each carousel is a multi-slide interactive HTML file that can be rendered to individual PNG slides for Instagram (1080x1350, 4:5 aspect ratio). Three visual themes: light, dark, and gradient.

```bash
node carousels/generate.js              # generate HTML carousels
node carousels/render.js                # render all to PNG slides
node carousels/render.js 01-what-is     # render specific carousel
```

### Reel Generator

15 short-form videos built with Remotion 4 and React. Each reel is composed from typed scene components (Hook, Point, Bold, Text, CTA) with transition animations and progress bars. Renders to 1080x1920 MP4 at ~18 seconds per reel.

```bash
cd reels
npm run start                           # open Remotion Studio (preview)
npm run render-all                      # render all 15 reels to MP4
```

### Dashboard

React 19 + Vite management interface with content gallery, analytics, posting queue, and settings. Communicates with the Express API server.

```bash
npm run dashboard                       # start dashboard dev server
npm run api                             # start API server (port 3001)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Story/Image Rendering | Puppeteer 24 |
| Video Rendering | Remotion 4, React 19, TypeScript |
| Carousel Generation | Node.js (HTML generation + Puppeteer screenshot) |
| API Server | Express 5, Multer |
| Dashboard | React 19, Vite 8, Tailwind CSS 4, Recharts, Lucide |
| Brand System | Bebas Neue + Poppins, #E32326 red / #141414 dark |

## Getting Started

Prerequisites: Node.js 22+, ffmpeg (for video rendering).

```bash
# Install dependencies
npm install
cd reels && npm install
cd ../dashboard && npm install

# Generate story images
npm run generate

# Preview reels in Remotion Studio
cd reels && npm run start

# Start the dashboard
npm run dashboard
```

## Brand Configuration

All visual tokens, copy, and content categories are defined in `brand-config.js`. Templates, generators, and reels all pull from this single source of truth — change the config once, regenerate everywhere.

## Links

- **FrameCoach**: [framecoach.io](https://framecoach.io)
- **Instagram**: [@framecoach.io](https://instagram.com/framecoach.io)
