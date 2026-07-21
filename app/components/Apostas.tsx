"use client";
// components/Apostas.tsx — Sistema de apostas com times A e B, valor fixo, sem empate

import { useState, useEffect } from "react";
import { getVotos, registrarVoto, jaVotou, calcularResumo } from "@/lib/firestore-apostas";
import type { ConfigAposta } from "@/types/apostas";

interface Props { config: ConfigAposta; }

// ─── Card de aposta ────────────────────────────────────────────────────────────
function CardAposta({ titulo, emoji, tipo, opcoes, jogoId, encerrado, resultado, nomeVotante, valorAposta, onVotou }: {
  titulo: string; emoji: string; tipo: "primeiro_gol" | "vencedor";
  opcoes: { nome: string; time?: string }[];
  jogoId: string; encerrado: boolean; resultado?: string;
  nomeVotante: string; valorAposta: number; onVotou: () => void;
}) {
  const [resumo, setResumo] = useState<{ voto: string; time?: string; total: number; percentual: number; acertou?: boolean }[]>([]);
  const [votado, setVotado] = useState(false);
  const [meuVoto, setMeuVoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalVotos, setTotalVotos] = useState(0);

  const carregar = async () => {
    const votos = await getVotos(jogoId, tipo);
    setTotalVotos(votos.length);
    setResumo(calcularResumo(votos, opcoes, resultado));
  };

  useEffect(() => {
    carregar();
    const chave = `voto_${jogoId}_${tipo}_${nomeVotante.toLowerCase()}`;
    const salvo = localStorage.getItem(chave);
    if (salvo) { setVotado(true); setMeuVoto(salvo); }
  }, [jogoId, tipo, nomeVotante, resultado]);

  const handleVotar = async (opcao: string) => {
    if (!nomeVotante.trim()) return;
    setLoading(true);
    try {
      const jv = await jaVotou(jogoId, tipo, nomeVotante);
      if (jv) { setVotado(true); alert("Você já votou!"); setLoading(false); return; }
      await registrarVoto({ jogoId, tipo, nomeVotante, voto: opcao });
      localStorage.setItem(`voto_${jogoId}_${tipo}_${nomeVotante.toLowerCase()}`, opcao);
      setVotado(true); setMeuVoto(opcao);
      await carregar(); onVotou();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const jaEnc = encerrado && resultado;
  const totalValor = (totalVotos * valorAposta).toFixed(2).replace(".", ",");

  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/20 to-transparent border-b border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h3 className="text-white font-black uppercase text-lg" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{titulo}</h3>
              <p className="text-[#555] text-xs">{totalVotos} voto{totalVotos !== 1 ? "s" : ""} · Pote: <span className="text-[#F5C518] font-bold">R$ {totalValor}</span></p>
            </div>
          </div>
          {jaEnc
            ? <span className="bg-[#F5C518] text-black text-xs font-black uppercase px-3 py-1 rounded-full">Encerrado</span>
            : <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Aberto
              </span>}
        </div>
      </div>

      <div className="p-6">
        {/* Valor da aposta */}
        <div className="flex items-center justify-center gap-2 mb-5 bg-[#0D0D0D] rounded-xl py-3 border border-[#1C1C1C]">
          <span className="text-[#555] text-sm">Valor da aposta:</span>
          <span className="text-[#F5C518] font-black text-xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
            R$ {valorAposta.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* Resultado se encerrado */}
        {jaEnc && (
          <div className="mb-4 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl p-4 text-center">
            <p className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-1">🏆 Resultado</p>
            <p className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{resultado}</p>
          </div>
        )}

        {/* Opções de voto */}
        <div className="space-y-3">
          {(resumo.length > 0 ? resumo : opcoes.map(o => ({ voto: o.nome, time: o.time, total: 0, percentual: 0 }))).map((item) => {
            const isVotado = votado && meuVoto === item.voto;
            const acertou = jaEnc && item.voto === resultado;
            const errou = jaEnc && votado && meuVoto === item.voto && item.voto !== resultado;
            const ganho = acertou && isVotado ? (totalVotos * valorAposta).toFixed(2).replace(".", ",") : null;

            return !votado && !encerrado ? (
              <button key={item.voto} onClick={() => handleVotar(item.voto)} disabled={loading}
                className="w-full text-left bg-[#0D0D0D] hover:bg-red-600/10 border border-[#333] hover:border-red-600 rounded-xl px-4 py-3 transition-all disabled:opacity-50 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-[#F5C518] transition-colors">{item.voto}</p>
                    {item.time && <p className="text-[#555] text-xs mt-0.5">👕 {item.time}</p>}
                  </div>
                  <svg className="w-4 h-4 text-[#444] group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </button>
            ) : (
              <div key={item.voto} className={`rounded-xl overflow-hidden border ${acertou ? "border-[#F5C518]" : isVotado ? "border-red-600" : "border-[#222]"}`}>
                <div className="relative bg-[#0D0D0D] px-4 py-3">
                  <div className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ${acertou ? "bg-[#F5C518]/20" : isVotado ? "bg-red-600/20" : "bg-[#1C1C1C]"}`} style={{ width: `${item.percentual}%` }} />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${acertou ? "text-[#F5C518]" : isVotado ? "text-red-400" : "text-white"}`}>{item.voto}</span>
                        {isVotado && !jaEnc && <span className="text-red-400 text-xs">← seu voto</span>}
                        {acertou && <span className="text-[#F5C518] text-xs font-bold">✓ acertou!</span>}
                        {errou && <span className="text-red-400 text-xs">✗ errou</span>}
                      </div>
                      {item.time && <p className="text-[#555] text-xs mt-0.5">👕 {item.time}</p>}
                      {ganho && <p className="text-[#F5C518] text-xs font-bold mt-1">🏆 Você ganha R$ {ganho}!</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#555] text-xs">{item.total} voto{item.total !== 1 ? "s" : ""}</span>
                      <span className={`font-black text-sm ${acertou ? "text-[#F5C518]" : "text-white"}`}>{item.percentual}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {votado && !encerrado && (
          <div className="mt-4 text-center">
            <p className="text-green-400 text-sm font-semibold">✓ Voto em <strong>{meuVoto}</strong> registrado!</p>
            <p className="text-[#555] text-xs mt-1">🍺 Quem errar paga R$ {valorAposta.toFixed(2).replace(".", ",")}!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Seção principal ───────────────────────────────────────────────────────────
export default function Apostas({ config }: Props) {
  const [nomeVotante, setNomeVotante] = useState("");
  const [nomeConfirmado, setNomeConfirmado] = useState("");
  const [votouAlguma, setVotouAlguma] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("nome_votante");
    if (salvo) { setNomeVotante(salvo); setNomeConfirmado(salvo); }
  }, []);

  const confirmarNome = () => {
    if (!nomeVotante.trim()) return;
    localStorage.setItem("nome_votante", nomeVotante.trim());
    setNomeConfirmado(nomeVotante.trim());
  };

  if (!config.ativo && !config.encerrado) return null;

  // Monta lista de jogadores com seus times
  const jogadoresComTime = [
    ...config.jogadoresTimeA.map(j => ({ nome: j, time: config.timeA })),
    ...config.jogadoresTimeB.map(j => ({ nome: j, time: config.timeB })),
  ];

  return (
    <section id="apostas" className="bg-[#0D0D0D] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>
            🍺 Apostas do Jogo
          </span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
          {/* Confronto */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase">
            <span className="text-red-400">{config.timeA}</span>
            <span className="text-[#444]">vs</span>
            <span className="text-blue-400">{config.timeB}</span>
          </div>
        </div>

        <p className="text-[#555] text-sm mb-10">
          {config.encerrado
            ? "Apostas encerradas — veja quem acertou e quanto vai pagar! 🍺"
            : `Aposte R$ ${config.valorAposta.toFixed(2).replace(".", ",")} — ${config.timeA} vs ${config.timeB}`}
        </p>

        {/* Input nome */}
        {!nomeConfirmado ? (
          <div className="max-w-md mx-auto mb-10 bg-[#151515] border border-[#222] rounded-2xl p-6 text-center">
            <p className="text-2xl mb-3">✍️</p>
            <h3 className="text-white font-black uppercase text-xl mb-2"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Como você se chama?</h3>
            <p className="text-[#555] text-sm mb-4">Digite seu nome para participar — cada um paga R$ {config.valorAposta.toFixed(2).replace(".", ",")}</p>
            <input type="text" placeholder="Seu nome ou apelido" value={nomeVotante}
              onChange={(e) => setNomeVotante(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmarNome()}
              className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors mb-4" />
            <button onClick={confirmarNome} disabled={!nomeVotante.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">
              Entrar nas Apostas 🍺
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-8">
            <p className="text-[#555] text-sm">Apostando como: <span className="text-white font-bold">{nomeConfirmado}</span></p>
            <button onClick={() => { setNomeConfirmado(""); localStorage.removeItem("nome_votante"); }}
              className="text-[#444] hover:text-[#888] text-xs transition-colors">Trocar nome</button>
          </div>
        )}

        {/* Cards de aposta */}
        {nomeConfirmado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardAposta
              titulo="Primeiro Gol" emoji="⚽" tipo="primeiro_gol"
              opcoes={jogadoresComTime}
              jogoId={config.jogoId} encerrado={config.encerrado}
              resultado={config.resultadoPrimeiroGol}
              nomeVotante={nomeConfirmado} valorAposta={config.valorAposta}
              onVotou={() => setVotouAlguma(true)}
            />
            <CardAposta
              titulo="Time Vencedor" emoji="🏆" tipo="vencedor"
              opcoes={[{ nome: config.timeA }, { nome: config.timeB }]}
              jogoId={config.jogoId} encerrado={config.encerrado}
              resultado={config.resultadoVencedor}
              nomeVotante={nomeConfirmado} valorAposta={config.valorAposta}
              onVotou={() => setVotouAlguma(true)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
