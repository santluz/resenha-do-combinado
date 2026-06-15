// components/NextMatch.tsx — simplificado: só data, horário e local
import type { NextMatch as NextMatchType } from "@/types";

interface Props {
  match: NextMatchType;
}

export default function NextMatch({ match }: Props) {
  const matchDate = new Date(match.date + "T" + match.time + ":00");
  const formattedDate = matchDate.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <section id="proximo-jogo" className="bg-[#0D0D0D] py-20 px-6 relative overflow-hidden">
      {/* Decoração campo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white" />
        <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-white m-8 rounded" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-red-500 text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}>
            📅 Próximo Jogo
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
        </div>

        <div className="max-w-xl mx-auto bg-[#151515] border border-[#222] rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-600 via-[#F5C518] to-red-600" />
          <div className="p-8 flex flex-col gap-6">
            {/* Data */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[#555] text-xs uppercase tracking-widest mb-0.5">Data</p>
                <p className="text-white font-semibold capitalize">{formattedDate}</p>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#555] text-xs uppercase tracking-widest mb-0.5">Horário</p>
                <p className="text-white font-semibold">{match.time}h</p>
              </div>
            </div>

            {/* Local */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#555] text-xs uppercase tracking-widest mb-0.5">Local</p>
                <p className="text-white font-semibold">{match.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
