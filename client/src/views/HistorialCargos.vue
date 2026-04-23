<script setup>
import { ref, onMounted, provide } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Table from '@/components/Table.vue';
import personalServices from '@/services/personal.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
provide('showAcciones', false);

const items = [
  { label: 'Personal', route: '/personal' },
  { label: 'Historial de cargos', route: '/personal/historial' }
];

const columns = [
  { field: 'cedula', header: 'Cédula', sortable: true },
  { field: 'empleado', header: 'Nombres y apellidos', sortable: true },
  { field: 'cargo', header: 'Cargo', sortable: true },
  { field: 'dependencia', header: 'Dependencia', sortable: true },
  { field: 'fecha_ingreso', header: 'Fecha de ingreso', type: 'fecha', sortable: true },
  { field: 'fecha_salida', header: 'Fecha de salida', type: 'fecha', sortable: true },
  { field: 'estado_cargo', header: 'Estatus', type: 'estatus', sortable: false },
];

const filtros = [
  {
    field: 'estado_cargo', 
    placeholder: 'Filtrar por estatus',
    options: ['Actual', 'Anterior'],
  }
];


// --- Operaciones con la API ---
const historial = ref([]);

async function listarPersonal() {
  try {
    historial.value = await personalServices.obtenerHistorial();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener el historial: ', error);
  }
}

onMounted(async () => {
  await listarPersonal();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-employee-man"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Historial de Cargos</span>
          <span class="-mt-1 text-xs text-slate-400">Registro de cambios en los cargos del personal</span>
        </div>
      </div>
    </div>

    <Table
      :data="historial"
      :columns="columns"
      :globalFilterFields="['cedula', 'empleado', 'cargo', 'dependencia']"
      :headerFilters="filtros"
    />

  </div>

</template>