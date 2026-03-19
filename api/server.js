/**
 * FrameCoach Content Factory — API Server
 *
 * Express.js server that powers the Content Factory dashboard.
 * Handles content CRUD, TikTok & Instagram posting, analytics,
 * and the posting queue.
 *
 * Port: 3001 (dashboard runs on a separate port, CORS enabled)
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import 'dotenv/config';

// Route imports
import contentRouter from './routes/content.js';
import tiktokRouter from './routes/tiktok.js';
import instagramRouter from './routes/instagram.js';
import analyticsRouter from './routes/analytics.js';
import queueRouter from './routes/queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// CORS — allow the dashboard (any localhost port) during development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',  // Vite default
    'http://localhost:5174',
    'http://localhost:4000',
    /^http:\/\/localhost:\d+$/,
  ],
  credentials: true,
}));

// JSON body parsing (10mb limit for content payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Static files — serve generated output assets
// ---------------------------------------------------------------------------
// The generator writes rendered images/videos to ../output/
// The dashboard can reference them via /output/<filename>
// Sub-paths /stories/, /feed/, /carousel/ map directly to output sub-dirs
const outputDir = join(__dirname, '..', 'output');
app.use('/output', express.static(outputDir));
app.use('/stories', express.static(join(outputDir, 'stories')));
app.use('/feed', express.static(join(outputDir, 'feed')));
app.use('/carousel', express.static(join(outputDir, 'carousel')));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FrameCoach Content Factory API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      tiktok: !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_ACCESS_TOKEN),
      instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID),
    },
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/content', contentRouter);
app.use('/api/tiktok', tiktokRouter);
app.use('/api/instagram', instagramRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/queue', queueRouter);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableRoutes: [
      'GET  /health',
      'GET  /api/content',
      'GET  /api/tiktok/auth',
      'GET  /api/instagram/auth',
      'GET  /api/analytics/overview',
      'GET  /api/queue',
    ],
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[API Error]', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n FrameCoach Content Factory API`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` TikTok configured: ${!!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_ACCESS_TOKEN)}`);
  console.log(` Instagram configured: ${!!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID)}`);
  console.log(` Output dir served at: /output/*\n`);
});

export default app;
