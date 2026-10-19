import { useAdminQuery } from './admin.api';
import { identitySchema } from '../model/contracts';
export function useAdminIdentity() {
  return useAdminQuery(['identity'], '/api/v1/admin/me', identitySchema);
}
