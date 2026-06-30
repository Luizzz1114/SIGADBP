<script setup>
import { ref, computed, onMounted } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import DistributionBar from '@/components/Graficos/DistributionBar.vue';
import metricasServices from '@/services/metricas.services';
import { exportarAImpresion } from '@/utils/imprimir';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [
  { label: 'Personal', route: '/personal' },
  { label: 'Estadísticas', route: '/personal/estadisticas' }
];

const popovers = ref([]);

const togglePopover = (event, index) => {
  if (popovers.value[index]) {
    popovers.value[index].toggle(event);
  }
};

// --- Referencias para impresión ---
const chartCapacitacionRef = ref(null);
const chartSatisfaccionRef = ref(null);

// --- Exportación a PDF ---
const manejarExportacion = (tipoGrafico) => {
  const configuraciones = {
    capacitacion: {
      elementoRef: chartCapacitacionRef.value,
      datos: capacitacionHistorial.value,
      titulo: 'Tendencia de capacitación',
      descripcion: 'Evolución histórica del porcentaje de trabajadores de la Unidad de Administración que recibieron formación o completaron cursos.',
      columnas: ['Período', 'Tasa de Capacitación', 'Capacitados', 'Total Evaluados'],
      formatearFila: (d) => [
        d.label,
        `${d.value}%`,
        d.detalles?.cantidad || 0,
        d.detalles?.total || 0
      ],
      rangosAlerta: [
        { value: 'Óptimo: ≥ 75%', severity: 'success' },
        { value: 'Atención: 60 a 74%', severity: 'warn' },
        { value: 'Crítico: < 60%', severity: 'danger' }
      ]
    },
    satisfaccion: {
      elementoRef: chartSatisfaccionRef.value,
      datos: satisfacionHistorial.value,
      titulo: 'Tendencia de satisfacción',
      descripcion: 'Evolución histórica del porcentaje de empleados de la Unidad de Administración que reportaron estar conformes o satisfechos con su entorno laboral.',
      columnas: ['Período', 'Índice de Satisfacción', 'Satisfechos', 'Total Evaluados'],
      formatearFila: (d) => [
        d.label,
        `${d.value}%`,
        d.detalles?.cantidad || 0,
        d.detalles?.total || 0
      ],
      rangosAlerta: [
        { value: 'Óptimo: ≥ 75%', severity: 'success' },
        { value: 'Atención: 60 a 74%', severity: 'warn' },
        { value: 'Crítico: < 60%', severity: 'danger' }
      ]
    }
  };

  const config = configuraciones[tipoGrafico];
  if (config) {
    exportarAImpresion(config);
  }
};


// --- Estados ---
const data = ref({});
const capacitacionHistorial = ref([]);
const satisfacionHistorial = ref([]);
 
const construirChartData = (labelSi, labelNo, colorSi, cantT, cantSi, porcSi) => {
  const y = Number(cantSi) || 0;
  const n = Number(cantT - cantSi) || 0;
  const p = Math.round(Number(porcSi) || 0);
  return [
    { label: labelSi, color: colorSi, value: y, percentage: p },
    { label: labelNo, color: 'url(#stripes)', value: n, percentage: 100 - p }
  ]
}


// --- Computados ---
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
  { title: 'Personal capacitado', icon: 'fi-rr-book-alt', data: capacitados.value, description: 'Porcentaje de trabajadores de la Unidad de Administración que recibieron formación o completaron cursos durante el semestre evaluado.' },
  { title: 'Satisfacción del personal', icon: 'fi-rr-smile-beam', data: satisfechos.value, description: 'Porcentaje de empleados de la Unidad de Administración que reportaron estar conformes o satisfechos con su entorno laboral en el semestre evaluado.' }
]);

const evaluarEstatus = (percentage) => {
  if (percentage >= 75) return { label: 'Óptimo', severity: 'success' };
  if (percentage >= 60) return { label: 'Atención', severity: 'warn' };
  return { label: 'Crítico', severity: 'danger' };
};


// --- Operaciones con la API ---
const procesarHistorial = (res) => {
  const historial = res?.[0]?.historial_metricas || [];
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
  try {
    const [resActual, resCapacitacion, resSatisfaccion] = await Promise.all([
      metricasServices.evaluacionesResumen(),
      metricasServices.obtenerKPI('ICP'),
      metricasServices.obtenerKPI('IPS')
    ]);

    data.value = resActual;
    capacitacionHistorial.value = procesarHistorial(resCapacitacion);
    satisfacionHistorial.value = procesarHistorial(resSatisfaccion);

  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando datos de estadísticas:", error);
  }
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-employee-man"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas del personal</span>
          <span class="-mt-1 text-xs text-slate-400">Formación y crecimiento del Área de Administración</span>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:max-w-220">
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div 
        v-for="(metric, index) in metricsConfig"
        :key="metric.title"
        class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden"
      >
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i :class="metric.icon"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">{{ metric.title }}</span>
            <Tag
              v-if="metric.data[0].percentage"
              :value="evaluarEstatus(metric.data[0].percentage).label"
              :severity="evaluarEstatus(metric.data[0].percentage).severity"
              class="ring-1 ring-inset ring-current/10"
            />
          </div>
          <div class="flex items-center gap-3">
            <Button @click="togglePopover($event, index)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover :ref="el => popovers[index] = el">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>{{ metric.description }}</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Óptimo: ≥ 75%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Atención: 60 a 74%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Crítico: < 60%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-4">
          <DistributionBar :data="metric.data" :showValues="true" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-book-alt"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de capacitación</span>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="manejarExportacion('capacitacion')" label="Exportar PDF" icon="fi-rr-file-export" severity="secondary" class="h-7! shrink-0" />
          </div>
        </div>
        <div ref="chartCapacitacionRef" class="w-full p-4">
          <AreaChart
            :data="capacitacionHistorial"
            unit="Personal capacitado"
            :details-formatter="(d) => [
              { label: 'Capacitados', value: d.cantidad },
              { label: 'Total evaluados', value: d.total }
            ]"
          />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-smile-beam"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de satisfacción</span>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="manejarExportacion('satisfaccion')" label="Exportar PDF" icon="fi-rr-file-export" severity="secondary" class="h-7! shrink-0" />
          </div>
        </div>
        <div ref="chartSatisfaccionRef" class="w-full p-4">
          <AreaChart
            :data="satisfacionHistorial"
            unit="Personal satisfecho"
            :details-formatter="(d) => [
              { label: 'Satisfechos', value: d.cantidad },
              { label: 'Total evaluados', value: d.total }
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>