<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import MultiBarChart from '@/components/Graficos/MultiBarChart.vue';
import metricasServices from '@/services/metricas.services.js';

const items = [
  { label: 'Presupuestos', route: '/presupuestos' },
  { label: 'Estadísticas', route: '/presupuestos/estadisticas' }
];

const kpisConfig = [
  { name: 'Inversión Equipos Tecnológicos', color: '#818cf8', icon: 'fi-rr-computer', label: 'Inversión Equipos Tecnológicos' },
  { name: 'Inversión Muebles', color: '#34d399', icon: 'fi-rr-chair',    label: 'Inversión Muebles' },
  { name: 'Mantenimiento Bienes', color: '#60a5fa', icon: 'fi-rr-tools', label: 'Mantenimiento Bienes' }
];

// --- Estados base ---
const respuestasAPI = ref([]);
const opPresupuesto = ref();
const presupuestoRangos = ref({ min: 0, max: 0 });

// --- Computadas (Lógica de presentación) ---
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
    const kpiData = res?.[0] || {};
    const historial = kpiData.historial_metricas || [];
    const lastItem = historial.at(-1);

    const lastValue = lastItem?.valor ?? 0;
    const meta = Number(kpiData.meta || 0);
    const peligro = Number(kpiData.peligro || 0);

    let status = 'warn';
    if (lastValue >= meta) status = 'success';
    else if (lastValue <= peligro) status = 'danger';

    const message = lastItem ? lastItem.periodo : 'Sin datos';

    return {
      ...kpisConfig[index],
      value: `${lastValue}%`,
      status,
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

    const kpiBase = resEquipos?.[0] || {};
    presupuestoRangos.value = {
      min: Number(kpiBase.peligro || 0),
      max: Number(kpiBase.meta || 0)
    };

  } catch (error) {
    console.error("Error cargando los KPIs:", error);
  }
});
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
          <span class="font-bold text-lg dark:text-slate-50">Análisis Presupuestario</span>
          <span class="-mt-0.5 text-xs text-slate-400">Control y seguimiento de inversión en bienes</span>
        </div>
      </div>
    </div>

    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        v-for="(card, index) in cardsData"
        :key="index"
        :label="card.label"
        :icon="card.icon" 
        :value="card.value"
        :status="card.status"
        :message="card.message" 
      />
    </div>

    <div class="w-full">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Distribución porcentual de la inversión</span>
          <Button @click="opPresupuesto.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8!" />
          <Popover ref="opPresupuesto">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag :value="`Meta:  > ${presupuestoRangos.max - 1}%`" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="`${presupuestoRangos.max}% a ${presupuestoRangos.min}%`" severity="warn" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="`< ${presupuestoRangos.min}%`" severity="danger" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-5">
          <MultiBarChart
            :labels="chartLabels" 
            :datasets="chartDatasets" 
            :force-max-value="100"
          />
        </div>
      </div>
    </div>
  </div>
</template>