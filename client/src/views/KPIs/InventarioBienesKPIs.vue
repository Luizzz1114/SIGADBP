<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import AreaChart from '@/components/Graficos/AreaChart.vue';
import BarChart from '@/components/Graficos/BarChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { obtenerMesAnio } from '@/utils/formatters.js';


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

const actualOperatividad = computed(() => {
  const len = operatividad.value.length;
  if (len === 0) return { value: '0%', status: '', message: '' };
  const val = operatividad.value[len - 1].value;
  const { min, max } = operatividadRangos.value;
  const status = val >= min ? 'success' : val <= max ? 'danger' : 'warn';
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
  const { min, max } = crecimientoRangos.value;
  const status = val < min ? 'danger' : val > max ? 'warn' : 'success';
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
              <Tag :value="`< ${crecimientoRangos.min}%`" severity="danger" class="ring-1 ring-inset ring-current/10" />
              <Tag :value="`Meta: ${crecimientoRangos.min}% a ${crecimientoRangos.max}%`" severity="success" class="ring-1 ring-inset ring-current/10" />
              <Tag :value="`> ${crecimientoRangos.max}%`" severity="warn" class="ring-1 ring-inset ring-current/10" />
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
              <Tag :value="`Meta: > ${operatividadRangos.min - 1}%`" severity="success" class="ring-1 ring-inset ring-current/10"/>
              <Tag :value="`${operatividadRangos.min - 1}% - ${operatividadRangos.max}%`" severity="warn" class="ring-1 ring-inset ring-current/10"/>
              <Tag :value="`< ${operatividadRangos.max}%`" severity="danger" class="ring-1 ring-inset ring-current/10"/>
            </div>
          </div>
        </Popover>
      </div>
      <div class="w-full p-5">
        <AreaChart :data="operatividad" unit="Operatividad" details="bienes" />
      </div>
    </div>
  </div>
</template>