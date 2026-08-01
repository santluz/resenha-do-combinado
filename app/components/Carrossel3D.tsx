"use client";
// components/Carrossel3D.tsx
// Efeito 3D de paralaxe/tilt — foto flutua com profundidade ao mover o mouse ou girar o celular

import { useState, useEffect, useRef } from "react";
import type { Carrossel3DFoto } from "@/types";

interface Props { fotos: Carrossel3DFoto[]; }

// Card individual com efeito tilt 3D
function TiltCard({ foto }: { foto: Carrossel3DFoto }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [ampliada, setAmpliada] = useState(false);

  // Mouse move — desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTransform({ rotateX: -dy * 18, rotateY: dx * 18, scale: 1.04 });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  // Giroscópio — celular
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = Math.max(-30, Math.min(30, e.beta ?? 0));
      const gamma = Math.max(-30, Math.min(30, e.gamma ?? 0));
      setTransform({ rotateX: beta * 0.5, rotateY: gamma * 0.5, scale: 1 });
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className="relative mx-auto cursor-pointer"
        style={{
          width: "min(90vw, 380px)",
          aspectRatio: "3/4",
          perspective: "1000px",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setAmpliada(true)}
      >
        {/* Card com tilt */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
            transition: "transform 0.1s ease-out",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: `
              ${transform.rotateY * -2}px ${transform.rotateX * 2}px 40px rgba(0,0,0,0.6),
              0 0 80px rgba(220,38,38,0.15)
            `,
          }}
        >
          {/* Foto principal */}
          <img
            src={foto.src}
            alt={foto.alt}
            className="w-full h-full object-cover"
            draggable={false}
            style={{
              transform: `translateZ(0px) scale(1.05)`,
              transformStyle: "preserve-3d",
            }}
          />

          {/* Camada de brilho dinâmico — segue o mouse */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(
                circle at ${50 + transform.rotateY * 2}% ${50 - transform.rotateX * 2}%,
                rgba(255,255,255,0.15) 0%,
                transparent 60%
              )`,
              mixBlendMode: "overlay",
            }}
          />

          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Legenda flutuante */}
          {foto.alt && (
            <div
              className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none"
              style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
            >
              <p className="text-white font-bold text-base text-center drop-shadow-lg">{foto.alt}</p>
            </div>
          )}

          {/* Ícone de ampliar */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Sombra no chão */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-2xl pointer-events-none"
          style={{
            width: "70%",
            height: "30px",
            background: "rgba(0,0,0,0.5)",
            transform: `translateX(-50%) scaleX(${0.8 + transform.rotateY * 0.01})`,
          }}
        />
      </div>

      {/* Dica */}
      <p className="text-center text-[#444] text-xs mt-8 uppercase tracking-widest">
        {typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
          ? "Incline o celular para ver o efeito 3D"
          : "Mova o mouse sobre a foto · Clique para ampliar"}
      </p>

      {/* Lightbox */}
      {ampliada && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setAmpliada(false)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={foto.src} alt={foto.alt} className="max-w-2xl w-full max-h-[85vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

// Navegação entre fotos
export default function Carrossel3D({ fotos }: Props) {
  const [idx, setIdx] = useState(0);
  if (fotos.length === 0) return null;
  const foto = fotos[idx];

  return (
    <section id="carrossel3d" className="bg-[#0D0D0D] py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="text-red-500 text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>
            ✨ Destaque 3D
          </span>
          <div className="flex-1 h-px bg-[#222]" />
          {fotos.length > 1 && (
            <span className="text-xs text-[#333] uppercase">{idx + 1} / {fotos.length}</span>
          )}
        </div>

        {/* Card com efeito tilt */}
        <TiltCard foto={foto} />

        {/* Navegação entre fotos */}
        {fotos.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={() => setIdx(i => (i - 1 + fotos.length) % fotos.length)}
              className="w-10 h-10 rounded-full bg-[#151515] border border-[#333] hover:border-red-600 text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i === idx ? "w-6 h-2 bg-red-600" : "w-2 h-2 bg-[#333] hover:bg-[#555]"}`} />
              ))}
            </div>

            <button onClick={() => setIdx(i => (i + 1) % fotos.length)}
              className="w-10 h-10 rounded-full bg-[#151515] border border-[#333] hover:border-red-600 text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
