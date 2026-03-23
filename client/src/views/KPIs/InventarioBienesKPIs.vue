<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import BarChart from '@/components/Graficos/BarChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { obtenerMesAnio } from '@/utils/formatters.js';
import DonutChart from '@/components/Graficos/DonutChart.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const opSinNumero = ref();
const opRangos = ref();
const opCrecimiento = ref();


// --- Estados ---
const dataSinNumero = ref([]);
const sinNumero = ref([]);
const crecimiento = ref([]);
const operatividad = ref([]);

const sinNumeroActual = computed(() => {
  const sin = Number(dataSinNumero.value.total_sin_numero) || 0;
  const otros = Number(dataSinNumero.value.total_bienes - dataSinNumero.value.total_sin_numero) || 0;
  const p = Math.round(Number(dataSinNumero.value.porcentaje_sin_numero) || 0);
  return [
    { label: 'Sin número', value: sin, percentage: p },
    { label: 'Otros', value: otros, percentage: 100 - p }
  ]
});

const evaluarEstatus = (percentage) => {
  if (percentage <= 5) return { label: 'Óptimo', severity: 'success' };
  if (percentage > 15) return { label: 'Crítico', severity: 'danger' };
  return { label: 'Atención', severity: 'warn' };
};

const actualOperatividad = computed(() => {
  const len = operatividad.value.length;
  if (len === 0) return { value: '0%', status: '', message: '' };
  const val = operatividad.value[len - 1].value;
  const status = val >= 90 ? 'success' : val <= 70 ? 'danger' : 'warn';
  const message = operatividad.value[len - 1]?.label || 'Sin datos';
  return { value: `${val}%`, status, message };
});

const actualCrecimiento = computed(() => {
  const len = crecimiento.value.length;
  if (len < 2) return { value: '0%', status: '', message: '' };
  const actual = crecimiento.value[len - 1].value;
  const anterior = crecimiento.value[len - 2].value;
  const variacion = anterior === 0 ? 0 : (((actual - anterior) / anterior) * 100).toFixed(2);
  const val = Number(variacion);
  const status = val < -5 ? 'danger' : val > 15 ? 'warn' : 'success';
  const message = crecimiento.value[len - 1]?.label || 'Sin datos';
  return { value: `${variacion}%`, status, message };
});


// --- Operaciones con la API ---
const procesarHistorial = (historial) => {
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

  dataSinNumero.value = resActual;

  if (resIBNI?.length) {
    sinNumero.value = procesarHistorial(resIBNI[0].historial_metricas);
  }

  if (resICMI?.length) {
    crecimiento.value = procesarHistorial(resICMI[0].historial_metricas);
  }

  if (resIBEO?.length) {
    operatividad.value = procesarHistorial(resIBEO[0].historial_metricas);
  }
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
        label="Indice de Crecimiento"
        icon="fi-rr-arrow-trend-up"
        :value="actualCrecimiento.value"
        :status="actualCrecimiento.status"
        :message="actualCrecimiento.message"
      />
      <Card
        label="Porcentaje de Operatividad"
        icon="fi-rr-check-circle"
        :value="actualOperatividad.value"
        :status="actualOperatividad.status"
        :message="actualOperatividad.message"
      />
    </div>

    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
      <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <span class="font-bold text-base dark:text-slate-50">Crecimiento del inventario</span>
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
      <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <span class="font-bold text-base dark:text-slate-50">Bienes en estado operativo</span>
        <Button @click="opRangos.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
        <Popover ref="opRangos" >
          <div class="flex flex-col gap-3 p-1">
            <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
              <i class="fi-br-info text-blue-500"></i>
              Rangos de alerta
            </span>
            <div class="flex items-center gap-2 flex-wrap">
              <Tag value="Meta: > 90%" severity="success" class="ring-1 ring-inset ring-current/10"/>
              <Tag value="90% - 70%" severity="warn" class="ring-1 ring-inset ring-current/10"/>
              <Tag value="< 70%" severity="danger" class="ring-1 ring-inset ring-current/10"/>
            </div>
          </div>
        </Popover>
      </div>
      <div class="w-full p-5">
        <AreaChart :data="operatividad" unit="Operatividad" details="bienes" />
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex flex-col flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <span class="font-bold text-base dark:text-slate-50">Bienes sin número asignado</span>
            <Tag
              :value="evaluarEstatus(sinNumeroActual.percentage).label"
              :severity="evaluarEstatus(sinNumeroActual.percentage).severity"
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
                  <Tag value="Meta: < 5%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="5% - 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="> 15%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center w-full overflow-x-auto p-5">
          <DonutChart :data="sinNumeroActual" unit="Bienes" />
        </div>
      </div>

      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center gap-3 px-4 pt-4 pb-1">
          <div class="grid place-items-center shrink-0 size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
            <i class="fi-rr-tags"></i>
          </div>
          <span class="font-bold text-base dark:text-slate-50">Historial mensual de bienes sin identificación</span>
        </div>
        <div class="w-full p-5">
          <AreaChart :data="sinNumero" unit="Sin número" details="b_sin_numero" />
        </div>
      </div>

    </div>

  </div>
</template>