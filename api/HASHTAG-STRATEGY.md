# FrameCoach Hashtag Strategy Guide

Research-backed playbook for Instagram and TikTok hashtag usage. Updated March 2026.

---

## 1. Current Best Practices Per Platform

### Instagram (2026)

**Use 3–5 highly relevant hashtags per post.**

Instagram's own guidance (updated 2025) recommends quality over quantity. The old 20–30 hashtag spray-and-pray strategy now actively signals spam to the algorithm. Instagram's Explore categorisation engine reads the full post — caption text, alt text, and hashtags — as a single data package when published. Relevance across all three signals matters more than hashtag volume alone.

**Why this count works:**
- Posts with 4–5 hashtags consistently outperform posts with 1 hashtag or posts with 20+ hashtags in engagement rate studies (2025 data).
- For accounts under 100K followers, hashtags in the caption boost reach by up to 36% versus placing them in the first comment.
- For accounts over 100K followers, first-comment placement increases reach by ~15.9% (reduced caption clutter helps engagement signals).

**Placement recommendation for @framecoachapp:**
Put hashtags directly in the caption (FrameCoach is a growing account, well under 100K). Add them at the end of the caption after your copy, separated by a line break for readability.

**What to avoid:**
- Do not stuff 30 hashtags to "cover all bases". Instagram has confirmed it deprioritises this pattern.
- Avoid banned or restricted hashtags — they can shadow-restrict the entire post.
- Avoid using identical hashtag sets on every post. Instagram rewards variation as a signal of authentic, non-automated behaviour.

---

### TikTok (2026)

**Use 3–5 strategically chosen hashtags per video.**

TikTok's 2026 algorithm update explicitly confirmed that hashtag stuffing reduces distribution. TikTok primarily categorises content from video content, audio, on-screen text, and captions — hashtags are a supporting signal, not the primary one.

**Why this count works:**
- Nearly 80% of viral TikTok videos are categorised by TikTok through a combination of keywords, hashtags, sounds, and on-screen text — the algorithm doesn't rely on hashtags alone.
- 3–5 focused hashtags consistently outperform 10+ generic hashtags in reach-per-view metrics.
- Community tags like #filmtok connect content directly to an engaged niche audience rather than competing in the generic #fyp sea.

**Placement:**
All hashtags in the TikTok caption. Keep the caption readable — write a sentence or two of copy before the hashtags.

**What to avoid:**
- Do not lead with 10 generic tags (#fyp #viral #trending #foryoupage) — this is treated as low-quality signal.
- Avoid duplicating hashtags across every post with no variation.

---

## 2. The Mix Strategy: Broad / Medium / Niche / Micro

Every hashtag set in the engine uses a tiered mix:

| Tier   | Post Volume | Role | Count per post |
|--------|-------------|------|----------------|
| Broad  | 1M+ posts   | Maximum discovery pool, high competition | 1–2 |
| Medium | 100K–1M     | Engaged community, good reach, lower competition than broad | 1–2 |
| Niche  | 10K–100K    | Strong community relevance, manageable competition | 1–2 |
| Micro  | <10K        | Highest engagement rate, very targeted audience | 0–1 |
| Branded | — | Brand recall, searchability, community building | Always 2 |

**Why not just use broad hashtags?**
A post using only #filmmaking (hundreds of millions of posts) will be buried instantly. The algorithm needs to see that your content is relevant to a *specific* community, not just the entire filmmaking internet.

**Why not just use micro hashtags?**
Micro tags reach a tiny pool. They're great for engagement rate metrics but won't drive discovery for a growing account. You need broad tags to enter new feeds.

**The balance:**
Start broader to get discovered, then pull in the viewer with medium + niche tags that signal your specific value proposition. Branded tags always appear to build recall and searchability over time.

---

## 3. Category-Specific Recommendations for FrameCoach

### App Promo content
Goal: reach filmmakers who don't know FrameCoach yet. Prioritise broad filmmaking + tech discovery.

Recommended blend:
- 1–2 broad filmmaking tags (#filmmaker, #filmmaking)
- 1–2 medium tags focused on tools/production (#filmproduction, #filmgear)
- 1 niche tag (#filmtech, #filmprotools)
- Always: #FrameCoach + #FrameCoachApp

Instagram example: `#filmmaker #filmproduction #filmgear #FrameCoach #FrameCoachApp`
TikTok example: `#fyp #filmtok #filmgear #FrameCoach #FrameCoachApp`

### Brand Awareness content
Goal: build familiarity with the FrameCoach brand among the wider filmmaker community.

Recommended blend:
- 1–2 broad community tags (#filmmaker, #cinema)
- 1–2 medium brand-adjacent tags (#filmcommunity, #cinematic)
- 1 niche credibility tag (#dplife, #filmmakersworld)
- Always: #FrameCoach + #FrameCoachApp

### Film Education content
Goal: position FrameCoach as a trusted knowledge source. High save rate expected — saves are the strongest IG signal for educational content.

Recommended blend:
- 1 broad education tag (#filmschool, #learnfilmmaking)
- 1–2 medium topic tags (#cinematographytips, #filmtips)
- 1–2 niche precise-topic tags (#colorgrading, #exposuretriangle, #shotcomposition)
- Always: #FrameCoach + #FrameCoachApp

Use save-bait CTAs with education posts: "Save this for your next shoot." This category historically drives the most saves, which Instagram treats as a strong quality signal.

---

## 4. How to Update the Hashtag Database

The hashtag database lives at `/generator/hashtag-engine.js` in the `HASHTAG_DB` export.

**When to update:**
- Every 3–4 months (hashtag performance shifts seasonally)
- After a major platform algorithm update announcement
- When a new community hashtag goes viral in the filmmaking niche (e.g., a new challenge tag)
- If a specific post significantly outperforms — check which hashtags were on it

**How to add a hashtag:**
1. Identify the correct tier (broad / medium / niche / micro) based on post volume
2. Add it to the relevant category array in `HASHTAG_DB`
3. No changes needed to `getHashtags()` — it auto-merges all pool members

**How to retire a hashtag:**
Simply remove it from the array. The engine is pool-based, so removal is instant.

**How to check the database:**
```js
import { getDatabaseStats } from './generator/hashtag-engine.js';
console.log(getDatabaseStats());
```

---

## 5. What to Monitor and How to Iterate

### Metrics to track per post
Track these in the FrameCoach Command Centre or via `/api/analytics/`:

| Metric | What it tells you |
|--------|-------------------|
| Reach (non-followers) | How many new people the hashtags are bringing in |
| Saves | Educational content quality signal (aim for >3% of reach) |
| Impressions from hashtags | Instagram Insights shows this directly |
| Engagement rate | Benchmark: >5% is strong for a niche B2B creator account |

### Monthly hashtag review process
1. Pull top-performing posts from `/api/analytics/top-performing`
2. Note which hashtag sets were used (visible in post metadata if you store it)
3. Identify patterns: did education content with #cinematographytips consistently outperform?
4. Retire hashtags that appear on low-performing posts 3 or more times in a row
5. Add 2–3 new experimental hashtags to the relevant pool tier
6. Run A/B: same content type, different hashtag tier emphasis (niche-heavy vs medium-heavy)

### Signals that a hashtag is losing effectiveness
- Post impressions from hashtags declining over 4+ weeks despite consistent content quality
- Engagement rate dropping while using the same hashtag set
- Instagram starts hiding the hashtag from Explore (shadow restriction signal)

### Growth thresholds requiring strategy shifts
| Follower count | Recommended adjustment |
|---|---|
| 0–10K | Caption placement, 5 tags, mix as described above |
| 10K–50K | Test niche-heavy sets (3 niche + 1 medium + branded). Micro tags become more powerful. |
| 50K–100K | Begin testing first-comment placement vs caption (split test over 2 weeks) |
| 100K+ | First-comment placement recommended. Reduce to 3 tags. Brand recall hashtags carry more weight. |

---

## 6. Hashtag Sets Quick Reference

These are the engine defaults. Every call to `getHashtags()` randomises within each tier, so individual posts will have variation while staying within the strategic framework.

### Instagram

| Category | Typical set (example) |
|---|---|
| App Promo | #filmmaker #filmproduction #filmtech #FrameCoach #FrameCoachApp |
| Brand Awareness | #filmmaker #filmdirector #filmcommunity #FrameCoach #FrameCoachApp |
| Film Education | #filmschool #cinematographytips #colorgrading #FrameCoach #FrameCoachApp |

### TikTok

| Category | Typical set (example) |
|---|---|
| App Promo | #fyp #filmtok #filmgear #FrameCoach #FrameCoachApp |
| Brand Awareness | #fyp #cinematiktok #filmcommunity #FrameCoach #FrameCoachApp |
| Film Education | #fyp #filmstudenttok #cinematographytips #FrameCoach #FrameCoachApp |

---

## 7. API Endpoints

Two endpoints are available for programmatic hashtag retrieval:

```
GET /api/analytics/hashtags?category=app-promo&platform=instagram
GET /api/analytics/hashtag-sets
```

See the routes in `/api/routes/analytics.js` for full response schema.

---

*Last updated: March 2026. Refresh this guide when major platform algorithm changes are announced.*
