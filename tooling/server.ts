const DEFAULT_DEV_PORT = 5173;
const DEFAULT_PREVIEW_PORT = 4173;

// Vite uses the dev port; Playwright starts the production preview on the preview port.
export const server = {
  host: '127.0.0.1',
  devPort: DEFAULT_DEV_PORT,
  previewPort: Number(process.env.E2E_PORT ?? DEFAULT_PREVIEW_PORT),
};

// Playwright uses this URL as its baseURL and readiness check.
export const previewOrigin = `http://${server.host}:${server.previewPort}`;
