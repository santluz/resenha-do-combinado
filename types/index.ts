// types/index.ts
// Tipos centralizados — preparados para integração futura com Firebase

export interface Interview {
  id: string;
  name: string;
  role: string;
  date: string; // ISO: "YYYY-MM-DD"
  thumbnail: string;
  youtubeId: string;
  description: string;
}

export interface LatestResenha {
  youtubeId: string;
  title: string;
  date: string;
  description: string;
  matchStats: {
    goals: string;
    opponent: string;
    location: string;
  };
}

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  date: string;
}

export interface NextMatch {
  date: string;
  time: string;
  location: string;
  opponent: string;
  competition: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  contact: string;
  logoText: string; // Iniciais exibidas enquanto não há logo real
  color: string;    // Cor de fundo do placeholder do logo
}
