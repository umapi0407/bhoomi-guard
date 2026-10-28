import { io, Socket } from 'socket.io-client';

// Connect to backend port 5001 or current origin in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log(`[BhoomiGuard Realtime] Connected to Socket.IO Server (${socket.id})`);
});

socket.on('disconnect', () => {
  console.log('[BhoomiGuard Realtime] Disconnected from Socket.IO Server');
});
