import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, setDoc, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Interview, LatestResenha, GalleryPhoto, NextMatch, Sponsor } from "@/types";

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

export async function getInterviews(): Promise<Interview[]> {
  const q = query(collection(db, "interviews"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interview));
}

export async function addInterview(data: Omit<Interview, "id">) {
  await addDoc(collection(db, "interviews"), { ...data, createdAt: serverTimestamp() });
}

export async function updateInterview(id: string, data: Partial<Interview>) {
  await updateDoc(doc(db, "interviews", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteInterview(id: string) {
  await deleteDoc(doc(db, "interviews", id));
}

export async function getGallery(): Promise<GalleryPhoto[]> {
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryPhoto));
}

export async function uploadPhoto(file: File, alt: string): Promise<void> {
  const filename = `gallery/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await addDoc(collection(db, "gallery"), {
    src: url, alt, storagePath: filename,
    date: new Date().toISOString().split("T")[0],
    createdAt: serverTimestamp(),
  });
}

export async function deletePhoto(id: string, storagePath: string) {
  await deleteDoc(doc(db, "gallery", id));
  try { await deleteObject(ref(storage, storagePath)); } catch {}
}

export async function getNextMatch(): Promise<NextMatch | null> {
  const snap = await getDoc(doc(db, "config", "nextMatch"));
  if (!snap.exists()) return null;
  return snap.data() as NextMatch;
}

export async function saveNextMatch(data: NextMatch) {
  await setDoc(doc(db, "config", "nextMatch"), { ...data, updatedAt: serverTimestamp() });
}

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