import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Filter, Search, X, Eye, CheckSquare, Square, Tag,
  ExternalLink, Check, Copy, Instagram, Hash, Loader2,
  AlertCircle, RefreshCw, Download,
} from 'lucide-react';
import { loadManifest, updateContent, loadInstagramCarousels } from '../store/contentStore';
import StatusBadge from '../components/StatusBadge';
import CarouselCard from '../components/CarouselCard';
import CarouselViewer from '../components/CarouselViewer';
import DownloadButton from '../components/DownloadButton';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMAT_OPTIONS  = ['All', 'Story', 'Feed', 'Carousel'];
const CATEGORY_OPTIONS = ['All', 'App Promo', 'Brand Awareness', 'Film Education'];
const STATUS_OPTIONS  = ['All', 'Pending', 'Scheduled', 'Posted', 'Analyzed'];
const TEMPLATE_OPTIONS = ['All', 'brand-icon', 'gradient-slide', 'statement-card', 'bold-typography', 'asset-feature', 'minimal-dark'];

const TEMPLATE_COLORS = {
  'brand-icon':      '#E32326',
  'gradient-slide':  '#3B82F6',
  'statement-card':  '#F59E0B',
  'bold-typography': '#8B5CF6',
  'asset-feature':   '#22C55E',
  'minimal-dark':    '#EC4899',
};

const IG_BASE_PATH = `${import.meta.env.BASE_URL}instagram-carousels/`;

// ---------------------------------------------------------------------------
// Copy-to-clipboard helper with toast feedback
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
// Download helper (fetch + blob)
// ---------------------------------------------------------------------------

async function triggerDownload(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || url.split('/').pop() || 'download.png';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error('Download failed:', err);
  }
}

// ---------------------------------------------------------------------------
// ContentCard
// ---------------------------------------------------------------------------

function ContentCard({ item, selected, onSelect, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const color = TEMPLATE_COLORS[item.template] || '#8E8E8E';

  return (
    <div
      className={`bg-[#141414] border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 group ${
        selected
          ? 'border-[#E32326] ring-1 ring-[#E32326]/30'
          : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
      }`}
      onClick={() => onClick(item)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden bg-[#1C1C1C]">
        {!imgError && item.imageUrl ? (
          <>
            {!imgLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}
              >
                <Loader2 size={20} className="text-[#8E8E8E] animate-spin" />
              </div>
            )}
            <img
              src={item.imageUrl}
              alt={item.headline}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
            style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
              style={{ backgroundColor: `${color}30`, color }}
            >
              {item.headline.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-[#8E8E8E] text-[10px] text-center leading-tight line-clamp-3 px-2">
              {item.headline.replace(/\n/g, ' ')}
            </p>
          </div>
        )}

        {/* Download overlay button */}
        <button
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center bg-black/60 hover:bg-[#E32326] rounded-lg text-white"
          onClick={e => { e.stopPropagation(); if (item.imageUrl) triggerDownload(item.imageUrl, item.filename || `${item.id}.png`); }}
          title="Download image"
        >
          <Download size={13} />
        </button>

        {/* Format badge */}
        <div
          className="absolute bottom-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: color }}
        >
          {item.format}
        </div>

        {/* Template badge */}
        <div className="absolute bottom-2 right-2 text-[#8E8E8E] text-[9px] bg-black/60 px-1.5 py-0.5 rounded">
          {item.template}
        </div>

        {/* Checkbox */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => { e.stopPropagation(); onSelect(item.id); }}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center border ${
            selected ? 'bg-[#E32326] border-[#E32326]' : 'bg-black/60 border-white/30'
          }`}>
            {selected && <Check size={11} className="text-white" />}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-[#f7f7f7] text-xs font-semibold leading-tight line-clamp-2 mb-1.5">
          {item.headline.replace(/\n/g, ' ')}
        </div>
        <div className="text-[#8E8E8E] text-[10px] line-clamp-2 mb-2 leading-relaxed">
          {item.caption?.instagram?.slice(0, 80)}…
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#8E8E8E] text-[10px]">{item.category}</span>
          <StatusBadge status={item.status} showDot />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentModal
// ---------------------------------------------------------------------------

function ContentModal({ item, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('instagram');
  const [status, setStatus] = useState(item.status);
  const [platformUrl, setPlatformUrl] = useState(item.platformUrl || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const { toast, copy } = useCopyToast();

  const color = TEMPLATE_COLORS[item.template] || '#8E8E8E';

  const captionText = item.caption?.[activeTab] || '';
  const hashtagText = (item.hashtags?.[activeTab] || []).join(' ');
  const fullCopyText = `${captionText}\n\n${hashtagText}`;

  const handleSave = () => {
    setSaving(true);
    const updates = { status, platformUrl, notes };
    if (status === 'Posted' && !item.datePosted) {
      updates.datePosted = new Date().toISOString();
    }
    onUpdate(item.id, updates);
    setTimeout(() => { setSaving(false); onClose(); }, 300);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top: image + meta */}
        <div className="flex flex-col md:flex-row gap-0">
          {/* Image panel */}
          <div className="md:w-64 shrink-0">
            <div
              className="relative md:rounded-tl-2xl md:rounded-bl-2xl overflow-hidden"
              style={{ minHeight: 280 }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.headline}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: 460 }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${color}22, ${color}55)`,
                    minHeight: 280,
                  }}
                >
                  <div className="text-center px-6">
                    <div
                      className="text-xs font-bold px-3 py-1 rounded-full mb-3 text-white inline-block"
                      style={{ backgroundColor: color }}
                    >
                      {item.template}
                    </div>
                    <h2 className="text-white text-base font-bold leading-tight">
                      {item.headline.replace(/\n/g, '\n')}
                    </h2>
                  </div>
                </div>
              )}
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 p-5 space-y-4">
            {/* Headline + meta */}
            <div>
              <h2 className="text-[#f7f7f7] text-lg font-bold leading-tight mb-1.5">
                {item.headline.replace(/\n/g, ' ')}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: color }}
                >
                  {item.template}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#1C1C1C] text-[#8E8E8E]">
                  {item.format}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#1C1C1C] text-[#8E8E8E]">
                  {item.category}
                </span>
                <StatusBadge status={status} showDot />
              </div>
            </div>

            {/* Body copy */}
            <div>
              <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-1.5">Body Copy</div>
              <p className="text-[#ACACAB] text-sm leading-relaxed">{item.body}</p>
            </div>

            {/* Platform caption tabs */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[#8E8E8E] text-xs uppercase tracking-wider flex-1">Caption</div>
                <div className="flex gap-1">
                  {['instagram', 'tiktok'].map(p => (
                    <button
                      key={p}
                      onClick={() => setActiveTab(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        activeTab === p
                          ? 'bg-[#E32326] text-white'
                          : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}
                    >
                      {p === 'instagram' ? 'Instagram' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#1C1C1C] rounded-xl p-3 relative group/caption">
                <p className="text-[#f7f7f7] text-sm leading-relaxed pr-8">{captionText}</p>
                <button
                  onClick={() => copy(captionText, 'Caption copied')}
                  className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#E32326] rounded-lg text-[#8E8E8E] hover:text-white transition-all"
                  title="Copy caption"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-1.5">Hashtags ({activeTab})</div>
              <div className="bg-[#1C1C1C] rounded-xl p-3 relative group/tags">
                <p className="text-[#3B82F6] text-xs leading-relaxed font-mono pr-8">
                  {hashtagText}
                </p>
                <button
                  onClick={() => copy(hashtagText, 'Hashtags copied')}
                  className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#3B82F6] rounded-lg text-[#8E8E8E] hover:text-white transition-all"
                  title="Copy hashtags"
                >
                  <Hash size={13} />
                </button>
              </div>
            </div>

            {/* Copy full post button */}
            <button
              onClick={() => copy(fullCopyText, 'Full post copied')}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#E32326]/40 hover:bg-[#E32326]/10 text-[#f7f7f7] text-xs font-medium rounded-xl transition-all"
            >
              <Copy size={13} className="text-[#E32326]" />
              Copy Caption + Hashtags ({activeTab === 'instagram' ? 'Instagram' : 'TikTok'})
            </button>

            {/* Download button */}
            {item.imageUrl && (
              <DownloadButton
                url={item.imageUrl}
                filename={item.filename || `${item.id}.png`}
                label="Download Image"
                className="w-full justify-center"
              />
            )}
          </div>
        </div>

        {/* Bottom edit section */}
        <div className="border-t border-[#2A2A2A] p-5 space-y-4">
          {/* Status */}
          <div>
            <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-2">Status</div>
            <div className="flex gap-2 flex-wrap">
              {['Pending', 'Scheduled', 'Posted', 'Analyzed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    status === s
                      ? 'bg-[#E32326] text-white'
                      : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform URL */}
            <div>
              <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-1.5">Platform URL</div>
              <input
                type="text"
                value={platformUrl}
                onChange={e => setPlatformUrl(e.target.value)}
                placeholder="Paste post URL after publishing..."
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/40 focus:outline-none focus:border-[#E32326]/50"
              />
            </div>

            {/* Notes */}
            <div>
              <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-1.5">Notes</div>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add a note..."
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/40 focus:outline-none focus:border-[#E32326]/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#E32326] hover:bg-[#B91C1F] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {platformUrl && (
              <a
                href={platformUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3A3A3A] text-[#f7f7f7] text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink size={14} /> View Post
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl z-[60]">
          <Check size={14} /> {toast}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GalleryPage
// ---------------------------------------------------------------------------

export default function GalleryPage() {
  // --- Tab state from URL hash ---
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'tiktok' ? 'tiktok' : 'instagram';
  };

  const [activeMainTab, setActiveMainTab] = useState(getTabFromHash);

  const switchTab = useCallback((tab) => {
    setActiveMainTab(tab);
    window.location.hash = tab;
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveMainTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // --- Instagram Carousels state ---
  const [carousels, setCarousels] = useState([]);
  const [carouselsLoading, setCarouselsLoading] = useState(false);
  const [carouselsLoaded, setCarouselsLoaded] = useState(false);
  const [igSearch, setIgSearch] = useState('');
  const [viewerCarousel, setViewerCarousel] = useState(null);

  const loadCarousels = useCallback(async () => {
    setCarouselsLoading(true);
    try {
      const data = await loadInstagramCarousels();
      setCarousels(data);
    } catch {
      setCarousels([]);
    } finally {
      setCarouselsLoading(false);
      setCarouselsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (activeMainTab === 'instagram' && !carouselsLoaded) {
      loadCarousels();
    }
  }, [activeMainTab, carouselsLoaded, loadCarousels]);

  const filteredCarousels = useMemo(() => {
    if (!igSearch) return carousels;
    const q = igSearch.toLowerCase();
    return carousels.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q)
    );
  }, [carousels, igSearch]);

  // --- TikTok Content state ---
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTemplate, setFilterTemplate] = useState('All');
  const [selected, setSelected] = useState(new Set());
  const [expandedItem, setExpandedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const items = await loadManifest();
      setContent(items);
      if (items.length === 0) setApiError(true); else setApiError(false);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
      setContentLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (activeMainTab === 'tiktok' && !contentLoaded) {
      loadContent();
    }
  }, [activeMainTab, contentLoaded, loadContent]);

  const filtered = useMemo(() => {
    return content.filter(item => {
      if (filterFormat !== 'All' && item.format !== filterFormat) return false;
      if (filterCategory !== 'All' && item.category !== filterCategory) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterTemplate !== 'All' && item.template !== filterTemplate) return false;
      if (search) {
        const q = search.toLowerCase();
        const inHeadline = item.headline.toLowerCase().includes(q);
        const inCaption = item.caption?.instagram?.toLowerCase().includes(q) ||
                          item.caption?.tiktok?.toLowerCase().includes(q);
        if (!inHeadline && !inCaption) return false;
      }
      return true;
    });
  }, [content, filterFormat, filterCategory, filterStatus, filterTemplate, search]);

  const handleSelect = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
  };

  const handleBulkMarkPosted = () => {
    const now = new Date().toISOString();
    setContent(prev => prev.map(item => {
      if (!selected.has(item.id)) return item;
      const updates = { status: 'Posted', datePosted: item.datePosted || now };
      updateContent(item.id, updates);
      return { ...item, ...updates };
    }));
    setSelected(new Set());
  };

  const handleUpdate = (id, updates) => {
    updateContent(id, updates);
    setContent(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const activeFilters = [filterFormat, filterCategory, filterStatus, filterTemplate].filter(f => f !== 'All').length;

  // Collect download URLs for selected items (bulk download)
  const selectedDownloadUrls = useMemo(() => {
    return filtered
      .filter(item => selected.has(item.id) && item.imageUrl)
      .map(item => item.imageUrl);
  }, [filtered, selected]);

  // -----------------------------------------------------------------------
  // Tab bar
  // -----------------------------------------------------------------------

  const tabBar = (
    <div className="flex items-center gap-2 p-1 bg-[#1C1C1C] rounded-xl w-fit">
      <button
        onClick={() => switchTab('instagram')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeMainTab === 'instagram'
            ? 'bg-[#E32326] text-white'
            : 'text-[#8E8E8E] hover:text-[#f7f7f7]'
        }`}
      >
        Instagram Carousels{carousels.length > 0 ? ` (${carousels.length})` : ''}
      </button>
      <button
        onClick={() => switchTab('tiktok')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeMainTab === 'tiktok'
            ? 'bg-[#E32326] text-white'
            : 'text-[#8E8E8E] hover:text-[#f7f7f7]'
        }`}
      >
        TikTok Content{content.length > 0 ? ` (${content.length})` : ''}
      </button>
    </div>
  );

  // -----------------------------------------------------------------------
  // Instagram Carousels tab content
  // -----------------------------------------------------------------------

  const renderInstagramTab = () => {
    if (carouselsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="text-[#E32326] animate-spin" />
          <div className="text-[#8E8E8E] text-sm">Loading Instagram carousels...</div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
          <input
            type="text"
            value={igSearch}
            onChange={e => setIgSearch(e.target.value)}
            placeholder="Search carousels by name or subtitle..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/50 focus:outline-none focus:border-[#E32326]/50"
          />
        </div>

        {/* Grid or empty state */}
        {filteredCarousels.length === 0 ? (
          <div className="text-center py-20 text-[#8E8E8E]">
            <Tag size={40} className="mx-auto mb-4 opacity-30" />
            <div className="text-lg font-medium mb-1">No carousels found</div>
            <div className="text-sm">
              {igSearch ? 'Try adjusting your search' : 'No carousel data available'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCarousels.map(carousel => (
              <CarouselCard
                key={carousel.id}
                carousel={carousel}
                basePath={IG_BASE_PATH}
                onClick={setViewerCarousel}
              />
            ))}
          </div>
        )}

        {/* Carousel Viewer Modal */}
        {viewerCarousel && (
          <CarouselViewer
            carousel={viewerCarousel}
            basePath={IG_BASE_PATH}
            onClose={() => setViewerCarousel(null)}
          />
        )}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // TikTok Content tab content
  // -----------------------------------------------------------------------

  const renderTikTokTab = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="text-[#E32326] animate-spin" />
          <div className="text-[#8E8E8E] text-sm">Loading TikTok content...</div>
        </div>
      );
    }

    // API error state
    if (apiError) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle size={36} className="text-[#F59E0B] opacity-70" />
          <div className="text-[#f7f7f7] text-base font-medium">API server not running</div>
          <div className="text-[#8E8E8E] text-sm text-center max-w-xs">
            Start the API with <code className="bg-[#1C1C1C] px-1.5 py-0.5 rounded text-[#E32326] text-xs">node api/server.js</code> then refresh.
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
            <p className="text-[#8E8E8E] text-sm">
              {filtered.length} of {content.length} items
              {content.length > 0 && <span className="text-[#E32326]"> · {content.length} real images</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <>
                <span className="text-[#8E8E8E] text-sm">{selected.size} selected</span>
                <DownloadButton
                  zipUrls={selectedDownloadUrls}
                  zipFilename={`framecoach-tiktok-${selected.size}-images.zip`}
                  label={`Download ${selected.size} Selected`}
                  className="!bg-[#3B82F6]/15 !text-[#3B82F6] border border-[#3B82F6]/20 hover:!bg-[#3B82F6]/25"
                />
                <button
                  onClick={handleBulkMarkPosted}
                  className="px-4 py-2 bg-[#22C55E]/15 border border-[#22C55E]/20 text-[#22C55E] text-sm font-medium rounded-lg hover:bg-[#22C55E]/25 transition-colors"
                >
                  Mark Posted
                </button>
                <button onClick={() => setSelected(new Set())} className="text-[#8E8E8E] hover:text-[#f7f7f7]">
                  <X size={16} />
                </button>
              </>
            )}
            <button
              onClick={loadContent}
              className="w-8 h-8 flex items-center justify-center text-[#8E8E8E] hover:text-[#f7f7f7] bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg transition-colors"
              title="Reload from API"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Search + filter toggle */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search headlines or captions..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/50 focus:outline-none focus:border-[#E32326]/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || activeFilters > 0
                ? 'bg-[#E32326]/10 border-[#E32326]/30 text-[#E32326]'
                : 'bg-[#141414] border-[#2A2A2A] text-[#8E8E8E] hover:text-[#f7f7f7]'
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[#E32326] text-white rounded-full text-xs">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap gap-6">
              {/* Format */}
              <div>
                <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-2">Format</div>
                <div className="flex gap-1.5">
                  {FORMAT_OPTIONS.map(f => (
                    <button key={f} onClick={() => setFilterFormat(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterFormat === f ? 'bg-[#E32326] text-white' : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-2">Category</div>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORY_OPTIONS.map(c => (
                    <button key={c} onClick={() => setFilterCategory(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterCategory === c ? 'bg-[#E32326] text-white' : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-2">Status</div>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === s ? 'bg-[#E32326] text-white' : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div>
                <div className="text-[#8E8E8E] text-xs uppercase tracking-wider mb-2">Template</div>
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_OPTIONS.map(t => (
                    <button key={t} onClick={() => setFilterTemplate(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterTemplate === t ? 'bg-[#E32326] text-white' : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterFormat('All'); setFilterCategory('All'); setFilterStatus('All'); setFilterTemplate('All'); }}
                className="text-[#E32326] text-xs hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Select all */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3">
            <button onClick={handleSelectAll} className="flex items-center gap-2 text-[#8E8E8E] hover:text-[#f7f7f7] text-sm transition-colors">
              {selected.size === filtered.length && filtered.length > 0 ? (
                <CheckSquare size={15} className="text-[#E32326]" />
              ) : (
                <Square size={15} />
              )}
              {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[#2A2A2A] text-xs">|</span>
            <span className="text-[#8E8E8E] text-xs">{filtered.length} items shown</span>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8E8E8E]">
            <Tag size={40} className="mx-auto mb-4 opacity-30" />
            <div className="text-lg font-medium mb-1">No content found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                selected={selected.has(item.id)}
                onSelect={handleSelect}
                onClick={setExpandedItem}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {expandedItem && (
          <ContentModal
            item={expandedItem}
            onClose={() => setExpandedItem(null)}
            onUpdate={(id, updates) => {
              handleUpdate(id, updates);
              setExpandedItem(prev => ({ ...prev, ...updates }));
            }}
          />
        )}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* Page header + tab bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[#f7f7f7] text-2xl font-bold">Content Gallery</h1>
          <p className="text-[#8E8E8E] text-sm mt-0.5">Browse and manage all generated content</p>
        </div>
        {tabBar}
      </div>

      {/* Tab content */}
      {activeMainTab === 'instagram' ? renderInstagramTab() : renderTikTokTab()}
    </div>
  );
}
