import type { NFAlbum, PhotoAttachment } from '../types';

/**
 * Converte uma imagem em formato DataURL (Base64) em um objeto File real
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Compartilha as fotos reais diretamente com qualquer aplicativo (WhatsApp, Drive, Email, etc.)
 */
export async function shareAlbumPhotos(
  album: NFAlbum, 
  selectedPhotos?: PhotoAttachment[]
): Promise<{ success: boolean; message: string }> {
  const photosToShare = selectedPhotos && selectedPhotos.length > 0 
    ? selectedPhotos 
    : album.attachments;

  if (!photosToShare || photosToShare.length === 0) {
    return { success: false, message: 'Nenhuma foto para compartilhar.' };
  }

  try {
    const files: File[] = photosToShare.map((photo, index) => {
      const ext = photo.dataUrl.includes('image/png') ? 'png' : 'jpg';
      const cleanName = (album.nickname || 'comprovante').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_foto_${index + 1}.${ext}`;
      return dataURLtoFile(photo.dataUrl, filename);
    });

    // 1. Tenta compartilhamento nativo no celular com os arquivos de imagem reais
    if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
      try {
        await navigator.share({
          title: album.nickname,
          text: `Fotos de ${album.nickname} ${album.invoiceNumber ? `(NF #${album.invoiceNumber})` : ''}`,
          files: files
        });
        return { success: true, message: 'Fotos compartilhadas com sucesso!' };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: true, message: 'Compartilhamento cancelado.' };
        }
        console.warn('Erro ao compartilhar via Web Share:', err);
      }
    }

    // 2. Fallback: Baixa as fotos no aparelho
    photosToShare.forEach((photo, idx) => {
      const link = document.createElement('a');
      link.href = photo.dataUrl;
      link.download = `${(album.nickname || 'foto').replace(/[^a-zA-Z0-9_-]/g, '_')}_${idx + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    return { success: true, message: `${photosToShare.length} foto(s) baixada(s) no aparelho!` };
  } catch (error) {
    console.error('Erro ao compartilhar fotos:', error);
    return { success: false, message: 'Não foi possível compartilhar as fotos.' };
  }
}
