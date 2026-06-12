// app/page.tsx — dados reais do Firebase com fallback para JSONs mockados
import HeroSection from "@/app/components/HeroSection";
import LatestResenha from "@/app/components/LatestResenha";
import InterviewsGrid from "@/app/components/InterviewsGrid";
import GameGallery from "@/app/components/GameGallery";
import NextMatch from "@/app/components/NextMatch";
import Sponsors from "@/app/components/Sponsors";
import AboutProject from "@/app/components/AboutProject";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

import {
  getLatestResenha, getInterviews, getGallery,
  getNextMatch, getSponsors, getSiteConfig,
} from "@/lib/firestore";

import interviewsFallback from "@/data/interviews.json";
import latestResenhaFallback from "@/data/latest-resenha.json";
import galleryFallback from "@/data/gallery.json";
import matchSponsorsFallback from "@/data/match-sponsors.json";
import type { Interview, LatestResenha as LatestResenhaType, GalleryPhoto } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const [resenha, interviews, gallery, nextMatch, sponsors, siteConfig] = await Promise.all([
    getLatestResenha().catch(() => null),
    getInterviews().catch(() => []),
    getGallery().catch(() => []),
    getNextMatch().catch(() => null),
    getSponsors().catch(() => []),
    getSiteConfig().catch(() => ({ instagram: "resenhadocombinado" })),
  ]);

  const resenhaData = resenha ?? (latestResenhaFallback as LatestResenhaType);
  const interviewsData = interviews.length > 0 ? interviews : (interviewsFallback as Interview[]);
  const galleryData = gallery.length > 0 ? gallery : (galleryFallback as GalleryPhoto[]);
  const nextMatchData = nextMatch ?? matchSponsorsFallback.nextMatch;
  const sponsorsData = sponsors.length > 0 ? sponsors : matchSponsorsFallback.sponsors;
  const instagram = siteConfig?.instagram || "resenhadocombinado";

  return (
    <>
      <Navbar instagram={instagram} />
      <main>
        <HeroSection />
        <LatestResenha data={resenhaData} />
        <InterviewsGrid interviews={interviewsData} />
        <GameGallery photos={galleryData} />
        <NextMatch match={nextMatchData} />
        <Sponsors sponsors={sponsorsData} />
        <AboutProject />
        <Footer instagram={instagram} />
      </main>
    </>
  );
}
