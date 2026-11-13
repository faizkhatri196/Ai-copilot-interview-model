import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') : 'http://localhost:5000');

const getToken = () => {
  if (typeof window !== 'undefined') {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed?.token || null;
      }
    } catch (e) {
      console.warn('[Socket] Could not read auth token:', e);
    }
  }
  return null;
};

const socket = io(socketUrl, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: getToken() });
  },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export const connectSocket = () => {
  const token = getToken();
  if (token) {
    socket.auth = { token };
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export default socket;
