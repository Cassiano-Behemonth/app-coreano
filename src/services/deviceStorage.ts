import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const BASE_DIR = 'NFSe_Manager';

/**
 * Cria uma pasta física real no armazenamento do celular (Documents/NFSe_Manager/<folderName>)
 */
export async function createRealDeviceFolder(folderName: string): Promise<string> {
  const cleanName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '_');
  if (!cleanName) return '';

  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.mkdir({
        path: `${BASE_DIR}/${cleanName}`,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (err) {
      console.warn('Pasta física já existe ou erro ao criar diretório:', err);
    }
  }

  return cleanName;
}

/**
 * Salva uma foto real dentro da pasta física no celular
 */
export async function savePhotoToRealDeviceFolder(
  folderName: string, 
  fileName: string, 
  base64DataUrl: string
): Promise<string> {
  const cleanFolder = folderName.trim().replace(/[/\\?%*:|"<>]/g, '_');
  const cleanFile = fileName.trim().replace(/[/\\?%*:|"<>]/g, '_');

  if (Capacitor.isNativePlatform()) {
    try {
      await createRealDeviceFolder(cleanFolder);

      const rawBase64 = base64DataUrl.includes('base64,') 
        ? base64DataUrl.split('base64,')[1] 
        : base64DataUrl;

      const result = await Filesystem.writeFile({
        path: `${BASE_DIR}/${cleanFolder}/${cleanFile}`,
        data: rawBase64,
        directory: Directory.Documents,
        recursive: true
      });

      return result.uri;
    } catch (err) {
      console.error('Erro ao gravar foto no diretório físico:', err);
    }
  }

  return base64DataUrl;
}

/**
 * Exclui a pasta física real e seus arquivos do celular
 */
export async function deleteRealDeviceFolder(folderName: string): Promise<void> {
  const cleanName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '_');
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.rmdir({
        path: `${BASE_DIR}/${cleanName}`,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (err) {
      console.warn('Erro ao remover diretório físico:', err);
    }
  }
}
