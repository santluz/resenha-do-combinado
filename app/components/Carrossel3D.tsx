"use client";
// components/Carrossel3D.tsx
// Carrossel 3D giratório automático — fotos dispostas em cilindro

import { useState, useEffect, useRef } from "react";
import type { Carrossel3DFoto } from "@/types";

interface Props { fotos: Carrossel3DFoto[]; }

export default function Carrossel3D({ fotos }: Props) {
  const [angulo, setAngulo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState<Carrossel3DFoto | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = fotos.length;
  // Ângulo entre cada foto no cilindro
  const passo = total > 0 ? 360 / total : 0;
  // Raio do cilindro baseado na quantidade de fotos
  const raio = Math.max(280, total * 80);

  useEffect(() => {
    if (pausado || total === 0) return;
    animRef.current = setInterval(() => {
      setAngulo(a => a + 0.4);
    }, 16); // ~60fps
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [pausado, total]);

  if (total === 0) return null;

  return (
    <section id="carrossel3d" className="bg-[#111] py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-red-500 text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>
            🌀 Galeria 3D
          </span>
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-xs text-[#333] uppercase">{total} fotos</span>
        </div>

        {/* Palco 3D */}
        <div
          className="relative mx-auto select-none"
          style={{ height: "420px", perspective: "1200px" }}
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onTouchStart={() => setPausado(true)}
          onTouchEnd={() => setTimeout(() => setPausado(false), 2000)}
        >
          {/* Cilindro giratório */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${angulo}deg)`,
              transition: pausado ? "transform 0.3s ease" : "none",
            }}
          >
            {fotos.map((foto, i) => {
              const anguloFoto = passo * i;
              return (
                <div
                  key={foto.id || i}
                  className="absolute cursor-pointer"
                  style={{
                    transform: `rotateY(${anguloFoto}deg) translateZ(${raio}px)`,
                    transformStyle: "preserve-3d",
                    width: "220px",
                    height: "300px",
                  }}
                  onClick={() => setFotoAtiva(foto)}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white/10 hover:border-red-500/60 transition-all duration-300 shadow-2xl hover:shadow-red-500/20 group">
                    <img
                      src={foto.src}
                      alt={foto.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      draggable={false}
                    />
                    {/* Reflexo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Legenda */}
                    {foto.alt && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-semibold text-center">{foto.alt}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reflexo no chão */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #111 0%, transparent 100%)",
              zIndex: 10,
            }}
          />
        </div>

        {/* Dica */}
        <p className="text-center text-[#333] text-xs mt-6 uppercase tracking-widest">
          Passe o mouse para pausar · Clique para ampliar
        </p>
      </div>

      {/* Lightbox */}
      {fotoAtiva && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFotoAtiva(null)}>
          <button onClick={() => setFotoAtiva(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <img src={fotoAtiva.src} alt={fotoAtiva.alt}
              className="w-full h-full object-contain" />
            {fotoAtiva.alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-sm font-semibold text-center">{fotoAtiva.alt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
