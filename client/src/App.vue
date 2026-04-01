<script setup>
import { onMounted } from 'vue';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
import { iniciarListenersSocket } from '@/api/socket.js';

const notificaciones = useNotificaciones();

onMounted(() => {
  iniciarListenersSocket(notificaciones);
});
</script>

<template>
  <Toast position="bottom-right" />
  <router-view />
</template>