<script setup>
import { computed, onMounted, ref } from 'vue';
import BarChart from '../Graficos/BarChart.vue';
import kpiServices from '@/services/kpi.services';

const data = ref([]);

const categorias = computed(() => {
  const d = data.value;
  return [
    { label: 'Muebles', key: 'muebles', color: 'fill-slate-400 text-slate-400 bg-slate-400' },
    { label: 'Tecnológicos', key: 'tecnologicos', color: 'fill-indigo-400 text-indigo-400 bg-indigo-400' },
    { label: 'Vehículos', key: 'vehiculos', color: 'fill-emerald-400 text-emerald-400 bg-emerald-400' },
  ].map(cat => ({
    ...cat,
    total: d[cat.key] ?? 0,
    value: d[`p_${cat.key}`] ?? 0,
  }));
});

onMounted(async() => {
  data.value = await kpiServices.bienesPorCategoria();
});
</script>

<template>
  <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
    <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <span class="font-bold text-base dark:text-slate-50">Clasificación de los bienes</span>
    </div>
    <div class="w-full overflow-x-auto px-5 pb-5">
      <BarChart :data="categorias" />
    </div>
  </div>
</template>