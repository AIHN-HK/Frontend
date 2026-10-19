import type { RouteObject } from 'react-router';
import { RequireAdmin } from './guards/RequireAdmin';
import { UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const adminRoutes: RouteObject[] = [
  {
    path: paths.admin,
    Component: RequireAdmin,
    children: [
      {
        lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).AdminLayout }),
        children: [
          {
            path: 'students/:studentId',
            lazy: async () => ({
              Component: (await import('@/modules/admin/students/pages/StudentDetailPage')).StudentDetailPage,
            }),
          },
          {
            path: 'students',
            lazy: async () => ({
              Component: (await import('@/modules/admin/students/pages/StudentsPage')).StudentsPage,
            }),
          },
          {
            path: 'careers',
            lazy: async () => ({
              Component: (await import('@/modules/career-platform/pages/AdminCareerDataPage')).AdminCareerDataPage,
            }),
          },
          {
            path: 'scoring',
            lazy: async () => ({
              Component: (await import('@/modules/admin/scoring/pages/ScoringConfigPage')).ScoringConfigPage,
            }),
          },
          {
            path: 'holland-content',
            lazy: async () => ({
              Component: (await import('@/modules/admin/scoring/pages/HollandContentPage'))
                .HollandContentPage,
            }),
          },
          {
            path: 'questions',
            lazy: async () => ({
              Component: (await import('@/modules/admin/questions/pages/QuestionsPage')).QuestionsPage,
            }),
          },
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/modules/admin/overview/pages/OverviewPage')).OverviewPage,
            }),
          },
          { path: '*', Component: UnavailableRoute },
        ],
      },
    ],
  },
];
