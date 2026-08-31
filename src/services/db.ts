import Dexie, { type Table } from 'dexie';
import type { NFAlbum } from '../types';

export class NFSePhotoDatabase extends Dexie {
  albums!: Table<NFAlbum, string>;

  constructor() {
    super('NFSePhotoDB');
    this.version(2).stores({
      albums: 'id, nickname, invoiceNumber, category, createdAt'
    });
  }
}

export const db = new NFSePhotoDatabase();

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
  return album.id;
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.albums.delete(id);
}

export async function seedInitialDataIfEmpty(): Promise<void> {
  const count = await db.albums.count();
  if (count === 0) {
    const sampleAlbum: NFAlbum = {
      id: 'album_' + Date.now(),
      nickname: 'Manutenção Ar Condicionado',
      invoiceNumber: '2026/0084',
      category: 'Manutenção',
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.albums.add(sampleAlbum);
  }
}
