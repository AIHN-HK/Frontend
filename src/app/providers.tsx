import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import { ApiProvider } from '@/shared/api/ApiProvider';
import { AuthProvider } from '@/modules/auth';
import type { AuthController } from '@/modules/auth';

export function AppProviders({ queryClient, http, auth, children }: { queryClient: QueryClient; http: AxiosInstance; auth: AuthController; children: ReactNode }) {
  return <QueryClientProvider client={queryClient}><ApiProvider client={http}><AuthProvider controller={auth}>{children}</AuthProvider></ApiProvider></QueryClientProvider>;
}
