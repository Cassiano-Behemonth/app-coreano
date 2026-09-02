import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
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
 * Baixa as fotos diretamente para o armazenamento / pasta de downloads do celular ou PC
 */
export function downloadAlbumPhotos(
  album: NFAlbum, 
  selectedPhotos?: PhotoAttachment[]
): { success: boolean; message: string } {
  const photosToDownload = selectedPhotos && selectedPhotos.length > 0 
    ? selectedPhotos 
    : album.attachments;

  if (!photosToDownload || photosToDownload.length === 0) {
    return { success: false, message: 'Nenhuma foto para baixar.' };
  }

  const cleanName = (album.nickname || 'foto').replace(/[^a-zA-Z0-9_-]/g, '_');

  photosToDownload.forEach((photo, idx) => {
    const ext = photo.dataUrl.includes('image/png') ? 'png' : 'jpg';
    const cleanCaption = (photo.caption || `${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `${cleanName}_${cleanCaption}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  return { 
    success: true, 
    message: `${photosToDownload.length} foto(s) baixada(s) com sucesso!` 
  };
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

  const cleanName = (album.nickname || 'comprovante').replace(/[^a-zA-Z0-9_-]/g, '_');

  // 1. Capacitor Native (se estiver rodando como APK)
  if (Capacitor.isNativePlatform()) {
    try {
      const fileUris: string[] = [];

      for (let i = 0; i < photosToShare.length; i++) {
        const photo = photosToShare[i];
        const base64Data = photo.dataUrl.includes('base64,') 
          ? photo.dataUrl.split('base64,')[1] 
          : photo.dataUrl;

        const ext = photo.dataUrl.includes('image/png') ? 'png' : 'jpg';
        const fileName = `${cleanName}_foto_${i + 1}_${Date.now()}.${ext}`;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        fileUris.push(savedFile.uri);
      }

      await Share.share({
        title: album.nickname,
        text: `Fotos de ${album.nickname} ${album.invoiceNumber ? `(NF #${album.invoiceNumber})` : ''}`,
        files: fileUris,
        dialogTitle: 'Compartilhar fotos com...'
      });

      return { success: true, message: 'Compartilhado com sucesso!' };
    } catch (nativeErr: any) {
      if (nativeErr.message?.includes('canceled') || nativeErr.message?.includes('abort')) {
        return { success: false, message: 'Compartilhamento cancelado.' };
      }
      console.warn('Fallback para Web Share:', nativeErr);
    }
  }

  // 2. Web Share API (Navegador com HTTPS / Netlify)
  try {
    const files: File[] = photosToShare.map((photo, index) => {
      const ext = photo.dataUrl.includes('image/png') ? 'png' : 'jpg';
      const cleanCaption = (photo.caption || `${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_${cleanCaption}.${ext}`;
      return dataURLtoFile(photo.dataUrl, filename);
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        title: album.nickname,
        text: `Fotos: ${album.nickname}`,
        files: files
      });
      return { success: true, message: 'Fotos compartilhadas com sucesso!' };
    }
  } catch (webErr: any) {
    if (webErr.name === 'AbortError') {
      return { success: false, message: 'Compartilhamento cancelado.' };
    }
    console.warn('Web Share de arquivos não suportado neste ambiente, executando download:', webErr);
  }

  // 3. Fallback: Download automático
  return downloadAlbumPhotos(album, photosToShare);
}
