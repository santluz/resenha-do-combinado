"use client";
import { useState, useEffect } from "react";
import { getVotos, registrarVoto, jaVotou, calcularResumo } from "@/lib/firestore-apostas";
import type { ConfigAposta, ResumoAposta } from "@/types/apostas";

interface Props { config: ConfigAposta; }

function CardAposta({ titulo, emoji, tipo, opcoes, jogoId, encerrado, resultado, nomeVotante, onVotou }: {
  titulo: string; emoji: string; tipo: "primeiro_gol" | "vencedor";
  opcoes: string[]; jogoId: string; encerrado: boolean;
  resultado?: string; nomeVotante: string; onVotou: () => void;
}) {
  const [resumo, setResumo] = useState<ResumoAposta[]>([]);
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

  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-red-600/20 to-transparent border-b border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h3 className="text-white font-black uppercase text-lg" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{titulo}</h3>
              <p className="text-[#555] text-xs">{totalVotos} voto{totalVotos !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {jaEnc ? <span className="bg-[#F5C518] text-black text-xs font-black uppercase px-3 py-1 rounded-full">Encerrado</span>
            : <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Aberto</span>}
        </div>
      </div>
      <div className="p-6">
        {jaEnc && (
          <div className="mb-4 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl p-4 text-center">
            <p className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-1">🏆 Resultado</p>
            <p className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{resultado}</p>
          </div>
        )}
        <div className="space-y-3">
          {(resumo.length > 0 ? resumo : opcoes.map(o => ({ voto: o, total: 0, percentual: 0 }))).map((item) => {
            const isVotado = votado && meuVoto === item.voto;
            const acertou = jaEnc && item.voto === resultado;
            const errou = jaEnc && votado && meuVoto === item.voto && item.voto !== resultado;
            return !votado && !encerrado ? (
              <button key={item.voto} onClick={() => handleVotar(item.voto)} disabled={loading}
                className="w-full text-left bg-[#0D0D0D] hover:bg-red-600/10 border border-[#333] hover:border-red-600 rounded-xl px-4 py-3 text-white font-semibold text-sm transition-all disabled:opacity-50">
                {item.voto}
              </button>
            ) : (
              <div key={item.voto} className={`rounded-xl overflow-hidden border ${acertou ? "border-[#F5C518]" : isVotado ? "border-red-600" : "border-[#222]"}`}>
                <div className="relative bg-[#0D0D0D] px-4 py-3">
                  <div className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ${acertou ? "bg-[#F5C518]/20" : isVotado ? "bg-red-600/20" : "bg-[#1C1C1C]"}`} style={{ width: `${item.percentual}%` }} />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${acertou ? "text-[#F5C518]" : isVotado ? "text-red-400" : "text-white"}`}>{item.voto}</span>
                      {isVotado && !jaEnc && <span className="text-red-400 text-xs">← seu voto</span>}
                      {acertou && <span className="text-[#F5C518] text-xs font-bold">✓ acertou!</span>}
                      {errou && <span className="text-red-400 text-xs">✗ errou</span>}
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
        {votado && !encerrado && <div className="mt-4 text-center"><p className="text-green-400 text-sm font-semibold">✓ Seu voto em <strong>{meuVoto}</strong> foi registrado!</p></div>}
      </div>
    </div>
  );
}

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

  return (
    <section id="apostas" className="bg-[#0D0D0D] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[#F5C518] text-sm font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "1rem" }}>🍺 Apostas do Jogo</span>
          <div className="flex-1 h-px bg-[#1C1C1C]" />
        </div>
        <p className="text-[#555] text-sm mb-10">{config.encerrado ? "Apostas encerradas — veja quem acertou!" : `Faça sua aposta para o jogo contra ${config.adversario}!`}</p>

        {!nomeConfirmado ? (
          <div className="max-w-md mx-auto mb-10 bg-[#151515] border border-[#222] rounded-2xl p-6 text-center">
            <p className="text-2xl mb-3">✍️</p>
            <h3 className="text-white font-black uppercase text-xl mb-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Como você se chama?</h3>
            <p className="text-[#555] text-sm mb-4">Digite seu nome para participar das apostas</p>
            <input type="text" placeholder="Seu nome ou apelido" value={nomeVotante}
              onChange={(e) => setNomeVotante(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmarNome()}
              className="w-full bg-[#0D0D0D] border border-[#333] focus:border-red-600 rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors mb-4" />
            <button onClick={confirmarNome} disabled={!nomeVotante.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors">
              Entrar nas Apostas
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-8">
            <p className="text-[#555] text-sm">Apostando como: <span className="text-white font-bold">{nomeConfirmado}</span></p>
            <button onClick={() => { setNomeConfirmado(""); localStorage.removeItem("nome_votante"); }} className="text-[#444] hover:text-[#888] text-xs transition-colors">Trocar nome</button>
          </div>
        )}

        {nomeConfirmado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardAposta titulo="Primeiro Gol" emoji="⚽" tipo="primeiro_gol" opcoes={config.jogadores} jogoId={config.jogoId} encerrado={config.encerrado} resultado={config.resultadoPrimeiroGol} nomeVotante={nomeConfirmado} onVotou={() => setVotouAlguma(true)} />
            <CardAposta titulo="Time Vencedor" emoji="🏆" tipo="vencedor" opcoes={["Combinado", config.adversario, "Empate"]} jogoId={config.jogoId} encerrado={config.encerrado} resultado={config.resultadoVencedor} nomeVotante={nomeConfirmado} onVotou={() => setVotouAlguma(true)} />
          </div>
        )}
        {votouAlguma && !config.encerrado && <p className="text-center text-[#444] text-sm mt-8">🍺 Quem errar paga a rodada!</p>}
      </div>
    </section>
  );
}
