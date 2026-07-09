"use client";
import { useState, useEffect, useRef } from "react";
import {
  getLatestResenha, saveResenha,
  getInterviews, addInterview, deleteInterview,
  getHighlights, addHighlight, deleteHighlight,
  getGallery, addPhoto, deletePhoto,
  getFeaturedPhoto, saveFeaturedPhoto, deleteFeaturedPhoto,
  getNextMatch, saveNextMatch,
  getSponsors, addSponsor, deleteSponsor,
  getSiteConfig, saveSiteConfig,
} from "@/lib/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Interview, Highlight, LatestResenha, GalleryPhoto, NextMatch, Sponsor, SiteConfig } from "@/types";

function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  if (pct <= 0 || pct >= 100) return null;
  return (
    <div className="mt-2">
      <div className="w-full bg-[#222] rounded-full h-2">
        <div className="bg-red-600 h-2 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[#555] text-xs mt-1">{label || `${pct}%...`}</p>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1"); onLogin();
    } else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">⚽</div>
        <h1 className="text-white font-black text-2xl uppercase mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Painel Admin</h1>
        <p className="text-[#555] text-sm mb-8">Resenha do Combinado</p>
        <input type="password" placeholder="Senha do grupo" value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full bg-[#0D0D0D] border rounded-lg px-4 py-3 text-white text-sm mb-4 outline-none transition-colors ${error ? "border-red-500" : "border-[#333] focus:border-red-600"}`} />
        {error && <p className="text-red-400 text-xs mb-3">Senha incorreta</p>}
        <button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">Entrar</button>
      </div>
    </div>
  );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6">
      <h2 className="text-white font-black text-xl uppercase mb-6 flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{emoji} {title}</h2>
      {children}
    </div>
  );
}

function Input({ label, tip, ...props }: { label: string; tip?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <input {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
      {tip && <p className="text-[#444] text-xs mt-1">{tip}</p>}
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <textarea {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none" />
    </div>
  );
}

function SaveBtn({ loading, label = "Salvar" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition-colors">
      {loading ? "Aguarde..." : label}
    </button>
  );
}

function UploadArea({ label, accept, multiple, onChange, preview, inputRef }: {
  label: string; accept: string; multiple?: boolean;
  onChange: (files: FileList | null) => void;
  preview?: string | null; inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label>
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full bg-[#0D0D0D] border-2 border-dashed border-[#333] hover:border-red-600 rounded-xl px-4 py-6 flex flex-col items-center gap-2 transition-colors group">
        {preview ? <img src={preview} alt="preview" className="w-24 h-16 object-cover rounded-lg mb-1" /> : (
          <div className="w-12 h-12 rounded-full bg-red-600/10 group-hover:bg-red-600/20 flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        )}
        <span className="text-[#666] group-hover:text-red-500 text-sm transition-colors">Toque para escolher da galeria ou tirar foto</span>
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(e) => onChange(e.target.files)} className="hidden" />
    </div>
  );
}

// ─── Configurações ─────────────────────────────────────────────────────────────
function ConfigSection() {
  const [config, setConfig] = useState<SiteConfig>({ instagram: "", logoUrl: "", comunicado: "", comunicadoAtivo: false });
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getSiteConfig().then((c) => { setConfig(c); if (c.logoUrl) setLogoPreview(c.logoUrl); }); }, []);

  const handleLogoChange = async (files: FileList | null) => {
    const file = files?.[0]; if (!file) return;
    setLogoLoading(true);
    setLogoPreview(URL.createObjectURL(file));
    const result = await uploadToCloudinary(file);
    setConfig((prev) => ({ ...prev, logoUrl: result.url }));
    setLogoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await saveSiteConfig(config);
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Section title="Configurações do Site" emoji="⚙️">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Logo do Grupo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-red-600" /> : <div className="w-16 h-16 rounded-full bg-[#222] border-2 border-dashed border-[#444] flex items-center justify-center text-2xl">⚽</div>}
            <button type="button" onClick={() => logoRef.current?.click()} disabled={logoLoading}
              className="bg-[#222] hover:bg-[#333] border border-[#444] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {logoLoading ? "Enviando..." : "Escolher Logo"}
            </button>
            <input ref={logoRef} type="file" accept="image/*" onChange={(e) => handleLogoChange(e.target.files)} className="hidden" />
          </div>
        </div>
        <Input label="@ do Instagram (sem o @)" value={config.instagram}
          onChange={(e) => setConfig({ ...config, instagram: e.target.value.replace("@", "") })}
          placeholder="grupocombinadofutebol" />
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[#666] text-xs uppercase tracking-widest">Comunicado / Aviso</label>
            <div onClick={() => setConfig({ ...config, comunicadoAtivo: !config.comunicadoAtivo })}
              className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${config.comunicadoAtivo ? "bg-red-600" : "bg-[#333]"}`}>
              <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${config.comunicadoAtivo ? "translate-x-4" : ""}`} />
            </div>
          </div>
          <textarea value={config.comunicado || ""} onChange={(e) => setConfig({ ...config, comunicado: e.target.value })}
            placeholder="Ex: Jogo cancelado por chuva!" rows={2}
            className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none resize-none" />
        </div>
        <div className="flex items-center gap-4">
          <SaveBtn loading={loading} label="Salvar Configurações" />
          {saved && <span className="text-green-500 text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Última Entrevista ─────────────────────────────────────────────────────────
function ResenhaSection() {
  const [data, setData] = useState<LatestResenha>({ youtubeId: "", title: "", date: "", description: "", matchStats: { goals: "", opponent: "", location: "" } });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [useYoutube, setUseYoutube] = useState(true);
  const videoRef = useRef<HTMLInputElement>(null);
  useEffect(() => { getLatestResenha().then((r) => { if (r) { setData(r); setUseYoutube(!r.videoUrl); } }); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let finalData = { ...data };
    if (!useYoutube && videoFile) {
      setProgress(1);
      const result = await uploadToCloudinary(videoFile, setProgress);
      finalData = { ...finalData, youtubeId: "", videoUrl: result.url };
    }
    await saveResenha(finalData, (finalData as any).id);
    setProgress(0); setVideoFile(null); setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Section title="Última Entrevista" emoji="🎬">
      <div className="flex gap-3 mb-6">
        {["youtube", "upload"].map((mode) => (
          <button key={mode} type="button" onClick={() => setUseYoutube(mode === "youtube")}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${(mode === "youtube") === useYoutube ? "bg-red-600 border-red-600 text-white" : "bg-transparent border-[#333] text-[#666]"}`}>
            {mode === "youtube" ? "📺 YouTube" : "📱 Celular"}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {useYoutube ? (
          <div className="md:col-span-2">
            <Input label="ID do YouTube" tip="Parte depois de ?v= no link" value={data.youtubeId || ""}
              onChange={(e) => setData({ ...data, youtubeId: e.target.value })} placeholder="Ex: ABC123xyz" />
          </div>
        ) : (
          <div className="md:col-span-2">
            <UploadArea label="Vídeo da Entrevista" accept="video/*" onChange={(f) => setVideoFile(f?.[0] || null)} inputRef={videoRef} preview={null} />
            {videoFile && <p className="text-red-400 text-xs mt-1">✓ {videoFile.name}</p>}
            <ProgressBar pct={progress} label={`Enviando... ${progress}%`} />
          </div>
        )}
        <Input label="Título" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required />
        <Input label="Data" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} required />
        <Input label="Placar" value={data.matchStats.goals} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, goals: e.target.value } })} placeholder="Ex: 4 x 1" />
        <Input label="Adversário" value={data.matchStats.opponent} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, opponent: e.target.value } })} />
        <div className="md:col-span-2"><Input label="Local" value={data.matchStats.location} onChange={(e) => setData({ ...data, matchStats: { ...data.matchStats, location: e.target.value } })} /></div>
        <div className="md:col-span-2"><Textarea label="Descrição" value={data.description} rows={3} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
        <div className="md:col-span-2 flex items-center gap-4">
          <SaveBtn loading={loading} />
          {saved && <span className="text-green-500 text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Highlights (máx 6) ────────────────────────────────────────────────────────
function HighlightsSection() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [form, setForm] = useState<Omit<Highlight, "id">>({ title: "", date: "", youtubeId: "", videoUrl: "", description: "" });
  const [useYoutube, setUseYoutube] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const load = () => getHighlights().then(setHighlights);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (highlights.length >= 6) { alert("Máximo de 6 highlights atingido."); return; }
    setLoading(true);
    let finalForm = { ...form };
    if (!useYoutube && videoFile) {
      setProgress(1);
      const result = await uploadToCloudinary(videoFile, setProgress);
      finalForm = { ...finalForm, videoUrl: result.url, youtubeId: "" };
    }
    await addHighlight(finalForm);
    setForm({ title: "", date: "", youtubeId: "", videoUrl: "", description: "" });
    setVideoFile(null); setProgress(0); await load(); setLoading(false);
  };
  return (
    <Section title={`Melhores Momentos (${highlights.length}/6)`} emoji="🎯">
      <div className="flex gap-3 mb-6">
        {["youtube", "upload"].map((mode) => (
          <button key={mode} type="button" onClick={() => setUseYoutube(mode === "youtube")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${(mode === "youtube") === useYoutube ? "bg-red-600 border-red-600 text-white" : "bg-transparent border-[#333] text-[#666]"}`}>
            {mode === "youtube" ? "📺 YouTube" : "📱 Celular"}
          </button>
        ))}
      </div>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        {useYoutube ? (
          <div className="md:col-span-2">
            <Input label="ID do YouTube" value={form.youtubeId || ""} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })} placeholder="Ex: ABC123xyz" required={useYoutube} />
          </div>
        ) : (
          <div className="md:col-span-2">
            <UploadArea label="Vídeo" accept="video/*" onChange={(f) => setVideoFile(f?.[0] || null)} inputRef={videoRef} preview={null} />
            {videoFile && <p className="text-red-400 text-xs mt-1">✓ {videoFile.name}</p>}
            <ProgressBar pct={progress} label={`Enviando... ${progress}%`} />
          </div>
        )}
        <div className="md:col-span-2"><Textarea label="Descrição" value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><SaveBtn loading={loading} label={highlights.length >= 6 ? "Limite atingido (6/6)" : "Adicionar"} /></div>
      </form>
      <div className="space-y-3">
        {highlights.length === 0 && <p className="text-[#555] text-sm">Nenhum highlight cadastrado.</p>}
        {highlights.map((h) => (
          <div key={h.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div><p className="text-white font-semibold text-sm">{h.title}</p><p className="text-[#555] text-xs">{h.date} · {h.videoUrl ? "📱 próprio" : "📺 YouTube"}</p></div>
            <button onClick={() => { if(confirm("Remover?")) deleteHighlight(h.id!).then(load); }} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Entrevistas (máx 2) ──────────────────────────────────────────────────────
function InterviewsSection() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [form, setForm] = useState<Omit<Interview, "id">>({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
  const [useYoutube, setUseYoutube] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const load = () => getInterviews().then(setInterviews);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interviews.length >= 2) { alert("Máximo de 2 entrevistas atingido."); return; }
    setLoading(true);
    let finalForm = { ...form };
    if (!useYoutube && videoFile) {
      setProgress(1);
      const result = await uploadToCloudinary(videoFile, setProgress);
      finalForm = { ...finalForm, youtubeId: "", videoUrl: result.url } as any;
    }
    if (thumbFile) {
      const result = await uploadToCloudinary(thumbFile);
      finalForm = { ...finalForm, thumbnail: result.url };
    } else if (useYoutube && form.youtubeId) {
      finalForm = { ...finalForm, thumbnail: `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg` };
    }
    await addInterview(finalForm);
    setForm({ name: "", role: "", date: "", thumbnail: "", youtubeId: "", description: "" });
    setVideoFile(null); setThumbFile(null); setThumbPreview(null); setProgress(0);
    await load(); setLoading(false);
  };
  return (
    <Section title={`Entrevistas (${interviews.length}/2)`} emoji="🎙">
      <div className="flex gap-3 mb-6">
        {["youtube", "upload"].map((mode) => (
          <button key={mode} type="button" onClick={() => setUseYoutube(mode === "youtube")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${(mode === "youtube") === useYoutube ? "bg-red-600 border-red-600 text-white" : "bg-transparent border-[#333] text-[#666]"}`}>
            {mode === "youtube" ? "📺 YouTube" : "📱 Celular"}
          </button>
        ))}
      </div>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Posição" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        {useYoutube ? (
          <Input label="ID do YouTube" value={form.youtubeId || ""} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })} placeholder="Ex: ABC123xyz" required={useYoutube} />
        ) : (
          <div>
            <UploadArea label="Vídeo (vertical)" accept="video/*" onChange={(f) => setVideoFile(f?.[0] || null)} inputRef={videoRef} preview={null} />
            {videoFile && <p className="text-red-400 text-xs mt-1">✓ {videoFile.name}</p>}
            <ProgressBar pct={progress} />
          </div>
        )}
        <div className="md:col-span-2">
          <UploadArea label="Foto de Capa (opcional)" accept="image/*"
            onChange={(f) => { setThumbFile(f?.[0] || null); if (f?.[0]) setThumbPreview(URL.createObjectURL(f[0])); }}
            inputRef={thumbRef} preview={thumbPreview} />
        </div>
        <div className="md:col-span-2"><Textarea label="Descrição" value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><SaveBtn loading={loading} label="Adicionar Entrevista" /></div>
      </form>
      <div className="space-y-3">
        {interviews.length === 0 && <p className="text-[#555] text-sm">Nenhuma entrevista cadastrada.</p>}
        {interviews.map((iv) => (
          <div key={iv.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]">
            <div className="flex items-center gap-3">
              {iv.thumbnail && <img src={iv.thumbnail} alt="" className="w-12 h-8 object-cover rounded" />}
              <div><p className="text-white font-semibold text-sm">{iv.name}</p><p className="text-[#555] text-xs">{iv.role} · {iv.date}</p></div>
            </div>
            <button onClick={() => { if(confirm("Remover?")) deleteInterview(iv.id!).then(load); }} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Foto Destaque ─────────────────────────────────────────────────────────────
function FeaturedPhotoSection() {
  const [featured, setFeatured] = useState<GalleryPhoto | null>(null);
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { getFeaturedPhoto().then((f) => { if (f) { setFeatured(f); setPreview(f.src); setAlt(f.alt); } }); }, []);
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setProgress(1);
    const result = await uploadToCloudinary(file, setProgress);
    await saveFeaturedPhoto({ src: result.url, alt, date: new Date().toISOString().split("T")[0] });
    setFeatured({ src: result.url, alt, date: new Date().toISOString().split("T")[0] });
    setFile(null); setProgress(0); setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleRemove = async () => {
    if (!confirm("Remover foto destaque?")) return;
    await deleteFeaturedPhoto();
    setFeatured(null); setPreview(null); setAlt("");
  };
  return (
    <Section title="Foto Destaque do Jogo" emoji="⭐">
      <p className="text-[#555] text-sm mb-4">Aparece em destaque no topo da galeria — ideal para o melhor momento ou jogador do dia.</p>
      {featured && (
        <div className="mb-6 relative rounded-xl overflow-hidden aspect-video max-w-sm">
          <img src={featured.src} alt={featured.alt} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <button onClick={handleRemove} className="bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Remover</button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-sm font-semibold">{featured.alt}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4">
        <UploadArea label={featured ? "Trocar foto destaque" : "Escolher foto destaque"} accept="image/*"
          onChange={(f) => { setFile(f?.[0] || null); if (f?.[0]) setPreview(URL.createObjectURL(f[0])); }}
          inputRef={inputRef} preview={file ? preview : null} />
        {file && <p className="text-red-400 text-xs">✓ {file.name} selecionada</p>}
        <ProgressBar pct={progress} label={`Enviando... ${progress}%`} />
        <Input label="Legenda da foto" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex: Gol do Marquinhos no último minuto!" required />
        <div className="flex items-center gap-4">
          <SaveBtn loading={loading} label="Salvar Destaque" />
          {saved && <span className="text-green-500 text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Galeria (máx 6) ──────────────────────────────────────────────────────────
function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [alt, setAlt] = useState("");
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const load = () => getGallery().then(setPhotos);
  useEffect(() => { load(); }, []);
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      setCurrent(i + 1); setProgress(0);
      const result = await uploadToCloudinary(files[i], setProgress);
      await addPhoto({ src: result.url, alt: alt || `Foto ${i + 1}`, date: new Date().toISOString().split("T")[0] });
    }
    setAlt(""); setFiles(null); setProgress(0); setCurrent(0);
    if (inputRef.current) inputRef.current.value = "";
    await load(); setLoading(false);
  };
  return (
    <Section title={`Galeria de Fotos (${photos.length}/6)`} emoji="📷">
      <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 mb-6 pb-6 border-b border-[#222]">
        <UploadArea label="Fotos do Jogo (pode selecionar várias)" accept="image/*" multiple onChange={(f) => setFiles(f)} inputRef={inputRef} preview={null} />
        {files && files.length > 0 && <p className="text-red-400 text-sm">✓ {files.length} foto{files.length > 1 ? "s" : ""} selecionada{files.length > 1 ? "s" : ""}</p>}
        {loading && <ProgressBar pct={progress} label={`Enviando foto ${current} de ${files?.length}... ${progress}%`} />}
        <Input label="Legenda (opcional)" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex: Jogo contra o Pelotão" />
        <div><SaveBtn loading={loading} label={loading ? `Enviando ${current}/${files?.length}...` : "Enviar Fotos"} /></div>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0D0D0D]">
            <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            <button onClick={() => { if(confirm("Remover?")) deletePhoto(photo.id!).then(load); }}
              className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs font-bold">Remover</button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-[#555] text-sm col-span-full">Nenhuma foto ainda.</p>}
      </div>
    </Section>
  );
}

// ─── Próximo Jogo ──────────────────────────────────────────────────────────────
function NextMatchSection() {
  const [data, setData] = useState<NextMatch>({ date: "", time: "", location: "" });
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
        <div className="md:col-span-2"><Input label="Local" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} required /></div>
        <div className="flex items-center gap-4">
          <SaveBtn loading={loading} />
          {saved && <span className="text-green-500 text-sm">✓ Salvo!</span>}
        </div>
      </form>
    </Section>
  );
}

// ─── Patrocinadores ────────────────────────────────────────────────────────────
function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState<Omit<Sponsor, "id">>({ name: "", tagline: "", contact: "", logoText: "", color: "#dc2626" });
  const [loading, setLoading] = useState(false);
  const load = () => getSponsors().then(setSponsors);
  useEffect(() => { load(); }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await addSponsor(form);
    setForm({ name: "", tagline: "", contact: "", logoText: "", color: "#dc2626" });
    await load(); setLoading(false);
  };
  return (
    <Section title="Patrocinadores" emoji="🤝">
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#222]">
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Slogan" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        <Input label="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <Input label="Iniciais do Logo" value={form.logoText} maxLength={3} onChange={(e) => setForm({ ...form, logoText: e.target.value.toUpperCase() })} required />
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
            <button onClick={() => { if(confirm("Remover?")) deleteSponsor(s.id!).then(load); }} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button>
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
  useEffect(() => { if (sessionStorage.getItem("admin_auth") === "1") setAuthed(true); setChecked(true); }, []);
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
        <ConfigSection />
        <ResenhaSection />
        <HighlightsSection />
        <InterviewsSection />
        <FeaturedPhotoSection />
        <GallerySection />
        <NextMatchSection />
        <SponsorsSection />
      </div>
    </div>
  );
}
