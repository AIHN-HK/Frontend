import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import { ApiProvider } from '@/shared/api/ApiProvider';

export function AppProviders({ queryClient, http, children }: { queryClient: QueryClient; http: AxiosInstance; children: ReactNode }) {
  return <QueryClientProvider client={queryClient}><ApiProvider client={http}>{children}</ApiProvider></QueryClientProvider>;
}
