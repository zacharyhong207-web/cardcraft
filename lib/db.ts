import { CardLayerState } from '@/types/studio';

export interface SavedCard {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  previewImage: string;
  bgImage: string | null;
  bgTransform: { xPct: number; yPct: number; scale: number };
  layers: CardLayerState[];
  mode: 'preset' | 'custom';
  presetCardId?: string;
}

const DB_NAME = 'cardcraft_db';
const DB_VERSION = 1;
const STORE_NAME = 'my_cards';

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (e) => reject(request.error);

    request.onsuccess = (e) => {
      dbInstance = request.result as IDBDatabase;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveCard = async (card: SavedCard): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(card);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSavedCards = async (): Promise<SavedCard[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by updatedAt descending
      const cards = request.result as SavedCard[];
      cards.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(cards);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSavedCard = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCardById = async (id: string): Promise<SavedCard | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
