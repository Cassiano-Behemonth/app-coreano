import type { PhotoAttachment } from '../types';

/**
 * Formata a legenda da foto para exibição limpa (ex: "Foto #1" vira "#1", "#1b" permanece "#1b")
 */
export function formatPhotoCaption(caption?: string, fallbackIndex?: number): string {
  if (!caption) {
    return typeof fallbackIndex === 'number' ? `#${fallbackIndex + 1}` : '#1';
  }
  return caption.replace(/^Foto\s*/i, '').trim();
}

/**
 * Extrai o número base de uma legenda (ex: "#1" -> 1, "#1b" -> 1, "Foto #4" -> 4)
 */
export function getBaseNumber(caption?: string): number | null {
  if (!caption) return null;
  const match = caption.match(/#?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Calcula a próxima legenda para uma nova foto principal (ex: "#1", "#2", "#3"...)
 */
export function getNextMainCaption(attachments: PhotoAttachment[] = []): string {
  let maxNum = 0;
  for (const att of attachments) {
    const num = getBaseNumber(att.caption);
    if (num && num > maxNum) {
      maxNum = num;
    }
  }
  return `#${maxNum + 1}`;
}

/**
 * Calcula a próxima legenda para uma variante de uma foto selecionada.
 * Se a foto for #1, a primeira variante é #1b, depois #1c, #1d, etc.
 */
export function getNextVariantCaption(
  parentPhoto: PhotoAttachment,
  allAttachments: PhotoAttachment[] = []
): string {
  const baseNum = getBaseNumber(parentPhoto.caption) || 1;
  const prefix = `#${baseNum}`;

  // Busca variantes já existentes dessa foto pai ou com prefixo #baseNum + letra
  const variantLetters: string[] = [];

  for (const att of allAttachments) {
    const isLinked = att.parentPhotoId && att.parentPhotoId === parentPhoto.id;
    const cleanCap = formatPhotoCaption(att.caption);
    const hasPrefix = cleanCap.startsWith(prefix) && cleanCap !== prefix;

    if (isLinked || hasPrefix) {
      const suffix = cleanCap.slice(prefix.length).toLowerCase().trim();
      if (/^[a-z]+$/.test(suffix)) {
        variantLetters.push(suffix);
      }
    }
  }

  if (variantLetters.length === 0) {
    return `${prefix}b`;
  }

  // Ordena alfabeticamente para pegar o último sufixo utilizado
  variantLetters.sort();
  const lastSuffix = variantLetters[variantLetters.length - 1];

  // Incrementa a letra (b -> c -> d -> ...)
  const charCode = lastSuffix.charCodeAt(lastSuffix.length - 1);
  if (charCode >= 122) { // 'z'
    return `${prefix}z${String.fromCharCode(98)}`; // fallback caso exceda z
  }

  const nextLetter = String.fromCharCode(charCode + 1);
  return `${prefix}${nextLetter}`;
}

export interface PhotoGroup {
  mainPhoto: PhotoAttachment;
  variants: PhotoAttachment[];
}

/**
 * Agrupa fotos para garantir que cada foto principal e suas variantes apareçam juntas lado a lado.
 */
export function groupPhotosByMain(allPhotos: PhotoAttachment[]): PhotoGroup[] {
  const groups: PhotoGroup[] = [];
  const processedVariantIds = new Set<string>();

  for (let i = 0; i < allPhotos.length; i++) {
    const photo = allPhotos[i];
    if (processedVariantIds.has(photo.id)) continue;

    const cleanCap = formatPhotoCaption(photo.caption, i);
    const isVariant = Boolean(photo.parentPhotoId) || /#[0-9]+[a-z]$/i.test(cleanCap);

    if (!isVariant) {
      const baseNum = getBaseNumber(photo.caption) || (i + 1);
      const prefix = `#${baseNum}`;

      const variants = allPhotos.filter(p => {
        if (p.id === photo.id) return false;
        if (p.parentPhotoId && p.parentPhotoId === photo.id) return true;
        const pClean = formatPhotoCaption(p.caption);
        return pClean.startsWith(prefix) && pClean !== prefix && /#[0-9]+[a-z]$/i.test(pClean);
      });

      variants.forEach(v => processedVariantIds.add(v.id));
      groups.push({ mainPhoto: photo, variants });
    } else {
      groups.push({ mainPhoto: photo, variants: [] });
    }
  }

  return groups;
}
