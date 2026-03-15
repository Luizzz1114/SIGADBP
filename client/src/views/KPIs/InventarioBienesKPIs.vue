<script setup>
import { ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import Card from '@/components/Card.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const historicoOperatividad = ref([
  { label: 'Oct', value: 82 }, // Precaución (Amarillo)
  { label: 'Nov', value: 88 }, // Precaución (Amarillo)
  { label: 'Dic', value: 94 }, // Meta superada (Verde)
  { label: 'Ene', value: 91 }, // Meta superada (Verde)
  { label: 'Feb', value: 65 }, // Caída crítica simulada (Rojo)
  { label: 'Mar', value: 95 }
]);

// 2. EL PROP 'thresholdConfig' (La configuración de alertas)
// Según tu tabla: Meta >= 90%, Precaución 70% a 89%, Crítico < 70%
const configuracionUmbrales = ref({
  optimal: 90,  // De 90 para arriba dibuja verde
  warning: 70   // De 70 a 89 dibuja amarillo. Menos de 70 dibuja rojo.
});

</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes grid place-items-center"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas del inventario</span>
          <span class="-mt-0.5 text-xs text-slate-400">Monitoreo del estado de los bienes</span>
        </div>
      </div>
    </div>

    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card label="Crecimiento Mensual" icon="fi-rr-arrow-trend-up" message="Bienes activos" value="14" trend="+5%" trendType="up" />
      <Card label="Tasa de Operatividad" icon="fi-rr-check-circle" message="13 bienes" value="95%" trend="+2%" trendType="up" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Bienes en estado operativo</span>
        </div>
        <div class="w-full p-5">
          <div class="flex flex-col gap-3">
            <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
              <i class="fi-br-info text-blue-500"></i>
              Rangos de alerta
            </span>
            <div class="flex items-center gap-x-4 gap-y-2 flex-wrap">
              <Tag value="Meta: > 89%" severity="success" class="ring-1 ring-inset ring-current/10"/>
              <Tag value="89% - 70%" severity="warn" class="ring-1 ring-inset ring-current/10"/>
              <Tag value="< 70%" severity="danger" class="ring-1 ring-inset ring-current/10"/>
            </div>
          </div>
          <AreaChart 
            :data="historicoOperatividad"
            :thresholdConfig="configuracionUmbrales"
          />
        </div>
      </div>

      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">

      </div>

    </div>

  </div>
</template>