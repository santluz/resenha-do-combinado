// components/GameGallery.tsx
// Galeria de fotos com lightbox (clique para ampliar)
"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/types";

interface Props {
  photos: GalleryPhoto[];
}

export default function GameGallery({ photos }: Props) {
  // Estado do lightbox: null = fechado, número = índice da foto aberta
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);
  const goPrev = () => setActiveIndex((i) => (i! > 0 ? i! - 1 : photos.length - 1));
  const goNext = () => setActiveIndex((i) => (i! < photos.length - 1 ? i! + 1 : 0));

  return (
    <section id="galeria" className="bg-[#111] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="text-white text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}
          >
            📷 Galeria do Jogo
          </span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        {/* Grade de fotos: 2 cols mobile → 3 tablet → 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-[#1C1C1C] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]"
              aria-label={`Ver foto: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              {/* Overlay hover com ícone de lupa */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full p-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de foto"
        >
          {/* Botão fechar */}
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Fechar"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navegar anterior */}
          <button
            className="absolute left-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Foto anterior"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Imagem principal */}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[activeIndex].src}
              alt={photos[activeIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navegar próxima */}
          <button
            className="absolute right-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Próxima foto"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Caption */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/70 text-sm">{photos[activeIndex].alt}</p>
            <p className="text-[#555] text-xs mt-1">
              {activeIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
