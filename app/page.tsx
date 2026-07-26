import HeroSection from "@/app/components/HeroSection";
import LatestResenha from "@/app/components/LatestResenha";
import Highlights from "@/app/components/Highlights";
import InterviewsGrid from "@/app/components/InterviewsGrid";
import GameGallery from "@/app/components/GameGallery";
import Apostas from "@/app/components/Apostas";
import NextMatch from "@/app/components/NextMatch";
import Sponsors from "@/app/components/Sponsors";
import AboutProject from "@/app/components/AboutProject";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Comunicado from "@/app/components/Comunicado";
import { getLatestResenha, getInterviews, getHighlights, getGallery, getFeaturedPhoto, getNextMatch, getSponsors, getSiteConfig } from "@/lib/firestore";
import { getConfigAposta } from "@/lib/firestore-apostas";
import latestResenhaFallback from "@/data/latest-resenha.json";
import matchSponsorsFallback from "@/data/match-sponsors.json";
import type { LatestResenha as LRT } from "@/types";
export const revalidate = 60;
export default async function Home() {
  const [resenha, interviews, highlights, gallery, featuredPhoto, nextMatch, sponsors, siteConfig, configAposta] = await Promise.all([
    getLatestResenha().catch(() => null), getInterviews().catch(() => []), getHighlights().catch(() => []),
    getGallery().catch(() => []), getFeaturedPhoto().catch(() => null), getNextMatch().catch(() => null),
    getSponsors().catch(() => []),
    getSiteConfig().catch(() => ({ instagram: "resenhadocombinado", logoUrl: undefined, comunicado: undefined, comunicadoAtivo: false })),
    getConfigAposta().catch(() => null),
  ]);
  const resenhaData = resenha?.title ? resenha : null;
  const nextMatchData = nextMatch ?? matchSponsorsFallback.nextMatch;
  const sponsorsData = sponsors.length > 0 ? sponsors : matchSponsorsFallback.sponsors;
  const instagram = siteConfig?.instagram || "resenhadocombinado";
  const logoUrl = siteConfig?.logoUrl;
  const comunicado = siteConfig?.comunicadoAtivo ? siteConfig?.comunicado || "" : "";
  return (
    <>
      <Navbar instagram={instagram} logoUrl={logoUrl} />
      {comunicado && <Comunicado texto={comunicado} />}
      <main>
        <HeroSection logoUrl={logoUrl} />
        {resenhaData && <LatestResenha data={resenhaData} />}
        {highlights.length > 0 && <Highlights highlights={highlights} />}
        {interviews.length > 0 && <InterviewsGrid interviews={interviews} />}
        {(gallery.length > 0 || featuredPhoto) && <GameGallery photos={gallery} featuredPhoto={featuredPhoto} />}
        {configAposta && (configAposta.ativo || configAposta.encerrado) && <Apostas config={configAposta} />}
        <NextMatch match={nextMatchData} />
        {sponsorsData.length > 0 && <Sponsors sponsors={sponsorsData} />}
        <AboutProject />
        <Footer instagram={instagram} />
      </main>
    </>
  );
}
