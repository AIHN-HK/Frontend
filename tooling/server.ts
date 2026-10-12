export const server = {
  host: '127.0.0.1',
  devPort: 5173,
  previewPort: Number(process.env.E2E_PORT ?? 4173),
};

export const previewOrigin = `http://${server.host}:${server.previewPort}`;
