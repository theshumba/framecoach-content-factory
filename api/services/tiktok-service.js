/**
 * TikTok API Service
 *
 * Encapsulates all TikTok Content Posting API v2 calls.
 *
 * SETUP REQUIREMENTS:
 *   1. Create a TikTok Developer App at https://developers.tiktok.com/
 *   2. Add the "Content Posting API" product to your app
 *   3. Request the following scopes:
 *      - video.upload   (post videos to drafts)
 *      - video.publish  (publish videos directly — requires review/approval)
 *   4. Complete OAuth to get an access token (see /api/tiktok/auth)
 *   5. Set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_ACCESS_TOKEN in .env
 *
 * IMPORTANT NOTES:
 *   - Videos go to the user's TikTok "inbox" (drafts) when using MEDIA_UPLOAD mode.
 *     The user must then open TikTok and publish from there.
 *   - Direct publishing (post_mode: DIRECT_POST) requires app review approval.
 *   - Photos can be uploaded as photo posts — they also go to inbox/drafts.
 *   - Rate limits: TikTok limits posting frequency. Avoid burst posting.
 *     See https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * API Reference:
 *   https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
 *   https://developers.tiktok.com/doc/content-posting-api-reference-upload-photo
 */

import fetch from 'node-fetch';
import { readFile } from 'fs/promises';
import { createReadStream, statSync } from 'fs';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';
const TIKTOK_AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

function getConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3001/api/tiktok/callback';

  return { clientKey, clientSecret, accessToken, refreshToken, redirectUri };
}

export function isConfigured() {
  const { clientKey, accessToken } = getConfig();
  return !!(clientKey && accessToken);
}

// ---------------------------------------------------------------------------
// OAuth — build authorization URL
// ---------------------------------------------------------------------------

/**
 * Returns the TikTok OAuth URL to redirect the user to.
 * After the user authorizes, TikTok redirects to /api/tiktok/callback with a code.
 */
export function buildAuthUrl() {
  const { clientKey, redirectUri } = getConfig();
  if (!clientKey) throw new Error('TIKTOK_CLIENT_KEY not configured');

  // CSRF token (in production, store this in session and verify in callback)
  const csrfState = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,video.upload',
    response_type: 'code',
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return `${TIKTOK_AUTH_BASE}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// OAuth — exchange code for access token
// ---------------------------------------------------------------------------

/**
 * Exchange an OAuth authorization code for access + refresh tokens.
 * @param {string} code — The code received in the OAuth callback
 * @returns {Object} { access_token, refresh_token, expires_in, open_id, ... }
 */
export async function exchangeCodeForToken(code) {
  const { clientKey, clientSecret, redirectUri } = getConfig();

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  const data = await res.json();
  if (data.error) throw new Error(`TikTok OAuth error: ${data.error_description || data.error}`);
  return data;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

/**
 * Refresh the access token using a refresh token.
 * TikTok access tokens expire after a configurable period (default ~24h).
 * @param {string} refreshToken
 * @returns {Object} New token response
 */
export async function refreshAccessToken(refreshToken) {
  const { clientKey, clientSecret } = getConfig();

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  const data = await res.json();
  if (data.error) throw new Error(`TikTok token refresh error: ${data.error_description || data.error}`);
  return data;
}

// ---------------------------------------------------------------------------
// Helper: authenticated fetch
// ---------------------------------------------------------------------------

async function tiktokFetch(path, options = {}) {
  const { accessToken } = getConfig();
  if (!accessToken) throw new Error('TIKTOK_ACCESS_TOKEN not configured');

  const url = path.startsWith('http') ? path : `${TIKTOK_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (data.error?.code && data.error.code !== 'ok') {
    throw new Error(`TikTok API error [${data.error.code}]: ${data.error.message}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Get creator info (verify token works)
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's basic creator info.
 * Good for verifying the access token is valid.
 */
export async function getCreatorInfo() {
  return tiktokFetch('/post/publish/creator_info/query/', { method: 'POST', body: '{}' });
}

// ---------------------------------------------------------------------------
// Initiate video upload
// ---------------------------------------------------------------------------

/**
 * Step 1 of video upload: initialize an upload session.
 *
 * TikTok returns an upload URL and a publish_id.
 * The video is sent to the user's TikTok inbox (drafts) for them to review and post.
 *
 * @param {Object} options
 * @param {string} options.title     — Video caption/title
 * @param {number} options.fileSize  — File size in bytes
 * @param {string} options.mimeType  — e.g. "video/mp4"
 * @returns {{ publish_id, upload_url }}
 */
export async function initVideoUpload({ title, fileSize, mimeType = 'video/mp4' }) {
  const body = {
    post_info: {
      title,
      privacy_level: 'SELF_ONLY',  // Goes to drafts/inbox, user controls final visibility
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: fileSize,
      chunk_size: fileSize,  // Single chunk upload for simplicity
      total_chunk_count: 1,
    },
  };

  // MEDIA_UPLOAD mode → video goes to user's inbox/drafts
  const data = await tiktokFetch('/post/publish/inbox/video/init/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    publishId: data.data?.publish_id,
    uploadUrl: data.data?.upload_url,
  };
}

// ---------------------------------------------------------------------------
// Upload video file to TikTok's upload URL
// ---------------------------------------------------------------------------

/**
 * Step 2: Upload the actual video bytes to the upload URL returned by initVideoUpload.
 *
 * @param {string} uploadUrl  — URL from initVideoUpload
 * @param {string} filePath   — Local file path to the video
 * @param {number} fileSize   — File size in bytes
 * @param {string} mimeType   — e.g. "video/mp4"
 */
export async function uploadVideoFile(uploadUrl, filePath, fileSize, mimeType = 'video/mp4') {
  const fileBuffer = await readFile(filePath);

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': fileSize.toString(),
      'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok file upload failed (${res.status}): ${text}`);
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Initiate photo upload
// ---------------------------------------------------------------------------

/**
 * Upload photo(s) to TikTok as a photo post.
 * Photos go to the user's inbox (drafts) — they publish from TikTok app.
 *
 * @param {Object} options
 * @param {string} options.title      — Post caption
 * @param {string[]} options.photoUrls — Publicly accessible URLs to the images
 * @returns {{ publish_id }}
 */
export async function uploadPhotoPost({ title, photoUrls }) {
  const body = {
    post_info: {
      title,
      privacy_level: 'SELF_ONLY',
      disable_duet: false,
      disable_comment: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      photo_cover_index: 0,
      photo_images: photoUrls,
    },
    post_mode: 'MEDIA_UPLOAD',
    media_type: 'PHOTO',
  };

  const data = await tiktokFetch('/post/publish/content/init/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    publishId: data.data?.publish_id,
  };
}

// ---------------------------------------------------------------------------
// Check publish status
// ---------------------------------------------------------------------------

/**
 * Poll the status of an upload/publish operation.
 *
 * Statuses:
 *   PROCESSING_UPLOAD  — TikTok is processing the upload
 *   PUBLISH_COMPLETE   — Published (or sent to drafts) successfully
 *   FAILED             — Something went wrong
 *   SEND_TO_USER_INBOX — Sent to inbox, awaiting user action
 *
 * @param {string} publishId — The publish_id from initVideoUpload / uploadPhotoPost
 */
export async function checkPublishStatus(publishId) {
  const data = await tiktokFetch('/post/publish/status/fetch/', {
    method: 'POST',
    body: JSON.stringify({ publish_id: publishId }),
  });

  return {
    publishId,
    status: data.data?.status,
    failReason: data.data?.fail_reason,
    publiclyAvailable: data.data?.publicly_available,
    extra: data.extra,
  };
}

// ---------------------------------------------------------------------------
// High-level: upload a photo to TikTok drafts
// ---------------------------------------------------------------------------

/**
 * Full flow: upload a content item's image to TikTok drafts.
 *
 * @param {Object} contentItem  — Content item from content.json
 * @param {string} baseUrl      — Public base URL where output files are served
 * @returns {{ publishId, status }}
 */
export async function sendPhotoToTikTokDrafts(contentItem, baseUrl) {
  if (!isConfigured()) throw new Error('TikTok not configured — set TIKTOK_CLIENT_KEY and TIKTOK_ACCESS_TOKEN in .env');

  const photoUrl = `${baseUrl}/output/${contentItem.outputFile?.replace('output/', '') || ''}`;
  const title = `${contentItem.caption}\n\n${(contentItem.hashtags || []).join(' ')}`.trim();

  const { publishId } = await uploadPhotoPost({ title, photoUrls: [photoUrl] });
  const statusResult = await checkPublishStatus(publishId);

  return { publishId, ...statusResult };
}
