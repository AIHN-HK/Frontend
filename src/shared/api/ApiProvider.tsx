import type { ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import { ApiContext } from './api-context';

export function ApiProvider({ client, children }: { client: AxiosInstance; children: ReactNode }) {
  return <ApiContext value={client}>{children}</ApiContext>;
}
