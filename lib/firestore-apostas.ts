// lib/firestore-apostas.ts
import { collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Aposta, ConfigAposta } from "@/types/apostas";

export async function getConfigAposta(): Promise<ConfigAposta | null> {
  try {
    const snap = await getDoc(doc(db, "config", "aposta"));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ConfigAposta;
  } catch { return null; }
}

export async function saveConfigAposta(data: Omit<ConfigAposta, "id">) {
  await setDoc(doc(db, "config", "aposta"), { ...data, updatedAt: serverTimestamp() });
}

export async function jaVotou(jogoId: string, tipo: string, nomeVotante: string): Promise<boolean> {
  try {
    const q = query(collection(db, "apostas"), where("jogoId", "==", jogoId), where("tipo", "==", tipo), where("nomeVotante", "==", nomeVotante.trim().toLowerCase()));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch { return false; }
}

export async function registrarVoto(aposta: Omit<Aposta, "id">) {
  await addDoc(collection(db, "apostas"), {
    ...aposta,
    nomeVotante: aposta.nomeVotante.trim().toLowerCase(),
    criadoEm: serverTimestamp(),
  });
}

export async function getVotos(jogoId: string, tipo: "primeiro_gol" | "vencedor"): Promise<Aposta[]> {
  try {
    const q = query(collection(db, "apostas"), where("jogoId", "==", jogoId), where("tipo", "==", tipo));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Aposta));
  } catch { return []; }
}

// Aceita tanto string[] quanto {nome, time}[] para compatibilidade
export function calcularResumo(
  votos: Aposta[],
  opcoes: (string | { nome: string; time?: string })[],
  resultado?: string
): { voto: string; time?: string; total: number; percentual: number; acertou?: boolean }[] {
  const total = votos.length;
  return (opcoes || []).map(opcao => {
    const nome = typeof opcao === "string" ? opcao : opcao.nome;
    const time = typeof opcao === "string" ? undefined : opcao.time;
    const count = votos.filter(v => v.voto === nome).length;
    return {
      voto: nome,
      time,
      total: count,
      percentual: total > 0 ? Math.round((count / total) * 100) : 0,
      acertou: resultado ? nome === resultado : undefined,
    };
  });
}
