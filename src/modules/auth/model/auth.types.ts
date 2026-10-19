import type { SessionSnapshot, SessionTokens, SessionUser } from '@/shared/session/session.types';

export type LoginInput = { email: string; password: string };
export type LoginOptions = { rememberMe: boolean };
export type AuthApi = {
  login(input: LoginInput): Promise<{ user: SessionUser; tokens: SessionTokens }>;
  identity(accessToken: string): Promise<SessionUser>;
  refresh(refreshToken: string): Promise<SessionTokens>;
  logout(accessToken: string): Promise<void>;
};
export type SavedSession = { version: 1; tokens: SessionTokens; ownerId: number; rememberMe: boolean };
export type AuthPersistence = {
  read(): SavedSession | null;
  save(value: SavedSession): boolean;
  clear(expectedRefreshToken?: string): boolean;
};
export type AuthController = {
  read(): SessionSnapshot;
  subscribe(listener: () => void): () => void;
  notice(): string | null;
  subscribeNotice(listener: () => void): () => void;
  login(input: LoginInput, options: LoginOptions): Promise<void>;
  logout(): Promise<void>;
  hydrate(): Promise<void>;
  refresh(revision: number): Promise<boolean>;
  unauthorized(revision: number): void;
  synchronize(): Promise<void>;
  dispose(): void;
};
