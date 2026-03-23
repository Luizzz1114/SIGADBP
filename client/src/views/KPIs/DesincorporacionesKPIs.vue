<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import metricasServices from '@/services/metricas.services';
import { obtenerMesAnio } from '@/utils/formatters.js';


// --- Configuración de la vista ---
const items = [
  { label: 'Desincorporaciones', route: '/desincorporaciones' },
  { label: 'Estadísticas', route: '/desincorporaciones/estadisticas' }
];

const opTasaDesincorporacion = ref(null);
const opDeterioro = ref(null);


// --- Estados ---
const tasaDesincorporacion = ref([]);
const deterioro = ref([]);


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
  const [resITDB, resDD] = await Promise.all([
    metricasServices.obtenerKPI('ITDB'),
    metricasServices.obtenerKPI('IDD')
  ]);

  tasaDesincorporacion.value = procesarHistorial(resITDB);
  deterioro.value = procesarHistorial(resDD);
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-red-500 text-white">
          <i class="fi-sr-apps-delete"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50 whitespace-nowrap">Estadísticas de las desincorporaciones</span>
          <span class="-mt-0.5 text-xs text-slate-400">Análisis de las bajas del inventario</span>
        </div>
      </div>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        label="Bienes desincorporados"
        icon="fi-rr-apps-delete"
        color="red"
        :value="actualTasa.total"
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
        label="Desincorporaciones por deterioro"
        icon="fi-rr-damage"
        color="red"
        :value="actualDeterioro.value"
        :status="actualDeterioro.status"
        :message="actualDeterioro.message"
      />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-red-100 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
              <i class="fi-rr-ruler-combined"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Tendencia de desincorporaciones</span>
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opTasaDesincorporacion.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
            <Popover ref="opTasaDesincorporacion">
              <div class="flex flex-col gap-3 p-1">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Meta: ≤ 5%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'5% a 10%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'> 10%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-5">
          <AreaChart
            :data="tasaDesincorporacion"
            unit="Tasa"
            details="d_tasa"
          />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-red-100 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
              <i class="fi-rr-damage"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Tendencia de desincorporaciones por deterioro</span>
          </div>
          <div class="flex items-center gap-3">
            <Button @click="opDeterioro.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
            <Popover ref="opDeterioro">
              <div class="flex flex-col gap-3 p-1">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag :value="'Meta: ≤ 20%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'20% a 30%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag :value="'> 30%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="w-full p-5">
          <AreaChart
            :data="deterioro"
            unit="Deterioro"
            details="d_deterioro"
          />
        </div>
      </div>
    </div>
  </div>
</template>