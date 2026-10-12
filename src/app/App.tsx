import { RouterProvider } from 'react-router/dom';
import type { QueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import { router } from '@/routes';
import { AppProviders } from './providers';

export function App({ queryClient, http }: { queryClient: QueryClient; http: AxiosInstance }) {
  return <AppProviders queryClient={queryClient} http={http}><RouterProvider router={router} /></AppProviders>;
}
