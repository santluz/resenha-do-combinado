// components/LatestResenha.tsx
import type { LatestResenha as LatestResenhaType } from "@/types";

interface Props {
  data: LatestResenhaType;
}

export default function LatestResenha({ data }: Props) {
  const formattedDate = new Date(data.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <section id="ultima-resenha" className="bg-[#111] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[#1A7A3A] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}>
            ⚽ Última Resenha
          </span>
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-xs text-[#444] uppercase tracking-widest">{formattedDate}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#0D0D0D] border border-[#222] shadow-2xl shadow-[#1A7A3A]/10">
              <iframe
                src={`https://www.youtube.com/embed/${data.youtubeId}?rel=0&modestbranding=1`}
                title={data.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="bg-[#1A7A3A] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                {data.matchStats.goals}
              </span>
              <span className="text-[#555] text-xs">vs {data.matchStats.opponent}</span>
            </div>

            <h2 className="text-white text-3xl md:text-4xl font-black uppercase leading-tight mb-4"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}>
              {data.title}
            </h2>

            <div className="flex items-center gap-2 text-[#555] text-sm mb-6">
              <svg className="w-4 h-4 text-[#1A7A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
              <span className="mx-1">·</span>
              <svg className="w-4 h-4 text-[#1A7A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {data.matchStats.location}
            </div>

            <p className="text-[#888] leading-relaxed text-base mb-8">{data.description}</p>

            <a href={`https://youtube.com/watch?v=${data.youtubeId}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#F5C518] hover:text-white font-semibold text-sm uppercase tracking-widest transition-colors group">
              Abrir no YouTube
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
