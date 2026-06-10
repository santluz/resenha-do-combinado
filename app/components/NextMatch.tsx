// components/NextMatch.tsx
// Seção "Próximo Jogo" com contagem regressiva visual
import type { NextMatch as NextMatchType } from "@/types";

interface Props {
  match: NextMatchType;
}

export default function NextMatch({ match }: Props) {
  // Formata data para exibição
  const matchDate = new Date(match.date + "T" + match.time + ":00");
  const formattedDate = matchDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section id="proximo-jogo" className="bg-[#0D0D0D] py-20 px-6 relative overflow-hidden">
      {/* Decoração de campo — linhas brancas finas */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white" />
        <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-white m-8 rounded" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="text-[#1A7A3A] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}
          >
            📅 Próximo Jogo
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
        </div>

        {/* Card principal do próximo jogo */}
        <div className="bg-gradient-to-br from-[#151515] to-[#111] border border-[#222] rounded-2xl overflow-hidden">
          {/* Faixa verde no topo */}
          <div className="h-1.5 bg-gradient-to-r from-[#1A7A3A] via-[#F5C518] to-[#1A7A3A]" />

          <div className="p-8 md:p-12">
            {/* Badge competição */}
            <div className="inline-flex items-center gap-2 bg-[#1A7A3A]/10 border border-[#1A7A3A]/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#1A7A3A] animate-pulse" />
              <span className="text-[#1A7A3A] text-xs font-bold uppercase tracking-widest">
                {match.competition}
              </span>
            </div>

            {/* Placar de confronto */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
              {/* Time da casa */}
              <div className="text-center flex-1">
                <div className="w-20 h-20 rounded-full bg-[#1A7A3A]/20 border-2 border-[#1A7A3A] flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">⚽</span>
                </div>
                <p
                  className="text-white text-2xl font-black uppercase"
                  style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                >
                  Combinado
                </p>
                <p className="text-[#555] text-xs uppercase tracking-widest mt-1">Casa</p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                <span
                  className="text-[#F5C518] text-5xl font-black"
                  style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                >
                  VS
                </span>
              </div>

              {/* Adversário */}
              <div className="text-center flex-1">
                <div className="w-20 h-20 rounded-full bg-[#333]/50 border-2 border-[#444] flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🆚</span>
                </div>
                <p
                  className="text-white text-2xl font-black uppercase"
                  style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                >
                  {match.opponent}
                </p>
                <p className="text-[#555] text-xs uppercase tracking-widest mt-1">Visitante</p>
              </div>
            </div>

            {/* Detalhes do jogo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: "Data",
                  value: formattedDate,
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: "Horário",
                  value: match.time + "h",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: "Local",
                  value: match.location,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#0D0D0D] rounded-xl p-5 border border-[#1C1C1C] flex items-start gap-4"
                >
                  <div className="text-[#1A7A3A] mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-white text-sm font-semibold capitalize">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
