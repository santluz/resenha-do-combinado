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
  await addDoc(collection(db, "apostas"), { ...aposta, nomeVotante: aposta.nomeVotante.trim().toLowerCase(), criadoEm: serverTimestamp() });
}
export async function getVotos(jogoId: string, tipo: "primeiro_gol" | "vencedor"): Promise<Aposta[]> {
  try {
    const q = query(collection(db, "apostas"), where("jogoId", "==", jogoId), where("tipo", "==", tipo));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Aposta));
  } catch { return []; }
}
export function calcularResumo(votos: Aposta[], opcoes: string[], resultado?: string) {
  const total = votos.length;
  return opcoes.map(opcao => ({
    voto: opcao,
    total: votos.filter(v => v.voto === opcao).length,
    percentual: total > 0 ? Math.round((votos.filter(v => v.voto === opcao).length / total) * 100) : 0,
    acertou: resultado ? opcao === resultado : undefined,
  }));
}
