<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from '@/components/Card.vue';
import StackedBarChart from '@/components/Graficos/StackedBarChart.vue';
import metricasServices from '@/services/metricas.services';
import { listarDependencias } from '@/utils/fetch.utils';
import { adaptarDatosStackedBar } from '@/utils/graficos.formatter.js';


// --- Configuración de la vista ---
const defaultData = {
  total_bienes: "0",
  bienes_operativos: "0",
  bienes_mantenimiento: "0",
  porcentaje_operativos: "0.00",
  porcentaje_mantenimiento: "0.00"
};


// --- Variables Reactivas ---
const opInfoKPIs = ref();
const dataGeneral = ref([]);
const dependencias = ref([]);
const selectedDependencia = ref(null);
const datosActualesList = ref([]);
const isMounted = ref(false); 


// --- Propiedades Computadas ---
const currentData = computed(() => {
  if (!selectedDependencia.value || datosActualesList.value.length === 0) {
    return defaultData;
  }
  return datosActualesList.value.find(item => item.id_dependencia === selectedDependencia.value) || defaultData;
});

const chartData = computed(() => {
  if (!selectedDependencia.value || dataGeneral.value.length === 0) return [];
  return adaptarDatosStackedBar(dataGeneral.value, selectedDependencia.value);
});

const statusDisponibilidad = computed(() => {
  const porcentaje = parseFloat(currentData.value.porcentaje_operativos);
  if (porcentaje >= 90) return 'success';
  if (porcentaje >= 80) return 'warning';
  return 'danger';
});

const statusMantenimiento = computed(() => {
  const porcentaje = parseFloat(currentData.value.porcentaje_mantenimiento);
  if (porcentaje <= 5) return 'success';
  if (porcentaje <= 15) return 'warning';
  return 'danger';
});

const barrasData = computed(() => [
  {
    label: 'Tasa de disponibilidad',
    value: currentData.value.bienes_operativos,
    percentage: currentData.value.porcentaje_operativos,
    color: 'bg-emerald-400'
  },
  {
    label: 'Índice de mantenimiento',
    value: currentData.value.bienes_mantenimiento,
    percentage: currentData.value.porcentaje_mantenimiento,
    color: 'bg-slate-400'
  }
]);


// --- Operaciones con la API ---
onMounted(async () => {
  try {
    const [res, resDep, res2] = await Promise.all([
      metricasServices.obtenerKPI('TDRB'),
      listarDependencias(),
      metricasServices.disponibilidadDependencia(), 
    ]);

    dataGeneral.value = res || [];
    dependencias.value = resDep || [];
    datosActualesList.value = res2 || [];

    if (dependencias.value.length > 0) {
      selectedDependencia.value = dependencias.value[0].id;
    }
  } catch (error) {
    console.error("Error cargando datos de estadísticas:", error);
  } finally {
    setTimeout(() => { isMounted.value = true }, 50);
  }
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-start justify-between gap-5 flex-wrap">
      <div class="flex items-center w-full max-w-full md:w-auto">
        <InputGroup class="flex w-full">
          <InputGroupAddon class="h-9! text-sm shrink-0">
            Dependencia
          </InputGroupAddon>
          <Select 
            v-model="selectedDependencia"
            :options="dependencias" 
            optionLabel="nombre"
            optionValue="id" 
            filter 
            placeholder="Seleccione la dependencia" 
            size="small"
            class="h-9! w-full min-w-0"
          />
        </InputGroup>
      </div>
    </div>

    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        label="Total de bienes"
        icon="fi-rr-boxes"
        :value="currentData.total_bienes"
        message="Bienes asignados"
      />
      <Card
        label="Tasa de disponibilidad"
        icon="fi-rr-check-circle"
        :value="currentData.porcentaje_operativos + '%'"
        :status="statusDisponibilidad"
        message="Actual"
      />
      <Card
        label="Índice de mantenimiento"
        icon="fi-rr-tools"
        :value="currentData.porcentaje_mantenimiento + '%'"
        :status="statusMantenimiento"
        message="Actual"
      />
    </div>
    
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex flex-col rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-bars-progress"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Disponibilidad actual de los bienes</span>
          </div>
          <Button @click="opInfoKPIs.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opInfoKPIs">
            <div class="flex flex-col p-1">
              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Tasa de Disponibilidad
                </span>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="Meta: ≥ 90%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="90% a 80%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="> 80%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
              <Divider class="my-4!" />
              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-info text-blue-500"></i>
                  Índice de Mantenimiento
                </span>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="Meta: ≤ 5%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="5% a 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="> 15%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </div>
          </Popover>
        </div>
        <div class="flex flex-col flex-1 p-6 gap-5 w-full">
          <div v-for="(item, index) in barrasData" :key="index" class="flex flex-col gap-1 w-full">
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium text-slate-600 dark:text-slate-200">
                {{ item.label }}
              </span>
              <div class="flex items-center gap-4">
                <span class="font-medium text-slate-500 dark:text-slate-400">
                  {{ item.value }}
                </span>
                <span class="w-12 text-right font-semibold dark:text-slate-200">
                  {{ item.percentage }}%
                </span>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-[width] duration-700 ease-out"
                :class="item.color"
                :style="{ width: isMounted ? `${item.percentage}%` : '0%' }"
              ></div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
            <div class="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
              <div class="flex items-center gap-2">
                <i class="fi-sr-check-circle text-emerald-400 text-sm"></i>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-200">Tasa de Disponibilidad</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-4">
                Mide el porcentaje de bienes que están 100% operativos y listos para ser utilizados por la dependencia, garantizando la continuidad de las operaciones.
              </p>
            </div>
            <div class="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
              <div class="flex items-center gap-2">
                <i class="fi-sr-tools text-slate-400 text-sm"></i>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-200">Índice de Mantenimiento</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-4">
                Indica la proporción de bienes que se encuentran actualmente inoperativos debido a reparaciones preventivas o correctivas en curso.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-time-forward"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Histórico de disponibilidad de bienes</span>
          </div>
        </div>
        <div class="w-full p-5">
          <StackedBarChart 
            :data="chartData" 
            labelBottom="Bienes operativos"
            labelTop="En mantenimiento"
            colorBottom="fill-emerald-400 bg-emerald-400"
            usePatternTop
          />
        </div>
      </div>
    </div>
  </div>
</template>