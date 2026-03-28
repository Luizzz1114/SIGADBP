<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import Card from '@/components/Card.vue';
import BienesEstatus from '@/components/PanelControl/BienesEstatus.vue';
import BienesPorDependencia from '@/components/PanelControl/BienesPorDependencia.vue';
import BienesPorCategoria from '@/components/PanelControl/BienesPorCategoria.vue';
import metricasServices from '@/services/metricas.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();

const metricas = ref([]);
const userRole = inject('userData').rol;

const enlaces = [
  { name: 'Inventario de bienes', path: '/inventario/estadisticas', icon: 'fi-rr-boxes' },
  { name: 'Desincorporaciones', path: '/desincorporaciones/estadisticas', icon: 'fi-rr-apps-delete', roles: ['Administrador', 'Supervisor'] },
  { name: 'Mantenimiento', path: '/mantenimiento/estadisticas', icon: 'fi-rr-screw-alt' },
  { name: 'Presupuestos', path: '/presupuestos/estadisticas', icon: 'fi-rr-piggy-bank', roles: ['Administrador'] },
  { name: 'Personal', path: '/personal/estadisticas', icon: 'fi-rr-employee-man', roles: ['Administrador'] },
];

const accesoRapido = computed(() => {
  return enlaces.filter(enlace => {
    return !enlace.roles || enlace.roles.includes(userRole);
  });
});

onMounted(async() => {
  try {
    metricas.value = await metricasServices.obtenerMetricas();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando datos de estadísticas:", error);
  }
});
</script>

<template>
  <Breadcrumbs />
  <div class="flex flex-col gap-5 px-4 pb-4">
    <div class="flex items-center gap-4">
      <div class="grid place-items-center size-10 text-xl rounded-md bg-blue-500 text-white">
        <i class="fi-sr-chart-pie"></i>
      </div>
      <div class="flex flex-col">
        <span class="font-bold text-lg dark:text-slate-50">Panel de control</span>
        <span class="-mt-0.5 text-xs text-slate-400">Resumen general del sistema</span>
      </div>
    </div>

    <div class="flex *:flex-1 gap-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card label="Total de bienes" :value="metricas.total_bienes || 0" icon="fi-rr-boxes" message="Bienes activos" />
      <Card label="Incorporaciones" :value="metricas.incorporaciones_mes || 0" icon="fi-rr-apps-add" message="Este mes" />
      <Card label="Desincorporaciones" :value="metricas.desincorporaciones_mes || 0" icon="fi-rr-apps-delete" message="Este mes" />
      <Card label="Movimientos" :value="metricas.movimientos_mes || 0" icon="fi-rr-priority-arrows rotate-90!" message="Este mes" />
      <Card label="Mantenimientos" :value="metricas.mantenimientos_mes || 0" icon="fi-rr-screw-alt" message="Este mes" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <BienesEstatus />
      <BienesPorCategoria />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <BienesPorDependencia class="xl:col-span-2" />
      
      <div class="flex flex-col shrink-0 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700">
        <div class="flex items-center gap-3 p-4">
          <div class="grid place-items-center shrink-0 size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
            <i class="fi-rr-bolt"></i>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-base dark:text-slate-50">Acceso rápido</span>
            <span class="-mt-0.5 text-xs text-slate-400">Indicadores clave de gestión</span>
          </div>
        </div>
        <ul class="flex flex-col gap-4 px-4 pb-4 text-sm">
          <li v-for="item in accesoRapido" :key="item.name" class="w-full">
            <router-link :to="item.path" class="group flex items-center justify-between rounded-xl p-2.5 font-medium border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 dark:border-slate-750 dark:bg-slate-800/50 dark:hover:border-blue-500/20 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400">
              <div class="flex items-center gap-3">
                <div class="flex size-7 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-slate-200 transition-colors group-hover:ring-blue-200 dark:bg-slate-850 dark:ring-slate-700 dark:group-hover:ring-blue-500/50">
                  <i :class="item.icon" class="text-[0.95rem] transition-colors group-hover:text-blue-500 dark:text-slate-300 dark:group-hover:text-blue-400"></i>
                </div>
                <span>{{ item.name }}</span>
              </div>
              <i class="fi-rr-angle-small-right text-blue-500 opacity-0 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100"></i>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>