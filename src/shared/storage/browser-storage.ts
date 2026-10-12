type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createBrowserStorage(storage: StoragePort) {
  return {
    read<T>(key: string, valid: (value: unknown) => value is T): T | null {
      try {
        const raw = storage.getItem(key);
        if (raw === null) return null;
        const value: unknown = JSON.parse(raw);
        return valid(value) ? value : null;
      } catch { return null; }
    },
    write(key: string, value: unknown): boolean {
      try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key: string): boolean {
      try { storage.removeItem(key); return true; } catch { return false; }
    },
  };
}
