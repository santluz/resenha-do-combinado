// app/page.tsx
// Página principal — orquestra todas as seções com dados mockados
// Estrutura preparada para futura integração com Firebase Firestore

import HeroSection from "@/app/components/HeroSection";
import LatestResenha from "@/app/components/LatestResenha";
import InterviewsGrid from "@/app/components/InterviewsGrid";
import GameGallery from "@/app/components/GameGallery";
import NextMatch from "@/app/components/NextMatch";
import Sponsors from "@/app/components/Sponsors";
import AboutProject from "@/app/components/AboutProject";
import Footer from "@/app/components/Footer";

// Dados mockados — substituir por chamadas ao Firebase quando integrar
// Exemplo Firebase: const interviews = await getDocs(collection(db, "interviews"))
import interviewsData from "@/data/interviews.json";
import latestResenhaData from "@/data/latest-resenha.json";
import galleryData from "@/data/gallery.json";
import matchSponsorsData from "@/data/match-sponsors.json";

import type { Interview, LatestResenha as LatestResenhaType, GalleryPhoto } from "@/types";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LatestResenha data={latestResenhaData as LatestResenhaType} />
      <InterviewsGrid interviews={interviewsData as Interview[]} />
      <GameGallery photos={galleryData as GalleryPhoto[]} />
      <NextMatch match={matchSponsorsData.nextMatch} />
      <Sponsors sponsors={matchSponsorsData.sponsors} />
      <AboutProject />
      <Footer />
    </main>
  );
}
