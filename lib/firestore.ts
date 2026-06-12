// lib/firestore.ts
// Versão sem Firebase Storage — usa links externos (YouTube, Google Fotos, etc.)

import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, setDoc, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Interview, LatestResenha, GalleryPhoto, NextMatch, Sponsor, SiteConfig } from "@/types";

// ─── CONFIG DO SITE ───────────────────────────────────────────────────────────
export async function getSiteConfig(): Promise<SiteConfig> {
  const snap = await getDoc(doc(db, "config", "site"));
  if (!snap.exists()) return { instagram: "resenhadocombinado" };
  return snap.data() as SiteConfig;
}
export async function saveSiteConfig(data: SiteConfig) {
  await setDoc(doc(db, "config", "site"), { ...data, updatedAt: serverTimestamp() });
}

// ─── RESENHAS ─────────────────────────────────────────────────────────────────
export async function getLatestResenha(): Promise<LatestResenha | null> {
  const q = query(collection(db, "resenhas"), orderBy("date", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as LatestResenha;
}
export async function saveResenha(data: Omit<LatestResenha, "id">, id?: string) {
  if (id) {
    await updateDoc(doc(db, "resenhas", id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, "resenhas"), { ...data, createdAt: serverTimestamp() });
  }
}

// ─── ENTREVISTAS ──────────────────────────────────────────────────────────────
export async function getInterviews(): Promise<Interview[]> {
  const q = query(collection(db, "interviews"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interview));
}
export async function addInterview(data: Omit<Interview, "id">) {
  await addDoc(collection(db, "interviews"), { ...data, createdAt: serverTimestamp() });
}
export async function deleteInterview(id: string) {
  await deleteDoc(doc(db, "interviews", id));
}

// ─── GALERIA ──────────────────────────────────────────────────────────────────
export async function getGallery(): Promise<GalleryPhoto[]> {
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryPhoto));
}
export async function addPhoto(data: Omit<GalleryPhoto, "id">) {
  await addDoc(collection(db, "gallery"), { ...data, createdAt: serverTimestamp() });
}
export async function deletePhoto(id: string) {
  await deleteDoc(doc(db, "gallery", id));
}

// ─── PRÓXIMO JOGO ─────────────────────────────────────────────────────────────
export async function getNextMatch(): Promise<NextMatch | null> {
  const snap = await getDoc(doc(db, "config", "nextMatch"));
  if (!snap.exists()) return null;
  return snap.data() as NextMatch;
}
export async function saveNextMatch(data: NextMatch) {
  await setDoc(doc(db, "config", "nextMatch"), { ...data, updatedAt: serverTimestamp() });
}

// ─── PATROCINADORES ───────────────────────────────────────────────────────────
export async function getSponsors(): Promise<Sponsor[]> {
  const snap = await getDocs(collection(db, "sponsors"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor));
}
export async function addSponsor(data: Omit<Sponsor, "id">) {
  await addDoc(collection(db, "sponsors"), { ...data, createdAt: serverTimestamp() });
}
export async function deleteSponsor(id: string) {
  await deleteDoc(doc(db, "sponsors", id));
}
