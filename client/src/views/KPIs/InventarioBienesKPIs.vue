<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import BarChart from '@/components/Graficos/BarChart.vue';
import DonutChart from '@/components/Graficos/DonutChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { obtenerMesAnio } from '@/utils/formatters.js';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const opSinNumero = ref();
const opRangos = ref();
const opCrecimiento = ref();


// --- Estados ---
const sinNumero = ref([]);
const historialSinNumero = ref([]);
const crecimiento = ref([]);
const operatividad = ref([]);


// --- Computados ---
const actualSinNumero = computed(() => {
  const { total_sin_numero = 0, total_bienes = 0, porcentaje_sin_numero = 0 } = historialSinNumero.value || {};
  const sin = Number(total_sin_numero);
  const otros = Number(total_bienes) - sin;
  const p = Math.round(Number(porcentaje_sin_numero));
  return [
    { label: 'Sin número', color: '#60a5fa', value: sin, percentage: p },
    { label: 'Otros', color: 'url(#stripes_donut)', value: otros, percentage: 100 - p }
  ];
});

const evaluarEstatus = (percentage) => {
  if (percentage <= 5) return { label: 'Óptimo', severity: 'success' };
  if (percentage > 15) return { label: 'Crítico', severity: 'danger' };
  return { label: 'Atención', severity: 'warn' };
};

const actualOperatividad = computed(() => {
  const actual = operatividad.value.at(-1);
  if (!actual) return { value: '0%', status: '', message: '' };
  const val = actual.value;
  const status = val >= 90 ? 'success' : val < 70 ? 'danger' : 'warn';
  return { value: `${val}%`, status, message: actual.label || 'Sin datos' };
});

const actualCrecimiento = computed(() => {
  const actual = crecimiento.value.at(-1);
  const anterior = crecimiento.value.at(-2);
  if (!actual || !anterior) return { value: '0%', status: '', message: '' };
  const variacion = anterior.value === 0 ? 0 : ((actual.value - anterior.value) / anterior.value) * 100;
  const status = variacion < -5 ? 'danger' : variacion > 15 ? 'warn' : 'success';
  return { value: `${variacion.toFixed(2)}%`, status, message: actual.label || 'Sin datos' };
});


// --- Operaciones con la API ---
const procesarHistorial = (res) => {
  const historial = res?.[0]?.historial_metricas || [];
  return historial
    .map(item => ({
      ...item,
      label: obtenerMesAnio(item.periodo),
      value: Number(item.valor),
      detalles: item?.detalles || {}
    }))
    .sort((a, b) => (a.fecha > b.fecha ? 1 : -1)); 
};

onMounted(async () => {
  const [resActual, resIBNI, resIBEO, resICMI] = await Promise.all([
    metricasServices.sinNumeroResumen(),
    metricasServices.obtenerKPI('IBNI'),
    metricasServices.obtenerKPI('IBEO'),
    metricasServices.obtenerKPI('ICMI')
  ]);

  historialSinNumero.value = resActual || {};
  sinNumero.value = procesarHistorial(resIBNI);
  operatividad.value = procesarHistorial(resIBEO);
  crecimiento.value = procesarHistorial(resICMI);
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas del inventario</span>
          <span class="-mt-0.5 text-xs text-slate-400">Monitoreo del estado de los bienes</span>
        </div>
      </div>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        label="Total de bienes"
        icon="fi-rr-boxes"
        :value="historialSinNumero.total_bienes"
        message="Bienes en inventario"
      />
      <Card
        label="Indice de crecimiento"
        icon="fi-rr-arrow-trend-up"
        :value="actualCrecimiento.value"
        :status="actualCrecimiento.status"
        :message="actualCrecimiento.message"
      />
      <Card
        label="Tasa de operatividad"
        icon="fi-rr-check-circle"
        :value="actualOperatividad.value"
        :status="actualOperatividad.status"
        :message="actualOperatividad.message"
      />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-arrow-trend-up"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Crecimiento del inventario</span>
          </div>
          <Button @click="opCrecimiento.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opCrecimiento">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta (Índice)
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag value="< -5%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                <Tag value="Meta: -5% a 15%" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag value="> 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-5">
          <BarChart :data="crecimiento" :historical="true" type="Bienes" />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-check-circle"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Tendencia de operatividad</span>
          </div>
          <Button @click="opRangos.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opRangos" >
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag value="Meta: ≥ 90%" severity="success" class="ring-1 ring-inset ring-current/10"/>
                <Tag value="90% a 70%" severity="warn" class="ring-1 ring-inset ring-current/10"/>
                <Tag value="< 70%" severity="danger" class="ring-1 ring-inset ring-current/10"/>
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-5">
          <AreaChart :data="operatividad" unit="Operatividad" details="bienes" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex flex-col flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-tags"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Bienes sin número asignado</span>
            <Tag
              :value="evaluarEstatus(actualSinNumero.percentage).label"
              :severity="evaluarEstatus(actualSinNumero.percentage).severity"
              class="ring-1 ring-inset ring-current/10"
            />
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opSinNumero.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
            <Popover ref="opSinNumero">
              <div class="flex flex-col gap-3 p-1">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag value="Meta: ≤ 5%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="5% a 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="> 15%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center w-full overflow-x-auto p-5">
          <DonutChart :data="actualSinNumero" unit="Bienes" />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-tags"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Tendencia de bienes sin número asignado</span>
          </div>
        </div>
        <div class="w-full p-5">
          <AreaChart :data="sinNumero" unit="Sin número" details="b_sin_numero" />
        </div>
      </div>
    </div>
  </div>
</template>