<script setup>
import { ref, onMounted } from 'vue'; // Quitamos 'computed' si no se usa
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import metricasServices from '@/services/metricas.services';
import { adaptarDatosStackedBar } from '@/utils/graficos.formatter.js';
import StackedBarChart from '@/components/Graficos/StackedBarChart.vue';
import { listarDependencias } from '@/utils/fetch.utils';

// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas2' }
];

const data = ref([]);
const dataGeneral = ref([]);
const dependencias = ref([]);
const selectedDependencia = ref(null);

const onChangeDependencias = (value) => {
  if (value) {
    data.value = adaptarDatosStackedBar(dataGeneral.value, value);
  }
}

onMounted(async () => {
  try {
    const [res, resDep] = await Promise.all([
      metricasServices.obtenerKPI('TDRB'),
      listarDependencias()
    ]);

    dataGeneral.value = res;
    dependencias.value = resDep;

    if (resDep && resDep.length > 0) {
      const primerId = resDep[0].id;
      selectedDependencia.value = primerId;
      data.value = adaptarDatosStackedBar(res, primerId);
    }
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
});


const datosDeEjemplo = [
  {
    label: 'Ene 2024',
    valueBottom: 85,   // Porcentaje de bienes operativos
    valueTop: 15,      // Porcentaje en mantenimiento
    countBottom: 170,  // Cantidad real operativa
    countTop: 30,      // Cantidad real en mantenimiento
    total: 200         // Total asignado
  },
  {
    label: 'Feb 2024',
    valueBottom: 78,
    valueTop: 22,
    countBottom: 156,
    countTop: 44,
    total: 200
  },
  {
    label: 'Mar 2024',
    valueBottom: 90,
    valueTop: 10,
    countBottom: 189,
    countTop: 21,
    total: 210
  },
  {
    label: 'Abr 2024',
    valueBottom: 95,
    valueTop: 5,
    countBottom: 199,
    countTop: 11,
    total: 210
  },
  {
    label: 'May 2024',
    valueBottom: 88,
    valueTop: 12,
    countBottom: 184,
    countTop: 26,
    total: 210
  }
];
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-building"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas de las dependencias</span>
          <span class="-mt-0.5 text-xs text-slate-400">Análisis de la disponibilidad de los bienes</span>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <Select 
          v-model="selectedDependencia"
          @change="onChangeDependencias(selectedDependencia)" 
          :options="dependencias" 
          optionLabel="nombre"
          optionValue="id" 
          filter 
          placeholder="Seleccione la dependencia" 
          size="small" 
          fluid 
        />
      </div>
    </div>
    

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">


      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-bars-progress"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Disponibilidad actual de los bienes</span>
          </div>
        </div>
        <div class="w-full p-5">
        </div>
      </div>


      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-time-forward"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Histórico de disponibilidad de bienes</span>
          </div>
        </div>
        <div class="w-full p-5">
          <StackedBarChart 
            :data="datosDeEjemplo" 
            labelBottom="Bienes Operativos"
            labelTop="En Mantenimiento"
            colorBottom="fill-emerald-400 bg-emerald-400"
            usePatternTop
          />
        </div>
      </div>


    </div>
  </div>
</template>