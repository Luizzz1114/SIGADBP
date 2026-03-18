<script setup>
import MoneyCard from '@/components/MoneyCard.vue';

const props = defineProps({
  data: Object
});

const iconMap = {
  'Compra de Equipos Tecnológicos': 'fi-sr-computer',
  'Compra de Muebles': 'fi-rr-chair',
  'Compra de Vehículos / Equipos de Elevación': 'fi-sr-truck-moving',
  'Mantenimiento de Bienes': 'fi-sr-screw-alt'
};
</script>

<template>
  <div v-if="data?.length > 0" class="flex gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
    <MoneyCard
      v-for="(presupuesto, index) in data" 
      :key="index"
      :item="presupuesto"
      :icon="iconMap[presupuesto.tipo] || 'fi-sr-box'"
    />
  </div>
</template>