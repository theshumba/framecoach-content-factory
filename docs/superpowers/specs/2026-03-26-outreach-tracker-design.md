# Outreach Tracker — Design Spec

## Overview

New "Outreach" page in the Content Factory dashboard sidebar. A searchable, filterable table of ~425 leads where a social media manager can track outreach status per channel.

## Data

- 425 deduplicated leads from 9 categories (8 CSV lists + Instagram creators)
- Pre-loaded from `src/data/leads.json` on first visit, then persisted to localStorage
- Lead schema:

```json
{
  "id": "lead_001",
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "company": "string",
  "jobTitle": "string",
  "location": "string",
  "email": "string",
  "phone": "string",
  "instagram": "string",
  "tiktok": "string",
  "linkedin": "string",
  "category": "string",
  "headline": "string",
  "followers": "string",
  "engagementRate": "string",
  "source": "csv | instagram",
  "channels": {
    "instagramDm": "not_sent | sent | responded | follow_up",
    "tiktokDm": "not_sent | sent | responded | follow_up",
    "email": "not_sent | sent | responded | follow_up",
    "phone": "not_called | called | responded | follow_up",
    "text": "not_sent | sent | responded | follow_up",
    "linkedin": "not_sent | sent | responded | follow_up"
  },
  "notes": ""
}
```

## UI Components

### Summary Bar
- Total leads, contacted (at least 1 channel not default), responded, remaining
- 4 StatCard components in a grid

### Filters & Search
- Search by name, company, email, handle
- Filter by category (dropdown, 9 options + "All")
- Filter by status: "All", "Not Contacted", "Contacted", "Responded", "Follow-up Needed"
- Debounced search (300ms)

### Leads Table
- Columns: Name (+ company subtitle), Category, Email, Channels (6 toggle buttons), Notes, Actions
- Each channel is a small pill/badge that cycles through statuses on click
- Channel status colors: not_sent = gray, sent = blue, responded = green, follow_up = amber
- Click lead name to expand detail row with full info (location, LinkedIn, headline, followers, etc.)
- Notes field: inline editable, auto-saves on blur

### Channel Status Badges
- Compact clickable badges, one per channel
- Click cycles: not_sent → sent → responded → follow_up → not_sent
- Icons: Instagram, TikTok, Mail, Phone, MessageSquare, Linkedin (from lucide-react)
- Color-coded by status

## Storage

- localStorage key: `fc_outreach_v1`
- On first load: if no localStorage data, load from leads.json and persist
- All changes persist immediately (no save button)
- Export to CSV button in header

## Patterns

- Follows existing dashboard patterns: dark theme, card backgrounds, spacing
- Colors: `bg-[#141414]` cards, `border-[#2A2A2A]`, `text-[#f7f7f7]` / `text-[#8E8E8E]`
- Primary CTA: `bg-[#E32326]`
- Responsive: table scrolls horizontally on mobile

## Files to Create/Edit

1. **Create** `src/pages/OutreachPage.jsx` — main page component
2. **Create** `src/store/outreachStore.js` — localStorage CRUD
3. **Edit** `src/components/Sidebar.jsx` — add Outreach nav item
4. **Edit** `src/App.jsx` — add /outreach route
