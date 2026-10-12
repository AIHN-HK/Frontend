import { RouterProvider } from 'react-router/dom';
import type { QueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import { router } from '@/routes';
import { AppProviders } from './providers';
import type { AuthController } from '@/modules/auth';

export function App({ queryClient, http, auth }: { queryClient: QueryClient; http: AxiosInstance; auth: AuthController }) {
  return <AppProviders queryClient={queryClient} http={http} auth={auth}><RouterProvider router={router} /></AppProviders>;
}
