import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

export default function DownloadButton({ url, filename, zipUrls, zipFilename, label, className = '' }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (loading) return;

    if (url) {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'download.png';
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }

    if (zipUrls?.length) {
      setLoading(true);
      try {
        const zip = new JSZip();
        const fetches = zipUrls.map(async (u, i) => {
          const res = await fetch(u);
          const blob = await res.blob();
          const name = u.split('/').pop() || `slide-${String(i + 1).padStart(2, '0')}.png`;
          zip.file(name, blob);
        });
        await Promise.all(fetches);
        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = zipFilename || 'download.zip';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.error('Download failed:', err);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${loading ? 'bg-zinc-700 text-zinc-400 cursor-wait' : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'}
        ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {label || 'Download'}
    </button>
  );
}
