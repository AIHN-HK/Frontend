import type { RouteObject } from 'react-router';
import { paths } from './paths';

// These routes preview UI only. They never establish session state or consume private APIs.
const preview = async () => ({ Component: (await import('@/layouts/components/ShellPreview')).ShellPreview });

export const previewRoutes: RouteObject[] = [
  {
    path: paths.previewStudent,
    lazy: async () => ({ Component: (await import('@/layouts/StudentLayout')).StudentLayout }),
    children: [{ index: true, lazy: preview }],
  },
  {
    path: paths.previewAdmin,
    lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).AdminLayout }),
    children: [{ index: true, lazy: preview }],
  },
  {
    path: paths.previewAuth,
    lazy: async () => ({ Component: (await import('@/layouts/AuthLayout')).AuthLayout }),
    children: [{ index: true, lazy: preview }],
  },
];
