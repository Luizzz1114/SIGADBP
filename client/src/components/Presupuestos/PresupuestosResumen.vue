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
  <div v-if="data?.length > 0" class="flex gap-4 mt-4 overflow-x-auto pb-0.5 snap-x snap-mandatory hide-scrollbar">
    <MoneyCard
      v-for="(presupuesto, index) in data" 
      :key="index"
      :item="presupuesto"
      :icon="iconMap[presupuesto.tipo] || 'fi-sr-box'"
    />
  </div>
</template>