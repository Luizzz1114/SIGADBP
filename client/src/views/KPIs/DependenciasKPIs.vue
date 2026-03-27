<script setup>
import { ref, onMounted, computed } from 'vue';

// --- Componentes ---
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import StackedBarChart from '@/components/Graficos/StackedBarChart.vue';

// --- Servicios y Utilidades ---
import metricasServices from '@/services/metricas.services';
import { listarDependencias } from '@/utils/fetch.utils';
import { adaptarDatosStackedBar } from '@/utils/graficos.formatter.js';

// --- Configuración de la vista ---
const items = [
  { label: 'Inventario', route: '/inventario' },
  { label: 'Estadísticas', route: '/inventario/estadisticas2' }
];

// Objeto por defecto para evitar redundancias
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

// 1. Obtiene los datos de la dependencia actualmente seleccionada
const currentData = computed(() => {
  if (!selectedDependencia.value || datosActualesList.value.length === 0) {
    return defaultData;
  }
  return datosActualesList.value.find(item => item.id_dependencia === selectedDependencia.value) || defaultData;
});

// 2. Transforma los datos para el StackedBarChart automáticamente cuando cambia la dependencia
const chartData = computed(() => {
  if (!selectedDependencia.value || dataGeneral.value.length === 0) return [];
  return adaptarDatosStackedBar(dataGeneral.value, selectedDependencia.value);
});

// 3. Estatus dinámico para la Tasa de Disponibilidad
const statusDisponibilidad = computed(() => {
  const porcentaje = parseFloat(currentData.value.porcentaje_operativos);
  if (porcentaje >= 80) return 'success';
  if (porcentaje >= 50) return 'warning';
  return 'danger';                       
});

// 4. Estatus dinámico para el Índice de Mantenimiento
const statusMantenimiento = computed(() => {
  const porcentaje = parseFloat(currentData.value.porcentaje_mantenimiento);
  if (porcentaje <= 15) return 'success';
  if (porcentaje <= 35) return 'warning';
  return 'danger';                       
});

// 5. Array para iterar sobre las barras
const barrasData = computed(() => [
  {
    label: 'Bienes Operativos',
    value: currentData.value.bienes_operativos,
    percentage: currentData.value.porcentaje_operativos,
    color: 'bg-emerald-400'
  },
  {
    label: 'Bienes en Mantenimiento',
    value: currentData.value.bienes_mantenimiento,
    percentage: currentData.value.porcentaje_mantenimiento,
    color: 'bg-amber-400'
  }
]);

// --- Ciclo de Vida ---
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
    // Activar la animación de las barras, asegurado por el bloque finally
    setTimeout(() => { isMounted.value = true }, 50);
  }
});
</script>

<template>
  <Breadcrumbs :items="items" />
  
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-start justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-building"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Estadísticas de las dependencias</span>
          <span class="-mt-0.5 text-xs text-slate-400">Análisis de la disponibilidad de los bienes</span>
        </div>
      </div>
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
        label="Tasa de disponibilidad de bienes"
        icon="fi-rr-check-circle"
        :value="currentData.porcentaje_operativos + '%'"
        :status="statusDisponibilidad"
        message="Actual"
      />
      <Card
        label="Índice de afectación por mantenimiento"
        icon="fi-rr-tools"
        :value="currentData.porcentaje_mantenimiento + '%'"
        :status="statusMantenimiento"
        message="Actual"
      />
    </div>
    
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-8 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-bars-progress"></i>
            </div>
            <span class="font-bold text-base dark:text-slate-50">Disponibilidad actual de los bienes</span>
          </div>
          <Button @click="opInfoKPIs.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-9! shrink-0" />
          
          <Popover ref="opInfoKPIs">
            <div class="flex flex-col gap-5 p-2 w-72">
              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-check-circle text-emerald-500"></i>
                  Tasa de Disponibilidad
                </span>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="< 50%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="50% a 79%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Meta: >= 80%" severity="success" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
              
              <hr class="border-slate-200 dark:border-slate-700">

              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <i class="fi-br-tools text-amber-500"></i>
                  Índice de Mantenimiento
                </span>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="Meta: <= 15%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="16% a 35%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="> 35%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </div>
          </Popover>
        </div>
        
        <div class="w-full p-6 flex flex-col gap-5">
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
            <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-[width] duration-700 ease-out"
                :class="item.color"
                :style="{ width: isMounted ? `${item.percentage}%` : '0%' }"
              ></div>
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
            labelBottom="Bienes Operativos"
            labelTop="En Mantenimiento"
            colorBottom="fill-emerald-400 bg-emerald-400"
            usePatternTop
          />
        </div>
      </div>

    </div>
  </div>
</template>