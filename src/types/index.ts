export interface PhotoAttachment {
  id: string;
  dataUrl: string; // Base64 da imagem
  caption?: string; // ex: "#1", "#1b", etc.
  parentPhotoId?: string; // id da foto pai se for variante
  createdAt: number;
}

export interface NFAlbum {
  id: string;
  nickname: string; // Apelido da organização (ex: "Reforma Escritório", "Conserto Ar")
  invoiceNumber?: string; // Número da NF (opcional)
  category: string; // Pasta (ex: "Manutenção", "Reforma", ou pasta personalizada criada pelo usuário)
  attachments: PhotoAttachment[]; // Fotos e comprovantes
  createdAt: number;
  updatedAt: number;
}
