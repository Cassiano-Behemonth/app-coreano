import Dexie, { type Table } from 'dexie';
import type { NFAlbum } from '../types';
import { createRealDeviceFolder, savePhotoToRealDeviceFolder, deleteRealDeviceFolder } from './deviceStorage';

export interface FolderItem {
  id: string;
  name: string;
  createdAt: number;
}

export class ChongiDatabase extends Dexie {
  albums!: Table<NFAlbum, string>;
  folders!: Table<FolderItem, string>;

  constructor() {
    super('ChongiPhotoDB_v5');
    this.version(5).stores({
      albums: 'id, nickname, invoiceNumber, category, createdAt',
      folders: 'id, name, createdAt'
    });
  }
}

export const db = new ChongiDatabase();

// --- Álbuns / Registros ---
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
  const folderName = album.category?.trim() || 'Minhas Fotos';
  await createRealDeviceFolder(folderName);
  await ensureFolderExists(folderName);

  if (album.attachments && album.attachments.length > 0) {
    const savePromises = album.attachments.map(async (att, idx) => {
      const ext = att.dataUrl.includes('image/png') ? 'png' : 'jpg';
      const cleanNick = (album.nickname || 'foto').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${cleanNick}_${idx + 1}.${ext}`;
      await savePhotoToRealDeviceFolder(folderName, fileName, att.dataUrl);
    });
    await Promise.all(savePromises);
  }

  await db.albums.put(album);
  return album.id;
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.albums.delete(id);
}

// --- Pastas Dinâmicas ---
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

/**
 * Remove a pasta, seu diretório físico no celular e opcionalmente seus registros
 */
export async function deleteFolderAndContents(folderName: string): Promise<void> {
  const clean = folderName.trim();
  if (!clean) return;

  // 1. Remove os álbuns vinculados a essa pasta
  const linkedAlbums = await db.albums.where('category').equalsIgnoreCase(clean).toArray();
  for (const album of linkedAlbums) {
    await db.albums.delete(album.id);
  }

  // 2. Remove o registro da pasta no banco
  await db.folders.where('name').equalsIgnoreCase(clean).delete();

  // 3. Remove a pasta física do celular
  await deleteRealDeviceFolder(clean);
}
