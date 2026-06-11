import HeroSection from "@/app/components/HeroSection";
import LatestResenha from "@/app/components/LatestResenha";
import InterviewsGrid from "@/app/components/InterviewsGrid";
import GameGallery from "@/app/components/GameGallery";
import NextMatch from "@/app/components/NextMatch";
import Sponsors from "@/app/components/Sponsors";
import AboutProject from "@/app/components/AboutProject";
import Footer from "@/app/components/Footer";

import {
  getLatestResenha,
  getInterviews,
  getGallery,
  getNextMatch,
  getSponsors,
} from "@/lib/firestore";

import interviewsFallback from "@/data/interviews.json";
import latestResenhaFallback from "@/data/latest-resenha.json";
import galleryFallback from "@/data/gallery.json";
import matchSponsorsFallback from "@/data/match-sponsors.json";

import type { Interview, LatestResenha as LatestResenhaType, GalleryPhoto } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const [resenha, interviews, gallery, nextMatch, sponsors] = await Promise.all([
    getLatestResenha().catch(() => null),
    getInterviews().catch(() => []),
    getGallery().catch(() => []),
    getNextMatch().catch(() => null),
    getSponsors().catch(() => []),
  ]);

  const resenhaData = resenha ?? (latestResenhaFallback as LatestResenhaType);
  const interviewsData = interviews.length > 0 ? interviews : (interviewsFallback as Interview[]);
  const galleryData = gallery.length > 0 ? gallery : (galleryFallback as GalleryPhoto[]);
  const nextMatchData = nextMatch ?? matchSponsorsFallback.nextMatch;
  const sponsorsData = sponsors.length > 0 ? sponsors : matchSponsorsFallback.sponsors;

  return (
    <main>
      <HeroSection />
      <LatestResenha data={resenhaData} />
      <InterviewsGrid interviews={interviewsData} />
      <GameGallery photos={galleryData} />
      <NextMatch match={nextMatchData} />
      <Sponsors sponsors={sponsorsData} />
      <AboutProject />
      <Footer />
    </main>
  );
}
