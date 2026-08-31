export interface PhotoAttachment {
  id: string;
  dataUrl: string; // Base64 image
  caption?: string;
  createdAt: number;
}

export interface NFAlbum {
  id: string;
  nickname: string; // Apelido da organização (ex: "Reforma Escritório", "Conserto Ar", "Troca Peças")
  invoiceNumber?: string; // Número da NF (opcional / lido pelo OCR)
  category: string; // Categoria / Pasta (ex: "Manutenção", "Reforma", "Serviços", "Geral")
  totalAmount?: number; // Valor (opcional)
  attachments: PhotoAttachment[]; // Fotos e comprovantes vinculados
  createdAt: number;
  updatedAt: number;
}

export interface OCRQuickResult {
  invoiceNumber?: string;
  suggestedNickname?: string;
  rawText: string;
}
