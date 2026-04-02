<script setup>
import MoneyCard from '@/components/MoneyCard.vue';

const props = defineProps({
  data: Object
});

const iconMap = {
  'Compra de Equipos Tecnológicos': 'fi-rr-computer',
  'Compra de Muebles': 'fi-rr-chair',
  'Compra de Vehículos / Equipos de Elevación': 'fi-rr-truck-moving',
  'Mantenimiento de Bienes': 'fi-rr-screw-alt'
};
</script>

<template>
  <div v-if="data?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4 w-full">
    <MoneyCard
      v-for="(presupuesto, index) in data" 
      :key="index"
      :item="presupuesto"
      :icon="iconMap[presupuesto.tipo] || 'fi-sr-box'"
    />
  </div>
</template>