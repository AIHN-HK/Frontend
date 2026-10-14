import type { RouteObject } from 'react-router';
import { paths } from './paths';

// These routes preview UI only. They never establish session state or consume private APIs.
const preview = async () => ({ Component: (await import('@/layouts/components/ShellPreview')).ShellPreview });

export const previewRoutes: RouteObject[] = [
  {
    lazy: async () => ({ Component: (await import('@/layouts/PublicLayout')).PublicLayout }),
    children: [
      { path: paths.previewRoadmap, lazy: async () => ({ Component: (await import('@/modules/roadmap/pages/RoadmapPage')).RoadmapPage }) },
      { path: paths.previewCareers, lazy: async () => ({ Component: (await import('@/modules/careers/explorer/pages/CareerExplorerPage')).CareerExplorerPage }) },
      { path: '/preview/careers/:careerId', lazy: async () => ({ Component: (await import('@/modules/careers/detail/pages/CareerDetailPage')).CareerDetailPage }) },
      { path: paths.previewRecommendations, lazy: async () => ({ Component: (await import('@/modules/recommendations/list/pages/RecommendationsPreviewPage')).RecommendationsPreviewPage }) },
      { path: '/preview/recommendations/:recommendationId', lazy: async () => ({ Component: (await import('@/modules/recommendations/detail/pages/RecommendationDetailPage')).RecommendationDetailPage }) },
    ],
  },
  {
    path: paths.previewStudent,
    lazy: async () => ({ Component: (await import('@/layouts/StudentLayout')).StudentLayout }),
    children: [{ index: true, lazy: preview }],
  },
  {
    path: paths.previewAdmin,
    lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).AdminLayout }),
    children: [{ index: true, lazy: preview }, { path: 'careers', lazy: async () => ({ Component: (await import('@/modules/admin/careers/pages/CareersPreviewPage')).CareersPreviewPage }) }],
  },
  {
    path: paths.previewAuth,
    lazy: async () => ({ Component: (await import('@/layouts/AuthLayout')).AuthLayout }),
    children: [{ index: true, lazy: preview }],
  },
];
