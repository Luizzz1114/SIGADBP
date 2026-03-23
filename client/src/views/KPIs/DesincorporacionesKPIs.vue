<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import metricasServices from '@/services/metricas.services';


// --- Configuración de la vista ---
const items = [
  { label: 'Desincorporaciones', route: '/desincorporaciones' },
  { label: 'Estadísticas', route: '/desincorporaciones/estadisticas' }
];

const opTasaDesincorporacion = ref(null);
const opDeterioro = ref(null);

const tasaDesincorporacion = ref([]);
const deterioro = ref([]);


const actualTasa = computed(() => {
  const len = tasaDesincorporacion.value.length;
  if (len === 0) return { value: '0%', status: '', message: '' };
  const val = tasaDesincorporacion.value[len - 1].value;
  const status = val <= 5 ? 'success' : val > 10 ? 'danger' : 'warn';
  const message = tasaDesincorporacion.value[len - 1]?.label || 'Sin datos';
  return { value: `${val}%`, status, message };
});

const actualDeterioro = computed(() => {
  const len = deterioro.value.length;
  if (len === 0) return { value: '0%', status: '', message: '' };
  const val = deterioro.value[len - 1].value;
  const status = val <= 20 ? 'success' : val > 30 ? 'danger' : 'warn';
  const message = deterioro.value[len - 1]?.label || 'Sin datos';
  return { value: `${val}%`, status, message };
});

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
  const [resTasa, resDeterioro] = await Promise.all([
    metricasServices.obtenerKPI('ITDB'),
    metricasServices.obtenerKPI('IDD')
  ]);

  if (resTasa?.length) {
    tasaDesincorporacion.value = procesarHistorial(resTasa[0].historial_metricas);
  }

  if (resDeterioro?.length) {
    deterioro.value = procesarHistorial(resDeterioro[0].historial_metricas);
  }

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
    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
      <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <span class="font-bold text-base dark:text-slate-50">Tasa de desincorporación mensual</span>
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
                <Tag :value="'Meta: > 5%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'5% - 10%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
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
          <span class="font-bold text-base dark:text-slate-50">Historial de desincorporaciones por deterioro</span>
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
                <Tag :value="'Meta: < 20%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'20% - 30%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
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
</template>