// types/index.ts
export interface Interview {
  id?: string;
  name: string;
  role: string;
  date: string;
  thumbnail: string;   // URL da imagem (Google Fotos, Imgur, etc.)
  youtubeId: string;   // ID do YouTube
  description: string;
}

export interface LatestResenha {
  id?: string;
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
  id?: string;
  src: string;   // URL da imagem (Google Fotos, Imgur, etc.)
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
  id?: string;
  name: string;
  tagline: string;
  contact: string;
  logoText: string;
  color: string;
}

export interface SiteConfig {
  instagram: string;
}
