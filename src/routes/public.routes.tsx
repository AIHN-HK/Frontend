import type { RouteObject } from 'react-router';
import { NotFoundRoute } from './RouteStates';
import { paths } from './paths';

export const publicRoutes: RouteObject[] = [
  { lazy: async () => ({ Component: (await import('./CareerWorkspaceRoute')).CareerWorkspaceRoute }), children: [
    { path: paths.assessment, lazy: async () => ({ Component: (await import('@/modules/assessment/guest/pages/AssessmentEntryPage')).AssessmentEntryPage }) },
    { path: paths.guestAssessmentResult, lazy: async () => ({ Component: (await import('@/modules/assessment/guest/pages/GuestResultPage')).GuestResultPage }) },
  ] },
  { path: paths.home, lazy: async () => ({ Component: (await import('@/modules/public/pages/HomePage')).HomePage }) },
  { path: paths.previewHome, lazy: async () => ({ Component: (await import('@/modules/public/pages/HomePage')).HomePage }) }, {
  lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
  children: [
    { path: '*', Component: NotFoundRoute },
  ],
}];
