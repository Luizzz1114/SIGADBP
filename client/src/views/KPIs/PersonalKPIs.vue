<script setup>
import Breadcrumbs from '@/components/Breadcrumbs.vue';


// --- Configuración de la vista ---
const items = [
  { label: 'Personal', route: '/personal' },
  { label: 'Estadísticas', route: '/personal/estadisticas' }
];
</script>

<template>
  <Breadcrumbs :items="items" />
    <div class="flex flex-col px-4 pb-4 gap-5">
      <div class="flex items-center justify-between gap-5 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
            <i class="fi-sr-employee-man"></i>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg dark:text-slate-50">Estadísticas del personal</span>
            <span class="-mt-0.5 text-xs text-slate-400">Formación y crecimiento de la Unidad de Administación</span>
          </div>
        </div>
      </div>

    </div>
</template>