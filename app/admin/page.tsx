"use client";
import { useState, useEffect, useRef } from "react";
import {
  getLatestResenha, saveResenha,
  getInterviews, addInterview, deleteInterview,
  getGallery, uploadPhoto, deletePhoto,
  getNextMatch, saveNextMatch,
  getSponsors, addSponsor, deleteSponsor,
} from "@/lib/firestore";
import type { Interview, LatestResenha, GalleryPhoto, NextMatch, Sponsor } from "@/types";

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
        <h1 className="text-white font-black text-2xl uppercase mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Painel Admin</h1>
        <p className="text-[#555] text-sm mb-8">Resenha do Combinado</p>
        <input type="password" placeholder="Senha do grupo" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full bg-[#0D0D0D] border rounded-lg px-4 py-3 text-white text-sm mb-4 outline-none transition-colors ${error ? "border-red-500" : "border-[#333] focus:border-[#1A7A3A]"}`}
        />
        {error && <p className="text-red-400 text-xs mb-3">Senha incorreta</p>}
        <button onClick={handleSubmit} className="w-full bg-[#1A7A3A] hover:bg-[#15612F] text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">Entrar</button>
      </div>
    </div>
  );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6">
      <h2 className="text-white font-black text-xl uppercase mb-6 flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
        <span>{emoji}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <input {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-[#1A7A3A] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
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
    <button type="submit" disabled={loading} className="bg-[#1A7A3A] hover:bg-[#15612F] disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition-colors">
      {loading ? "Salvando..." : label}
    </button>
  );
}

function ResenhaSection() {
  const [data, setData] = useState<LatestResenha>({ youtubeId: "", title: "", date: "", description: "", matchStats: { goals: "", opponent: "", location: "" } });
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="ID do YouTube (ex: dQw4w9WgXcQ)" value={data.youtubeId} onChange={(e) => setData({ ...data, youtubeId: e.target.value })} required />
        <Input label="Título da Resenha" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required />
        <Input label="Data do Jogo" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} required />
        <Input label="Placar (ex: 4 x 1)" value={data.matchStats.goals} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, goals: e.target.value } })} />
        <Input label="Adversário" value={data.matchStats.opponent} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, opponent: e.target.value } })} />
        <Input label="Local do Jogo" value={data.matchStats.location} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, location: e.target.value } })} />
        <div className="md:col-span-2"><Textarea label="Descrição" value={data.description} rows={3} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
        <div className="flex items-center gap-4"><SaveBtn loading={loading} />{saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}</div>
      </form>
    </Section>
  );
}

function InterviewsSection() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [form, setForm] = useState<Omit<Interview, "id">>({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
  const [loading, setLoading] = useState(false);
  const load = () => getInterviews().then(setInterviews);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await addInterview(form);
    setForm({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
    await load(); setLoading(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta entrevista?")) return;
    await deleteInterview(id); await load();
  };
  return (
    <Section title="Entrevistas" emoji="🎙">
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome do Entrevistado" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Posição / Função" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <Input label="ID do YouTube" value={form.youtubeId} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })} required />
        <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <Input label="URL da Miniatura" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://img.youtube.com/vi/SEU_ID/hqdefault.jpg" />
        <div className="md:col-span-2"><Textarea label="Descrição curta" value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><SaveBtn loading={loading} label="Adicionar Entrevista" /></div>
      </form>
      <div className="space-y-3">
        {interviews.length === 0 && <p className="text-[#555] text-sm">Nenhuma entrevista cadastrada ainda.</p>}
        {interviews.map((iv) => (
          <div key={iv.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div><p className="text-white font-semibold text-sm">{iv.name}</p><p className="text-[#555] text-xs">{iv.role} · {iv.date}</p></div>
            <button onClick={() => handleDelete(iv.id!)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">Remover</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const load = () => getGallery().then(setPhotos);
  useEffect(() => { load(); }, []);
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      setProgress(`Enviando ${i + 1}/${files.length}...`);
      await uploadPhoto(files[i], alt || files[i].name);
    }
    setProgress(""); setAlt("");
    if (inputRef.current) inputRef.current.value = "";
    setFiles(null); await load(); setLoading(false);
  };
  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm("Remover esta foto?")) return;
    await deletePhoto(photo.id!, (photo as any).storagePath || ""); await load();
  };
  return (
    <Section title="Galeria de Fotos" emoji="📷">
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-[#222]">
        <div className="flex-1">
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Fotos</label>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} required
            className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-2.5 text-[#888] text-sm file:mr-3 file:bg-[#1A7A3A] file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-xs file:font-bold file:uppercase" />
        </div>
        <div className="flex-1"><Input label="Legenda (opcional)" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex: Gol do Marquinhos" /></div>
        <div className="flex items-end"><SaveBtn loading={loading} label={loading ? progress || "Enviando..." : "Enviar Fotos"} /></div>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0D0D0D]">
            <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            <button onClick={() => handleDelete(photo)} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs font-bold">Remover</button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-[#555] text-sm col-span-full">Nenhuma foto ainda.</p>}
      </div>
    </Section>
  );
}

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
        <div className="md:col-span-2"><Input label="Local" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} required /></div>
        <div className="flex items-center gap-4"><SaveBtn loading={loading} />{saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}</div>
      </form>
    </Section>
  );
}

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
        <Input label="Iniciais do Logo (ex: AG)" value={form.logoText} maxLength={3} onChange={(e) => setForm({ ...form, logoText: e.target.value.toUpperCase() })} required />
        <div>
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Cor do Logo</label>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded-lg border border-[#333] bg-[#0D0D0D] cursor-pointer" />
        </div>
        <div className="flex items-end"><SaveBtn loading={loading} label="Adicionar" /></div>
      </form>
      <div className="space-y-3">
        {sponsors.length === 0 && <p className="text-[#555] text-sm">Nenhum patrocinador cadastrado.</p>}
        {sponsors.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: s.color }}>{s.logoText}</div>
              <div><p className="text-white font-semibold text-sm">{s.name}</p><p className="text-[#555] text-xs">{s.tagline} · {s.contact}</p></div>
            </div>
            <button onClick={() => handleDelete(s.id!)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">Remover</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

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
            <h1 className="text-white font-black text-4xl uppercase" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>⚽ Painel Admin</h1>
            <p className="text-[#555] text-sm">Resenha do Combinado</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[#555] hover:text-white text-sm transition-colors">← Ver Site</a>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }} className="text-[#555] hover:text-red-400 text-sm transition-colors">Sair</button>
          </div>
        </div>
        <ResenhaSection />
        <InterviewsSection />
        <GallerySection />
        <NextMatchSection />
        <SponsorsSection />
      </div>
    </div>
  );
}