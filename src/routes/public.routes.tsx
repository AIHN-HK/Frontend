import type { RouteObject } from 'react-router';
import { NotFoundRoute, UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const publicRoutes: RouteObject[] = [{
  lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
  children: [
    { path: paths.home, lazy: async () => ({ Component: (await import('@/modules/public/pages/HomePage')).HomePage }) },
    { path: paths.careers, lazy: async () => ({ Component: (await import('@/modules/careers/explorer/pages/CareerCatalogUnavailablePage')).CareerCatalogUnavailablePage }) },
    { path: '/careers/:careerId', Component: UnavailableRoute },
    { path: '*', Component: NotFoundRoute },
  ],
}];
