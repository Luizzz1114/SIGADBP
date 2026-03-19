<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Movimientos/MovimientoRegister.vue';
import DrawerView from '@/components/Movimientos/MovimientoView.vue';
import DrawerEdit from '@/components/Movimientos/MovimientoEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import movimientosServices from '@/services/movimientos.services';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista
const items = [{ label: 'Movimientos', route: '/movimientos' }];

const columns = [
  { field: 'fecha', header: 'Fecha', type: 'fecha' },
  { field: 'tipo', header: 'Tipo de movimiento' },
  { field: 'cantidad_bienes', header: 'Cantidad de bienes', type: 'codigo' },
  { field: 'dependencia_destino', header: 'Dependencia destino' },
  { field: 'receptor', header: 'Responsable receptor' },
];

const filtros = [
  {
    field: 'tipo', 
    placeholder: 'Filtrar por tipo de movimiento',
    options: ['Traslado', 'Cambio de personal'],
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedMovimiento.value = await obtenerMovimiento(item.id);
  if (selectedMovimiento.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedMovimiento.value = await obtenerMovimiento(item.id);
  if (selectedMovimiento.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Tipo de movimiento': item.tipo,
    'Cantidad': `${item.cantidad_bienes} Bienes`,
    'Fecha': item.fecha,
    'Dependencia origen': item.dependencia_origen,
    'Responsable cedente': item.cedente,
    'Dependencia destino': item.dependencia_destino,
    'Responsable receptor': item.receptor,
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const movimientos = ref([]);
const selectedMovimiento = ref(null);

async function listarMovimientos() {
  try {
    movimientos.value = await movimientosServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar movimientos: ', error);
  }
}

async function obtenerMovimiento(id) {
  try {
    return await movimientosServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener movimiento: ', error);
  }
}

async function crearMovimiento(movimiento) {
  try {
    const respuesta = await movimientosServices.crear(movimiento);
    showSuccess(respuesta.message);
    await listarMovimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear movimiento: ', error);
  }
}

async function actualizarMovimiento(movimiento) {
  try {
    const respuesta = await movimientosServices.actualizar(movimiento);
    showSuccess(respuesta.message);
    await listarMovimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar movimiento: ', error);
  }
}

async function eliminarMovimiento(id) {
  try {
    const respuesta = await movimientosServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarMovimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al eliminar movimiento: ', error);
  }
}

const totalMes = computed(() => {
  const hoy = new Date();
  const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const anioActual = hoy.getFullYear().toString();
  const target = `${mesActual}/${anioActual}`;
  return movimientos.value.filter(m => 
    m.fecha?.includes(`/${target}`)
  ).length;
});

onMounted(async() => {
  await listarMovimientos();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-priority-arrows rotate-90!"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Movimientos</span>
          <span class="-mt-0.5 text-xs text-slate-400">Traslado de bienes y reasignación de responsables</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Nuevo Movimento" icon="fi-sr-plus-small"  />
    </div>

    <div class="flex items-stretch gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card label="Movimientos este mes" :value="totalMes" icon="fi-rr-priority-arrows rotate-90!" />
    </div>

    <Table
      :data="movimientos"
      :columns="columns"
      :globalFilterFields="['fecha', 'tipo', 'dependencia_destino', 'receptor']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearMovimiento" />
  <DrawerView v-model:visible="isDrawerViewOpen" :movimiento="selectedMovimiento" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :movimiento="selectedMovimiento" @confirmEdit="actualizarMovimiento" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarMovimiento" />

</template>