<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import BarChart2 from '@/components/Graficos/BarChart2.vue';
import metricasServices from '@/services/metricas.services';
import { obtenerMesAnio } from '@/utils/formatters';


// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas' }
];

const opRangos = ref();
const opCrecimiento = ref();


// --- Estados ---
const crecimiento = ref([]);
const operatividad = ref([]);
const crecimientoRangos = ref({ min: 0, max: 0 });
const operatividadRangos = ref({ min: 0, max: 0 });

const actualIBEO = computed(() => {
  const len = operatividad.value.length;
  return len > 0 ? operatividad.value[len - 1].value : 0;
});

const variacionCrecimiento = computed(() => {
  const len = crecimiento.value.length;
  if (len < 2) return 0;
  const actual = crecimiento.value[len - 1].value;
  const anterior = crecimiento.value[len - 2].value;
  if (anterior === 0) return 0;
  return (((actual - anterior) / anterior) * 100).toFixed(2);
});

const crecimientoStatus = computed(() => {
  const val = Number(variacionCrecimiento.value);
  const { min, max } = crecimientoRangos.value;
  return val < min ? 'danger' : val > max ? 'warn' : 'success';
});

const operatividadStatus = computed(() => {
  const val = actualIBEO.value;
  const { min, max } = operatividadRangos.value;
  return val >= min ? 'success' : val <= max ? 'danger' : 'warn';
});


// --- Operaciones con la API ---
const procesarHistorial = (historial) => {
  return historial
    .map(item => ({
      ...item,
      label: obtenerMesAnio(item.periodo),
      value: Number(item.valor)
    }))
    .sort((a, b) => (a.fecha > b.fecha ? 1 : -1)); 
};

onMounted(async () => {
  const [resIBEO, resICMI] = await Promise.all([
    metricasServices.obtenerKPI('IBEO'),
    metricasServices.obtenerKPI('ICMI')
  ]);

  if (resICMI?.length) {
    crecimiento.value = procesarHistorial(resICMI[0].historial_metricas);
    crecimientoRangos.value = {
      min: Number(resICMI[0].peligro),
      max: Number(resICMI[0].meta)
    };
  }

  if (resIBEO?.length) {
    operatividad.value = procesarHistorial(resIBEO[0].historial_metricas);
    operatividadRangos.value = {
      min: Number(resIBEO[0].meta),
      max: Number(resIBEO[0].peligro)
    };
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
        :value="variacionCrecimiento + '%'"
        :status="crecimientoStatus"
      />
      <Card
        label="Porcentaje de Operatividad"
        icon="fi-rr-check-circle"
        :value="actualIBEO + '%'"
        :status="operatividadStatus"
      />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Crecimiento del inventario</span>
          <Button @click="opCrecimiento.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8!" />
          <Popover ref="opCrecimiento">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta (Índice)
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag :value="`< ${crecimientoRangos.min}%`" severity="danger" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="`Meta: ${crecimientoRangos.min}% a ${crecimientoRangos.max}%`" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="`> ${crecimientoRangos.max}%`" severity="warn" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-5">
          <BarChart2 :data="crecimiento" type="Bienes" />
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <span class="font-bold text-base dark:text-slate-50">Bienes en estado operativo</span>
          <Button @click="opRangos.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8!" />
          <Popover ref="opRangos" >
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag :value="`Meta: > ${operatividadRangos.min - 1}%`" severity="success" class="ring-1 ring-inset ring-current/10"/>
                <Tag :value="`${operatividadRangos.min - 1}% - ${operatividadRangos.max}%`" severity="warn" class="ring-1 ring-inset ring-current/10"/>
                <Tag :value="`< ${operatividadRangos.max}%`" severity="danger" class="ring-1 ring-inset ring-current/10"/>
              </div>
            </div>
          </Popover>
        </div>
        <div class="w-full p-5">
          <AreaChart :data="operatividad" :ranges="operatividadRangos" type="Operatividad" />
        </div>
      </div>
    </div>
  </div>
</template>