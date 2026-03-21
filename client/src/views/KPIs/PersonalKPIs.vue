<script setup>
import { ref, computed, onMounted } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import DistributionBar from '@/components/Graficos/DistributionBar.vue';
import metricasServices from '@/services/metricas.services';
import AreaChart from '@/components/Graficos/AreaChart.vue';

const items = [
  { label: 'Personal', route: '/personal' },
  { label: 'Estadísticas', route: '/personal/estadisticas' }
];

const data = ref({});
const capacitacionHistorial = ref([]);
const satisfacionHistorial = ref([]);
const popovers = ref([]); 

const togglePopover = (event, index) => {
  if (popovers.value[index]) {
    popovers.value[index].toggle(event);
  }
};

const construirChartData = (labelSi, labelNo, colorSi, cantT, cantSi, porcSi) => {
  const y = Number(cantSi) || 0;
  const n = Number(cantT - cantSi) || 0;
  const p = Math.round(Number(porcSi) || 0);
  return [
    { label: labelSi, color: colorSi, value: y, percentage: p },
    { label: labelNo, color: 'url(#stripes)', value: n, percentage: 100 - p }
  ]
}

const capacitados = computed(() => construirChartData(
  'Capacitados', 'No capacitados', '#00d492',
  data.value.total_evaluados,
  data.value.personal_capacitado,
  data.value.porcentaje_capacitacion
));

const satisfechos = computed(() => construirChartData(
  'Satisfechos', 'Insatisfechos', '#60a5fa',
  data.value.total_evaluados,
  data.value.personal_satisfecho,
  data.value.porcentaje_satisfaccion
));

const metricsConfig = computed(() => [
  { title: 'Personal capacitado', data: capacitados.value },
  { title: 'Satisfacción del personal', data: satisfechos.value }
]);

const evaluarEstatus = (percentage) => {
  if (percentage >= 80) return { label: 'Óptimo', severity: 'success' };
  if (percentage >= 60) return { label: 'Atención', severity: 'warn' };
  return { label: 'Crítico', severity: 'danger' };
};

const procesarHistorial = (historial) => {
  return historial
    .map(item => ({
      ...item,
      label: item.periodo,
      value: Number(item.valor),
      detalles: item?.detalles || {}
    }))
    .sort((a, b) => (a.fecha > b.fecha ? 1 : -1)); 
};

onMounted(async () => {
  const [resActual, resCapacitacion, resSatisfaccion] = await Promise.all([
    metricasServices.evaluacionesResumen(),
    metricasServices.obtenerKPI('ICP'),
    metricasServices.obtenerKPI('IPS')
  ]);

  data.value = resActual;

  if (resCapacitacion?.length) {
    capacitacionHistorial.value = procesarHistorial(resCapacitacion[0].historial_metricas);
  }

  if (resSatisfaccion?.length) {
    satisfacionHistorial.value = procesarHistorial(resSatisfaccion[0].historial_metricas);
  }
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-employee-man"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas del personal</span>
          <span class="-mt-0.5 text-xs text-slate-400">Formación y crecimiento de la Unidad de Administación</span>
        </div>
      </div>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        label="Personal evaluado"
        icon="fi-rr-user"
        :value="data.total_evaluados"
      />
      <Card
        label="Último semestre evaluado"
        icon="fi-rr-calendar"
        :value="data.semestre"
      />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div 
        v-for="(metric, index) in metricsConfig"
        :key="metric.title"
        class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden"
      >
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <span class="font-bold text-base dark:text-slate-50">{{ metric.title }}</span>
            <Tag
              :value="evaluarEstatus(metric.data[0].percentage).label"
              :severity="evaluarEstatus(metric.data[0].percentage).severity"
              class="ring-1 ring-inset ring-current/10"
            />
          </div>
          <div class="flex items-center gap-3">
            <Button @click="togglePopover($event, index)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
            <Popover :ref="el => popovers[index] = el">
              <div class="flex flex-col gap-3 p-1">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Meta: > 79%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'79% - 60%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'< 60%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-5">
          <DistributionBar :data="metric.data" :showValues="true" />
        </div>
      </div>
    </div>
    
    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700">
      <div class="flex items-center gap-3 px-4 pt-4 pb-1">
        <div class="grid place-items-center shrink-0 size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
          <i class="fi-rr-book-alt"></i>
        </div>
        <span class="font-bold text-base dark:text-slate-50">Historial de capacitación</span>
      </div>
      <div class="w-full p-5">
        <AreaChart :data="capacitacionHistorial" unit="Personal capacitado" details="personal" />
      </div>
    </div>

    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700">
      <div class="flex items-center gap-3 px-4 pt-4 pb-1">
        <div class="grid place-items-center shrink-0 size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
          <i class="fi-rr-smile-beam"></i>
        </div>
        <span class="font-bold text-base dark:text-slate-50">Historial de satisfacción</span>
      </div>
      <div class="w-full p-5">
        <AreaChart :data="satisfacionHistorial" unit="Personal satisfecho" details="personal" />
      </div>
    </div>

  </div>
</template>