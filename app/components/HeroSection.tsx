// components/HeroSection.tsx
// Banner principal com tema futebol amador
"use client";

export default function HeroSection() {
  const handleScroll = () => {
    const el = document.getElementById("ultima-resenha");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D0D0D]">
      {/* Fundo: gradiente de campo com listras diagonais — a assinatura visual */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 60px,
            rgba(26,122,58,0.6) 60px,
            rgba(26,122,58,0.6) 80px
          )`,
        }}
      />

      {/* Gradiente verde no topo-direito */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1A7A3A] opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#F5C518] opacity-5 blur-[100px] pointer-events-none" />

      {/* Linha de campo decorativa */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#1A7A3A] to-transparent" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#1A7A3A] bg-[#1A7A3A]/10">
          <span className="w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
          <span className="text-[#F5C518] text-xs font-semibold tracking-[0.2em] uppercase">
            Futebol Amador ao Vivo
          </span>
        </div>

        {/* Título principal — Bebas Neue, gritante */}
        <h1
          className="text-[clamp(3rem,12vw,8rem)] font-black uppercase leading-none tracking-tight text-white"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: "0.02em" }}
        >
          Resenha do
          <br />
          <span className="text-[#1A7A3A] relative">
            Combinado
            {/* Sublinhado amarelo estilizado */}
            <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#F5C518] rounded" />
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-8 text-[#A0A0A0] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          As histórias, entrevistas e melhores momentos depois do apito final.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleScroll}
            className="group inline-flex items-center gap-3 bg-[#1A7A3A] hover:bg-[#15612F] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-all duration-200 hover:scale-[1.03] active:scale-95"
          >
            {/* Ícone play */}
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <svg className="w-3.5 h-3.5 ml-0.5" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Assistir Última Resenha
          </button>

          <a
            href="#entrevistas"
            className="inline-flex items-center gap-2 border border-[#333] hover:border-[#F5C518] text-[#A0A0A0] hover:text-[#F5C518] font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded transition-all duration-200"
          >
            Ver Entrevistas
          </a>
        </div>

        {/* Stats rápidos */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { value: "14+", label: "Resenhas" },
            { value: "40+", label: "Jogadores" },
            { value: "2 anos", label: "No ar" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-black text-white"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-[#555] uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seta scroll down */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
