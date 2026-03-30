<script setup>
import { ref, onMounted } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import PresupuestosResumen from '@/components/Presupuestos/PresupuestosResumen.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Presupuestos/PresupuestoRegister.vue';
import DrawerView from '@/components/Presupuestos/PresupuestoView.vue';
import DrawerEdit from '@/components/Presupuestos/PresupuestoEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import presupuestosServices from '@/services/presupuestos.services.js';
import metricasServices from '@/services/metricas.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError, showWarning } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Presupuestos', route: '/presupuestos' }];

const columns = [
  { field: 'codigo', header: 'Partida presupuestaria', type: 'codigo' },
  { field: 'tipo', header: 'Descripción', type: 'tipo_presupuesto' },
  { field: 'montousd', header: 'Monto asignado (USD)', type: 'usd' },
  { field: 'anio', header: 'Año fiscal y semestre', type: 'anio_fiscal' },
  { field: 'estatus', header: 'Estatus', type: 'estatus' },
];

const filtros = [
  {
    field: 'estatus', 
    placeholder: 'Filtrar por estatus',
    options: [ 'Activo', 'Cerrado' ]
  },
  {
    field: 'tipo',
    placeholder: 'Filtrar por tipo de presupuesto',
    options: ['Compra de Muebles', 'Compra de Equipos Tecnológicos', 'Compra de Vehículos / Equipos de Elevación', 'Mantenimiento de Bienes']
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedPresupuesto.value = await obtenerPresupuesto(item.id);
  if (selectedPresupuesto.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedPresupuesto.value = await obtenerPresupuesto(item.id);
  if (selectedPresupuesto.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Partida': item.codigo,
    'Tipo': item.tipo,
    'Descripción': item.descripcion,
    'Monto asignado (USD)': item.montousd,
    'Año fiscal y semestre': `${item.anio} - ${item.semestre}`
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const presupuestos = ref([]);
const selectedPresupuesto = ref(null);
const dataResumen = ref(null);

async function listarPresupuestos() {
  try {
    presupuestos.value = await presupuestosServices.listar();
    dataResumen.value = await metricasServices.presupuestosResumen();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar presupuestos: ', error);
  }
}

async function crearPresupuesto(presupuesto) {
  try {
    const respuesta = await presupuestosServices.crear(presupuesto);
    showSuccess(respuesta.message);
    await listarPresupuestos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear presupuesto: ', error);
  }
}

async function obtenerPresupuesto(id) {
  try {
    return await presupuestosServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener presupuesto: ', error);
  }
}

async function actualizarPresupuesto(presupuesto) {
  try {
    const respuesta = await presupuestosServices.actualizar(presupuesto);
    showSuccess(respuesta.message);
    await listarPresupuestos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar presupuesto: ', error);
  }
}

async function eliminarPresupuesto(id) {
  try {
    const respuesta = await presupuestosServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarPresupuestos();
  } catch (error) {
    if (error.response?.status === 409) {
      showWarning(error.response?.data?.message);
      return;
    }
    showError(error.response?.data?.message);
    console.error('Error al eliminar presupuesto: ', error);
  }
}

onMounted(async () => {
  await listarPresupuestos();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Presupuestos</span>
          <span class="-mt-0.5 text-xs text-slate-400">Control y seguimiento del presupuesto de bienes</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <Button as="router-link" to="/presupuestos/estadisticas" label="Estadísticas" icon="fi-sr-arrow-trend-up" severity="secondary" outlined class="h-9" />
        <Button @click="isDrawerRegisterOpen = true" type="button" label="Nueva Partida" icon="fi-sr-plus-small" />
      </div>
    </div>

    <PresupuestosResumen :data="dataResumen" />

    <Table
      :data="presupuestos"
      :columns="columns"
      :globalFilterFields="['codigo', 'tipo', 'descripcion', 'anio']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearPresupuesto" />
  <DrawerView v-model:visible="isDrawerViewOpen" :presupuesto="selectedPresupuesto" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :presupuesto="selectedPresupuesto" @confirmEdit="actualizarPresupuesto" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarPresupuesto" />

</template>