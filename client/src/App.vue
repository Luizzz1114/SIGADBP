<script setup>
import { onMounted } from 'vue';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
import { socket, iniciarListenersSocket } from '@/api/socket.js';

const notificaciones = useNotificaciones();

onMounted(() => {
  iniciarListenersSocket(notificaciones);
  const sessionString = localStorage.getItem('user_session');
  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      socket.auth = { token: session.token };
      socket.connect(); 
    } catch (error) {
      console.error("Error leyendo la sesión o conectando el socket:", error);
    }
  }
});
</script>

<template>
  <Toast position="bottom-right" />
  <router-view />
</template>