// components/Navbar.tsx
// Barra de navegação fixa no topo com scroll-aware
"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Aplica sombra/fundo quando rola a página
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Última Resenha", href: "#ultima-resenha" },
    { label: "Entrevistas", href: "#entrevistas" },
    { label: "Galeria", href: "#galeria" },
    { label: "Próximo Jogo", href: "#proximo-jogo" },
    { label: "Sobre", href: "#sobre" },
  ];

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1C1C1C] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Navegação principal">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          aria-label="Resenha do Combinado — início"
        >
          <span className="w-8 h-8 rounded-full bg-[#1A7A3A] flex items-center justify-center text-sm">
            ⚽
          </span>
          <span
            className="text-white font-black uppercase text-lg leading-none group-hover:text-[#1A7A3A] transition-colors"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: "0.05em" }}
          >
            Resenha
          </span>
        </a>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[#666] hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <a
          href="https://instagram.com/resenhadocombinado"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 text-[#888] hover:text-[#F5C518] text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram
        </a>

        {/* Botão menu mobile */}
        <button
          className="md:hidden text-[#888] hover:text-white p-1 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Abrir menu de navegação"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Menu mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D0D0D]/98 backdrop-blur-md border-b border-[#1C1C1C]">
          <ul className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-[#888] hover:text-white text-sm font-semibold uppercase tracking-widest block py-2 border-b border-[#1C1C1C] last:border-0 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
