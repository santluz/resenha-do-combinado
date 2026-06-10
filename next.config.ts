// next.config.ts
// Configurações do Next.js — domínios de imagem autorizados
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Unsplash — imagens mockadas
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // YouTube thumbnails
        protocol: "https",
        hostname: "img.youtube.com",
      },
      // Para integrar Firebase Storage no futuro, adicionar:
      // { protocol: "https", hostname: "firebasestorage.googleapis.com" }
    ],
  },
};

export default nextConfig;
