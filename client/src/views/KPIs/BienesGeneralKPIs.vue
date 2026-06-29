<script setup>
import { computed, onMounted, ref } from 'vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import BarChart from '@/components/Graficos/BarChart.vue';
import DonutChart from '@/components/Graficos/DonutChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { exportarAImpresion } from '@/utils/imprimir';
import { obtenerMesAnio } from '@/utils/formatters.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const opSinNumero = ref();
const opRangos = ref();
const opCrecimiento = ref();

const chartCrecimientoRef = ref(null);
const chartOperatividadRef = ref(null);
const chartSinNumeroRef = ref(null);
const chartTendenciasRef = ref(null);


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
  try {
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

  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando datos de estadísticas:", error);
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:max-w-220">
      <Card
        label="Total de bienes"
        icon="fi-rr-boxes"
        :value="historialSinNumero.total_bienes || '0'"
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-arrow-trend-up"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Crecimiento del inventario</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="
                exportarAImpresion(
                  chartCrecimientoRef,
                  crecimiento,
                  'Crecimiento del Inventario de Bienes',
                  'Indica cuánto aumentó o disminuyó el total de bienes en comparación con el mes anterior.',
                  ['Período', 'Bienes en inventario'],
                  (d) => [d.label, `${d.value} Bienes`],
                )
              "
              label="Exportar PDF"
              icon="fi-rr-file-export"
              severity="secondary"
              class="h-7! shrink-0"
            />
            <Button @click="opCrecimiento.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opCrecimiento">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Indica cuánto aumentó o disminuyó el total de bienes en comparación con el mes anterior.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta (Índice)
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag value="Óptimo: -5% a 15%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Atención: > 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Crítico: < -5%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div ref="chartCrecimientoRef" class="w-full p-4">
          <BarChart :data="crecimiento" :historical="true" type="Bienes" />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-check-circle"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de operatividad</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="
                exportarAImpresion(
                  chartOperatividadRef,
                  operatividad,
                  'Tendencia de Operatividad de Bienes',
                  'Porcentaje del inventario total que se encuentra en estado funcional y en uso, excluyendo equipos dañados o en reparación.',
                  ['Período', 'Tasa de Operatividad', 'Bienes Operativos', 'Total en Inventario'],
                  (d) => [
                    d.label,
                    `${d.value}%`,
                    d.detalles?.cantidad || 0,
                    d.detalles?.total || 0,
                  ],
                )
              "
              label="Exportar PDF"
              icon="fi-rr-file-export"
              severity="secondary"
              class="h-7! shrink-0"
            />
            <Button @click="opRangos.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opRangos" >
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Porcentaje del inventario total que se encuentra en estado funcional y en uso, excluyendo equipos dañados o en reparación.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag value="Óptimo: ≥ 90%" severity="success" class="ring-1 ring-inset ring-current/10"/>
                  <Tag value="Atención: 60 a 89%" severity="warn" class="ring-1 ring-inset ring-current/10"/>
                  <Tag value="Crítico: < 60%" severity="danger" class="ring-1 ring-inset ring-current/10"/>
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div ref="chartOperatividadRef" class="w-full p-4">
          <AreaChart
            :data="operatividad"
            unit="Tasa"
            :details-formatter="(d) => [
              { label: 'Operativos', value: d.cantidad },
              { label: 'En inventario', value: d.total }
            ]"
          />
        </div>
      </div>
    </div>


    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex flex-col flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-tags"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Bienes sin número asignado</span>
            <Tag
              v-if="actualSinNumero[0]?.percentage !== undefined"
              :value="evaluarEstatus(actualSinNumero[0].percentage).label"
              :severity="evaluarEstatus(actualSinNumero[0].percentage).severity"
              class="ring-1 ring-inset ring-current/10"
            />
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="
                exportarAImpresion(
                  chartSinNumeroRef,
                  actualSinNumero,
                  'Distribución de Bienes (Sin Número)',
                  'Porcentaje y cantidad de bienes en el sistema que aún no tienen un número de identificación registrado.',
                  ['Categoría', 'Cantidad', 'Porcentaje'],
                  (d) => [d.label, d.value, `${d.percentage}%`],
                )
              "
              label="Exportar PDF"
              icon="fi-rr-file-export"
              severity="secondary"
              class="h-7! shrink-0"
            />
            <Button @click="opSinNumero.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opSinNumero">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Porcentaje y cantidad de bienes en el sistema que aún no tienen un número de identificación registrado.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag value="Óptimo: ≤ 5%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Atención: 6% a 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Crítico: > 15%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div ref="chartSinNumeroRef" class="flex-1 flex items-center justify-center w-full overflow-x-auto p-5">
          <DonutChart :data="actualSinNumero" unit="Bienes" />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-tags"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de bienes sin número asignado</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="
                exportarAImpresion(
                  chartTendenciasRef,
                  sinNumero,
                  'Tendencia de Bienes sin Número',
                  'Porcentaje y cantidad de bienes en el sistema que aún no tienen un número de identificación registrado.',
                  ['Período', 'Cantidad', 'En Inventario'],
                  (d) => [
                    d.label,
                    d.detalles?.cantidad || d.value,
                    d.detalles?.total || 0,
                  ],
                )
              "
              label="Exportar PDF"
              icon="fi-rr-file-export"
              severity="secondary"
              class="h-7! shrink-0"
            />
          </div>
        </div>
        <div ref="chartTendenciasRef" class="w-full p-4">
          <AreaChart
            :data="sinNumero"
            unit="Sin número"
            :details-formatter="(d) => [
              { label: 'Sin número', value: d.cantidad },
              { label: 'En inventario', value: d.total }
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>