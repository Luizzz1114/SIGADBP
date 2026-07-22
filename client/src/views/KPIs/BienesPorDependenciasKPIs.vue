<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from '@/components/Card.vue';
import StackedBarChart from '@/components/Graficos/StackedBarChart.vue';
import metricasServices from '@/services/metricas.services';
import { exportarAImpresion } from '@/utils/imprimir';
import { listarDependencias } from '@/utils/fetch.utils';
import { adaptarDatosStackedBar } from '@/utils/graficos.formatter.js';
import { obtenerMesAnterior } from '@/utils/formatters.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const defaultData = {
  total_bienes: "0",
  bienes_operativos: "0",
  bienes_mantenimiento: "0",
  porcentaje_operativos: "0.00",
  porcentaje_mantenimiento: "0.00"
};

const manejarExportacion = () => {
  const config = {
    elementoRef: chartRef.value,
    datos: chartData.value,
    titulo: 'Histórico de disponibilidad de bienes',
    descripcion: 'Distribución mensual de bienes operativos y en mantenimiento para la dependencia seleccionada.',
    columnas: ['Período', 'Operativos', 'En mantenimiento', 'Total de bienes'],
    formatearFila: (d) => [
      d.label,
      `${d.valueBottom}% - ${d.countBottom || 0} Bienes`,
      `${d.valueTop}% - ${d.countTop || 0} Bienes`,
      `${d.total || 0} Bienes`
    ],
    rangosAlerta: [
      { value: 'Disp. Óptima: ≥ 90%', severity: 'success' },
      { value: 'Disp. Atención: 80 a 89%', severity: 'warn' },
      { value: 'Disp. Crítica: < 80%', severity: 'danger' },
    ]
  };

  exportarAImpresion(config);
};

const chartRef = ref(null);


// --- Variables Reactivas ---
const opInfoKPIs = ref();
const dataGeneral = ref([]);
const dependencias = ref([]);
const selectedDependencia = ref(null);
const datosActualesList = ref([]);
const isMounted = ref(false); 
const mesSeleccionado = ref(obtenerMesAnterior());
const cargando = ref(false);
const maxDate = ref(obtenerMesAnterior());


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
  if (porcentaje >= 80) return 'warn';
  return 'danger';
});

const statusMantenimiento = computed(() => {
  const porcentaje = parseFloat(currentData.value.porcentaje_mantenimiento);
  if (porcentaje <= 5) return 'success';
  if (porcentaje <= 15) return 'warn';
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
const obtenerMesConsulta = () => {
  const mes = mesSeleccionado.value;
  return `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;
};

const cargarMetricas = async () => {
  cargando.value = true;
  try {
    const hasta = obtenerMesConsulta();
    const [res, res1] = await Promise.all([
      metricasServices.obtenerKPI('TDRB', hasta),
      metricasServices.disponibilidadDependencia(),
    ]);

    dataGeneral.value = res || [];
    datosActualesList.value = res1 || [];

  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando datos de estadísticas:", error);
  } finally {
    cargando.value = false;
    setTimeout(() => { isMounted.value = true }, 50);
  }
};

onMounted(async () => {
  try {
    dependencias.value = await listarDependencias() || [];
    if (dependencias.value.length > 0) {
      selectedDependencia.value = dependencias.value[0].id;
    }
    await cargarMetricas();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando dependencias:", error);
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4 flex-wrap">
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
      <DatePicker
        v-model="mesSeleccionado"
        view="month"
        dateFormat="mm/yy"
        showIcon
        :manualInput="false"
        :disabled="cargando"
        :maxDate="maxDate"
        placeholder="Seleccionar mes"
        class="w-full sm:w-52"
        @date-select="cargarMetricas"
        size="small"
        fluid
      />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:max-w-220">
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
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex flex-col rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-bars-progress"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Disponibilidad actual de los bienes</span>
          </div>
          <Button @click="opInfoKPIs.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
          <Popover ref="opInfoKPIs">
            <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Tasa de Disponibilidad
                </span>
                <p>Porcentaje del inventario de esta dependencia que se mantuvo operativo y listo para su uso durante el mes pasado.</p>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="Óptimo: ≥ 90%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Atención: 80% a 89%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Crítico: < 80%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
              <Divider class="my-4!" />
              <div class="flex flex-col gap-2">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Índice de Mantenimiento
                </span>
                <p>Porcentaje de bienes de esta dependencia que estuvieron inoperativos por encontrarse en revisión o reparación a lo largo del mes anterior.</p>
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <Tag value="Óptimo: ≤ 5%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Atención: 6% a 15%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Crítico: > 15%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </div>
          </Popover>
        </div>
        <div class="flex flex-col flex-1 p-5 gap-4 w-full">
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-2">
            <div class="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-750 shadow-xs">
              <div class="flex items-center gap-2">
                <div class="grid place-items-center size-7 text-sm rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
                  <i class="fi-sr-check-circle text-sm"></i>
                </div>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-200">Tasa de Disponibilidad</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-4">
                Mide el porcentaje de bienes que están operativos en la dependencia, garantizando la continuidad de las operaciones.
              </p>
            </div>
            <div class="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-750 shadow-xs">
              <div class="flex items-center gap-2">
                <div class="grid place-items-center size-7 text-sm rounded-lg bg-slate-100 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-400/20">
                  <i class="fi-sr-tools text-sm"></i>
                </div>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-200">Índice de Mantenimiento</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-4">
                Indica la proporción de bienes que se encuentran actualmente inoperativos debido a mantenimientos en curso.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-time-forward"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Histórico de disponibilidad de bienes</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="manejarExportacion()"
              label="Exportar PDF"
              icon="fi-rr-file-export"
              severity="secondary"
              class="h-7! shrink-0"
            />
          </div>
        </div>
        <div ref="chartRef" class="flex-1 flex items-center justify-center w-full p-5 min-h-0">
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