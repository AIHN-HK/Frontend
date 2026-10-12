export type Environment = { apiOrigin: string; socketOrigin: string };

export function readEnvironment(values: Record<string, string | undefined>): Environment {
  function origin(value: string | undefined) {
    const url = new URL(value || 'http://localhost:3000');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('API/socket configuration must be an HTTP origin without credentials, path, query or hash.');
    }
    return url.origin;
  }
  return {
    apiOrigin: origin(values.VITE_API_ORIGIN),
    socketOrigin: origin(values.VITE_SOCKET_ORIGIN),
  };
}

export function getEnvironment() { return readEnvironment(import.meta.env); }
