// components/AboutProject.tsx
// Seção "Sobre o Projeto" com texto institucional
export default function AboutProject() {
  return (
    <section id="sobre" className="bg-[#0D0D0D] py-20 px-6 relative overflow-hidden">
      {/* Decoração tipográfica de fundo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]"
        aria-hidden="true"
      >
        <span
          className="text-[clamp(8rem,25vw,20rem)] font-black uppercase text-white leading-none"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
        >
          COMBINADO
        </span>
      </div>

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex-1 h-px bg-[#1C1C1C]" />
          <span
            className="text-white text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}
          >
            ⚽ Sobre o Projeto
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
        </div>

        {/* Aspas decorativas */}
        <div
          className="text-[#1A7A3A] text-8xl leading-none mb-4 font-black"
          style={{ fontFamily: "Georgia, serif" }}
          aria-hidden="true"
        >
          "
        </div>

        <blockquote className="text-[#C0C0C0] text-xl md:text-2xl leading-relaxed font-light italic mb-8">
          A Resenha do Combinado nasceu para registrar os bastidores, entrevistas e momentos
          especiais do futebol entre amigos, valorizando quem faz parte dessa história.
        </blockquote>

        {/* Linha decorativa */}
        <div className="w-16 h-1 bg-[#F5C518] rounded mx-auto mb-8" />

        {/* Valores do projeto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          {[
            {
              emoji: "🎙",
              title: "Entrevistas",
              text: "Cada jogador tem uma história que merece ser contada.",
            },
            {
              emoji: "🏆",
              title: "Memória",
              text: "Registramos os momentos que vão ficar para sempre.",
            },
            {
              emoji: "👥",
              title: "Comunidade",
              text: "O futebol amador une pessoas, famílias e bairros.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-[#111] border border-[#1C1C1C] rounded-xl p-6 hover:border-[#1A7A3A]/40 transition-colors duration-300"
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
              <p className="text-[#555] text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
