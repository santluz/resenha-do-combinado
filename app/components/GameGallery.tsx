"use client";
import { useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/types";
interface Props { photos: GalleryPhoto[]; featuredPhoto?: GalleryPhoto | null; }
function Lightbox({ photos, index, onClose }: { photos: GalleryPhoto[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 z-10"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      <button onClick={(e) => { e.stopPropagation(); setCur(i => i > 0 ? i - 1 : photos.length - 1); }} className="absolute left-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 z-10"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
      <div className="relative w-full max-w-4xl max-h-[85vh] aspect-video" onClick={e => e.stopPropagation()}>
        <Image src={photos[cur].src} alt={photos[cur].alt} fill className="object-contain" sizes="100vw" priority unoptimized />
      </div>
      <button onClick={(e) => { e.stopPropagation(); setCur(i => i < photos.length - 1 ? i + 1 : 0); }} className="absolute right-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 z-10"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"><p className="text-white/70 text-sm">{photos[cur].alt}</p><p className="text-[#555] text-xs mt-1">{cur + 1} / {photos.length}</p></div>
    </div>
  );
}
export default function GameGallery({ photos, featuredPhoto }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFeatured, setShowFeatured] = useState(false);
  if (!featuredPhoto && !photos.length) return null;
  return (
    <section id="galeria" className="bg-[#111] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12"><span className="text-white text-sm font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>📷 Galeria do Jogo</span><div className="flex-1 h-px bg-[#222]" /></div>
        {featuredPhoto && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><span className="bg-[#F5C518] text-black text-xs font-black uppercase px-3 py-1 rounded">⭐ Destaque do Dia</span></div>
            <button onClick={() => setShowFeatured(true)} className="relative w-full aspect-video rounded-xl overflow-hidden cursor-zoom-in group">
              <Image src={featuredPhoto.src} alt={featuredPhoto.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="100vw" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {featuredPhoto.alt && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4"><p className="text-white text-sm font-semibold">{featuredPhoto.alt}</p></div>}
            </button>
          </div>
        )}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <button key={photo.id} onClick={() => setLightboxIndex(index)} className="group relative aspect-square overflow-hidden rounded-lg bg-[#1C1C1C] cursor-zoom-in">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 33vw" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>
      {lightboxIndex !== null && <Lightbox photos={photos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      {showFeatured && featuredPhoto && <Lightbox photos={[featuredPhoto]} index={0} onClose={() => setShowFeatured(false)} />}
    </section>
  );
}
