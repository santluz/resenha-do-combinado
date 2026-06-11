export interface Interview {
  id?: string;
  name: string;
  role: string;
  date: string;
  thumbnail: string;
  youtubeId: string;
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
  src: string;
  alt: string;
  date: string;
  storagePath?: string;
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