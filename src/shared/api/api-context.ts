import { createContext, useContext } from 'react';
import type { AxiosInstance } from 'axios';

export const ApiContext = createContext<AxiosInstance | null>(null);

export function useHttpClient() {
  const client = useContext(ApiContext);
  if (!client) throw new Error('API consumer must be inside ApiProvider');
  return client;
}
