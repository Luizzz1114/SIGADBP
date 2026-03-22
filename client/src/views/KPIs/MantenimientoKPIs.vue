<script setup>
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import BarChart from '@/components/Graficos/BarChart.vue';
import metricasServices from '@/services/metricas.services';
import { computed, onMounted, ref } from 'vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Mantenimiento', route: '/mantenimiento' },
  { label: 'Estadísticas', route: '/mantenimiento/estadisticas' }
];

const opDiasPromedio = ref(null);
const opOperatividad = ref(null);

const diasPromedio = ref([]);
const operatividad = ref([]);


const actualDiasPromedio = computed(() => {
  const len = diasPromedio.value.length;
  if (len === 0) return { value: '0 días', status: '', message: '' };
  const val = diasPromedio.value[len - 1].value;
  const status = val <= 5 ? 'success' : val > 15 ? 'danger' : 'warn';
  const message = diasPromedio.value[len - 1]?.label || 'Sin datos';
  return { value: `${val} días`, status, message };
});

const actualOperatividad = computed(() => {
  const len = operatividad.value.length;
  if (len === 0) return { value: '0%', status: '', message: '' };
  const val = operatividad.value[len - 1].value;
  const status = val === 100 ? 'success' : val < 60 ? 'danger' : 'warn';
  const message = operatividad.value[len - 1]?.label || 'Sin datos';
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
  const [resDiasPromedio, resOperatividad] = await Promise.all([
    metricasServices.obtenerKPI('ITPMB'),
    metricasServices.obtenerKPI('IBODP'),
  ]);

  if (resDiasPromedio?.length) {
    diasPromedio.value = procesarHistorial(resDiasPromedio[0].historial_metricas);
  }

  if (resOperatividad?.length) {
    operatividad.value = procesarHistorial(resOperatividad[0].historial_metricas);
  }

});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4 gap-5">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-screw-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50 whitespace-nowrap">Estadísticas de mantenimiento</span>
          <span class="-mt-0.5 text-xs text-slate-400">Análisis de la efectividad de los mantenimientos realizados</span>
        </div>
      </div>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card
        label="Tiempo Medio de Mantenimiento"
        icon="fi-rr-time-fast"
        :value="actualDiasPromedio.value"
        :status="actualDiasPromedio.status"
        :message="actualDiasPromedio.message"
      />
      <Card
        label="Tasa de Operatividad"
        icon="fi-rr-check-circle"
        :value="actualOperatividad.value"
        :status="actualOperatividad.status"
        :message="actualOperatividad.message"
      />
    </div>

    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
      <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <span class="font-bold text-base dark:text-slate-50">Promedio mensual de días de mantenimiento</span>
        </div>
        <div class="flex items-center gap-3">
          <Button @click="opDiasPromedio.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opDiasPromedio">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag :value="'Meta: < 6 días'" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'6 a 15 días'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'> 15 días'" severity="danger" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
      </div>
      <div class="w-full p-5">
        <BarChart
          :data="diasPromedio"
          type="Promedio"
          unit="días"
          details="dias_promedio"
        />
      </div>
    </div>

    <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
      <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <span class="font-bold text-base dark:text-slate-50">Historial de operatividad post-mantenimiento</span>
        </div>
        <div class="flex items-center gap-3">
          <Button @click="opOperatividad.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8! shrink-0" />
          <Popover ref="opOperatividad">
            <div class="flex flex-col gap-3 p-1">
              <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                <i class="fi-br-info text-blue-500"></i>
                Rangos de alerta
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <Tag :value="'Meta: 100%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'99% - 60%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                <Tag :value="'< 60%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
              </div>
            </div>
          </Popover>
        </div>
      </div>
      <div class="w-full p-5">
        <AreaChart
          :data="operatividad"
          unit="Operatividad"
          details="mantenimiento_operatividad"
        />
      </div>
    </div>

  </div>
</template>