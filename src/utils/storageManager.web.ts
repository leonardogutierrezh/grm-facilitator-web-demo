/**
 * Web override of storageManager.
 *
 * Native build uses WatermelonDB (SQLite) for local data and expo-secure-store
 * for encrypted credentials. The web demo has neither, so:
 *  - `databaseServiceInstance.database` is a no-op fake (see web-stubs),
 *  - storage is backed by `localStorage` with the exact same JSON semantics as
 *    the native AsyncStorage / SecureStore wrappers (one JSON.stringify on
 *    write, one JSON.parse on read) so callers behave identically.
 */
// @ts-ignore - JS stub without types
import { fakeDatabase } from '../../web-stubs/fakeDatabase';

class DatabaseService {
  database: any = fakeDatabase;

  async initDB() {
    // No local database on web — remote API is the single source of truth.
    this.database = fakeDatabase;
  }
}

export const databaseServiceInstance = new DatabaseService();

const safeGet = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch (_e) {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch (_e) {
    /* ignore quota / privacy-mode errors */
  }
};

const safeRemove = (key: string) => {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch (_e) {
    /* ignore */
  }
};

export const storeData = async (key: string, value: unknown) => {
  safeSet(key, JSON.stringify(value));
};

export const storeEncryptedData = async (key: string, value: unknown) => {
  safeSet(key, JSON.stringify(value));
};

export const getData = async (key: string) => {
  const jsonValue = safeGet(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};

export const getEncryptedData = async (key: string) => {
  const jsonValue = safeGet(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};

export const removeValue = async (key: string) => {
  safeRemove(key);
};

export const removeEncryptedValue = async (key: string) => {
  safeRemove(key);
};
