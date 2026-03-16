<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import metricasServices from '@/services/metricas.services';
import { obtenerMesAnio } from '@/utils/formatters';
import BarChart2 from '@/components/Graficos/BarChart2.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];


// --- Operaciones con la API ---
const crecimiento = ref([]);
const crecimientoRangos = ref({});
const operatividad = ref([]);
const operatividadRangos = ref({});

const actualIBEO = computed(() => {
  if (!operatividad.value.length) return null;
  return operatividad.value.reduce((max, actual) => actual.fecha > max.fecha ? actual : max);
});

const variacionCrecimiento = computed(() => {
  if (crecimiento.value.length < 2) return 0;
  const ordenados = [...crecimiento.value].sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
  const actual = ordenados[0].value;
  const anterior = ordenados[1].value;
  if (anterior === 0) return 0;
  const calculo = ((actual - anterior) / anterior) * 100;
  return calculo.toFixed(2);
});

async function formatearICMI() {
  const respuesta = await metricasServices.obtenerICMI();
  if (respuesta && respuesta.length > 0) {
    const indicador = respuesta[0];
    crecimientoRangos.value = {
      optimal: Number(indicador.meta),
      warning: Number(indicador.peligro)
    };
    crecimiento.value = indicador.historial_metricas.map(item => ({
      ...item,
      label: obtenerMesAnio(item.periodo),
      value: Number(item.valor)
    }));
  }
}

async function formatearIBEO() {
  const respuesta = await metricasServices.obtenerIBEO()
  if (respuesta && respuesta.length > 0) {
    const indicador = respuesta[0];
    operatividadRangos.value = {
      optimal: Number(indicador.meta),
      warning: Number(indicador.peligro)
    };
    operatividad.value = indicador.historial_metricas.map(item => ({
      ...item,
      label: obtenerMesAnio(item.periodo),
      value: Number(item.valor)
    }));
  }
}

onMounted(async () => {
  await Promise.all([
    formatearIBEO(),
    formatearICMI()
  ]);
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
      <Card
        label="Indice de Crecimiento"
        icon="fi-rr-arrow-trend-up"
        :value="variacionCrecimiento + '%'"
      />
      <Card label="Porcentaje de Operatividad" icon="fi-rr-check-circle" :value="actualIBEO?.value + '%'" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">

      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Crecimiento mensual del inventario</span>
        </div>
        <div class="w-full p-5">
          <BarChart2
            :data="crecimiento"
            type="Bienes"
          />
        </div>
      </div>

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
              <Tag :value="`Meta: > ${operatividadRangos.optimal - 1}%`" severity="success" class="ring-1 ring-inset ring-current/10"/>
              <Tag :value="`${operatividadRangos.optimal - 1}% - ${operatividadRangos.warning}%`" severity="warn" class="ring-1 ring-inset ring-current/10"/>
              <Tag :value="`< ${operatividadRangos.warning}%`" severity="danger" class="ring-1 ring-inset ring-current/10"/>
            </div>
          </div>
          <AreaChart 
            :data="operatividad"
            :ranges="operatividadRangos"
          />
        </div>
      </div>
      
    </div>

  </div>
</template>