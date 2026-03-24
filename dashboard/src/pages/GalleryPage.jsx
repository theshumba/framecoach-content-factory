import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import {
  loadInstagramCarousels, loadTikTokGroups,
  updateInstagramCarousel, updateTikTokGroup,
} from '../store/contentStore';
import CarouselCard from '../components/CarouselCard';
import CarouselViewer from '../components/CarouselViewer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IG_BASE_PATH = `${import.meta.env.BASE_URL}instagram-carousels/`;
const TIKTOK_CATEGORIES = ['All', 'App Promo', 'Brand Awareness', 'Film Education'];

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

  const handleIgSave = useCallback((id, updates) => {
    updateInstagramCarousel(id, updates);
    setCarousels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (viewerCarousel?.id === id) {
      setViewerCarousel(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [viewerCarousel]);

  // --- TikTok Content state ---
  const [tiktokGroups, setTiktokGroups] = useState([]);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokLoaded, setTiktokLoaded] = useState(false);
  const [tiktokError, setTiktokError] = useState(false);
  const [tkSearch, setTkSearch] = useState('');
  const [tkCategory, setTkCategory] = useState('All');
  const [tkViewer, setTkViewer] = useState(null);

  const loadTiktok = useCallback(async () => {
    setTiktokLoading(true);
    setTiktokError(false);
    try {
      const groups = await loadTikTokGroups();
      setTiktokGroups(groups);
      if (groups.length === 0) setTiktokError(true);
    } catch {
      setTiktokError(true);
    } finally {
      setTiktokLoading(false);
      setTiktokLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (activeMainTab === 'tiktok' && !tiktokLoaded) {
      loadTiktok();
    }
  }, [activeMainTab, tiktokLoaded, loadTiktok]);

  const filteredTiktok = useMemo(() => {
    return tiktokGroups.filter(group => {
      if (tkCategory !== 'All' && group.subtitle !== tkCategory) return false;
      if (tkSearch) {
        const q = tkSearch.toLowerCase();
        if (!group.name?.toLowerCase().includes(q) && !group.subtitle?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tiktokGroups, tkCategory, tkSearch]);

  const handleTkSave = useCallback((id, updates) => {
    updateTikTokGroup(id, updates);
    setTiktokGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    if (tkViewer?.id === id) {
      setTkViewer(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [tkViewer]);

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
        TikTok Content{tiktokGroups.length > 0 ? ` (${tiktokGroups.length})` : ''}
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
            onSave={handleIgSave}
          />
        )}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // TikTok Content tab content
  // -----------------------------------------------------------------------

  const renderTikTokTab = () => {
    if (tiktokLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="text-[#E32326] animate-spin" />
          <div className="text-[#8E8E8E] text-sm">Loading TikTok content...</div>
        </div>
      );
    }

    if (tiktokError) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle size={36} className="text-[#F59E0B] opacity-70" />
          <div className="text-[#f7f7f7] text-base font-medium">Content not available</div>
          <div className="text-[#8E8E8E] text-sm text-center max-w-xs">
            Make sure content has been generated and the manifest is available.
          </div>
          <button
            onClick={() => { setTiktokLoaded(false); loadTiktok(); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#E32326] hover:bg-[#B91C1F] text-white text-sm font-medium rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Search + Category filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
            <input
              type="text"
              value={tkSearch}
              onChange={e => setTkSearch(e.target.value)}
              placeholder="Search by headline or category..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#f7f7f7] text-sm placeholder-[#8E8E8E]/50 focus:outline-none focus:border-[#E32326]/50"
            />
          </div>
          <button
            onClick={() => { setTiktokLoaded(false); loadTiktok(); }}
            className="w-8 h-8 flex items-center justify-center text-[#8E8E8E] hover:text-[#f7f7f7] bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg transition-colors self-center"
            title="Reload"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Category filter buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {TIKTOK_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setTkCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tkCategory === cat
                  ? 'bg-[#E32326] text-white'
                  : 'bg-[#1C1C1C] text-[#8E8E8E] hover:text-[#f7f7f7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-[#8E8E8E] text-sm">
          {filteredTiktok.length} of {tiktokGroups.length} groups
        </p>

        {/* Grid or empty state */}
        {filteredTiktok.length === 0 ? (
          <div className="text-center py-20 text-[#8E8E8E]">
            <Tag size={40} className="mx-auto mb-4 opacity-30" />
            <div className="text-lg font-medium mb-1">No content found</div>
            <div className="text-sm">
              {tkSearch || tkCategory !== 'All' ? 'Try adjusting your search or filters' : 'No TikTok content available'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTiktok.map(group => (
              <CarouselCard
                key={group.id}
                carousel={group}
                thumbnailUrl={group.slides[0]}
                onClick={setTkViewer}
              />
            ))}
          </div>
        )}

        {/* TikTok Carousel Viewer Modal */}
        {tkViewer && (
          <CarouselViewer
            carousel={tkViewer}
            basePath={null}
            onClose={() => setTkViewer(null)}
            onSave={handleTkSave}
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
