/**
 * Instagram Graph API Service
 *
 * Encapsulates all Instagram Graph API calls for publishing content.
 *
 * SETUP REQUIREMENTS:
 *   1. You need an Instagram Business or Creator account.
 *   2. Connect your Instagram account to a Facebook Page.
 *   3. Create a Meta Developer App at https://developers.facebook.com/
 *   4. Add "Instagram Graph API" to your app.
 *   5. Required permissions:
 *      - instagram_basic
 *      - instagram_content_publish
 *      - pages_read_engagement (for insights)
 *      - instagram_manage_insights (for post analytics)
 *   6. Get a Page Access Token (long-lived) from Meta Business Suite or Graph API Explorer.
 *   7. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env
 *
 * IMPORTANT NOTES:
 *   - Images must be hosted at a publicly accessible HTTPS URL.
 *   - Max 25 carousel children per post.
 *   - Publishing rate limit: 25 posts per 24 hours per Instagram account.
 *   - Insights are only available for Business/Creator accounts.
 *
 * API Reference:
 *   https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *   https://developers.facebook.com/docs/instagram-api/reference/ig-media
 */

import fetch from 'node-fetch';

const GRAPH_API_BASE = 'https://graph.facebook.com';
const GRAPH_API_VERSION = 'v19.0';

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

function getConfig() {
  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    igUserId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
  };
}

export function isConfigured() {
  const { accessToken, igUserId } = getConfig();
  return !!(accessToken && igUserId);
}

// ---------------------------------------------------------------------------
// Helper: authenticated fetch
// ---------------------------------------------------------------------------

async function graphFetch(path, options = {}) {
  const { accessToken } = getConfig();
  if (!accessToken) throw new Error('INSTAGRAM_ACCESS_TOKEN not configured');

  const separator = path.includes('?') ? '&' : '?';
  const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}${path}${separator}access_token=${accessToken}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(
      `Instagram API error [${data.error.code}/${data.error.error_subcode || 'n/a'}]: ${data.error.message}`
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// Account info (verify token + account)
// ---------------------------------------------------------------------------

/**
 * Fetch basic info about the connected Instagram Business account.
 * Useful for verifying credentials are correct.
 */
export async function getAccountInfo() {
  const { igUserId } = getConfig();
  return graphFetch(`/${igUserId}?fields=id,name,username,profile_picture_url,followers_count`);
}

// ---------------------------------------------------------------------------
// Step 1: Create a media container
// ---------------------------------------------------------------------------

/**
 * Upload a single image to Instagram (creates a media container, not yet published).
 *
 * The imageUrl MUST be a publicly accessible HTTPS URL.
 * Instagram's servers will fetch the image from this URL.
 *
 * @param {string} imageUrl  — Public HTTPS URL to the image
 * @param {string} caption   — Post caption (max 2,200 chars, max 30 hashtags)
 * @param {boolean} isCarouselItem — Set true when creating a carousel child
 * @returns {string} creationId — Used in the publish step
 */
export async function createMediaContainer(imageUrl, caption = '', isCarouselItem = false) {
  const { igUserId } = getConfig();

  const params = new URLSearchParams({
    image_url: imageUrl,
    ...(isCarouselItem ? { is_carousel_item: 'true' } : { caption }),
  });

  const data = await graphFetch(`/${igUserId}/media`, {
    method: 'POST',
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data.id; // creation_id
}

// ---------------------------------------------------------------------------
// Step 2: Publish the media container
// ---------------------------------------------------------------------------

/**
 * Publish a previously created media container.
 * Call this after createMediaContainer to make the post go live.
 *
 * @param {string} creationId — The id returned by createMediaContainer
 * @returns {string} mediaId  — The published media's id (used for insights)
 */
export async function publishMediaContainer(creationId) {
  const { igUserId } = getConfig();

  const params = new URLSearchParams({ creation_id: creationId });

  const data = await graphFetch(`/${igUserId}/media_publish`, {
    method: 'POST',
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data.id; // media_id of the live post
}

// ---------------------------------------------------------------------------
// High-level: publish a single image post
// ---------------------------------------------------------------------------

/**
 * Full two-step flow: create container → publish.
 *
 * @param {string} imageUrl — Public HTTPS URL
 * @param {string} caption  — Caption with hashtags
 * @returns {{ mediaId, postedAt }}
 */
export async function publishSingleImage(imageUrl, caption) {
  if (!isConfigured()) {
    throw new Error('Instagram not configured — set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env');
  }

  const creationId = await createMediaContainer(imageUrl, caption, false);

  // Short wait: Instagram recommends polling the container status before publishing.
  // For simplicity we do a minimal delay — in production, poll /media?fields=status_code
  await new Promise(r => setTimeout(r, 2000));

  const mediaId = await publishMediaContainer(creationId);

  return {
    mediaId,
    postedAt: new Date().toISOString(),
    platformUrl: `https://www.instagram.com/p/${mediaId}/`,
  };
}

// ---------------------------------------------------------------------------
// Carousel: create child containers
// ---------------------------------------------------------------------------

/**
 * Create individual media containers for a carousel.
 * Each image is uploaded separately, then combined into a carousel container.
 *
 * @param {string[]} imageUrls — Array of public HTTPS image URLs (max 20 for carousels)
 * @returns {string[]} childCreationIds
 */
export async function createCarouselChildren(imageUrls) {
  const childIds = [];
  for (const url of imageUrls) {
    // No caption on children — only the carousel container gets the caption
    const childId = await createMediaContainer(url, '', true);
    childIds.push(childId);
  }
  return childIds;
}

// ---------------------------------------------------------------------------
// Carousel: create carousel container
// ---------------------------------------------------------------------------

/**
 * Create the carousel container that groups all child media.
 *
 * @param {string[]} childCreationIds — IDs from createCarouselChildren
 * @param {string} caption            — Caption for the carousel post
 * @returns {string} carouselCreationId
 */
export async function createCarouselContainer(childCreationIds, caption) {
  const { igUserId } = getConfig();

  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    caption,
    children: childCreationIds.join(','),
  });

  const data = await graphFetch(`/${igUserId}/media`, {
    method: 'POST',
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data.id;
}

// ---------------------------------------------------------------------------
// High-level: publish carousel
// ---------------------------------------------------------------------------

/**
 * Full carousel publish flow:
 *   1. Create child containers for each image
 *   2. Create carousel container referencing all children
 *   3. Publish the carousel
 *
 * @param {string[]} imageUrls — Array of public HTTPS image URLs (2-20 images)
 * @param {string} caption     — Caption with hashtags
 * @returns {{ mediaId, postedAt }}
 */
export async function publishCarousel(imageUrls, caption) {
  if (!isConfigured()) {
    throw new Error('Instagram not configured — set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env');
  }
  if (imageUrls.length < 2) throw new Error('Carousel requires at least 2 images');
  if (imageUrls.length > 20) throw new Error('Carousel supports max 20 images');

  // Step 1: Upload all children
  const childIds = await createCarouselChildren(imageUrls);

  // Step 2: Create carousel container
  const carouselId = await createCarouselContainer(childIds, caption);

  // Step 3: Short wait for processing
  await new Promise(r => setTimeout(r, 2000));

  // Step 4: Publish
  const mediaId = await publishMediaContainer(carouselId);

  return {
    mediaId,
    postedAt: new Date().toISOString(),
    platformUrl: `https://www.instagram.com/p/${mediaId}/`,
    childCount: imageUrls.length,
  };
}

// ---------------------------------------------------------------------------
// Insights: single post
// ---------------------------------------------------------------------------

/**
 * Get insights for a specific published post.
 * Requires instagram_manage_insights permission.
 *
 * Available metrics:
 *   impressions, reach, engagement, saved, video_views,
 *   profile_visits, follows, shares
 *
 * @param {string} mediaId — The media's id (from publishSingleImage / publishCarousel)
 */
export async function getMediaInsights(mediaId) {
  const metrics = [
    'impressions',
    'reach',
    'engagement',
    'saved',
    'comments_count',
    'like_count',
    'shares',
  ].join(',');

  return graphFetch(`/${mediaId}/insights?metric=${metrics}`);
}

// ---------------------------------------------------------------------------
// Insights: account level
// ---------------------------------------------------------------------------

/**
 * Get account-level insights (follower count, impressions, reach, etc.)
 * over a specified period.
 *
 * @param {string} period  — 'day' | 'week' | 'month' | 'lifetime'
 * @param {string} since   — Unix timestamp or YYYY-MM-DD
 * @param {string} until   — Unix timestamp or YYYY-MM-DD
 */
export async function getAccountInsights(period = 'week', since, until) {
  const { igUserId } = getConfig();

  const metrics = [
    'impressions',
    'reach',
    'follower_count',
    'email_contacts',
    'phone_call_clicks',
    'website_clicks',
    'profile_views',
  ].join(',');

  let query = `/${igUserId}/insights?metric=${metrics}&period=${period}`;
  if (since) query += `&since=${since}`;
  if (until) query += `&until=${until}`;

  return graphFetch(query);
}

// ---------------------------------------------------------------------------
// Check media container status (for polling before publish)
// ---------------------------------------------------------------------------

/**
 * Poll the status of a media container before publishing.
 * Wait until status_code === 'FINISHED' before calling publishMediaContainer.
 *
 * @param {string} creationId
 * @returns {{ statusCode, id }}
 */
export async function getMediaContainerStatus(creationId) {
  const data = await graphFetch(`/${creationId}?fields=status_code,status`);
  return { statusCode: data.status_code, status: data.status, id: data.id };
}
