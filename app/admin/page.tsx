"use client";
// app/admin/page.tsx — Painel admin com links externos (sem Firebase Storage)

import { useState, useEffect } from "react";
import {
  getLatestResenha, saveResenha,
  getInterviews, addInterview, deleteInterview,
  getGallery, addPhoto, deletePhoto,
  getNextMatch, saveNextMatch,
  getSponsors, addSponsor, deleteSponsor,
  getSiteConfig, saveSiteConfig,
} from "@/lib/firestore";
import type { Interview, LatestResenha, GalleryPhoto, NextMatch, Sponsor, SiteConfig } from "@/types";

// ─── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">⚽</div>
        <h1 className="text-white font-black text-2xl uppercase mb-1"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Painel Admin</h1>
        <p className="text-[#555] text-sm mb-8">Resenha do Combinado</p>
        <input type="password" placeholder="Senha do grupo" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full bg-[#0D0D0D] border rounded-lg px-4 py-3 text-white text-sm mb-4 outline-none transition-colors ${error ? "border-red-500" : "border-[#333] focus:border-[#1A7A3A]"}`} />
        {error && <p className="text-red-400 text-xs mb-3">Senha incorreta</p>}
        <button onClick={handleSubmit}
          className="w-full bg-[#1A7A3A] hover:bg-[#15612F] text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">
          Entrar
        </button>
      </div>
    </div>
  );
}

// ─── Componentes base ──────────────────────────────────────────────────────────
function Section({ title, emoji, tip, children }: { title: string; emoji: string; tip?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6">
      <h2 className="text-white font-black text-xl uppercase mb-1 flex items-center gap-2"
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
        {emoji} {title}
      </h2>
      {tip && <p className="text-[#444] text-xs mb-6 leading-relaxed">{tip}</p>}
      {!tip && <div className="mb-6" />}
      {children}
    </div>
  );
}

function Input({ label, tip, ...props }: { label: string; tip?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <input {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-[#1A7A3A] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
      {tip && <p className="text-[#444] text-xs mt-1">{tip}</p>}
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <textarea {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-[#1A7A3A] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none" />
    </div>
  );
}

function SaveBtn({ loading, label = "Salvar" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="bg-[#1A7A3A] hover:bg-[#15612F] disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition-colors">
      {loading ? "Salvando..." : label}
    </button>
  );
}

// Caixa de dica visual
function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0D0D0D] border border-[#F5C518]/20 rounded-lg p-4 mb-4">
      <p className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-2">💡 Como funciona</p>
      <div className="text-[#888] text-sm leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

// ─── Instagram ─────────────────────────────────────────────────────────────────
function InstagramSection() {
  const [config, setConfig] = useState<SiteConfig>({ instagram: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { getSiteConfig().then(setConfig); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await saveSiteConfig(config);
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Section title="Instagram do Grupo" emoji="📱">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Input label="@ do Instagram (sem o @)" value={config.instagram}
            onChange={(e) => setConfig({ ...config, instagram: e.target.value.replace("@", "") })}
            placeholder="grupocombinadofutebol" required />
          <p className="text-[#444] text-xs mt-1">Link: instagram.com/{config.instagram || "..."}</p>
        </div>
        <div className="flex items-center gap-3">
          <SaveBtn loading={loading} />
          {saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Última Resenha ────────────────────────────────────────────────────────────
function ResenhaSection() {
  const [data, setData] = useState<LatestResenha>({
    youtubeId: "", title: "", date: "", description: "",
    matchStats: { goals: "", opponent: "", location: "" },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { getLatestResenha().then((r) => { if (r) setData(r); }); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await saveResenha(data, (data as any).id);
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Section title="Última Resenha" emoji="🎬">
      <TipBox>
        <p>1. Suba o vídeo no <strong className="text-white">YouTube</strong> (pode ser não listado)</p>
        <p>2. Copie o link: <span className="text-[#F5C518]">youtube.com/watch?v=<strong>ABC123xyz</strong></span></p>
        <p>3. Cole só o ID (<strong className="text-white">ABC123xyz</strong>) no campo abaixo</p>
      </TipBox>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input label="ID do YouTube"
            tip="Só a parte depois de ?v= — ex: se o link é youtube.com/watch?v=ABC123 cole ABC123"
            value={data.youtubeId}
            onChange={(e) => setData({ ...data, youtubeId: e.target.value })} required />
        </div>
        <Input label="Título da Resenha" value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })} required />
        <Input label="Data do Jogo" type="date" value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })} required />
        <Input label="Placar (ex: 4 x 1)" value={data.matchStats.goals}
          onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, goals: e.target.value } })} />
        <Input label="Adversário" value={data.matchStats.opponent}
          onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, opponent: e.target.value } })} />
        <div className="md:col-span-2">
          <Input label="Local do Jogo" value={data.matchStats.location}
            onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, location: e.target.value } })} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Descrição" value={data.description} rows={3}
            onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex items-center gap-4">
          <SaveBtn loading={loading} />
          {saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Entrevistas ───────────────────────────────────────────────────────────────
function InterviewsSection() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [form, setForm] = useState<Omit<Interview, "id">>({
    name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const load = () => getInterviews().then(setInterviews);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    // Se não informou thumbnail, gera automaticamente pelo YouTube
    const finalForm = {
      ...form,
      thumbnail: form.thumbnail || `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`,
    };
    await addInterview(finalForm);
    setForm({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
    await load(); setLoading(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta entrevista?")) return;
    await deleteInterview(id); await load();
  };
  return (
    <Section title="Entrevistas" emoji="🎙">
      <TipBox>
        <p>1. Suba a entrevista no <strong className="text-white">YouTube</strong> (pode ser não listado)</p>
        <p>2. Cole o <strong className="text-white">ID do vídeo</strong> no campo abaixo</p>
        <p>3. A foto de capa é gerada <strong className="text-white">automaticamente</strong> pelo YouTube — não precisa preencher</p>
      </TipBox>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome do Entrevistado" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Posição / Função" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <Input label="ID do YouTube" value={form.youtubeId}
          onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
          placeholder="Ex: ABC123xyz" required />
        <Input label="Data" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <div className="md:col-span-2">
          <Input label="URL da foto de capa (opcional)"
            tip="Deixe em branco para usar a miniatura automática do YouTube"
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Descrição curta" value={form.description} rows={2}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div><SaveBtn loading={loading} label="Adicionar Entrevista" /></div>
      </form>
      <div className="space-y-3">
        {interviews.length === 0 && <p className="text-[#555] text-sm">Nenhuma entrevista cadastrada ainda.</p>}
        {interviews.map((iv) => (
          <div key={iv.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div>
              <p className="text-white font-semibold text-sm">{iv.name}</p>
              <p className="text-[#555] text-xs">{iv.role} · {iv.date} · 📺 {iv.youtubeId}</p>
            </div>
            <button onClick={() => handleDelete(iv.id!)}
              className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">
              Remover
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Galeria ───────────────────────────────────────────────────────────────────
function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [form, setForm] = useState({ src: "", alt: "" });
  const [loading, setLoading] = useState(false);
  const load = () => getGallery().then(setPhotos);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await addPhoto({
      src: form.src, alt: form.alt,
      date: new Date().toISOString().split("T")[0],
    });
    setForm({ src: "", alt: "" });
    await load(); setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta foto?")) return;
    await deletePhoto(id); await load();
  };

  return (
    <Section title="Galeria de Fotos" emoji="📷">
      <TipBox>
        <p><strong className="text-white">Google Fotos:</strong> abra a foto → compartilhar → copiar link</p>
        <p><strong className="text-white">WhatsApp Web:</strong> salve a foto no PC → suba no <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-[#F5C518] underline">imgur.com</a> → copie o link direto</p>
        <p><strong className="text-white">Dica:</strong> No Imgur clique com botão direito na imagem → "Copiar endereço da imagem"</p>
      </TipBox>

      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 mb-6 pb-6 border-b border-[#222]">
        <Input label="URL da Foto"
          tip="Cole o link direto da imagem (termina em .jpg, .png ou link do imgur/google fotos)"
          value={form.src}
          onChange={(e) => setForm({ ...form, src: e.target.value })}
          placeholder="https://i.imgur.com/abc123.jpg" required />
        <Input label="Legenda da foto"
          value={form.alt}
          onChange={(e) => setForm({ ...form, alt: e.target.value })}
          placeholder="Ex: Gol do Marquinhos no segundo tempo" required />
        {/* Preview da imagem */}
        {form.src && (
          <div>
            <p className="text-[#666] text-xs uppercase tracking-widest mb-2">Preview</p>
            <img src={form.src} alt="preview" className="w-32 h-20 object-cover rounded-lg border border-[#333]"
              onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>
        )}
        <div><SaveBtn loading={loading} label="Adicionar Foto" /></div>
      </form>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0D0D0D]">
            <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            <button onClick={() => handleDelete(photo.id!)}
              className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs font-bold">
              Remover
            </button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-[#555] text-sm col-span-full">Nenhuma foto ainda.</p>}
      </div>
    </Section>
  );
}

// ─── Próximo Jogo ──────────────────────────────────────────────────────────────
function NextMatchSection() {
  const [data, setData] = useState<NextMatch>({ date: "", time: "", location: "", opponent: "", competition: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { getNextMatch().then((m) => { if (m) setData(m); }); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await saveNextMatch(data);
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Section title="Próximo Jogo" emoji="📅">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Data" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} required />
        <Input label="Horário" type="time" value={data.time} onChange={(e) => setData({ ...data, time: e.target.value })} required />
        <Input label="Adversário" value={data.opponent} onChange={(e) => setData({ ...data, opponent: e.target.value })} required />
        <Input label="Competição" value={data.competition} onChange={(e) => setData({ ...data, competition: e.target.value })} />
        <div className="md:col-span-2">
          <Input label="Local" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} required />
        </div>
        <div className="flex items-center gap-4">
          <SaveBtn loading={loading} />
          {saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Patrocinadores ────────────────────────────────────────────────────────────
function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState<Omit<Sponsor, "id">>({ name: "", tagline: "", contact: "", logoText: "", color: "#1A7A3A" });
  const [loading, setLoading] = useState(false);
  const load = () => getSponsors().then(setSponsors);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await addSponsor(form);
    setForm({ name: "", tagline: "", contact: "", logoText: "", color: "#1A7A3A" });
    await load(); setLoading(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Remover patrocinador?")) return;
    await deleteSponsor(id); await load();
  };
  return (
    <Section title="Patrocinadores" emoji="🤝">
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Slogan" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        <Input label="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <Input label="Iniciais do Logo (ex: AG)" value={form.logoText} maxLength={3}
          onChange={(e) => setForm({ ...form, logoText: e.target.value.toUpperCase() })} required />
        <div>
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Cor do Logo</label>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-10 rounded-lg border border-[#333] bg-[#0D0D0D] cursor-pointer" />
        </div>
        <div className="flex items-end"><SaveBtn loading={loading} label="Adicionar" /></div>
      </form>
      <div className="space-y-3">
        {sponsors.length === 0 && <p className="text-[#555] text-sm">Nenhum patrocinador cadastrado.</p>}
        {sponsors.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm"
                style={{ backgroundColor: s.color }}>{s.logoText}</div>
              <div>
                <p className="text-white font-semibold text-sm">{s.name}</p>
                <p className="text-[#555] text-xs">{s.tagline} · {s.contact}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(s.id!)}
              className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">Remover</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "1") setAuthed(true);
    setChecked(true);
  }, []);
  if (!checked) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-black text-4xl uppercase"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>⚽ Painel Admin</h1>
            <p className="text-[#555] text-sm">Resenha do Combinado</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[#555] hover:text-white text-sm transition-colors">← Ver Site</a>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
              className="text-[#555] hover:text-red-400 text-sm transition-colors">Sair</button>
          </div>
        </div>
        <InstagramSection />
        <ResenhaSection />
        <InterviewsSection />
        <GallerySection />
        <NextMatchSection />
        <SponsorsSection />
      </div>
    </div>
  );
}
