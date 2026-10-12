import type { RouteObject } from 'react-router';
import { RequireAdmin } from './guards/RequireAdmin';
import { UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const adminRoutes: RouteObject[] = [{
  path: `${paths.admin}/*`,
  Component: RequireAdmin,
  children: [{
    lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).AdminLayout }),
    children: [{ path: '*', Component: UnavailableRoute }],
  }],
}];
