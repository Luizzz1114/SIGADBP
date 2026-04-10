<script setup>
import { onMounted, ref } from 'vue';
import metricasServices from '@/services/metricas.services.js';
import DistributionBar from '@/components/Graficos/DistributionBar.vue';

const cargardo = ref(false);
const stats = ref([]);

const baseStats = [
  { label:'Operativos', key:'operativos', icono:'fi-rr-check-circle', color:'#00d492' },
  { label:'En mantenimiento', key:'mantenimiento', icono:'fi-rr-tools', color:'#60a5fa' },
  { label:'No asignados', key:'noasignados', icono:'fi-rr-minus-circle', color:'url(#stripes)' }
];

onMounted(async() => {
  cargardo.value = true;
  const data = await metricasServices.bienesPorEstatus();
  stats.value = baseStats.map(st => ({
    ...st,
    value: Number(data[st.key] ?? 0),
    percentage: Number(data[`p_${st.key}`] ?? 0)
  }));
  cargardo.value = false;
});
</script>

<template>
  <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
    <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <span class="font-bold text-base leading-tight dark:text-slate-50">Estado de los bienes</span>
    </div>
    <div class="flex flex-wrap p-4 gap-3">
      <div v-for="card in stats" :key="card.key" class="flex flex-col flex-1 min-w-32 sm:min-w-40 gap-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl ring-2 ring-inset ring-white dark:ring-slate-850 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
        <div class="flex items-start justify-between gap-2">
          <div class="grid place-items-center size-8 text-base rounded-lg bg-white border border-slate-200 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100">
            <i :class="card.icono"></i>
          </div>
          <span class="grid place-items-center px-1.5 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-750 dark:text-slate-400 shrink-0 ring-1 ring-current/10 dark:ring-current/20">
            {{ card.percentage }}%
          </span>
        </div>
        <div class="flex flex-col mt-0.5 min-w-0">
          <span class="text-sm font-medium leading-tight text-slate-500 dark:text-slate-200 truncate">
            {{ card.label }}
          </span>
          <div class="flex items-baseline gap-3 mt-0.5">
            <span class="text-2xl font-bold leading-none text-slate-700 dark:text-white truncate">
              {{ card.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 pt-1">
      <DistributionBar :data="stats" />
    </div>
  </div>
</template>