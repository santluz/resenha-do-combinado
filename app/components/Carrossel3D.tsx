"use client";
// components/Carrossel3D.tsx
// Carrossel 3D giratório suave — fotos dispostas em cilindro

import { useState, useEffect, useRef } from "react";
import type { Carrossel3DFoto } from "@/types";

interface Props { fotos: Carrossel3DFoto[]; }

export default function Carrossel3D({ fotos }: Props) {
  const [angulo, setAngulo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState<Carrossel3DFoto | null>(null);
  const rafRef = useRef<number | null>(null);
  const anguloRef = useRef(0);

  const total = fotos.length;
  const passo = total > 0 ? 360 / total : 0;
  // Raio maior para fotos mais espaçadas
  const raio = Math.max(320, total * 90);

  useEffect(() => {
    if (total === 0) return;
    const girar = () => {
      if (!pausado) {
        // Velocidade muito lenta — 0.1 grau por frame (~6 graus/segundo)
        anguloRef.current += 0.1;
        setAngulo(anguloRef.current);
      }
      rafRef.current = requestAnimationFrame(girar);
    };
    rafRef.current = requestAnimationFrame(girar);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pausado, total]);

  if (total === 0) return null;

  return (
    <section id="carrossel3d" className="bg-[#0D0D0D] py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-red-500 text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>
            🌀 Galeria 3D
          </span>
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-xs text-[#333] uppercase">{total} fotos</span>
        </div>
        <p className="text-[#555] text-sm mb-12">Passe o mouse para pausar · Clique para ampliar</p>

        {/* Palco 3D */}
        <div
          className="relative mx-auto cursor-pointer"
          style={{ height: "380px", perspective: "1000px" }}
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onTouchStart={() => setPausado(p => !p)}
        >
          {/* Cilindro */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${angulo}deg)`,
            }}
          >
            {fotos.map((foto, i) => {
              const anguloFoto = passo * i;
              // Calcular visibilidade — fotos de frente ficam mais brilhantes
              const anguloRelativo = ((anguloFoto + angulo) % 360 + 360) % 360;
              const visibilidade = Math.cos((anguloRelativo * Math.PI) / 180);
              const escala = 0.75 + (visibilidade + 1) / 2 * 0.35;

              return (
                <div
                  key={foto.id || i}
                  className="absolute"
                  style={{
                    transform: `rotateY(${anguloFoto}deg) translateZ(${raio}px)`,
                    transformStyle: "preserve-3d",
                    width: "200px",
                    height: "280px",
                    scale: String(escala),
                  }}
                  onClick={() => setFotoAtiva(foto)}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-colors duration-300"
                    style={{
                      // Sem box-shadow para evitar sombras indesejadas
                      filter: `brightness(${0.5 + (visibilidade + 1) / 2 * 0.6})`,
                    }}
                  >
                    <img
                      src={foto.src}
                      alt={foto.alt}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {/* Gradiente suave só na base */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    {foto.alt && (
                      <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs font-semibold px-2 truncate">{foto.alt}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            <img src={fotoAtiva.src} alt={fotoAtiva.alt} className="w-full h-full object-contain" />
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

interface Props { fotos: Carrossel3DFoto[]; }

