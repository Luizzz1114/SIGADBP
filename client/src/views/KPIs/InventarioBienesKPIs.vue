<script setup>
import { ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import EstadisticasGlobales from './BienesGeneralKPIs.vue';
import EstadisticasDependencias from './BienesPorDependenciasKPIs.vue';

const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const activeTab = ref('globales');
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas del inventario</span>
          <span class="-mt-1 text-xs text-slate-400">Monitoreo del estado de los bienes</span>
        </div>
      </div>
    </div>
    <Tabs v-model:value="activeTab" class="pt-4">
      <TabList>
        <Tab value="globales" class="flex items-center gap-2 font-medium">
          <i class="fi-rr-chart-pie-alt"></i>
          Estadísticas globales
        </Tab>
        <Tab value="dependencias" class="flex items-center gap-2 font-medium">
          <i class="fi-rr-building"></i>
          Por dependencia
        </Tab>
      </TabList>
    </Tabs>
    <div class="w-full pt-4">
      <EstadisticasGlobales v-if="activeTab === 'globales'" />
      <EstadisticasDependencias v-if="activeTab === 'dependencias'" />
    </div>
  </div>
</template>