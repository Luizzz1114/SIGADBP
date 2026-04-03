<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  segundos: {
    type: Number,
    default: 600 // 10 minutos por defecto
  }
});

const emit = defineEmits(['tiempo-agotado']);

const tiempoRestante = ref(props.segundos);
let timerId = null;

const tiempoFormateado = computed(() => {
  const minutos = Math.floor(tiempoRestante.value / 60).toString().padStart(2, '0');
  const segundos = (tiempoRestante.value % 60).toString().padStart(2, '0');
  return `${minutos}:${segundos}`;
});

onMounted(() => {
  timerId = setInterval(() => {
    if (tiempoRestante.value > 0) {
      tiempoRestante.value--;
    } else {
      clearInterval(timerId);
      emit('tiempo-agotado');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <span class="text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg text-sm flex items-center gap-2">
    {{ tiempoFormateado }} <i class="fi-rr-clock"></i>
  </span>
</template>