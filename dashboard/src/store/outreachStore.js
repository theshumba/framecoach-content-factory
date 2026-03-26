/**
 * FrameCoach Content Factory — Outreach Store
 *
 * Manages outreach leads in localStorage. On first load, seeds from bundled leads.json.
 * All updates persist immediately.
 */

const STORAGE_KEY = 'fc_outreach_v1';

let _cache = null;

function readStorage() {
  if (_cache) return _cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _cache = JSON.parse(raw);
      return _cache;
    }
  } catch {
    // corrupted — fall through to null
  }
  return null;
}

function writeStorage(leads) {
  _cache = leads;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export async function loadLeads() {
  const existing = readStorage();
  if (existing && existing.length > 0) return existing;

  // First load — seed from bundled JSON
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}leads.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const leads = await res.json();
    writeStorage(leads);
    return leads;
  } catch (err) {
    console.error('[outreachStore] Failed to load leads.json:', err);
    return [];
  }
}

export function getLeads() {
  return readStorage() || [];
}

export function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return leads;
  leads[idx] = { ...leads[idx], ...updates };
  writeStorage(leads);
  return leads;
}

export function updateLeadChannel(id, channel, status) {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return leads;
  leads[idx] = {
    ...leads[idx],
    channels: { ...leads[idx].channels, [channel]: status },
  };
  writeStorage(leads);
  return leads;
}

export function getOutreachStats(leads) {
  const total = leads.length;
  const defaultStatuses = ['not_sent', 'not_called'];

  const contacted = leads.filter(l =>
    Object.values(l.channels).some(s => !defaultStatuses.includes(s))
  ).length;

  const responded = leads.filter(l =>
    Object.values(l.channels).some(s => s === 'responded')
  ).length;

  const followUp = leads.filter(l =>
    Object.values(l.channels).some(s => s === 'follow_up')
  ).length;

  const remaining = total - contacted;

  return { total, contacted, responded, followUp, remaining };
}

export function exportLeadsCSV(leads) {
  const headers = [
    'ID', 'Name', 'Company', 'Job Title', 'Location', 'Email', 'Phone',
    'Instagram', 'TikTok', 'LinkedIn', 'Category', 'Followers', 'ER%',
    'Instagram DM', 'TikTok DM', 'Email Status', 'Phone Status',
    'Text/iMessage', 'LinkedIn Status', 'Notes',
  ];
  const rows = leads.map(l => [
    l.id,
    `"${(l.fullName || '').replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${(l.jobTitle || '').replace(/"/g, '""')}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    l.email || '',
    l.phone || '',
    l.instagram || '',
    l.tiktok || '',
    l.linkedin || '',
    l.category || '',
    l.followers || '',
    l.engagementRate || '',
    l.channels?.instagramDm || 'not_sent',
    l.channels?.tiktokDm || 'not_sent',
    l.channels?.email || 'not_sent',
    l.channels?.phone || 'not_called',
    l.channels?.text || 'not_sent',
    l.channels?.linkedin || 'not_sent',
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `framecoach-outreach-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetOutreachData() {
  _cache = null;
  localStorage.removeItem(STORAGE_KEY);
}
