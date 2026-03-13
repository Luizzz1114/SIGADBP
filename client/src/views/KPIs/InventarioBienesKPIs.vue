<script setup>
import { ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const opcionesRango = [
  { label: 'Este mes', value: 'current_month' },
  { label: 'Este trimestre', value: 'current_quarter' },
  { label: 'Este año', value: 'current_year' },
  { label: 'Histórico completo', value: 'all' },
];

const rangoSeleccionado = ref(opcionesRango[3].value);


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

    <div class="flex items-center gap-2">
      <Select 
        v-model="rangoSeleccionado" 
        :options="opcionesRango" 
        optionLabel="label"
        optionValue="value"
        placeholder="Seleccionar periodo"
        class="w-48 h-9!"
        size="small"
      />
      <Button 
        type="button" 
        icon="fi-sr-refresh"  
        class="size-9! shrink-0!"
        v-tooltip.top="'Actualizar'"
      />
    </div>

    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
      <div class="flex items-center gap-3 px-4 pt-4 pb-1">
        <div class="grid place-items-center size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
          <i class="fi-rr-check-circle"></i>
        </div>
        <span class="font-bold text-base dark:text-slate-50">Bienes en Estado Operativo</span>
      </div>
      <div class="w-full px-5 pb-5">
        <AreaChart 
          :data="historicoOperatividad"
          :thresholdConfig="configuracionUmbrales"
        />
      </div>
    </div>

  </div>
</template>