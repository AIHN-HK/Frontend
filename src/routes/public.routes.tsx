import type { RouteObject } from 'react-router';
import { NotFoundRoute } from './RouteStates';
import { paths } from './paths';

export const publicRoutes: RouteObject[] = [{
  lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
  children: [
    { path: paths.home, lazy: async () => ({ Component: (await import('@/modules/public/pages/HomePage')).HomePage }) },
    { path: paths.careers, lazy: async () => ({ Component: (await import('@/modules/career-platform/pages/CareerCatalogPage')).CareerCatalogPage }) },
    { path: '/careers/:careerId', lazy: async () => ({ Component: (await import('@/modules/career-platform/pages/CareerRuntimeDetailPage')).CareerRuntimeDetailPage }) },
    { path: '*', Component: NotFoundRoute },
  ],
}];
