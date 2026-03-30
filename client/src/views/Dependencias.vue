<script setup>
import { ref, onMounted } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MiniCard from '@/components/MiniCard.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Dependencias/DependenciaRegister.vue';
import DrawerView from '@/components/Dependencias/DependenciaView.vue';
import DrawerEdit from '@/components/Dependencias/DependenciaEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import dependenciasServices from '@/services/dependencias.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError, showWarning } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Dependencias', route: '/dependencias' }];

const columns = [
  { field: 'nombre', header: 'Nombre de la Dependencia', sortable: true },
  { field: 'tipo', header: 'Tipo de Dependencia', type: 'tipo_dependencia', sortable: true },
  { field: 'direccion', header: 'Dirección', type: 'direccion', sortable: true },
];

const filtros = [
  {
    field: 'tipo', 
    placeholder: 'Filtrar por tipo de dependencia',
    options: ['Centro de Acopio', 'Módulo', 'Unidad']
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedDependencia.value = await obtenerDependencia(item.id);
  if (selectedDependencia.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedDependencia.value = await obtenerDependencia(item.id);
  if (selectedDependencia.value) {
    isDrawerEditOpen.value = true;  
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Dependencia': item.nombre,
    'Tipo de dependencia': item.tipo,
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const dependencias = ref([]);
const selectedDependencia = ref(null);

async function listarDependencias() {
  try {
    dependencias.value = await dependenciasServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar dependencias: ', error);
  }
}

async function obtenerDependencia(id) {
  try {
    return await dependenciasServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener dependencia: ', error);
  }
}

async function crearDependencia(dependencia) {
  try {
    const respuesta = await dependenciasServices.crear(dependencia);
    showSuccess(respuesta.message);
    await listarDependencias();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear dependencia: ', error);
  }
}

async function actualizarDependencia(dependencia) {
  try {
    const respuesta = await dependenciasServices.actualizar(dependencia);
    showSuccess(respuesta.message);
    await listarDependencias();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar dependencia: ', error);
  }
}

async function eliminarDependencia(id) {
  try {
    const respuesta = await dependenciasServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarDependencias();
  } catch (error) {
    if (error.response?.status === 409) {
      showWarning(error.response?.data?.message);
      return;
    }
    showError(error.response?.data?.message);
    console.error('Error al eliminar dependencia: ', error);
  }
}

onMounted(async () => {
  await listarDependencias();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-building"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Dependencias</span>
          <span class="-mt-0.5 text-xs text-slate-400">Gestión de áreas y ubicaciones</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Agregar Dependencia" icon="fi-sr-plus-small" />
    </div>

    <div class="flex items-stretch gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <MiniCard label="Total de Dependencias" :value="dependencias.length" icon="fi-sr-building" color="blue" />
      <MiniCard label="Centros de Acopio" :value="dependencias.filter(d => d.tipo === 'Centro de Acopio').length" icon="fi-sr-warehouse-alt" color="violet" />
      <MiniCard label="Módulos" :value="dependencias.filter(d => d.tipo === 'Módulo').length" icon="fi-sr-shop" color="indigo" />
      <MiniCard label="Unidades" :value="dependencias.filter(d => d.tipo === 'Unidad').length" icon="fi-sr-desk" color="sky" />
    </div>

    <Table
      :data="dependencias" 
      :columns="columns"
      :globalFilterFields="['nombre', 'tipo', 'direccion']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />
    
  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearDependencia" />
  <DrawerView v-model:visible="isDrawerViewOpen" :dependencia="selectedDependencia" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :dependencia="selectedDependencia" @confirmEdit="actualizarDependencia" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarDependencia" />

</template>