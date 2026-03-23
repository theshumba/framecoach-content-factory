import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import DownloadButton from './DownloadButton';

export default function CarouselViewer({ carousel, basePath, onClose }) {
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);

  const slideUrls = carousel.slides.map(s => `${basePath}${carousel.id}/${s}`);
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

  function copyCaption() {
    navigator.clipboard.writeText(carousel.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
        <div className="w-full lg:w-80 p-5 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-y-auto">
          <h2 className="text-white text-lg font-bold">{carousel.name}</h2>
          <p className="text-zinc-500 text-sm mt-1">{carousel.subtitle}</p>

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

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Caption</span>
              <button onClick={copyCaption} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{carousel.caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
