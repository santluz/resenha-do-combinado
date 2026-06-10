// components/Sponsors.tsx
// Seção de patrocinadores com espaço para logos
import type { Sponsor } from "@/types";

interface Props {
  sponsors: Sponsor[];
}

// Card individual de patrocinador — reutilizável
function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="group bg-[#151515] border border-[#222] hover:border-[#333] rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center gap-4">
      {/* Espaço para logo — preparado para receber <Image> no futuro */}
      {/* Para integrar com Firebase: substituir este div por <Image src={sponsor.logoUrl} /> */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-2xl"
        style={{
          backgroundColor: sponsor.color,
          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
        }}
        aria-label={`Logo ${sponsor.name}`}
      >
        {sponsor.logoText}
      </div>

      <div>
        <h3 className="text-white font-bold text-base mb-1">{sponsor.name}</h3>
        <p className="text-[#666] text-sm mb-3">{sponsor.tagline}</p>
        <a
          href={`tel:${sponsor.contact.replace(/\D/g, "")}`}
          className="text-[#1A7A3A] hover:text-[#F5C518] text-sm font-medium transition-colors"
        >
          {sponsor.contact}
        </a>
      </div>
    </div>
  );
}

export default function Sponsors({ sponsors }: Props) {
  return (
    <section id="patrocinadores" className="bg-[#111] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "1rem" }}
          >
            🤝 Patrocinadores
          </span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <p className="text-[#555] text-sm mb-10 max-w-lg">
          Parceiros que apoiam o futebol amador e tornam a Resenha do Combinado possível.
        </p>

        {/* Grade de patrocinadores: 2 cols mobile → 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>

        {/* CTA para novos patrocinadores */}
        <div className="mt-10 border border-dashed border-[#333] rounded-xl p-8 text-center">
          <p className="text-[#555] text-sm mb-3">Quer patrocinar o Combinado?</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1A7A3A] hover:text-[#F5C518] font-semibold text-sm transition-colors"
          >
            Fale com a gente no Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}
