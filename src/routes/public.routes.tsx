import type { RouteObject } from 'react-router';
import { NotFoundRoute, UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const publicRoutes: RouteObject[] = [{
  lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
  children: [
    { path: paths.home, Component: UnavailableRoute },
    { path: paths.careers, Component: UnavailableRoute },
    { path: '/careers/:careerId', Component: UnavailableRoute },
    { path: '*', Component: NotFoundRoute },
  ],
}];
