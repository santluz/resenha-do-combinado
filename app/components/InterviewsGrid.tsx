"use client";
// components/InterviewsGrid.tsx
// Entrevistas com player vertical inline para vídeos do Cloudinary

import { useState } from "react";
import Image from "next/image";
import type { Interview } from "@/types";

interface Props { interviews: Interview[]; }

// Player vertical inline — aparece na própria página
function VerticalPlayer({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 z-10">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Container vertical 9:16 */}
      <div
        className="relative mx-auto"
        style={{ width: "min(90vw, 400px)", aspectRatio: "9/16", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        <video
          src={interview.videoUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full rounded-2xl object-cover bg-black"
          style={{ maxHeight: "90vh" }}
        />
        {/* Info sobre o vídeo */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 rounded-b-2xl pointer-events-none">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">{interview.role}</p>
          <p className="text-white font-bold text-base">{interview.name}</p>
          {interview.description && (
            <p className="text-white/60 text-xs mt-1 line-clamp-2">{interview.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const [showPlayer, setShowPlayer] = useState(false);

  const date = new Date(interview.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const thumb = interview.thumbnail
    ? interview.thumbnail
    : interview.youtubeId
    ? `https://img.youtube.com/vi/${interview.youtubeId}/hqdefault.jpg`
    : null;

  const handleClick = () => {
    if (interview.videoUrl) {
      // Vídeo próprio — abre player vertical inline
      setShowPlayer(true);
    } else {
      // YouTube — abre em nova aba
      window.open(`https://youtube.com/watch?v=${interview.youtubeId}`, "_blank");
    }
  };

  return (
    <>
      <article className="group bg-[#151515] border border-[#222] rounded-lg overflow-hidden hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden bg-[#0D0D0D]">
          {thumb ? (
            <Image src={thumb} alt={`Entrevista com ${interview.name}`} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={thumb.includes("youtube.com") || thumb.includes("cloudinary")} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">🎙</span></div>
          )}

          {/* Overlay play */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>

          <div className="absolute top-3 left-3 bg-black/70 text-[#F5C518] text-xs font-semibold px-2 py-1 rounded">{date}</div>

          {/* Badge vertical para vídeos próprios */}
          {interview.videoUrl && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              📱 vertical
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">{interview.role}</p>
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#F5C518] transition-colors">{interview.name}</h3>
          <p className="text-[#666] text-sm mb-5 line-clamp-2">{interview.description}</p>
          <button onClick={handleClick}
            className="inline-flex items-center gap-2 bg-red-600/10 hover:bg-red-600 border border-red-600 text-red-500 hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded transition-all">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Assistir {interview.videoUrl ? "na vertical" : "no YouTube"}
          </button>
        </div>
      </article>

      {showPlayer && interview.videoUrl && (
        <VerticalPlayer interview={interview} onClose={() => setShowPlayer(false)} />
      )}
    </>
  );
}

export default function InterviewsGrid({ interviews }: Props) {
  return (
    <section id="entrevistas" className="bg-[#0D0D0D] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>
            🎙 Entrevistas
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
          <span className="text-xs text-[#333] uppercase">{interviews.length} entrevista{interviews.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {interviews.map(iv => <InterviewCard key={iv.id} interview={iv} />)}
        </div>
      </div>
    </section>
  );
}
