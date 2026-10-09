type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
};
export function createQuizDraftStorage(storage: Storage) {
  let owner: number | null = null;
  let generation = 0;
  return {
    setOwner(id: number | null) { owner = id; generation++; },
    async getItem(_name: string) {
      if (owner === null) return null;
      const current = generation;
      const value = await storage.getItem(`huong-nghiep-quiz:${owner}`);
      return current === generation ? value : null;
    },
    async setItem(_name: string, value: string) {
      if (owner !== null) await storage.setItem(`huong-nghiep-quiz:${owner}`, value);
    },
    async removeItem(_name: string) {
      if (owner !== null) await storage.removeItem(`huong-nghiep-quiz:${owner}`);
    },
  };
}
