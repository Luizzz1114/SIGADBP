<script setup>
import { computed, onMounted, ref } from 'vue';
import metricasServices from '@/services/metricas.services.js';
import DonutChart from '../Graficos/DonutChart.vue';

const data = ref([]);

const categorias = computed(() => {
  const d = data.value;
  return [
    { label: 'Muebles', key: 'muebles', color: '#00d492' },
    { label: 'Tecnológicos', key: 'tecnologicos', color: '#60a5fa' },
    { label: 'Vehículos', key: 'vehiculos', color: '#667791' }
  ].map(cat => ({
    ...cat,
    value: d[cat.key] ?? 0,
    percentage: d[`p_${cat.key}`] ?? 0,
  }));
});

onMounted(async() => {
  data.value = await metricasServices.bienesPorCategoria();
});
</script>

<template>
  <div class="flex flex-col flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
    <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <span class="font-bold text-base leading-tight dark:text-slate-50">Clasificación de los bienes</span>
    </div>
    <div class="flex-1 flex items-center justify-center w-full overflow-x-auto p-5">
      <DonutChart :data="categorias" unit="Bienes" />
    </div>
  </div>
</template>