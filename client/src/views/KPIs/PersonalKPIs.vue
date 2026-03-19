<script setup>
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import DistributionBar from '@/components/Graficos/DistributionBar.vue';
import metricasServices from '@/services/metricas.services';
import { onMounted, ref } from 'vue';

// --- Configuración de la vista ---
const items = [
  { label: 'Personal', route: '/personal' },
  { label: 'Estadísticas', route: '/personal/estadisticas' }
];

const opCapacitacion = ref(null);
const opSatisfaccion = ref(null);

const data = ref({});

const capacitados = ref([
  { label: 'Capacitados', color: '#00d492', value: 0, percentage: 0 },
  { label: 'No capacitados', color: 'url(#stripes)', value: 0, percentage: 0 },
]);

const satisfechos = ref([
  { label: 'Satisfechos', color: '#50a2ff', value: 0, percentage: 0 },
  { label: 'Insatisfechos', color: 'url(#stripes)', value: 0, percentage: 0 },
]);

const evaluateStatus = (percentage) => {
  if (percentage >= 80) {
    return { label: 'Óptimo', severity: 'success' };
  } else if (percentage >= 60) {
    return { label: 'Atención', severity: 'warn' };
  } else {
    return { label: 'Crítico', severity: 'danger' };
  }
};

const updateStats = (targetRef, cantSi, cantNo, porcSi) => {
  const y = Number(cantSi) || 0;
  const n = Number(cantNo) || 0;
  const p = Math.round(Number(porcSi) || 0);
  targetRef.value[0].value = y;
  targetRef.value[0].percentage = p;
  targetRef.value[1].value = n;
  targetRef.value[1].percentage = (y === 0 && n === 0) ? 0 : 100 - p;
};

onMounted(async () => {
  const response = await metricasServices.evaluacionesResumen();
  data.value = response;
  updateStats(
    capacitados, 
    response.personal_capacitado, 
    response.personal_no_capacitado, 
    response.porcentaje_capacitacion
  );
  
  updateStats(
    satisfechos, 
    response.personal_satisfecho, 
    response.personal_no_satisfecho, 
    response.porcentaje_satisfaccion
  );
});
</script>

<template>
  <Breadcrumbs :items="items" />
    <div class="flex flex-col px-4 pb-4 gap-5">
      <div class="flex items-center justify-between gap-5 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="grid place-items-center shrink-0 size-10 text-xl rounded-lg bg-blue-500 text-white">
            <i class="fi-sr-employee-man"></i>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg dark:text-slate-50">Estadísticas del personal</span>
            <span class="-mt-0.5 text-xs text-slate-400">Formación y crecimiento de la Unidad de Administación</span>
          </div>
        </div>
      </div>
      <div class="flex gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
        <Card
          label="Personal evaluado"
          icon="fi-rr-user"
          :value="data.total_evaluados"
        />
        <Card
          label="Último semestre evaluado"
          icon="fi-rr-calendar"
          :value="data.semestre"
        />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
          <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center gap-2">
              <span class="font-bold text-base dark:text-slate-50">Personal capacitado</span>
              <Tag
                :value="evaluateStatus(capacitados[0].percentage).label"
                :severity="evaluateStatus(capacitados[0].percentage).severity"
                class="ring-1 ring-inset ring-current/10"
              />
            </div>
            <div class="flex items-center gap-3">
              <Button @click="opCapacitacion.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8!" />
              <Popover ref="opCapacitacion">
                <div class="flex flex-col gap-3 p-1">
                  <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                    <i class="fi-br-info text-blue-500"></i>
                    Rangos de alerta
                  </span>
                  <div class="flex items-center gap-2 flex-wrap">
                    <Tag :value="'Meta: > 79%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                    <Tag :value="'79% - 60%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                    <Tag :value="'< 60%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                  </div>
                </div>
              </Popover>
            </div>
          </div>
          <div class="w-full p-5">
            <DistributionBar
              :data="capacitados"
            />
          </div>
        </div>

        <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden">
          <div class="flex items-center justify-between gap-x-4 px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center gap-2">
              <span class="font-bold text-base dark:text-slate-50">Satisfacción del personal</span>
              <Tag
                :value="evaluateStatus(satisfechos[0].percentage).label"
                :severity="evaluateStatus(satisfechos[0].percentage).severity"
                class="ring-1 ring-inset ring-current/10"
              />
            </div>
            <div class="flex items-center gap-3">
              <Button @click="opSatisfaccion.toggle($event)" severity="secondary" outlined icon="fi-rr-info" class="size-8!" />
              <Popover ref="opSatisfaccion">
                <div class="flex flex-col gap-3 p-1">
                  <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                    <i class="fi-br-info text-blue-500"></i>
                    Rangos de alerta
                  </span>
                  <div class="flex items-center gap-2 flex-wrap">
                    <Tag :value="'Meta: > 79%'" severity="success" class="ring-1 ring-inset ring-current/10" />
                    <Tag :value="'79% - 60%'" severity="warn" class="ring-1 ring-inset ring-current/10" />
                    <Tag :value="'< 60%'" severity="danger" class="ring-1 ring-inset ring-current/10" />
                  </div>
                </div>
              </Popover>
            </div>
          </div>
          <div class="w-full p-5">
            <DistributionBar
              :data="satisfechos"
            />
          </div>
        </div>
      </div>
    </div>
</template>