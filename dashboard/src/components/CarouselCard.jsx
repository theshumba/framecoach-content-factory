import { Image } from 'lucide-react';

export default function CarouselCard({ carousel, basePath, onClick }) {
  const thumbUrl = `${basePath}${carousel.id}/${carousel.slides[0]}`;

  return (
    <div
      onClick={() => onClick(carousel)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-all hover:shadow-lg hover:shadow-red-600/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-800">
        <img
          src={thumbUrl}
          alt={carousel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
          <Image size={12} className="text-white" />
          <span className="text-white text-xs font-medium">{carousel.slideCount}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white text-sm font-semibold truncate">{carousel.name}</h3>
        <p className="text-zinc-500 text-xs mt-0.5">{carousel.subtitle}</p>
      </div>
    </div>
  );
}
