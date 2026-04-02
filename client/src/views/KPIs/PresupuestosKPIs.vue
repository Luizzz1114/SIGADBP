<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MoneyCard from '@/components/MoneyCard.vue';
import MultiBarChart from '@/components/Graficos/MultiBarChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [
  { label: 'Presupuestos', route: '/presupuestos' },
  { label: 'Estadísticas', route: '/presupuestos/estadisticas' }
];

const kpisConfig = [
  { name: 'Inversión Equipos Tecnológicos', color: '#2563eb', icon: 'fi-rr-computer', label: 'Inversión Equipos Tecnológicos' },
  { name: 'Inversión Muebles', color: '#60a5fa', icon: 'fi-rr-chair',    label: 'Inversión Muebles' },
  { name: 'Mantenimiento Bienes', color: '#93c5fd', icon: 'fi-rr-tools', label: 'Mantenimiento Bienes' }
];


// --- Estados ---
const respuestasAPI = ref([]);
const opPresupuesto = ref();


// --- Computados ---
const cardsData = computed(() => {
  if (!respuestasAPI.value.length) {
    return kpisConfig.map(config => ({
      ...config,
      value: '0%',
      status: '',
      message: ''
    }));
  }

  return respuestasAPI.value.map((res, index) => {
    const config = kpisConfig[index] || {};
    const kpiData = res?.[0] || {};
    const historial = kpiData.historial_metricas || [];
    const lastItem = historial.at(-1);
    const lastValue = lastItem?.valor ?? 0;
    const message = lastItem ? lastItem.periodo : 'Sin datos';

    return {
      icon: config.icon, 
      tipo: config.name, 
      gasto_total: lastItem?.detalles?.cantidad ?? 0,
      presupuesto_total_usd: lastItem?.detalles?.total ?? 0,
      porcentaje_uso: lastValue,
      message
    };
  });
});

const chartLabels = computed(() => {
  const primerHistorial = respuestasAPI.value[0]?.[0]?.historial_metricas || [];
  return primerHistorial.map(m => m.periodo); 
});

const chartDatasets = computed(() => {
  if (!respuestasAPI.value.length) return [];
  
  return respuestasAPI.value.map((res, index) => ({
    name: kpisConfig[index].name,
    color: kpisConfig[index].color,
    values: (res?.[0]?.historial_metricas || []).map(m => m.valor),
    detalles: (res?.[0]?.historial_metricas || []).map(m => m.detalles)
  }));
});


// --- Operaciones con la API ---
onMounted(async () => {
  try {
    const [resEquipos, resMuebles, resMantenimiento] = await Promise.all([
      metricasServices.obtenerKPI('IIET'),
      metricasServices.obtenerKPI('IIM'),
      metricasServices.obtenerKPI('IIMB')
    ]);

    respuestasAPI.value = [resEquipos, resMuebles, resMantenimiento];

  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando los KPIs:", error);
  }
});
</script>

<template>
  <Breadcrumbs :items="items" />
  
  <div class="flex flex-col px-4 pb-4 gap-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Análisis presupuestario</span>
          <span class="-mt-1 text-xs text-slate-400">Control y seguimiento de inversión en bienes</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <MoneyCard
        v-for="(card, index) in cardsData"
        :key="index"
        :icon="card.icon"
        :item="card"
      />
    </div>

    <div class="w-full">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2.5 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-percentage"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Distribución porcentual de la inversión</span>
          </div>
          <Button @click="opPresupuesto.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opPresupuesto">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag value="Meta: ≥ 60%" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag value="60% a 30" severity="warn" class="ring-1 ring-inset ring-current/10" />
                <Tag value="< 30" severity="danger" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-4">
          <MultiBarChart
            :labels="chartLabels" 
            :datasets="chartDatasets"
          />
        </div>
      </div>
    </div>
  </div>
</template>