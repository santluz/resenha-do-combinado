import type { Sponsor } from "@/types";
interface Props { sponsors: Sponsor[]; }
export default function Sponsors({ sponsors }: Props) {
  if (!sponsors.length) return null;
  return (
    <section id="patrocinadores" className="bg-[#111] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12"><span className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>🤝 Patrocinadores</span><div className="flex-1 h-px bg-[#222]" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{sponsors.map((s) => <div key={s.id} className="bg-[#151515] border border-[#222] rounded-xl p-6 flex flex-col items-center text-center gap-3"><div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl" style={{ backgroundColor: s.color }}>{s.logoText}</div><div><p className="text-white font-bold text-sm">{s.name}</p><p className="text-[#555] text-xs">{s.tagline}</p></div></div>)}</div>
      </div>
    </section>
  );
}
