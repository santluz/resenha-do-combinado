"use client";
import { useState, useEffect, useRef } from "react";
import { getLatestResenha, saveResenha, deleteResenha, getInterviews, addInterview, deleteInterview, getHighlights, addHighlight, deleteHighlight, getGallery, addPhoto, deletePhoto, getFeaturedPhoto, saveFeaturedPhoto, deleteFeaturedPhoto, getNextMatch, saveNextMatch, getSponsors, addSponsor, deleteSponsor, getSiteConfig, saveSiteConfig } from "@/lib/firestore";
import { getConfigAposta, saveConfigAposta, getVotos, calcularResumo } from "@/lib/firestore-apostas";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Interview, Highlight, LatestResenha, GalleryPhoto, NextMatch, Sponsor, SiteConfig } from "@/types";
import type { ConfigAposta } from "@/types/apostas";

function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  if (pct <= 0 || pct >= 100) return null;
  return <div className="mt-2"><div className="w-full bg-[#222] rounded-full h-2"><div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div><p className="text-[#555] text-xs mt-1">{label || `${pct}%`}</p></div>;
}
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  const go = () => { if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) { sessionStorage.setItem("admin_auth","1"); onLogin(); } else { setErr(true); setTimeout(()=>setErr(false),2000); } };
  return <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4"><div className="bg-[#151515] border border-[#222] rounded-2xl p-10 w-full max-w-sm text-center"><div className="text-4xl mb-4">⚽</div><h1 className="text-white font-black text-2xl uppercase mb-1" style={{fontFamily:"'Bebas Neue',Impact,sans-serif"}}>Painel Admin</h1><p className="text-[#555] text-sm mb-8">Resenha do Combinado</p><input type="password" placeholder="Senha" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} className={`w-full bg-[#0D0D0D] border rounded-lg px-4 py-3 text-white text-sm mb-4 outline-none transition-colors ${err?"border-red-500":"border-[#333] focus:border-red-600"}`} />{err&&<p className="text-red-400 text-xs mb-3">Senha incorreta</p>}<button onClick={go} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">Entrar</button></div></div>;
}
function Section({title,emoji,children}:{title:string;emoji:string;children:React.ReactNode}) {
  return <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6"><h2 className="text-white font-black text-xl uppercase mb-6 flex items-center gap-2" style={{fontFamily:"'Bebas Neue',Impact,sans-serif"}}>{emoji} {title}</h2>{children}</div>;
}
function Input({label,tip,...props}:{label:string;tip?:string}&React.InputHTMLAttributes<HTMLInputElement>) {
  return <div><label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label><input {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />{tip&&<p className="text-[#444] text-xs mt-1">{tip}</p>}</div>;
}
function Textarea({label,...props}:{label:string}&React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <div><label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label><textarea {...props} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none" /></div>;
}
function SaveBtn({loading,label="Salvar"}:{loading:boolean;label?:string}) {
  return <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition-colors">{loading?"Aguarde...":label}</button>;
}
function UploadArea({label,accept,multiple,onChange,preview,inputRef}:{label:string;accept:string;multiple?:boolean;onChange:(f:FileList|null)=>void;preview?:string|null;inputRef:React.RefObject<HTMLInputElement|null>}) {
  return <div><label className="text-[#666] text-xs uppercase tracking-widest block mb-1">{label}</label><button type="button" onClick={()=>inputRef.current?.click()} className="w-full bg-[#0D0D0D] border-2 border-dashed border-[#333] hover:border-red-600 rounded-xl px-4 py-6 flex flex-col items-center gap-2 transition-colors group">{preview?<img src={preview} alt="preview" className="w-24 h-16 object-cover rounded-lg mb-1" />:<div className="w-12 h-12 rounded-full bg-red-600/10 group-hover:bg-red-600/20 flex items-center justify-center"><svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg></div>}<span className="text-[#666] group-hover:text-red-500 text-sm transition-colors">Toque para escolher</span></button><input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={e=>onChange(e.target.files)} className="hidden"/></div>;
}

// ─── Configurações ─────────────────────────────────────────────────────────────
function ConfigSection() {
  const [config,setConfig]=useState<SiteConfig>({instagram:"",logoUrl:"",comunicado:"",comunicadoAtivo:false});
  const [loading,setLoading]=useState(false); const [logoLoading,setLogoLoading]=useState(false); const [saved,setSaved]=useState(false); const [logoPreview,setLogoPreview]=useState<string|null>(null);
  const logoRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{getSiteConfig().then(c=>{setConfig(c);if(c.logoUrl)setLogoPreview(c.logoUrl);});},[]);
  const handleLogo=async(files:FileList|null)=>{const f=files?.[0];if(!f)return;setLogoLoading(true);setLogoPreview(URL.createObjectURL(f));const r=await uploadToCloudinary(f);setConfig(p=>({...p,logoUrl:r.url}));setLogoLoading(false);};
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);await saveSiteConfig(config);setLoading(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <Section title="Configurações do Site" emoji="⚙️"><form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
    <div><label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Logo do Grupo</label><div className="flex items-center gap-4">{logoPreview?<img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-red-600"/>:<div className="w-16 h-16 rounded-full bg-[#222] border-2 border-dashed border-[#444] flex items-center justify-center text-2xl">⚽</div>}<button type="button" onClick={()=>logoRef.current?.click()} disabled={logoLoading} className="bg-[#222] hover:bg-[#333] border border-[#444] text-white text-xs font-bold uppercase px-4 py-2.5 rounded-lg disabled:opacity-50">{logoLoading?"Enviando...":"Escolher Logo"}</button><input ref={logoRef} type="file" accept="image/*" onChange={e=>handleLogo(e.target.files)} className="hidden"/></div></div>
    <Input label="@ do Instagram" value={config.instagram} onChange={e=>setConfig({...config,instagram:e.target.value.replace("@","")})} placeholder="grupocombinadofutebol"/>
    <div><div className="flex items-center justify-between mb-2"><label className="text-[#666] text-xs uppercase tracking-widest">Comunicado</label><div onClick={()=>setConfig({...config,comunicadoAtivo:!config.comunicadoAtivo})} className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${config.comunicadoAtivo?"bg-red-600":"bg-[#333]"}`}><div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${config.comunicadoAtivo?"translate-x-4":""}`}/></div></div><textarea value={config.comunicado||""} onChange={e=>setConfig({...config,comunicado:e.target.value})} placeholder="Ex: Jogo cancelado!" rows={2} className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none resize-none"/></div>
    <div className="flex items-center gap-4"><SaveBtn loading={loading} label="Salvar Configurações"/>{saved&&<span className="text-green-500 text-sm">✓ Salvo!</span>}</div>
  </form></Section>;
}

// ─── Apostas Admin Section ─────────────────────────────────────────────────────
function ApostasSection() {
  const emptyConfig: ConfigAposta = { jogoId: "", ativo: false, encerrado: false, valorAposta: 5, timeA: "", timeB: "", jogadoresTimeA: [], jogadoresTimeB: [] };
  const [config, setConfig] = useState<ConfigAposta>(emptyConfig);
  const [novoJA, setNovoJA] = useState(""); const [novoJB, setNovoJB] = useState("");
  const [loading, setLoading] = useState(false); const [saved, setSaved] = useState(false);
  const [resumoPG, setResumoPG] = useState<any[]>([]); const [resumoV, setResumoV] = useState<any[]>([]);
  const [totalPG, setTotalPG] = useState(0); const [totalV, setTotalV] = useState(0);
  const [showEncerrar, setShowEncerrar] = useState(false); const [pg, setPg] = useState(""); const [vc, setVc] = useState("");

  useEffect(() => {
    getConfigAposta().then(c => {
      if (c) {
        setConfig({ ...{ jogadoresTimeA: [], jogadoresTimeB: [], valorAposta: 5 }, ...c });
        if (c.jogoId) {
          const jogadores = [...(c.jogadoresTimeA||[]).map((j: string) => ({ nome: j, time: c.timeA })), ...(c.jogadoresTimeB||[]).map((j: string) => ({ nome: j, time: c.timeB }))];
          getVotos(c.jogoId, "primeiro_gol").then(v => { setTotalPG(v.length); setResumoPG(calcularResumo(v, jogadores, c.resultadoPrimeiroGol)); });
          getVotos(c.jogoId, "vencedor").then(v => { setTotalV(v.length); setResumoV(calcularResumo(v, [{ nome: c.timeA }, { nome: c.timeB }], c.resultadoVencedor)); });
        }
      }
    });
  }, []);

  const save = async () => { setLoading(true); await saveConfigAposta(config); setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const novoJogo = () => { setConfig({ ...emptyConfig, jogoId: `jogo_${Date.now()}`, ativo: true }); setResumoPG([]); setResumoV([]); setTotalPG(0); setTotalV(0); };
  const encerrar = async () => {
    if (!pg || !vc) return;
    const u = { ...config, encerrado: true, resultadoPrimeiroGol: pg, resultadoVencedor: vc };
    setConfig(u); await saveConfigAposta(u); setSaved(true); setTimeout(() => setSaved(false), 2000); setShowEncerrar(false);
  };

  const todosJogadores = [...(config.jogadoresTimeA||[]).map(j => ({ nome: j, time: config.timeA })), ...(config.jogadoresTimeB||[]).map(j => ({ nome: j, time: config.timeB }))];

  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl uppercase flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>🍺 Apostas do Jogo</h2>
        <button onClick={novoJogo} className="bg-[#222] hover:bg-[#333] border border-[#444] text-white text-xs font-bold uppercase px-4 py-2 rounded-lg transition-colors">+ Novo Jogo</button>
      </div>

      {!config.jogoId ? <p className="text-[#555] text-sm">Clique em "+ Novo Jogo" para configurar as apostas.</p> : <>
        {/* Status */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#0D0D0D] rounded-xl border border-[#1C1C1C]">
          <div className={`w-3 h-3 rounded-full ${config.encerrado ? "bg-[#555]" : config.ativo ? "bg-green-400 animate-pulse" : "bg-[#555]"}`} />
          <span className="text-white text-sm font-semibold flex-1">{config.encerrado ? "Encerradas" : config.ativo ? "Apostas Abertas" : "Desativadas"}</span>
          {!config.encerrado && <>
            <button onClick={() => setConfig({ ...config, ativo: true })} className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${config.ativo ? "bg-[#222] text-[#555]" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}>Ativar</button>
            <button onClick={() => setConfig({ ...config, ativo: false })} className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${!config.ativo ? "bg-[#222] text-[#555]" : "bg-red-600/20 text-red-400 hover:bg-red-600/30"}`}>Pausar</button>
          </>}
        </div>

        {!config.encerrado && <div className="space-y-5 mb-6">
          {/* Valor */}
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Valor da Aposta (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] text-sm font-bold">R$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="5,00"
                defaultValue={config.valorAposta ? config.valorAposta.toFixed(2).replace(".", ",") : ""}
                key={config.jogoId}
                onBlur={e => {
                  const raw = e.target.value.replace(/[^\d,\.]/g, "").replace(",", ".");
                  const num = parseFloat(raw) || 0;
                  e.target.value = num.toFixed(2).replace(".", ",");
                  setConfig({ ...config, valorAposta: num });
                }}
                className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none transition-colors"
              />
            </div>
            <p className="text-[#444] text-xs mt-1">Ex: 5,00 · 10,50 · 20,00</p>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">🔴 Nome do Time A</label>
              <input value={config.timeA} onChange={e => setConfig({ ...config, timeA: e.target.value })} placeholder="Ex: Azulão" className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">🔵 Nome do Time B</label>
              <input value={config.timeB} onChange={e => setConfig({ ...config, timeB: e.target.value })} placeholder="Ex: Verdão" className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
            </div>
          </div>

          {/* Jogadores Time A */}
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">🔴 Jogadores do {config.timeA || "Time A"} ({(config.jogadoresTimeA||[]).length})</label>
            <div className="flex gap-2 mb-2">
              <input value={novoJA} onChange={e => setNovoJA(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { if (novoJA.trim()) { setConfig({ ...config, jogadoresTimeA: [...(config.jogadoresTimeA||[]), novoJA.trim()] }); setNovoJA(""); } } }}
                placeholder="Nome do jogador" className="flex-1 bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
              <button onClick={() => { if (novoJA.trim()) { setConfig({ ...config, jogadoresTimeA: [...(config.jogadoresTimeA||[]), novoJA.trim()] }); setNovoJA(""); } }} className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 rounded-lg">+ Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{(config.jogadoresTimeA||[]).map((j, i) => <span key={i} className="flex items-center gap-1.5 bg-red-600/10 border border-red-600/30 text-red-400 text-xs px-3 py-1.5 rounded-full">{j}<button onClick={() => setConfig({ ...config, jogadoresTimeA: (config.jogadoresTimeA||[]).filter((_, idx) => idx !== i) })} className="hover:text-white ml-1">×</button></span>)}</div>
          </div>

          {/* Jogadores Time B */}
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">🔵 Jogadores do {config.timeB || "Time B"} ({(config.jogadoresTimeB||[]).length})</label>
            <div className="flex gap-2 mb-2">
              <input value={novoJB} onChange={e => setNovoJB(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { if (novoJB.trim()) { setConfig({ ...config, jogadoresTimeB: [...(config.jogadoresTimeB||[]), novoJB.trim()] }); setNovoJB(""); } } }}
                placeholder="Nome do jogador" className="flex-1 bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
              <button onClick={() => { if (novoJB.trim()) { setConfig({ ...config, jogadoresTimeB: [...(config.jogadoresTimeB||[]), novoJB.trim()] }); setNovoJB(""); } }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 rounded-lg">+ Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{(config.jogadoresTimeB||[]).map((j, i) => <span key={i} className="flex items-center gap-1.5 bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs px-3 py-1.5 rounded-full">{j}<button onClick={() => setConfig({ ...config, jogadoresTimeB: (config.jogadoresTimeB||[]).filter((_, idx) => idx !== i) })} className="hover:text-white ml-1">×</button></span>)}</div>
          </div>
        </div>}

        {/* Votos em tempo real */}
        {(totalPG > 0 || totalV > 0) && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0D0D0D] rounded-xl border border-[#1C1C1C] p-4">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">⚽ Primeiro Gol — {totalPG} votos · Pote: R$ {(totalPG * config.valorAposta).toFixed(2).replace(".", ",")}</p>
            <div className="space-y-2">{resumoPG.map(r => <div key={r.voto} className="flex items-center justify-between"><div><span className={`text-sm ${r.acertou ? "text-[#F5C518] font-bold" : "text-white"}`}>{r.voto}</span>{r.time && <span className="text-[#444] text-xs ml-2">({r.time})</span>}</div><div className="flex items-center gap-2"><div className="w-16 bg-[#222] rounded-full h-1.5"><div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${r.percentual}%` }} /></div><span className="text-[#555] text-xs w-8 text-right">{r.percentual}%</span></div></div>)}</div>
          </div>
          <div className="bg-[#0D0D0D] rounded-xl border border-[#1C1C1C] p-4">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">🏆 Vencedor — {totalV} votos · Pote: R$ {(totalV * config.valorAposta).toFixed(2).replace(".", ",")}</p>
            <div className="space-y-2">{resumoV.map(r => <div key={r.voto} className="flex items-center justify-between"><span className={`text-sm ${r.acertou ? "text-[#F5C518] font-bold" : "text-white"}`}>{r.voto}</span><div className="flex items-center gap-2"><div className="w-16 bg-[#222] rounded-full h-1.5"><div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${r.percentual}%` }} /></div><span className="text-[#555] text-xs w-8 text-right">{r.percentual}%</span></div></div>)}</div>
          </div>
        </div>}

        {/* Encerrar */}
        {config.ativo && !config.encerrado && !showEncerrar && (
          <button onClick={() => setShowEncerrar(true)} className="w-full border border-dashed border-[#444] hover:border-[#F5C518] text-[#555] hover:text-[#F5C518] text-sm font-semibold py-3 rounded-xl transition-colors mb-4">🏁 Encerrar e registrar resultado</button>
        )}
        {showEncerrar && <div className="bg-[#0D0D0D] border border-[#F5C518]/30 rounded-xl p-5 space-y-4 mb-4">
          <p className="text-[#F5C518] text-sm font-bold uppercase tracking-widest">🏁 Registrar Resultado</p>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Quem fez o primeiro gol?</label>
            <select value={pg} onChange={e => setPg(e.target.value)} className="w-full bg-[#151515] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm outline-none">
              <option value="">Selecione...</option>
              {todosJogadores.map(j => <option key={j.nome} value={j.nome}>{j.nome} ({j.time})</option>)}
              <option value="Ninguém">Ninguém (0 x 0)</option>
            </select>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Quem venceu?</label>
            <select value={vc} onChange={e => setVc(e.target.value)} className="w-full bg-[#151515] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm outline-none">
              <option value="">Selecione...</option>
              <option value={config.timeA}>{config.timeA}</option>
              <option value={config.timeB}>{config.timeB}</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={encerrar} disabled={!pg || !vc} className="flex-1 bg-[#F5C518] hover:bg-yellow-400 disabled:opacity-50 text-black font-black uppercase text-xs py-3 rounded-lg">Confirmar</button>
            <button onClick={() => setShowEncerrar(false)} className="px-4 bg-[#222] hover:bg-[#333] text-[#888] text-xs font-bold uppercase rounded-lg">Cancelar</button>
          </div>
        </div>}

        {!config.encerrado && <div className="flex items-center gap-4">
          <button onClick={save} disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg">{loading ? "Salvando..." : "Salvar Apostas"}</button>
          {saved && <span className="text-green-500 text-sm">✓ Salvo!</span>}
        </div>}
      </>}
    </div>
  );
}


// ─── Última Entrevista ─────────────────────────────────────────────────────────
function ResenhaSection() {
  const [data,setData]=useState<LatestResenha>({youtubeId:"",title:"",date:"",description:"",matchStats:{goals:"",opponent:"",location:""}});
  const [videoFile,setVideoFile]=useState<File|null>(null); const [progress,setProgress]=useState(0); const [loading,setLoading]=useState(false); const [saved,setSaved]=useState(false); const [useYt,setUseYt]=useState(true); const [deleting,setDeleting]=useState(false);
  const videoRef=useRef<HTMLInputElement>(null);
  const load = () => getLatestResenha().then(r=>{if(r){setData(r);setUseYt(!r.videoUrl);}});
  useEffect(()=>{load();},[]);
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);let d={...data};if(!useYt&&videoFile){setProgress(1);const r=await uploadToCloudinary(videoFile,setProgress);d={...d,youtubeId:"",videoUrl:r.url};}await saveResenha(d,(d as any).id);setProgress(0);setVideoFile(null);setLoading(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const handleDelete=async()=>{if(!confirm("Remover esta entrevista?"))return;if(!(data as any).id)return;setDeleting(true);await deleteResenha((data as any).id);setData({youtubeId:"",title:"",date:"",description:"",matchStats:{goals:"",opponent:"",location:""}});setDeleting(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const temConteudo = !!(data as any).id;
  return <Section title="Última Entrevista" emoji="🎬">
    {/* Preview do vídeo atual */}
    {temConteudo && (
      <div className="mb-6 bg-[#0D0D0D] border border-[#1C1C1C] rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Entrevista atual</p>
            <p className="text-white font-semibold text-sm">{data.title}</p>
            <p className="text-[#555] text-xs mt-1">{data.date} · {data.videoUrl ? "📱 vídeo próprio" : `📺 YouTube: ${data.youtubeId}`}</p>
          </div>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-shrink-0 bg-red-600/10 hover:bg-red-600 border border-red-600/50 hover:border-red-600 text-red-500 hover:text-white text-xs font-bold uppercase px-4 py-2.5 rounded-lg transition-all disabled:opacity-50">
            {deleting ? "Removendo..." : "🗑 Deletar"}
          </button>
        </div>
        {/* Mini preview do vídeo */}
        {(data.youtubeId || data.videoUrl) && (
          <div className="mt-3 relative w-full max-w-xs aspect-video rounded-lg overflow-hidden bg-black">
            {data.videoUrl
              ? <video src={data.videoUrl} className="w-full h-full object-cover" />
              : <img src={`https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`} alt={data.title} className="w-full h-full object-cover" />}
          </div>
        )}
      </div>
    )}
    <div className="flex gap-3 mb-6">{["youtube","upload"].map(m=><button key={m} type="button" onClick={()=>setUseYt(m==="youtube")} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${(m==="youtube")===useYt?"bg-red-600 border-red-600 text-white":"bg-transparent border-[#333] text-[#666]"}`}>{m==="youtube"?"📺 YouTube":"📱 Celular"}</button>)}</div>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {useYt?<div className="md:col-span-2"><Input label="ID do YouTube" tip="Parte depois de ?v=" value={data.youtubeId||""} onChange={e=>setData({...data,youtubeId:e.target.value})} placeholder="Ex: ABC123xyz"/></div>
        :<div className="md:col-span-2"><UploadArea label="Vídeo" accept="video/*" onChange={f=>setVideoFile(f?.[0]||null)} inputRef={videoRef} preview={null}/>{videoFile&&<p className="text-red-400 text-xs mt-1">✓ {videoFile.name}</p>}<ProgressBar pct={progress} label={`Enviando... ${progress}%`}/></div>}
      <Input label="Título" value={data.title} onChange={e=>setData({...data,title:e.target.value})} required/>
      <Input label="Data" type="date" value={data.date} onChange={e=>setData({...data,date:e.target.value})} required/>
      <Input label="Placar" value={data.matchStats.goals} onChange={e=>setData({...data,matchStats:{...data.matchStats,goals:e.target.value}})} placeholder="4 x 1"/>
      <Input label="Adversário" value={data.matchStats.opponent} onChange={e=>setData({...data,matchStats:{...data.matchStats,opponent:e.target.value}})}/>
      <div className="md:col-span-2"><Input label="Local" value={data.matchStats.location} onChange={e=>setData({...data,matchStats:{...data.matchStats,location:e.target.value}})}/></div>
      <div className="md:col-span-2"><Textarea label="Descrição" value={data.description} rows={3} onChange={e=>setData({...data,description:e.target.value})}/></div>
      <div className="md:col-span-2 flex items-center gap-4"><SaveBtn loading={loading} label={temConteudo ? "Atualizar" : "Salvar"}/>{saved&&<span className="text-green-500 text-sm">✓ {temConteudo ? "Atualizado!" : "Salvo!"}</span>}</div>
    </form>
  </Section>;
}

// ─── Highlights ────────────────────────────────────────────────────────────────
function HighlightsSection() {
  const [list,setList]=useState<Highlight[]>([]); const [form,setForm]=useState<Omit<Highlight,"id">>({title:"",date:"",youtubeId:"",videoUrl:"",description:""});
  const [useYt,setUseYt]=useState(true); const [vf,setVf]=useState<File|null>(null); const [prog,setProg]=useState(0); const [loading,setLoading]=useState(false);
  const vRef=useRef<HTMLInputElement>(null);
  const load=()=>getHighlights().then(setList);
  useEffect(()=>{load();},[]);
  const handleAdd=async(e:React.FormEvent)=>{e.preventDefault();if(list.length>=6){alert("Máximo 6");return;}setLoading(true);let f={...form};if(!useYt&&vf){setProg(1);const r=await uploadToCloudinary(vf,setProg);f={...f,videoUrl:r.url,youtubeId:""};}await addHighlight(f);setForm({title:"",date:"",youtubeId:"",videoUrl:"",description:""});setVf(null);setProg(0);await load();setLoading(false);};
  return <Section title={`Melhores Momentos (${list.length}/6)`} emoji="🎯">
    <div className="flex gap-3 mb-6">{["youtube","upload"].map(m=><button key={m} type="button" onClick={()=>setUseYt(m==="youtube")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase border transition-colors ${(m==="youtube")===useYt?"bg-red-600 border-red-600 text-white":"bg-transparent border-[#333] text-[#666]"}`}>{m==="youtube"?"📺 YouTube":"📱 Celular"}</button>)}</div>
    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
      <Input label="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
      <Input label="Data" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
      {useYt?<div className="md:col-span-2"><Input label="ID do YouTube" value={form.youtubeId||""} onChange={e=>setForm({...form,youtubeId:e.target.value})} placeholder="Ex: ABC123xyz" required={useYt}/></div>
        :<div className="md:col-span-2"><UploadArea label="Vídeo" accept="video/*" onChange={f=>setVf(f?.[0]||null)} inputRef={vRef} preview={null}/>{vf&&<p className="text-red-400 text-xs mt-1">✓ {vf.name}</p>}<ProgressBar pct={prog} label={`Enviando... ${prog}%`}/></div>}
      <div className="md:col-span-2"><Textarea label="Descrição" value={form.description} rows={2} onChange={e=>setForm({...form,description:e.target.value})}/></div>
      <div><SaveBtn loading={loading} label={list.length>=6?"Limite atingido":"Adicionar"}/></div>
    </form>
    <div className="space-y-3">{list.length===0&&<p className="text-[#555] text-sm">Nenhum highlight.</p>}{list.map(h=><div key={h.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]"><div><p className="text-white font-semibold text-sm">{h.title}</p><p className="text-[#555] text-xs">{h.date}</p></div><button onClick={()=>{if(confirm("Remover?"))deleteHighlight(h.id!).then(load);}} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button></div>)}</div>
  </Section>;
}

// ─── Entrevistas ───────────────────────────────────────────────────────────────
function InterviewsSection() {
  const [list,setList]=useState<Interview[]>([]); const [form,setForm]=useState<Omit<Interview,"id">>({name:"",role:"",date:"",thumbnail:"",youtubeId:"",description:""});
  const [useYt,setUseYt]=useState(true); const [vf,setVf]=useState<File|null>(null); const [tf,setTf]=useState<File|null>(null); const [tp,setTp]=useState<string|null>(null); const [prog,setProg]=useState(0); const [loading,setLoading]=useState(false);
  const vRef=useRef<HTMLInputElement>(null); const tRef=useRef<HTMLInputElement>(null);
  const load=()=>getInterviews().then(setList);
  useEffect(()=>{load();},[]);
  const handleAdd=async(e:React.FormEvent)=>{e.preventDefault();if(list.length>=2){alert("Máximo 2");return;}setLoading(true);let f={...form};if(!useYt&&vf){setProg(1);const r=await uploadToCloudinary(vf,setProg);f={...f,youtubeId:"",videoUrl:r.url} as any;}if(tf){const r=await uploadToCloudinary(tf);f={...f,thumbnail:r.url};}else if(useYt&&form.youtubeId){f={...f,thumbnail:`https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`};}await addInterview(f);setForm({name:"",role:"",date:"",thumbnail:"",youtubeId:"",description:""});setVf(null);setTf(null);setTp(null);setProg(0);await load();setLoading(false);};
  return <Section title={`Entrevistas (${list.length}/2)`} emoji="🎙">
    <div className="flex gap-3 mb-6">{["youtube","upload"].map(m=><button key={m} type="button" onClick={()=>setUseYt(m==="youtube")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase border transition-colors ${(m==="youtube")===useYt?"bg-red-600 border-red-600 text-white":"bg-transparent border-[#333] text-[#666]"}`}>{m==="youtube"?"📺 YouTube":"📱 Celular"}</button>)}</div>
    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
      <Input label="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
      <Input label="Posição" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} required/>
      <Input label="Data" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
      {useYt?<Input label="ID do YouTube" value={form.youtubeId||""} onChange={e=>setForm({...form,youtubeId:e.target.value})} placeholder="ABC123xyz" required={useYt}/>
        :<div><UploadArea label="Vídeo (vertical)" accept="video/*" onChange={f=>setVf(f?.[0]||null)} inputRef={vRef} preview={null}/>{vf&&<p className="text-red-400 text-xs mt-1">✓ {vf.name}</p>}<ProgressBar pct={prog}/></div>}
      <div className="md:col-span-2"><UploadArea label="Foto de Capa (opcional)" accept="image/*" onChange={f=>{setTf(f?.[0]||null);if(f?.[0])setTp(URL.createObjectURL(f[0]));}} inputRef={tRef} preview={tp}/></div>
      <div className="md:col-span-2"><Textarea label="Descrição" value={form.description} rows={2} onChange={e=>setForm({...form,description:e.target.value})}/></div>
      <div><SaveBtn loading={loading} label="Adicionar Entrevista"/></div>
    </form>
    <div className="space-y-3">{list.length===0&&<p className="text-[#555] text-sm">Nenhuma entrevista.</p>}{list.map(iv=><div key={iv.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]"><div className="flex items-center gap-3">{iv.thumbnail&&<img src={iv.thumbnail} alt="" className="w-12 h-8 object-cover rounded"/>}<div><p className="text-white font-semibold text-sm">{iv.name}</p><p className="text-[#555] text-xs">{iv.role} · {iv.date}</p></div></div><button onClick={()=>{if(confirm("Remover?"))deleteInterview(iv.id!).then(load);}} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button></div>)}</div>
  </Section>;
}

// ─── Foto Destaque ─────────────────────────────────────────────────────────────
function FeaturedPhotoSection() {
  const [feat,setFeat]=useState<GalleryPhoto|null>(null); const [alt,setAlt]=useState(""); const [file,setFile]=useState<File|null>(null); const [preview,setPreview]=useState<string|null>(null); const [prog,setProg]=useState(0); const [loading,setLoading]=useState(false); const [saved,setSaved]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{getFeaturedPhoto().then(f=>{if(f){setFeat(f);setPreview(f.src);setAlt(f.alt);}});},[]);
  const handleUpload=async(e:React.FormEvent)=>{e.preventDefault();if(!file)return;setLoading(true);setProg(1);const r=await uploadToCloudinary(file,setProg);await saveFeaturedPhoto({src:r.url,alt,date:new Date().toISOString().split("T")[0]});setFeat({src:r.url,alt,date:""});setFile(null);setProg(0);setLoading(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <Section title="Foto Destaque" emoji="⭐">
    <p className="text-[#555] text-sm mb-4">Aparece em destaque na galeria — jogador do dia, gol especial, etc.</p>
    {feat&&<div className="mb-6 relative rounded-xl overflow-hidden aspect-video max-w-sm"><img src={feat.src} alt={feat.alt} className="w-full h-full object-cover"/><div className="absolute top-2 right-2"><button onClick={async()=>{if(confirm("Remover?"))await deleteFeaturedPhoto().then(()=>{setFeat(null);setPreview(null);setAlt("");});}} className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Remover</button></div><div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3"><p className="text-white text-sm font-semibold">{feat.alt}</p></div></div>}
    <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4">
      <UploadArea label={feat?"Trocar foto destaque":"Escolher foto destaque"} accept="image/*" onChange={f=>{setFile(f?.[0]||null);if(f?.[0])setPreview(URL.createObjectURL(f[0]));}} inputRef={ref} preview={file?preview:null}/>
      {file&&<p className="text-red-400 text-xs">✓ {file.name}</p>}
      <ProgressBar pct={prog} label={`Enviando... ${prog}%`}/>
      <Input label="Legenda" value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Ex: Gol do Marquinhos no último minuto!" required/>
      <div className="flex items-center gap-4"><SaveBtn loading={loading} label="Salvar Destaque"/>{saved&&<span className="text-green-500 text-sm">✓ Salvo!</span>}</div>
    </form>
  </Section>;
}

// ─── Galeria ───────────────────────────────────────────────────────────────────
function GallerySection() {
  const [photos,setPhotos]=useState<GalleryPhoto[]>([]); const [files,setFiles]=useState<FileList|null>(null); const [alt,setAlt]=useState(""); const [prog,setProg]=useState(0); const [cur,setCur]=useState(0); const [loading,setLoading]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  const load=()=>getGallery().then(setPhotos);
  useEffect(()=>{load();},[]);
  const handleUpload=async(e:React.FormEvent)=>{e.preventDefault();if(!files||files.length===0)return;setLoading(true);for(let i=0;i<files.length;i++){setCur(i+1);setProg(0);const r=await uploadToCloudinary(files[i],setProg);await addPhoto({src:r.url,alt:alt||`Foto ${i+1}`,date:new Date().toISOString().split("T")[0]});}setAlt("");setFiles(null);setProg(0);setCur(0);if(ref.current)ref.current.value="";await load();setLoading(false);};
  return <Section title={`Galeria (${photos.length}/6)`} emoji="📷">
    <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 mb-6 pb-6 border-b border-[#222]">
      <UploadArea label="Fotos (pode selecionar várias)" accept="image/*" multiple onChange={f=>setFiles(f)} inputRef={ref} preview={null}/>
      {files&&files.length>0&&<p className="text-red-400 text-sm">✓ {files.length} foto{files.length>1?"s":""} selecionada{files.length>1?"s":""}</p>}
      {loading&&<ProgressBar pct={prog} label={`Enviando foto ${cur} de ${files?.length}... ${prog}%`}/>}
      <Input label="Legenda (opcional)" value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Ex: Jogo contra o Pelotão"/>
      <div><SaveBtn loading={loading} label={loading?`Enviando ${cur}/${files?.length}...`:"Enviar Fotos"}/></div>
    </form>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">{photos.map(p=><div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0D0D0D]"><img src={p.src} alt={p.alt} className="w-full h-full object-cover"/><button onClick={()=>{if(confirm("Remover?"))deletePhoto(p.id!).then(load);}} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs font-bold">Remover</button></div>)}{photos.length===0&&<p className="text-[#555] text-sm col-span-full">Nenhuma foto.</p>}</div>
  </Section>;
}

// ─── Próximo Jogo ──────────────────────────────────────────────────────────────
function NextMatchSection() {
  const [data,setData]=useState<NextMatch>({date:"",time:"",location:""}); const [loading,setLoading]=useState(false); const [saved,setSaved]=useState(false);
  useEffect(()=>{getNextMatch().then(m=>{if(m)setData(m);});},[]);
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);await saveNextMatch(data);setLoading(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <Section title="Próximo Jogo" emoji="📅"><form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Data" type="date" value={data.date} onChange={e=>setData({...data,date:e.target.value})} required/>
    <Input label="Horário" type="time" value={data.time} onChange={e=>setData({...data,time:e.target.value})} required/>
    <div className="md:col-span-2"><Input label="Local" value={data.location} onChange={e=>setData({...data,location:e.target.value})} required/></div>
    <div className="flex items-center gap-4"><SaveBtn loading={loading}/>{saved&&<span className="text-green-500 text-sm">✓ Salvo!</span>}</div>
  </form></Section>;
}

// ─── Patrocinadores ────────────────────────────────────────────────────────────
function SponsorsSection() {
  const [list,setList]=useState<Sponsor[]>([]); const [form,setForm]=useState<Omit<Sponsor,"id">>({name:"",tagline:"",contact:"",logoText:"",color:"#dc2626"}); const [loading,setLoading]=useState(false);
  const load=()=>getSponsors().then(setList);
  useEffect(()=>{load();},[]);
  const handleAdd=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);await addSponsor(form);setForm({name:"",tagline:"",contact:"",logoText:"",color:"#dc2626"});await load();setLoading(false);};
  return <Section title="Patrocinadores" emoji="🤝">
    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#222]">
      <Input label="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
      <Input label="Slogan" value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})}/>
      <Input label="Contato" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/>
      <Input label="Iniciais" value={form.logoText} maxLength={3} onChange={e=>setForm({...form,logoText:e.target.value.toUpperCase()})} required/>
      <div><label className="text-[#666] text-xs uppercase tracking-widest block mb-1">Cor</label><input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} className="w-full h-10 rounded-lg border border-[#333] bg-[#0D0D0D] cursor-pointer"/></div>
      <div className="flex items-end"><SaveBtn loading={loading} label="Adicionar"/></div>
    </form>
    <div className="space-y-3">{list.length===0&&<p className="text-[#555] text-sm">Nenhum.</p>}{list.map(s=><div key={s.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg px-4 py-3 border border-[#1C1C1C]"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{backgroundColor:s.color}}>{s.logoText}</div><div><p className="text-white font-semibold text-sm">{s.name}</p><p className="text-[#555] text-xs">{s.tagline}</p></div></div><button onClick={()=>{if(confirm("Remover?"))deleteSponsor(s.id!).then(load);}} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Remover</button></div>)}</div>
  </Section>;
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed,setAuthed]=useState(false); const [checked,setChecked]=useState(false);
  useEffect(()=>{if(sessionStorage.getItem("admin_auth")==="1")setAuthed(true);setChecked(true);},[]);
  if(!checked)return null;
  if(!authed)return <LoginScreen onLogin={()=>setAuthed(true)}/>;
  return <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-white font-black text-4xl uppercase" style={{fontFamily:"'Bebas Neue',Impact,sans-serif"}}>⚽ Painel Admin</h1><p className="text-[#555] text-sm">Resenha do Combinado</p></div>
        <div className="flex items-center gap-4"><a href="/" className="text-[#555] hover:text-white text-sm transition-colors">← Ver Site</a><button onClick={()=>{sessionStorage.removeItem("admin_auth");setAuthed(false);}} className="text-[#555] hover:text-red-400 text-sm transition-colors">Sair</button></div>
      </div>
      <ConfigSection/>
      <ApostasSection/>
      <ResenhaSection/>
      <HighlightsSection/>
      <InterviewsSection/>
      <FeaturedPhotoSection/>
      <GallerySection/>
      <NextMatchSection/>
      <SponsorsSection/>
    </div>
  </div>;
}
