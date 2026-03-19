import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, ExternalLink, Check, Calendar, ArrowUpDown,
  TrendingUp, Eye, Heart, Copy, Hash, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { loadManifest, updateContent } from '../store/contentStore';
import StatusBadge from '../components/StatusBadge';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_FLOW = ['Pending', 'Scheduled', 'Posted', 'Analyzed'];

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------

function useCopyToast() {
  const [toast, setToast] = useState(null);
  const copy = useCallback(async (text, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(label);
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast('Copy failed');
      setTimeout(() => setToast(null), 2000);
    }
  }, []);
  return { toast, copy };
}

// ---------------------------------------------------------------------------
// Format date
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ---------------------------------------------------------------------------
// EditableRow
// ---------------------------------------------------------------------------

function EditableRow({ item, onUpdate, onCopyCaption }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(item.status);
  const [datePosted, setDatePosted] = useState(item.datePosted ? item.datePosted.split('T')[0] : '');
  const [platformUrl, setPlatformUrl] = useState(item.platformUrl || '');

  const handleSave = () => {
    const updates = {
      status,
      datePosted: datePosted ? new Date(datePosted).toISOString() : item.datePosted,
      platformUrl,
    };
    onUpdate(item.id, updates);
    setEditing(false);
  };

  const color = {
    'brand-icon':      '#E32326',
    'gradient-slide':  '#3B82F6',
    'statement-card':  '#F59E0B',
    'bold-typography': '#8B5CF6',
    'asset-feature':   '#22C55E',
    'minimal-dark':    '#EC4899',
  }[item.template] || '#8E8E8E';

  return (
    <>
      <tr
        className="border-b border-[#2A2A2A] hover:bg-[#1C1C1C]/50 transition-colors"
      >
        {/* Thumbnail */}
        <td className="px-4 py-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#1C1C1C]">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.headline}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {item.headline.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </td>

        {/* Headline + meta */}
        <td className="px-4 py-3 cursor-pointer" onClick={() => !editing && setEditing(true)}>
          <div className="text-[#f7f7f7] text-sm font-medium max-w-xs truncate">{item.headline}</div>
          <div className="text-[#8E8E8E] text-xs mt-0.5">{item.format} · {item.category} · {item.template}</div>
        </td>

        {/* Status */}
        <td className="px-4 py-3 cursor-pointer" onClick={() => !editing && setEditing(true)}>
          <StatusBadge status={item.status} />
        </td>

        {/* Date Posted */}
        <td className="px-4 py-3 text-[#8E8E8E] text-sm cursor-pointer" onClick={() => !editing && setEditing(true)}>
          {formatDate(item.datePosted)}
        </td>

        {/* Caption copy */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopyCaption(item, 'instagram')}
              title="Copy Instagram caption"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1C1C1C] hover:bg-[#E32326]/20 border border-[#2A2A2A] hover:border-[#E32326]/30 text-[#8E8E8E] hover:text-[#E32326] text-xs transition-all"
            >
              <Copy size={10} /> IG
            </button>
            <button
              onClick={() => onCopyCaption(item, 'tiktok')}
              title="Copy TikTok caption"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1C1C1C] hover:bg-[#3B82F6]/20 border border-[#2A2A2A] hover:border-[#3B82F6]/30 text-[#8E8E8E] hover:text-[#3B82F6] text-xs transition-all"
            >
              <Copy size={10} /> TT
            </button>
          </div>
        </td>

        {/* Link */}
        <td className="px-4 py-3">
          {item.platformUrl ? (
            <a
              href={item.platformUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#E32326] hover:text-[#B91C1F] transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          ) : (
            <span className="text-[#2A2A2A]">—</span>
          )}
        </td>
      </tr>

      {/* Expanded edit row */}
      {editing && (
        <tr className="border-b border-[#E32326]/20 bg-[#141414]">
          <td colSpan={6} className="px-4 py-4">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Status */}
              <div>
                <div className="text-[#8E8E8E] text-xs mb-1">Status</div>
                <div className="flex gap-1.5">
                  {STATUS_FLOW.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        status === s ? 'bg-[#E32326] text-white' : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date posted */}
              <div>
                <div className="text-[#8E8E8E] text-xs mb-1">Date Posted</div>
                <input
                  type="date"
                  value={datePosted}
                  onChange={e => setDatePosted(e.target.value)}
                  className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-[#f7f7f7] text-xs focus:outline-none focus:border-[#E32326]/50"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Platform URL */}
              <div className="flex-1 min-w-48">
                <div className="text-[#8E8E8E] text-xs mb-1">Platform URL</div>
                <input
                  type="text"
                  value={platformUrl}
                  onChange={e => setPlatformUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-[#f7f7f7] text-xs placeholder-[#8E8E8E]/40 focus:outline-none focus:border-[#E32326]/50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E32326] text-white text-xs font-medium rounded-lg hover:bg-[#B91C1F] transition-colors"
                >
                  <Check size={12} /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] text-[#8E8E8E] text-xs rounded-lg hover:text-[#f7f7f7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Caption preview */}
            {item.caption?.instagram && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[#8E8E8E] text-xs mb-1.5">Instagram Caption</div>
                  <div className="bg-[#1C1C1C] rounded-lg p-3 text-[#ACACAB] text-xs leading-relaxed line-clamp-3">
                    {item.caption.instagram}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E8E] text-xs mb-1.5">TikTok Caption</div>
                  <div className="bg-[#1C1C1C] rounded-lg p-3 text-[#ACACAB] text-xs leading-relaxed line-clamp-3">
                    {item.caption.tiktok}
                  </div>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// TrackerPage
// ---------------------------------------------------------------------------

export default function TrackerPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortDir, setSortDir] = useState('desc');
  const { toast, copy } = useCopyToast();

  const loadContent = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const items = await loadManifest();
      setContent(items);
      if (items.length === 0) setApiError(true);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const stats = useMemo(() => {
    const total = content.length;
    const posted = content.filter(i => i.status === 'Posted' || i.status === 'Analyzed').length;
    const scheduled = content.filter(i => i.status === 'Scheduled').length;
    const pending = content.filter(i => i.status === 'Pending').length;
    return { total, posted, scheduled, pending };
  }, [content]);

  const filtered = useMemo(() => {
    let items = content;
    if (filterStatus !== 'All') items = items.filter(i => i.status === filterStatus);
    if (search) items = items.filter(i =>
      i.headline.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
    );

    return [...items].sort((a, b) => {
      let av, bv;
      if (sortBy === 'status') {
        av = STATUS_FLOW.indexOf(a.status);
        bv = STATUS_FLOW.indexOf(b.status);
      } else if (sortBy === 'datePosted') {
        av = a.datePosted ? new Date(a.datePosted).getTime() : 0;
        bv = b.datePosted ? new Date(b.datePosted).getTime() : 0;
      } else {
        av = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
        bv = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [content, filterStatus, search, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const handleUpdate = (id, updates) => {
    updateContent(id, updates);
    setContent(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleCopyCaption = (item, platform) => {
    const caption = item.caption?.[platform] || '';
    const hashtags = (item.hashtags?.[platform] || []).join(' ');
    const full = `${caption}\n\n${hashtags}`;
    copy(full, `${platform === 'instagram' ? 'Instagram' : 'TikTok'} caption copied`);
  };

  const pct = Math.round((stats.posted / Math.max(stats.total, 1)) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={32} className="text-[#E32326] animate-spin" />
        <div className="text-[#8E8E8E] text-sm">Loading content tracker...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={36} className="text-[#F59E0B] opacity-70" />
        <div className="text-[#f7f7f7] text-base font-medium">API server not running</div>
        <div className="text-[#8E8E8E] text-sm text-center max-w-xs">
          Start with <code className="bg-[#1C1C1C] px-1.5 py-0.5 rounded text-[#E32326] text-xs">node api/server.js</code>
        </div>
        <button
          onClick={loadContent}
          className="flex items-center gap-2 px-4 py-2 bg-[#E32326] hover:bg-[#B91C1F] text-white text-sm font-medium rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#f7f7f7] text-2xl font-bold">Posting Tracker</h1>
          <p className="text-[#8E8E8E] text-sm mt-0.5">Track and update posting status for all {content.length} content pieces</p>
        </div>
        <button
          onClick={loadContent}
          className="w-8 h-8 flex items-center justify-center text-[#8E8E8E] hover:text-[#f7f7f7] bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg transition-colors"
          title="Reload"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Progress */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#E32326]" />
            <span className="text-[#f7f7f7] text-sm font-semibold">Overall Progress</span>
          </div>
          <span className="text-[#f7f7f7] font-bold">{stats.posted} / {stats.total}</span>
        </div>
        <div className="h-3 bg-[#1C1C1C] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#E32326] to-[#FF4B4E] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: stats.pending, color: '#8E8E8E' },
            { label: 'Scheduled', count: stats.scheduled, color: '#F59E0B' },
            { label: 'Posted', count: stats.posted, color: '#22C55E' },
            { label: 'Complete', count: `${pct}%`, color: '#E32326' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-bold text-lg" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[#8E8E8E] text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search headlines or categories..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/50 focus:outline-none focus:border-[#E32326]/50"
          />
        </div>
        <div className="flex gap-2">
          {['All', ...STATUS_FLOW].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-[#E32326] text-white'
                  : 'bg-[#141414] border border-[#2A2A2A] text-[#8E8E8E] hover:text-[#f7f7f7]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider w-14">
                  Img
                </th>
                <th
                  className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[#f7f7f7] transition-colors"
                  onClick={() => handleSort('headline')}
                >
                  <span className="flex items-center gap-1">Content <ArrowUpDown size={11} /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[#f7f7f7] transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <span className="flex items-center gap-1">Status <ArrowUpDown size={11} /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[#f7f7f7] transition-colors"
                  onClick={() => handleSort('datePosted')}
                >
                  <span className="flex items-center gap-1">Posted <ArrowUpDown size={11} /></span>
                </th>
                <th className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider">
                  Copy Caption
                </th>
                <th className="px-4 py-3 text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider w-14">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <EditableRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onCopyCaption={handleCopyCaption}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#8E8E8E]">
            <Calendar size={36} className="mx-auto mb-3 opacity-30" />
            <div className="text-base font-medium">No content matches</div>
            <div className="text-sm">Adjust your filters to see results</div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-[#2A2A2A] flex items-center justify-between">
          <span className="text-[#8E8E8E] text-xs">Showing {filtered.length} of {content.length} items</span>
          <span className="text-[#8E8E8E] text-xs">Click any row to edit · Click IG/TT to copy caption</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl z-50">
          <Check size={14} /> {toast}
        </div>
      )}
    </div>
  );
}
