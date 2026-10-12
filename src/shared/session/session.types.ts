export type SessionUser = { id: number; fullname: string; role: 'USER' | 'ADMIN' | null };
export type SessionTokens = { accessToken: string; refreshToken: string };
export type SessionSnapshot = {
  revision: number;
  status: 'anonymous' | 'authenticated';
  user: SessionUser | null;
  tokens: SessionTokens | null;
};
export type SessionStore = {
  read(): SessionSnapshot;
  subscribe(listener: () => void): () => void;
  establish(user: SessionUser, tokens: SessionTokens): void;
  clear(expectedRevision?: number): boolean;
};
