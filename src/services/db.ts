import Dexie, { type Table } from 'dexie';
import type { NFAlbum } from '../types';
import { createRealDeviceFolder, savePhotoToRealDeviceFolder } from './deviceStorage';

export interface FolderItem {
  id: string;
  name: string;
  createdAt: number;
}

export class NFSePhotoDatabase extends Dexie {
  albums!: Table<NFAlbum, string>;
  folders!: Table<FolderItem, string>;

  constructor() {
    super('NFSePhotoDB_v4');
    this.version(4).stores({
      albums: 'id, nickname, invoiceNumber, category, createdAt',
      folders: 'id, name, createdAt'
    });
  }
}

export const db = new NFSePhotoDatabase();

// --- Álbuns / Organizações ---
export async function getAllAlbums(): Promise<NFAlbum[]> {
  try {
    return await db.albums.orderBy('createdAt').reverse().toArray();
  } catch (error) {
    console.error('Erro ao buscar álbuns locais:', error);
    return [];
  }
}

export async function getAlbumById(id: string): Promise<NFAlbum | undefined> {
  return await db.albums.get(id);
}

export async function saveAlbum(album: NFAlbum): Promise<string> {
  // Cria a pasta física real no celular
  const folderName = album.category?.trim() || 'Minhas Fotos';
  await createRealDeviceFolder(folderName);
  await ensureFolderExists(folderName);

  // Grava cada foto na pasta física do aparelho em background
  if (album.attachments && album.attachments.length > 0) {
    album.attachments.forEach(async (att, idx) => {
      const ext = att.dataUrl.includes('image/png') ? 'png' : 'jpg';
      const cleanNick = (album.nickname || 'comprovante').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${cleanNick}_${idx + 1}.${ext}`;
      await savePhotoToRealDeviceFolder(folderName, fileName, att.dataUrl);
    });
  }

  await db.albums.put(album);
  return album.id;
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.albums.delete(id);
}

// --- Pastas Dinâmicas Criadas pelo Usuário ---
export async function getAllFolders(): Promise<string[]> {
  try {
    const list = await db.folders.orderBy('name').toArray();
    const folderNames = list.map(f => f.name.trim()).filter(Boolean);
    const albumCategories = (await db.albums.toArray())
      .map(a => a.category?.trim())
      .filter(Boolean);

    const unique = Array.from(new Set([...folderNames, ...albumCategories]));
    return unique;
  } catch (error) {
    console.error('Erro ao buscar pastas:', error);
    return [];
  }
}

export async function createCustomFolder(name: string): Promise<string> {
  const clean = name.trim();
  if (!clean) return '';

  // Cria pasta física real no celular
  await createRealDeviceFolder(clean);

  const existing = await db.folders.where('name').equalsIgnoreCase(clean).first();
  if (!existing) {
    await db.folders.add({
      id: 'folder_' + Date.now() + Math.random().toString(36).substring(2, 5),
      name: clean,
      createdAt: Date.now()
    });
  }

  return clean;
}

export async function ensureFolderExists(name: string): Promise<void> {
  await createCustomFolder(name);
}

export async function deleteFolder(folderName: string): Promise<void> {
  await db.folders.where('name').equalsIgnoreCase(folderName.trim()).delete();
}
