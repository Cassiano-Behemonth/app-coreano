/**
 * Utilitário de compressão e redimensionamento de fotos no cliente via HTML5 Canvas.
 * Reduz fotos de câmeras (5MB - 15MB) para strings DataURL leves (~150KB - 350KB),
 * preservando excelente qualidade visual para comprovantes e documentos.
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  mimeType: 'image/jpeg'
};

/**
 * Comprime uma imagem a partir de um arquivo File ou Blob
 */
export async function compressImageFile(
  file: File | Blob, 
  options: CompressionOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const compressed = compressImageElement(img, mergedOptions);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem para compressão'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem'));
    reader.readAsDataURL(file);
  });
}

/**
 * Comprime uma imagem a partir de uma string DataURL já carregada
 */
export async function compressDataUrl(
  dataUrl: string, 
  options: CompressionOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const compressed = compressImageElement(img, mergedOptions);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = dataUrl;
  });
}

/**
 * Redimensiona a imagem mantendo a proporção de aspecto e converte para Canvas
 */
function compressImageElement(
  img: HTMLImageElement, 
  options: CompressionOptions
): string {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.82, mimeType = 'image/jpeg' } = options;

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter contexto 2D do Canvas');
  }

  // Preenche fundo branco (caso imagem original tenha transparência PNG)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Renderiza a imagem redimensionada com interpolação de alta qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL(mimeType, quality);
}
