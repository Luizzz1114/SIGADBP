<script setup>
import { onMounted, ref, computed } from 'vue';
import metricasServices from '@/services/metricas.services.js';

const cargardo = ref(false);
const stats = ref([]);

const baseStats = [
  { label:'Operativos', key:'operativos', icono:'fi-rr-check-circle', color:'#34d399' },
  { label:'En mantenimiento', key:'mantenimiento', icono:'fi-rr-tools', color:'#60a5fa' },
  { label:'No asignados', key:'noasignados', icono:'fi-rr-minus-circle', color:'#c2c2c2' }
];

onMounted(async() => {
  cargardo.value = true;
  const data = await metricasServices.bienesPorEstatus();
  stats.value = baseStats.map(st => ({
    ...st,
    number: Number(data[st.key] ?? 0),
    value: Number(data[`p_${st.key}`] ?? 0)
  }));
  cargardo.value = false;
});
</script>

<template>
  <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
    <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <span class="font-bold text-base dark:text-slate-50">Estado de los bienes</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 p-4 gap-4">
      <div v-for="card in stats" :key="card.key" class="flex flex-col justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700">
        <div class="grid place-items-center size-9 text-lg rounded-lg bg-white border border-slate-200 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100">
          <i :class="card.icono"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-200">
            {{ card.label }}
          </span>
          <div class="flex items-baseline gap-3">
            <span class="text-2xl font-bold text-slate-700 dark:text-white">
              {{ card.number }}
            </span>
            <span class="text-sm font-medium text-slate-400">
              {{ card.value }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 pt-2">
      <MeterGroup :value="stats" class="dark:text-slate-200" />
    </div>
  </div>
</template>