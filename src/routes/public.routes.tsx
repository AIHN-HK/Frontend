import type { RouteObject } from 'react-router';
import { NotFoundRoute } from './RouteStates';
import { EntryRedirect } from './EntryRedirect';
import { paths } from './paths';

export const publicRoutes: RouteObject[] = [{ path: paths.home, Component: EntryRedirect }, {
  lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
  children: [
    { path: paths.previewHome, lazy: async () => ({ Component: (await import('@/modules/public/pages/HomePage')).HomePage }) },
    { path: '*', Component: NotFoundRoute },
  ],
}];
