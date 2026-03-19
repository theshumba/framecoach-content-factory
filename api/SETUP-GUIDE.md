# FrameCoach Content Factory — API Setup Guide

## Quick Start

```bash
# From the project root
npm install
node api/server.js
# Server running at http://localhost:3001
```

---

## 1. TikTok Developer App Setup

### Step 1 — Create a TikTok Developer Account
1. Go to https://developers.tiktok.com/
2. Log in with your TikTok account (use the @framecoachapp account)
3. Click **Manage Apps** → **Connect an app**

### Step 2 — Create Your App
1. App name: `FrameCoach Content Factory`
2. App category: **Creator Tools**
3. Platform: **Web** (use `http://localhost:3001` as website URL)
4. Save. Copy your **Client Key** and **Client Secret**.

### Step 3 — Add Content Posting API
1. In your app dashboard → **Add Product**
2. Find **Content Posting API** → click **Add**
3. Under Scopes, enable:
   - `video.upload` — Upload videos to user's inbox/drafts
   - `user.info.basic` — Required for creator info check

> Note: `video.publish` (direct post without going to drafts) requires TikTok's app review.
> Start with `video.upload` and `MEDIA_UPLOAD` mode — content goes to TikTok inbox/drafts.

### Step 4 — Configure Redirect URI
1. In your app settings → **Redirect URI for Login Kit**
2. Add: `http://localhost:3001/api/tiktok/callback`

### Step 5 — Authorize and Get Tokens
1. Add your Client Key to `.env`:
   ```
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   ```
2. Restart the server
3. Visit: `http://localhost:3001/api/tiktok/auth`
4. Open the `authUrl` in a browser
5. Authorize the app
6. You'll be redirected to `/api/tiktok/callback` — copy the tokens shown
7. Add to `.env`:
   ```
   TIKTOK_ACCESS_TOKEN=your_access_token
   TIKTOK_REFRESH_TOKEN=your_refresh_token
   ```
8. Restart the server

### Step 6 — Verify
```bash
curl http://localhost:3001/api/tiktok/status
# Should return: "configured": true
```

---

## 2. Instagram / Meta Developer App Setup

### Step 1 — Instagram Business Account
1. You need an **Instagram Business** or **Creator** account.
   - Go to Instagram → Settings → Account → Switch to Professional Account
2. Connect your Instagram account to a **Facebook Page**.
   - Facebook → Settings → Instagram → Connect Account

### Step 2 — Create Meta Developer App
1. Go to https://developers.facebook.com/apps/create/
2. App type: **Business**
3. App name: `FrameCoach Content Factory`
4. Business account: select your Meta Business account

### Step 3 — Add Instagram Graph API
1. In your app → **Add Product** → **Instagram Graph API** → **Set Up**

### Step 4 — Get Required Permissions
In Graph API Explorer (https://developers.facebook.com/tools/explorer/):
1. Select your app
2. Select your Facebook Page from the User or Page dropdown
3. Click **Generate Access Token**
4. Add these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_read_engagement`
5. Click **Generate Access Token** → authorize

### Step 5 — Extend to Long-Lived Token
Short-lived tokens expire in ~1 hour. Extend it:
```bash
curl -X GET \
  "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```
Long-lived Page access tokens don't expire (they're permanent for Pages).

### Step 6 — Find Your Instagram Business Account ID
```bash
# Step 1: Get your Page ID
curl "https://graph.facebook.com/v19.0/me/accounts?access_token=YOUR_TOKEN"

# Step 2: Get the Instagram account ID linked to the page
curl "https://graph.facebook.com/v19.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_TOKEN"

# The returned id is your INSTAGRAM_BUSINESS_ACCOUNT_ID
```

### Step 7 — Configure .env
```
INSTAGRAM_ACCESS_TOKEN=your_long_lived_page_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id
```
Restart the server.

### Step 8 — Verify
```bash
curl http://localhost:3001/api/instagram/status
# Should return: "configured": true

curl http://localhost:3001/api/instagram/account
# Should return your account details
```

---

## 3. Image Hosting for Publishing

Both TikTok and Instagram require images to be at **publicly accessible HTTPS URLs**.
In local development, your `output/` directory is only accessible on `localhost`.

**Solution: ngrok**

```bash
# Install ngrok: https://ngrok.com/download
# Or: brew install ngrok

# Start your API server first
node api/server.js

# In another terminal, expose it publicly
ngrok http 3001

# ngrok will give you a URL like: https://xxxx.ngrok.io
# Use this as publicBaseUrl in publish calls
```

Your images will then be accessible at:
```
https://xxxx.ngrok.io/output/tip-card-composition-002.png
```

---

## 4. Full .env Configuration

```env
PORT=3001

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token
TIKTOK_REFRESH_TOKEN=your_refresh_token
TIKTOK_REDIRECT_URI=http://localhost:3001/api/tiktok/callback

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_long_lived_page_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_account_id
```

---

## 5. Test the API

### Health check
```bash
curl http://localhost:3001/health
```

### List all content
```bash
curl http://localhost:3001/api/content
```

### Get stats
```bash
curl http://localhost:3001/api/content/stats
```

### Get analytics overview
```bash
curl http://localhost:3001/api/analytics/overview
```

### Get recommendations
```bash
curl http://localhost:3001/api/analytics/recommendations
```

### View current queue
```bash
curl http://localhost:3001/api/queue
```

### Add an item to the queue
```bash
curl -X POST http://localhost:3001/api/queue/add \
  -H "Content-Type: application/json" \
  -d '{"contentId": "cnt_010", "platform": "instagram"}'
```

### Process next queue item (with ngrok running)
```bash
curl -X POST http://localhost:3001/api/queue/process-next \
  -H "Content-Type: application/json" \
  -d '{"publicBaseUrl": "https://xxxx.ngrok.io"}'
```

### Post directly to Instagram
```bash
curl -X POST http://localhost:3001/api/instagram/publish \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://xxxx.ngrok.io/output/tip-card-composition-011.png",
    "caption": "Your caption here #filmmaking #framecoach"
  }'
```

### Send photo to TikTok drafts
```bash
curl -X POST http://localhost:3001/api/tiktok/upload \
  -H "Content-Type: application/json" \
  -d '{
    "type": "photo",
    "title": "Your caption here",
    "outputFile": "output/tip-card-composition-011.png",
    "publicBaseUrl": "https://xxxx.ngrok.io"
  }'
```

---

## 6. API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Server health + config status |
| GET | /api/content | List content (supports filters) |
| GET | /api/content/stats | Aggregate stats |
| GET | /api/content/:id | Single item |
| POST | /api/content | Create item |
| PUT | /api/content/:id | Update item |
| DELETE | /api/content/:id | Delete item |
| POST | /api/content/:id/mark-posted | Quick-mark as posted |
| GET | /api/tiktok/status | TikTok config status |
| GET | /api/tiktok/auth | Get OAuth URL |
| GET | /api/tiktok/callback | OAuth callback |
| POST | /api/tiktok/upload | Upload to TikTok drafts |
| GET | /api/tiktok/status/:publish_id | Check TikTok upload status |
| POST | /api/tiktok/batch-upload | Batch upload (max 10) |
| GET | /api/instagram/status | Instagram config status |
| GET | /api/instagram/auth | Setup instructions |
| POST | /api/instagram/publish | Publish single image |
| POST | /api/instagram/carousel | Publish carousel |
| GET | /api/instagram/insights/:media_id | Post analytics |
| GET | /api/instagram/account-insights | Account analytics |
| GET | /api/instagram/account | Account info |
| GET | /api/analytics/overview | Combined analytics |
| GET | /api/analytics/top-performing | Top 5 posts |
| GET | /api/analytics/by-template | Template performance |
| GET | /api/analytics/by-category | Category performance |
| GET | /api/analytics/by-platform | TikTok vs Instagram |
| GET | /api/analytics/recommendations | Data-driven insights |
| POST | /api/analytics/sync | Pull live analytics |
| GET | /api/queue | Current queue |
| POST | /api/queue/add | Add to queue |
| PUT | /api/queue/reorder | Reorder queue |
| DELETE | /api/queue/:id | Remove from queue |
| POST | /api/queue/process-next | Post next item |
