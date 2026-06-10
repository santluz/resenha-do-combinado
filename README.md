# ⚽ Resenha do Combinado

Landing page moderna para reunir entrevistas e momentos pós-jogo de grupos de futebol amador.

**Stack:** Next.js 15 · React · TypeScript · Tailwind CSS · Vercel

---

## 🚀 Deploy na Vercel (passo a passo)

### 1. Suba o projeto para o GitHub

```bash
git init
git add .
git commit -m "feat: landing page Resenha do Combinado"
git remote add origin https://github.com/SEU_USUARIO/resenha-do-combinado.git
git push -u origin main
```

### 2. Conecte à Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `resenha-do-combinado`
4. Mantenha as configurações padrão (Next.js é detectado automaticamente)
5. Clique em **"Deploy"**

Pronto! O site fica ao vivo em poucos minutos com HTTPS gratuito.

---

## 💻 Rodar localmente

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000

# Build de produção
npm run build
npm start
```

---

## 📁 Estrutura do projeto

```
resenha-do-combinado/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx          # Barra de navegação responsiva
│   │   ├── HeroSection.tsx     # Banner principal
│   │   ├── LatestResenha.tsx   # Último vídeo em destaque
│   │   ├── InterviewsGrid.tsx  # Grade de entrevistas
│   │   ├── GameGallery.tsx     # Galeria com lightbox
│   │   ├── NextMatch.tsx       # Próximo jogo
│   │   ├── Sponsors.tsx        # Patrocinadores
│   │   ├── AboutProject.tsx    # Sobre o projeto
│   │   └── Footer.tsx          # Rodapé
│   ├── globals.css
│   ├── layout.tsx              # Layout raiz + SEO
│   └── page.tsx                # Página principal
├── data/
│   ├── interviews.json         # Dados mockados de entrevistas
│   ├── latest-resenha.json     # Dados da última resenha
│   ├── gallery.json            # Fotos da galeria
│   └── match-sponsors.json     # Próximo jogo + patrocinadores
├── types/
│   └── index.ts                # Tipos TypeScript centralizados
└── next.config.ts
```

---

## 🔥 Integração com Firebase (futuro)

Os dados mockados estão em `data/*.json`. Para migrar para Firebase Firestore:

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Criar `lib/firebase.ts`

```ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```

### 3. Substituir dados mockados em `app/page.tsx`

```ts
// Antes (mock):
import interviewsData from "@/data/interviews.json";

// Depois (Firebase):
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const snap = await getDocs(
  query(collection(db, "interviews"), orderBy("date", "desc"), limit(6))
);
const interviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 4. Variáveis de ambiente na Vercel

No painel da Vercel → **Settings → Environment Variables**, adicione todas as variáveis `NEXT_PUBLIC_FIREBASE_*`.

---

## 🎨 Personalização rápida

| O que mudar | Onde |
|---|---|
| YouTube ID da última resenha | `data/latest-resenha.json` |
| Entrevistas | `data/interviews.json` |
| Fotos da galeria | `data/gallery.json` |
| Próximo jogo | `data/match-sponsors.json` |
| Patrocinadores | `data/match-sponsors.json` |
| Instagram do grupo | `app/components/Footer.tsx` + `Navbar.tsx` |
| Cor principal (verde) | `#1A7A3A` em qualquer componente |

---

## 👤 Produção

Desenvolvido por **Edson Santana** — [github.com/santluz](https://github.com/santluz)
