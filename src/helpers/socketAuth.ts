type Socket = {
  auth: object | ((callback: (data: object) => void) => void);
  connected: boolean;
  emit(event: string, data: object): unknown;
};
export function updateSocketAuth(socket: Socket, token: string) {
  socket.auth = { token };
  if (socket.connected) socket.emit('refresh_auth', { token });
}
