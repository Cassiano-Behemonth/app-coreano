import { createWorker } from 'tesseract.js';
import type { OCRQuickResult } from '../types';

export async function performQuickOCR(
  imageSource: string | File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<OCRQuickResult> {
  let worker;
  try {
    onProgress?.(15, 'Iniciando OCR local...');
    worker = await createWorker('por');

    onProgress?.(50, 'Processando imagem...');
    const result = await worker.recognize(imageSource);
    const rawText = result.data.text;

    onProgress?.(90, 'Identificando número da NF...');
    const numMatch = rawText.match(/(?:número\s*da\s*nota|nfs-e\s*n[º°o]?|nota\s*n[º°o]?|n[º°o]\s*da\s*nota)[:\s]*([0-9]{1,10})/i) ||
                     rawText.match(/(?:número|nº)[:\s]*([0-9]{3,10})/i);
    
    const invoiceNumber = numMatch && numMatch[1] ? numMatch[1].trim() : undefined;

    // Tenta sugerir um apelido baseado na primeira linha ou prestador
    const providerMatch = rawText.match(/(?:prestador\s*de\s*servi[çc]os?|raz[ãa]o\s*social|emitente)[:\s]*\n*([^\n\r]+)/i);
    const suggestedNickname = providerMatch && providerMatch[1] ? providerMatch[1].trim().substring(0, 30) : undefined;

    await worker.terminate();

    return {
      invoiceNumber,
      suggestedNickname,
      rawText
    };
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    console.error('Erro no OCR:', error);
    return { rawText: '' };
  }
}
