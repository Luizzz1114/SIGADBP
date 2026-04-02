<script setup>
import { onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/InventarioBienes/BienesRegister.vue';
import DrawerView from '@/components/InventarioBienes/BienesView.vue';
import DrawerEdit from '@/components/InventarioBienes/BienesEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import bienesServices from '@/services/bienes.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Inventario', route: '/inventario' }];

const columns = [
  { field: 'numero', header: 'Número de bien', type: 'codigo', sortable: true },
  { field: 'descripcion', header: 'Descripción', type: 'descripcion', sortable: true },
  { field: 'categoria', header: 'Categoría', sortable: true },
  { field: 'dependencia', header: 'Dependencia', sortable: true },
  { field: 'responsable', header: 'Responsable', sortable: true },
  { field: 'estatus', header: 'Estatus', type: 'estatus' }
];

const filtros = [
  {
    field: 'estatus', 
    placeholder: 'Filtrar por estatus',
    options: ['Operativo', 'No asignado', 'Desincorporado', 'En mantenimiento']
  },
  {
    field: 'categoria',
    placeholder: 'Filtrar por categoría',
    options: ['Mueble', 'Tecnológico', 'Vehículo o Equipo de Elevación']
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedBien.value = await obtenerBien(item.id);
  if (selectedBien.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedBien.value = await obtenerBien(item.id);
  if (selectedBien.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Número de bien': item.numero,
    'Descripción': item.descripcion,
    'Categoría': item.categoria
  };
  confirmDialogRef.value.openConfirm(item, info);
}


// --- Operaciones con la API ---
const bienes = ref([]);
const selectedBien = ref(null);

async function listarBienes() {
  try {
    bienes.value = await bienesServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar bienes: ', error);
  }
}

async function obtenerBien(id) {
  try {
    return await bienesServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener bien: ', error);
  }
}

async function crearBien(bien) {
  try {
    const respuesta = await bienesServices.crear(bien);
    showSuccess(respuesta.message);
    await listarBienes();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear bien: ', error);
  }
}

async function actualizarBien(bien) {
  try {
    const respuesta = await bienesServices.actualizar(bien);
    showSuccess(respuesta.message);
    await listarBienes();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar bien: ', error);
  }
}

async function eliminarBien(id) {
  try {
    const respuesta = await bienesServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarBienes();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al eliminar bien: ', error);
  }
}

onMounted(async () => {
  await listarBienes();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Inventario de bienes</span>
          <span class="-mt-1 text-xs text-slate-400">Gestión completa del inventario de bienes</span>
        </div>
      </div>
      <div class="flex items-center flex-wrap gap-4">
        <Button as="router-link" to="/inventario/estadisticas" label="Estadísticas" icon="fi-sr-arrow-trend-up" severity="secondary" outlined class="h-9" />
        <Button @click="isDrawerRegisterOpen = true" label="Agregar Bien" icon="fi-sr-plus-small" class="h-9" />
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 lg:max-w-220">
      <Card label="Total de Bienes" :value="bienes.filter(b => b.estatus !== 'Desincorporado').length" icon="fi-rr-boxes" />
      <Card label="Operativos" :value="bienes.filter(b => b.estatus === 'Operativo').length" icon="fi-rr-check-circle" />
      <Card label="En Mantenimiento" :value="bienes.filter(b => b.estatus === 'En mantenimiento').length" icon="fi-rr-tools" />
      <Card label="No asignados" :value="bienes.filter(b => b.estatus === 'No asignado').length" icon="fi-rr-minus-circle" />
    </div>

    <Table
      :data="bienes" 
      :columns="columns"
      :globalFilterFields="['numero', 'descripcion', 'categoria', 'dependencia', 'responsable']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />
    
  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearBien" />
  <DrawerView v-model:visible="isDrawerViewOpen" :bien="selectedBien" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :bien="selectedBien" @confirmEdit="actualizarBien" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarBien" />

</template>