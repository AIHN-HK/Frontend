import { createContext } from 'react';
import type { AuthController } from './auth.types';

export const AuthContext = createContext<AuthController | null>(null);
