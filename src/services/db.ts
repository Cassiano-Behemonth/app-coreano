import Dexie, { type Table } from 'dexie';
import type { NFAlbum } from '../types';

export interface FolderItem {
  id: string;
  name: string;
  createdAt: number;
}

export class NFSePhotoDatabase extends Dexie {
  albums!: Table<NFAlbum, string>;
  folders!: Table<FolderItem, string>;

  constructor() {
    super('NFSePhotoDB_v3');
    this.version(3).stores({
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
  await db.albums.put(album);
  // Garante que a pasta do álbum exista na lista de pastas
  if (album.category && album.category.trim() !== '') {
    await ensureFolderExists(album.category.trim());
  }
  return album.id;
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.albums.delete(id);
}

// --- Pastas / Categorias Dinâmicas ---
export async function getAllFolders(): Promise<string[]> {
  try {
    const list = await db.folders.orderBy('name').toArray();
    const folderNames = list.map(f => f.name);
    // Combina com categorias de álbuns existentes caso alguma não esteja na tabela
    const albumCategories = (await db.albums.toArray()).map(a => a.category).filter(Boolean);
    const unique = Array.from(new Set([...folderNames, ...albumCategories, 'Geral']));
    return unique;
  } catch (error) {
    console.error('Erro ao buscar pastas:', error);
    return ['Geral'];
  }
}

export async function createCustomFolder(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) return;
  const existing = await db.folders.where('name').equalsIgnoreCase(clean).first();
  if (!existing) {
    await db.folders.add({
      id: 'folder_' + Date.now() + Math.random().toString(36).substring(2, 5),
      name: clean,
      createdAt: Date.now()
    });
  }
}

export async function ensureFolderExists(name: string): Promise<void> {
  await createCustomFolder(name);
}

export async function seedInitialDataIfEmpty(): Promise<void> {
  const count = await db.albums.count();
  if (count === 0) {
    await createCustomFolder('Geral');
    await createCustomFolder('Manutenção');
    await createCustomFolder('Reforma & Obras');
    
    const sampleAlbum: NFAlbum = {
      id: 'album_' + Date.now(),
      nickname: 'Conserto Ar Condicionado',
      invoiceNumber: '2026/0084',
      category: 'Manutenção',
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.albums.add(sampleAlbum);
  }
}
