// lib/cloudinary.ts
// Upload de arquivos para o Cloudinary via upload não assinado (unsigned)
// Não requer backend — funciona direto do navegador/celular

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = "resenha_unsigned"; // preset criado no Cloudinary

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
};

/**
 * Faz upload de imagem ou vídeo para o Cloudinary com progresso
 * @param file - arquivo do input
 * @param onProgress - callback com percentual 0-100
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const resourceType = file.type.startsWith("video") ? "video" : "image";
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "resenha-do-combinado");

    const xhr = new XMLHttpRequest();

    // Progresso do upload
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType,
        });
      } else {
        reject(new Error(`Upload falhou: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Erro de rede no upload")));
    xhr.open("POST", url);
    xhr.send(formData);
  });
}
