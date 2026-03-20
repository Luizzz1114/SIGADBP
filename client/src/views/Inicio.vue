<script setup>
import { onMounted, ref } from 'vue';
import Card from '@/components/Card.vue';
import BienesEstatus from '@/components/PanelControl/BienesEstatus.vue';
import BienesPorDependencia from '@/components/PanelControl/BienesPorDependencia.vue';
import BienesPorCategoria from '@/components/PanelControl/BienesPorCategoria.vue';
import metricasServices from '@/services/metricas.services.js';

const metricas = ref([]);

onMounted(async() => {
  metricas.value = await metricasServices.obtenerMetricas();
});
</script>

<template>
  <Breadcrumbs />
  <div class="flex flex-col gap-5 px-4 pb-4">
    <div class="flex items-center gap-4">
      <div class="grid place-items-center size-10 text-xl rounded-md bg-blue-500 text-white">
        <i class="fi-sr-chart-pie"></i>
      </div>
      <div class="flex flex-col">
        <span class="font-bold text-lg dark:text-slate-50">Panel de control</span>
        <span class="-mt-0.5 text-xs text-slate-400">Resumen general del sistema</span>
      </div>
    </div>

    <div class="flex *:flex-1 gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card label="Total de bienes" :value="metricas.total_bienes || 0" icon="fi-rr-boxes" message="Bienes activos" />
      <Card label="Incorporaciones" :value="metricas.incorporaciones_mes || 0" icon="fi-rr-apps-add" message="Este mes" />
      <Card label="Desincorporaciones" :value="metricas.desincorporaciones_mes || 0" icon="fi-rr-apps-delete" message="Este mes" />
      <Card label="Movimientos" :value="metricas.movimientos_mes || 0" icon="fi-rr-priority-arrows rotate-90!" message="Este mes" />
      <Card label="Mantenimientos" :value="metricas.mantenimientos_mes || 0" icon="fi-rr-screw-alt" message="Este mes" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <BienesEstatus />
      <BienesPorCategoria />
    </div>

    <BienesPorDependencia />

  </div>
</template>