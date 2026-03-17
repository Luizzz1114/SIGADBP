<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import Prueba from '@/components/Graficos/prueba.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Presupuesto', route: '/presupuestos' },
  { label: 'Estadísticas', route: '/presupuestos/estadisticas' }
];

const chartLabels = ref(['2023-I', '2023-II', '2024-I', '2024-II']);
const chartDatasets = ref([
  {
    name: '% Inversión Equipos',
    color: '#818cf8',
    values: [35, 45, 50, 65]
  },
  {
    name: '% Inversión Muebles',
    color: '#34d399',
    values: [65, 55, 45, 25]
  },
  {
    name: '% Mantenimiento Bienes',
    color: '#60a5fa',
    values: [35, 40, 50, 65]
  }
]);
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas de los presupuestos</span>
          <span class="-mt-0.5 text-xs text-slate-400">Control y seguimiento del presupuesto de bienes</span>
        </div>
      </div>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card />
      <Card />
      <Card />
    </div>
    <div class="w-full">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Inversión de los presupuestos</span>
        </div>
        <div class="w-full p-5">
          <Prueba
            :labels="chartLabels" 
            :datasets="chartDatasets" 
            :force-max-value="100"
          />
        </div>
      </div>
    </div>
  </div>
</template>