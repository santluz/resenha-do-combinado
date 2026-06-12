"use client";
// app/admin/page.tsx — Painel admin completo
// Novidades: upload de vídeo direto, fotos do celular, configuração do Instagram

import { useState, useEffect, useRef } from "react";
import {
  getLatestResenha, saveResenha,
  getInterviews, addInterview, deleteInterview,
  getGallery, uploadPhoto, deletePhoto,
  getNextMatch, saveNextMatch,
  getSponsors, addSponsor, deleteSponsor,
  getSiteConfig, saveSiteConfig,
  uploadFileWithProgress,
} from "@/lib/firestore";
import type { Interview, LatestResenha, GalleryPhoto, NextMatch, Sponsor, SiteConfig } from "@/types";

// ─── Barra de progresso de upload ─────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  if (pct <= 0 || pct >= 100) return null;
  return (
    <div className="w-full bg-[#222] rounded-full h-2 mt-2">
      <div
        className="bg-[#1A7A3A] h-2 rounded-full transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
      <p className="text-[#555] text-xs mt-1">{pct}% enviado...</p>
    </div>
  );
}

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
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
          Painel Admin
        </h1>
        <p className="text-[#555] text-sm mb-8">Resenha do Combinado</p>
        <input
          type="password"
          placeholder="Senha do grupo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full bg-[#0D0D0D] border rounded-lg px-4 py-3 text-white text-sm mb-4 outline-none transition-colors ${
            error ? "border-red-500" : "border-[#333] focus:border-[#1A7A3A]"
          }`}
        />
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
function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6">
      <h2 className="text-white font-black text-xl uppercase mb-6 flex items-center gap-2"
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
        {emoji} {title}
      </h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <input {...props}
        className="w-full bg-[#0D0D0D] border border-[#333] focus:border-[#1A7A3A] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <textarea {...props}
        className="w-full bg-[#0D0D0D] border border-[#333] focus:border-[#1A7A3A] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none" />
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

// Botão de upload otimizado para celular — abre câmera ou galeria
function UploadBtn({
  label, accept, capture, onChange, inputRef,
}: {
  label: string;
  accept: string;
  capture?: "user" | "environment";
  onChange: (files: FileList | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full bg-[#0D0D0D] border border-dashed border-[#444] hover:border-[#1A7A3A] rounded-lg px-4 py-4 text-[#666] hover:text-[#1A7A3A] text-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Escolher arquivo / Abrir câmera
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        multiple
        onChange={(e) => onChange(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

// ─── Seção: Instagram ──────────────────────────────────────────────────────────
function InstagramSection() {
  const [config, setConfig] = useState<SiteConfig>({ instagram: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getSiteConfig().then(setConfig); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveSiteConfig(config);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Section title="Instagram do Grupo" emoji="📱">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Input
            label="@ do Instagram (sem o @)"
            value={config.instagram}
            onChange={(e) => setConfig({ ...config, instagram: e.target.value.replace("@", "") })}
            placeholder="resenhadocombinado"
            required
          />
          <p className="text-[#444] text-xs mt-1">
            Link gerado: instagram.com/{config.instagram || "..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveBtn loading={loading} />
          {saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Seção: Última Resenha ─────────────────────────────────────────────────────
function ResenhaSection() {
  const [data, setData] = useState<LatestResenha>({
    youtubeId: "", videoUrl: "", title: "", date: "", description: "",
    matchStats: { goals: "", opponent: "", location: "" },
  });
  const [videoMode, setVideoMode] = useState<"youtube" | "upload">("youtube");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getLatestResenha().then((r) => {
    if (r) {
      setData(r);
      setVideoMode(r.videoUrl ? "upload" : "youtube");
    }
  }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalData = { ...data };

    // Se escolheu upload de vídeo, sobe o arquivo primeiro
    if (videoMode === "upload" && videoFile) {
      const path = `resenhas/${Date.now()}_${videoFile.name}`;
      const url = await uploadFileWithProgress(videoFile, path, setProgress);
      finalData = { ...finalData, videoUrl: url, videoPath: path, youtubeId: "" };
    }

    await saveResenha(finalData, (finalData as any).id);
    setProgress(0);
    setVideoFile(null);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Section title="Última Resenha" emoji="🎬">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modo de vídeo */}
        <div className="md:col-span-2">
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Tipo de Vídeo</label>
          <div className="flex gap-3">
            <button type="button"
              onClick={() => setVideoMode("youtube")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                videoMode === "youtube"
                  ? "bg-[#1A7A3A] border-[#1A7A3A] text-white"
                  : "bg-transparent border-[#333] text-[#666] hover:border-[#555]"
              }`}>
              📺 Link do YouTube
            </button>
            <button type="button"
              onClick={() => setVideoMode("upload")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                videoMode === "upload"
                  ? "bg-[#1A7A3A] border-[#1A7A3A] text-white"
                  : "bg-transparent border-[#333] text-[#666] hover:border-[#555]"
              }`}>
              📱 Vídeo do Celular
            </button>
          </div>
        </div>

        {/* Campo YouTube ou upload */}
        {videoMode === "youtube" ? (
          <div className="md:col-span-2">
            <Input label="ID do YouTube (ex: dQw4w9WgXcQ)" value={data.youtubeId || ""}
              onChange={(e) => setData({ ...data, youtubeId: e.target.value })}
              placeholder="Cole só o ID — a parte depois de ?v=" />
          </div>
        ) : (
          <div className="md:col-span-2">
            <UploadBtn
              label="Vídeo da Resenha (MP4 — do celular ou computador)"
              accept="video/*"
              capture="environment"
              onChange={(files) => setVideoFile(files?.[0] || null)}
              inputRef={videoRef}
            />
            {videoFile && (
              <p className="text-[#1A7A3A] text-xs mt-2">✓ {videoFile.name} selecionado</p>
            )}
            {data.videoUrl && !videoFile && (
              <p className="text-[#555] text-xs mt-2">Vídeo atual: já enviado ✓</p>
            )}
            <ProgressBar pct={progress} />
          </div>
        )}

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
          {saved && <span className="text-[#1A7A3A] text-sm">✓ Salvo com sucesso!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Seção: Entrevistas ────────────────────────────────────────────────────────
function InterviewsSection() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [form, setForm] = useState<Omit<Interview, "id">>({
    name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "",
  });
  const [videoMode, setVideoMode] = useState<"youtube" | "upload">("youtube");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const load = () => getInterviews().then(setInterviews);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalForm = { ...form };

    // Upload do vídeo se necessário
    if (videoMode === "upload" && videoFile) {
      const path = `interviews/${Date.now()}_${videoFile.name}`;
      const url = await uploadFileWithProgress(videoFile, path, setProgress);
      finalForm = { ...finalForm, videoUrl: url, videoPath: path, youtubeId: "" };
    }

    // Upload da thumbnail se fornecida
    if (thumbFile) {
      const path = `thumbnails/${Date.now()}_${thumbFile.name}`;
      const url = await uploadFileWithProgress(thumbFile, path);
      finalForm = { ...finalForm, thumbnail: url };
    }

    await addInterview(finalForm);
    setForm({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
    setVideoFile(null);
    setThumbFile(null);
    setProgress(0);
    await load();
    setLoading(false);
  };

  const handleDelete = async (id: string, videoPath?: string) => {
    if (!confirm("Remover esta entrevista?")) return;
    await deleteInterview(id, videoPath);
    await load();
  };

  return (
    <Section title="Entrevistas" emoji="🎙">
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome do Entrevistado" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Posição / Função" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <Input label="Data" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} required />

        {/* Modo de vídeo */}
        <div className="md:col-span-2">
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Tipo de Vídeo</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setVideoMode("youtube")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                videoMode === "youtube" ? "bg-[#1A7A3A] border-[#1A7A3A] text-white" : "bg-transparent border-[#333] text-[#666]"
              }`}>
              📺 YouTube
            </button>
            <button type="button" onClick={() => setVideoMode("upload")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                videoMode === "upload" ? "bg-[#1A7A3A] border-[#1A7A3A] text-white" : "bg-transparent border-[#333] text-[#666]"
              }`}>
              📱 Celular / Arquivo
            </button>
          </div>
        </div>

        {videoMode === "youtube" ? (
          <div className="md:col-span-2">
            <Input label="ID do YouTube" value={form.youtubeId || ""}
              onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
              placeholder="Ex: dQw4w9WgXcQ" />
          </div>
        ) : (
          <div className="md:col-span-2">
            <UploadBtn label="Vídeo da Entrevista" accept="video/*" capture="environment"
              onChange={(files) => setVideoFile(files?.[0] || null)} inputRef={videoRef} />
            {videoFile && <p className="text-[#1A7A3A] text-xs mt-1">✓ {videoFile.name}</p>}
            <ProgressBar pct={progress} />
          </div>
        )}

        {/* Thumbnail — foto do celular ou câmera */}
        <div className="md:col-span-2">
          <UploadBtn label="Foto de Capa (opcional — câmera ou galeria)" accept="image/*"
            onChange={(files) => setThumbFile(files?.[0] || null)} inputRef={thumbRef} />
          {thumbFile && <p className="text-[#1A7A3A] text-xs mt-1">✓ {thumbFile.name}</p>}
          {!thumbFile && (
            <p className="text-[#444] text-xs mt-1">
              Se não enviar, será gerada automaticamente pelo YouTube
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Textarea label="Descrição curta" value={form.description} rows={2}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div><SaveBtn loading={loading} label="Adicionar Entrevista" /></div>
      </form>

      {/* Lista de entrevistas */}
      <div className="space-y-3">
        {interviews.length === 0 && <p className="text-[#555] text-sm">Nenhuma entrevista cadastrada ainda.</p>}
        {interviews.map((iv) => (
          <div key={iv.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div>
              <p className="text-white font-semibold text-sm">{iv.name}</p>
              <p className="text-[#555] text-xs">{iv.role} · {iv.date} · {iv.videoUrl ? "📱 vídeo próprio" : "📺 YouTube"}</p>
            </div>
            <button onClick={() => handleDelete(iv.id!, iv.videoPath)}
              className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">
              Remover
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Seção: Galeria ────────────────────────────────────────────────────────────
function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => getGallery().then(setPhotos);
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      setCurrent(i + 1);
      await uploadPhoto(files[i], alt || files[i].name, setProgress);
    }
    setProgress(0);
    setCurrent(0);
    setAlt("");
    if (inputRef.current) inputRef.current.value = "";
    setFiles(null);
    await load();
    setLoading(false);
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm("Remover esta foto?")) return;
    await deletePhoto(photo.id!, photo.storagePath || "");
    await load();
  };

  return (
    <Section title="Galeria de Fotos" emoji="📷">
      <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 mb-6 pb-6 border-b border-[#222]">
        {/* Upload otimizado para celular */}
        <UploadBtn
          label="Fotos do Jogo (câmera ou galeria do celular — pode selecionar várias)"
          accept="image/*"
          onChange={(f) => setFiles(f)}
          inputRef={inputRef}
        />
        {files && files.length > 0 && (
          <p className="text-[#1A7A3A] text-xs">{files.length} foto(s) selecionada(s)</p>
        )}
        {loading && (
          <div>
            <p className="text-[#555] text-xs mb-1">
              Enviando foto {current} de {files?.length}...
            </p>
            <ProgressBar pct={progress} />
          </div>
        )}
        <Input label="Legenda para todas as fotos (opcional)" value={alt}
          onChange={(e) => setAlt(e.target.value)} placeholder="Ex: Jogo contra o Pelotão — 01/06/2025" />
        <div>
          <SaveBtn loading={loading} label={loading ? `Enviando ${current}/${files?.length}...` : "Enviar Fotos"} />
        </div>
      </form>

      {/* Grade de fotos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0D0D0D]">
            <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            <button onClick={() => handleDelete(photo)}
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

// ─── Seção: Próximo Jogo ───────────────────────────────────────────────────────
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

// ─── Seção: Patrocinadores ─────────────────────────────────────────────────────
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
            <button onClick={() => handleDelete(s.id!)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">Remover</button>
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
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
              ⚽ Painel Admin
            </h1>
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
