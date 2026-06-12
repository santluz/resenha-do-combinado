// components/InterviewsGrid.tsx
import Image from "next/image";
import type { Interview } from "@/types";

interface Props {
  interviews: Interview[];
}

function InterviewCard({ interview }: { interview: Interview }) {
  const formattedDate = new Date(interview.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const videoHref = `https://youtube.com/watch?v=${interview.youtubeId}`;

  const thumbSrc = interview.thumbnail
    ? interview.thumbnail
    : interview.youtubeId
    ? `https://img.youtube.com/vi/${interview.youtubeId}/hqdefault.jpg`
    : null;

  return (
    <article className="group bg-[#151515] border border-[#222] rounded-lg overflow-hidden hover:border-[#1A7A3A] transition-all duration-300 hover:shadow-lg hover:shadow-[#1A7A3A]/10 hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden bg-[#0D0D0D]">
        {thumbSrc ? (
          <Image src={thumbSrc} alt={`Entrevista com ${interview.name}`} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={thumbSrc.includes("youtube.com") || thumbSrc.includes("imgur")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🎙</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-[#1A7A3A] flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-[#F5C518] text-xs font-semibold px-2 py-1 rounded">
          {formattedDate}
        </div>
      </div>
      <div className="p-5">
        <p className="text-[#1A7A3A] text-xs font-bold uppercase tracking-widest mb-1">{interview.role}</p>
        <h3 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-[#F5C518] transition-colors">
          {interview.name}
        </h3>
        <p className="text-[#666] text-sm leading-relaxed mb-5 line-clamp-2">{interview.description}</p>
        <a href={videoHref} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1A7A3A]/10 hover:bg-[#1A7A3A] border border-[#1A7A3A] text-[#1A7A3A] hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Assistir
        </a>
      </div>
    </article>
  );
}

export default function InterviewsGrid({ interviews }: Props) {
  return (
    <section id="entrevistas" className="bg-[#0D0D0D] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}>
            🎙 Entrevistas Recentes
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
          <span className="text-xs text-[#333] uppercase tracking-widest">{interviews.length} entrevistas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </div>
    </section>
  );
}
