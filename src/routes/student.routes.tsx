import type { RouteObject } from 'react-router';
import { RequireSession } from './guards/RequireSession';
import { paths } from './paths';

export const studentRoutes: RouteObject[] = [
  {
    Component: RequireSession,
    children: [
      {
        path: paths.assessment,
        lazy: async () => ({
          Component: (await import('@/modules/assessment/testing/pages/HollandTestPage')).HollandTestPage,
        }),
      },
      {
        lazy: async () => ({ Component: (await import('@/layouts/StudentLayout')).StudentLayout }),
        children: [
          {
            path: paths.dashboard,
            lazy: async () => ({
              Component: (await import('@/modules/dashboard/pages/DashboardPage')).DashboardPage,
            }),
          },
          {
            path: paths.careerProfile,
            lazy: async () => ({
              Component: (await import('@/modules/profile/pages/CareerProfilePage')).CareerProfilePage,
            }),
          },
          {
            path: `${paths.assessmentResults}/:attemptId`,
            lazy: async () => ({
              Component: (await import('@/modules/assessment/results/pages/AssessmentResultPage'))
                .AssessmentResultPage,
            }),
          },
          {
            path: paths.assessmentResults,
            lazy: async () => ({
              Component: (await import('@/modules/assessment/results/pages/AssessmentResultPage'))
                .AssessmentResultPage,
            }),
          },
          {
            path: paths.history,
            lazy: async () => ({
              Component: (await import('@/modules/history/pages/HistoryPage')).HistoryPage,
            }),
          },
          {
            path: paths.advisor,
            lazy: async () => ({
              Component: (await import('@/modules/advisor/pages/AdvisorPage')).AdvisorPage,
            }),
          },
          {
            path: paths.recommendations,
            lazy: async () => ({
              Component: (await import('@/modules/career-platform/pages/CareerRecommendationsPage'))
                .CareerRecommendationsPage,
            }),
          },
          {
            path: '/recommendations/:recommendationId',
            lazy: async () => ({
              Component: (
                await import('@/modules/career-platform/pages/CareerRecommendationsPage')
              ).CareerRecommendationsPage,
            }),
          },
          {
            path: paths.roadmap,
            lazy: async () => ({
              Component: (await import('@/modules/roadmap/pages/RoadmapUnavailablePage'))
                .RoadmapUnavailablePage,
            }),
          },
          {
            path: paths.settings,
            lazy: async () => ({
              Component: (await import('@/modules/settings/pages/SettingsPage')).SettingsPage,
            }),
          },
        ],
      },
    ],
  },
];
