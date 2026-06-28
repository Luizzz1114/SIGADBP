<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import metricasServices from '@/services/metricas.services';
import { obtenerMesAnio } from '@/utils/formatters.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [
  { label: 'Desincorporaciones', route: '/desincorporaciones' },
  { label: 'Estadísticas', route: '/desincorporaciones/estadisticas' }
];

const opTasaDesincorporacion = ref(null);
const opDeterioro = ref(null);
const opObsolescencia = ref(null);


// --- Estados ---
const tasaDesincorporacion = ref([]);
const deterioro = ref([]);
const obsolescencia = ref([]);


// --- Computados ---
const actualTasa = computed(() => {
  const actual = tasaDesincorporacion.value.at(-1);
  if (!actual) return { value: '0%', status: '', message: '' };
  const { value: val, label, detalles } = actual;
  const status = val <= 5 ? 'success' : val > 10 ? 'danger' : 'warn';
  return { value: `${val}%`, total: detalles.cantidad, status, message: label || 'Sin datos' };
});

const actualDeterioro = computed(() => {
  const actual = deterioro.value.at(-1);
  if (!actual) return { value: '0%', status: '', message: '' };
  const { value: val, label } = actual;
  const status = val <= 20 ? 'success' : val > 30 ? 'danger' : 'warn';
  return { value: `${val}%`, status, message: label || 'Sin datos' };
});

const actualObsolescencia = computed(() => {
  const actual = obsolescencia.value.at(-1);
  if (!actual) return { value: '0%', status: '', message: '' };
  const { value: val, label } = actual;
  const status = val <= 20 ? 'success' : val > 30 ? 'danger' : 'warn';
  return { value: `${val}%`, status, message: label || 'Sin datos' };
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
    const [resITDB, resIDD, resIDO] = await Promise.all([
      metricasServices.obtenerKPI('ITDB'),
      metricasServices.obtenerKPI('IDD'),
      metricasServices.obtenerKPI('IDO')
    ]);
    
    tasaDesincorporacion.value = procesarHistorial(resITDB);
    deterioro.value = procesarHistorial(resIDD);
    obsolescencia.value = procesarHistorial(resIDO);

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
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-red-500 text-white">
          <i class="fi-sr-apps-delete"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas de desincorporaciones</span>
          <span class="-mt-1 text-xs text-slate-400">Análisis de las bajas del inventario</span>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:max-w-220">
      <Card
        label="Bienes desincorporados"
        icon="fi-rr-apps-delete"
        color="red"
        :value="actualTasa.total || 0"
        :message="actualTasa.message"
      />
      <Card
        label="Tasa de desincorporación"
        icon="fi-rr-ruler-combined"
        color="red"
        :value="actualTasa.value"
        :status="actualTasa.status"
        :message="actualTasa.message"
      />
      <Card
        label="Des. por deterioro"
        icon="fi-rr-damage"
        color="red"
        :value="actualDeterioro.value"
        :status="actualDeterioro.status"
        :message="actualDeterioro.message"
      />
      <Card
        label="Des. por obsolescencia"
        icon="fi-rr-trash-clock"
        color="red"
        :value="actualObsolescencia.value"
        :status="actualObsolescencia.status"
        :message="actualObsolescencia.message"
      />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-red-100 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
              <i class="fi-rr-ruler-combined"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de desincorporaciones</span>
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opTasaDesincorporacion.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opTasaDesincorporacion">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Porcentaje que representan las bajas del inventario en comparación con el total de bienes activos. Indica el ritmo al que se está reduciendo el patrimonio.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Óptimo: ≤ 5%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Atención: 6% a 10%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Crítico: > 10%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-4">
          <AreaChart
            :data="tasaDesincorporacion"
            unit="Tasa"
            :details-formatter="(d) => [
              { label: 'Desincorporados', value: d.cantidad },
              { label: 'En inventario', value: d.total }
            ]"
          />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-red-100 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
              <i class="fi-rr-damage"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de desincorporaciones por deterioro</span>
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opDeterioro.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opDeterioro">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Proporción de las desincorporaciones causadas por daños físicos, averías o desgaste extremo por el uso del bien.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Óptimo: ≤ 20%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Atención: 21% a 30%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Crítico: > 30%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-4">
          <AreaChart
            :data="deterioro"
            unit="Deterioro"
            :details-formatter="(d) => [
              { label: 'Por deterioro', value: d.cantidad },
              { label: 'Desinc. totales', value: d.total }
            ]"
          />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-red-100 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
              <i class="fi-rr-trash-clock"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Tendencia de desincorporaciones por obsolescencia</span>
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opObsolescencia.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opObsolescencia">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Proporción de las desincorporaciones que ocurren porque los equipos quedaron tecnológicamente desfasados o dejaron de ser útiles para los procesos actuales.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Óptimo: ≤ 20%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Atención: 21% a 30%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'Crítico: > 30%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-4">
          <AreaChart
            :data="obsolescencia"
            unit="Obsolescencia"
            :details-formatter="(d) => [
              { label: 'Por obsolescencia', value: d.cantidad },
              { label: 'Desinc. totales', value: d.total }
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>