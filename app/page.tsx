import HeroSection from "@/app/components/HeroSection";
import LatestResenha from "@/app/components/LatestResenha";
import Highlights from "@/app/components/Highlights";
import ArbitroVideos from "@/app/components/ArbitroVideos";
import InterviewsGrid from "@/app/components/InterviewsGrid";
import GameGallery from "@/app/components/GameGallery";
import NextMatch from "@/app/components/NextMatch";
import AboutProject from "@/app/components/AboutProject";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Comunicado from "@/app/components/Comunicado";
import { getLatestResenha, getInterviews, getHighlights, getArbitroVideos, getGallery, getFeaturedPhoto, getNextMatch, getSiteConfig } from "@/lib/firestore";
import latestResenhaFallback from "@/data/latest-resenha.json";
import matchSponsorsFallback from "@/data/match-sponsors.json";
import type { LatestResenha as LRT } from "@/types";
export const revalidate = 60;
export default async function Home() {
  const [resenha, interviews, highlights, arbitroVideos, gallery, featuredPhoto, nextMatch, siteConfig] = await Promise.all([
    getLatestResenha().catch(() => null), getInterviews().catch(() => []), getHighlights().catch(() => []),
    getArbitroVideos().catch(() => []),
    getGallery().catch(() => []), getFeaturedPhoto().catch(() => null), getNextMatch().catch(() => null),
    getSiteConfig().catch(() => ({ instagram: "resenhadocombinado", logoUrl: undefined, comunicado: undefined, comunicadoAtivo: false })),
  ]);
  const resenhaData = resenha?.title ? resenha : null;
  const nextMatchData = nextMatch ?? matchSponsorsFallback.nextMatch;
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
        {arbitroVideos.length > 0 && <ArbitroVideos videos={arbitroVideos} />}
        {interviews.length > 0 && <InterviewsGrid interviews={interviews} />}
        {(gallery.length > 0 || featuredPhoto) && <GameGallery photos={gallery} featuredPhoto={featuredPhoto} />}
        <NextMatch match={nextMatchData} />
        <AboutProject />
        <Footer instagram={instagram} />
      </main>
    </>
  );
}
