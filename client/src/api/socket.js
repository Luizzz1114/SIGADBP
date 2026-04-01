import { io } from 'socket.io-client';
import router from '@/router';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export const iniciarListenersSocket = (notificaciones) => {
  socket.on('sesion_forzada', (mensaje) => {
    console.warn("Expulsión por WebSocket:", mensaje);
    notificaciones.showWarning(mensaje); 
    localStorage.removeItem('user_session');
    socket.disconnect(); 
    router.push('/login'); 
  });
  socket.on('connect_error', (err) => {
    console.error('Error de conexión al socket:', err.message);
    if (err.message === 'NO_TOKEN' || err.message === 'INVALID_TOKEN' || err.message === 'USER_NOT_FOUND') {
      notificaciones.showError('Tu sesión ha expirado o es inválida.');
      localStorage.removeItem('user_session');
      router.push('/login');
    }
  });
};