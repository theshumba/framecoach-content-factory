import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Copy, Check, Save } from 'lucide-react';
import DownloadButton from './DownloadButton';

export default function CarouselViewer({ carousel, basePath, onClose, onSave, mode = 'instagram' }) {
  const [current, setCurrent] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // Status tracking state
  const [status, setStatus] = useState(carousel.status || 'Pending');
  const [platformUrl, setPlatformUrl] = useState(carousel.platformUrl || '');
  const [notes, setNotes] = useState(carousel.notes || '');
  const [saved, setSaved] = useState(false);

  // When basePath is null, slides are full URLs; otherwise build from basePath + id
  const slideUrls = basePath
    ? carousel.slides.map(s => `${basePath}${carousel.id}/${s}`)
    : carousel.slides;
  const total = carousel.slides.length;

  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') stableClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, stableClose]);

  function copyToClipboard(text, field) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handleSave() {
    if (!onSave) return;
    onSave(carousel.id, { status, platformUrl, notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Build hashtag string for TikTok
  const tiktokHashtagsStr = Array.isArray(carousel.tiktokHashtags)
    ? carousel.tiktokHashtags.join(' ')
    : carousel.tiktokHashtags || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={stableClose}>
      <div
        className="bg-zinc-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Slide viewer */}
        <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center">
          <img
            src={slideUrls[current]}
            alt={`${carousel.name} slide ${current + 1}`}
            className="max-h-[70vh] lg:max-h-[85vh] w-auto object-contain"
          />

          <button onClick={stableClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors">
            <X size={20} />
          </button>

          {total > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex gap-1.5">
              {carousel.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-red-500 w-6' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
            <span className="text-white/60 text-xs font-medium">{current + 1}/{total}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-5 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-y-auto max-h-[90vh]">
          <h2 className="text-white text-lg font-bold">{carousel.name}</h2>
          <p className="text-zinc-500 text-sm mt-1">{carousel.subtitle}</p>

          {/* Download buttons */}
          <div className="mt-5 flex flex-col gap-2">
            <DownloadButton
              url={slideUrls[current]}
              filename={`${carousel.id}-slide-${String(current + 1).padStart(2, '0')}.png`}
              label={`Download Slide ${current + 1}`}
            />
            <DownloadButton
              zipUrls={slideUrls}
              zipFilename={`${carousel.id}-all-slides.zip`}
              label={`Download All ${total} Slides`}
              className="bg-zinc-700 hover:bg-zinc-600"
            />
          </div>

          {/* ─── TikTok Mode: Separate Copy Buttons ───────────────────── */}
          {mode === 'tiktok' && (
            <div className="mt-5 space-y-3">
              <div className="border-t border-zinc-800 pt-4">
                <span className="text-[#8E8E8E] text-[10px] font-semibold uppercase tracking-wider">TikTok Copy</span>
              </div>

              {/* Caption (<90 chars) */}
              {carousel.tiktokCaption && (
                <div className="rounded-lg bg-[#1C1C1C] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider">Caption</span>
                    <span className="text-zinc-600 text-[10px]">{carousel.tiktokCaption.length} chars</span>
                  </div>
                  <p className="text-[#f7f7f7] text-sm leading-relaxed">{carousel.tiktokCaption}</p>
                  <button
                    onClick={() => copyToClipboard(carousel.tiktokCaption, 'tkCaption')}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    {copiedField === 'tkCaption' ? (
                      <><Check size={12} className="text-green-500" /> Copied Caption</>
                    ) : (
                      <><Copy size={12} /> Copy Caption</>
                    )}
                  </button>
                </div>
              )}

              {/* Description (long, up to 4000 chars) */}
              {carousel.tiktokDescription && (
                <div className="rounded-lg bg-[#1C1C1C] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider">Description</span>
                    <span className="text-zinc-600 text-[10px]">{carousel.tiktokDescription.length} chars</span>
                  </div>
                  <p className="text-[#f7f7f7] text-sm leading-relaxed max-h-40 overflow-y-auto">{carousel.tiktokDescription}</p>
                  <button
                    onClick={() => copyToClipboard(carousel.tiktokDescription, 'tkDesc')}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    {copiedField === 'tkDesc' ? (
                      <><Check size={12} className="text-green-500" /> Copied Description</>
                    ) : (
                      <><Copy size={12} /> Copy Description</>
                    )}
                  </button>
                </div>
              )}

              {/* Hashtags */}
              {tiktokHashtagsStr && (
                <div className="rounded-lg bg-[#1C1C1C] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider">Hashtags</span>
                  </div>
                  <p className="text-[#E32326] text-sm leading-relaxed">{tiktokHashtagsStr}</p>
                  <button
                    onClick={() => copyToClipboard(tiktokHashtagsStr, 'tkHash')}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    {copiedField === 'tkHash' ? (
                      <><Check size={12} className="text-green-500" /> Copied Hashtags</>
                    ) : (
                      <><Copy size={12} /> Copy Hashtags</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── Instagram Mode: Single Caption + Hashtags Copy ────────── */}
          {mode === 'instagram' && carousel.caption && (
            <div className="mt-5">
              <div className="border-t border-zinc-800 pt-4 mb-3">
                <span className="text-[#8E8E8E] text-[10px] font-semibold uppercase tracking-wider">Instagram Copy</span>
              </div>
              <div className="rounded-lg bg-[#1C1C1C] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider">Caption + Hashtags</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{carousel.caption}</p>
                <button
                  onClick={() => copyToClipboard(carousel.caption, 'igCaption')}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#E32326] hover:bg-[#c91f22] text-white text-sm font-semibold transition-colors"
                >
                  {copiedField === 'igCaption' ? (
                    <><Check size={14} className="text-white" /> Copied Caption + Hashtags</>
                  ) : (
                    <><Copy size={14} /> Copy Caption + Hashtags</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── Status Tracking ─────────────────────────────────────── */}
          {onSave && (
            <div className="mt-5 border-t border-zinc-800 pt-4 space-y-3">
              <span className="text-[#8E8E8E] text-[10px] font-semibold uppercase tracking-wider">Status Tracking</span>

              {/* Status selector */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#f7f7f7] text-sm px-3 py-2 focus:outline-none focus:border-[#E32326] transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Posted">Posted</option>
                </select>
              </div>

              {/* Platform URL */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-1">Platform URL</label>
                <input
                  type="url"
                  value={platformUrl}
                  onChange={e => setPlatformUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#f7f7f7] text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-[#E32326] transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add notes..."
                  className="w-full rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#f7f7f7] text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-[#E32326] transition-colors resize-none"
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E32326] hover:bg-[#c91f22] text-white text-sm font-semibold transition-colors"
              >
                {saved ? (
                  <><Check size={14} /> Saved</>
                ) : (
                  <><Save size={14} /> Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
