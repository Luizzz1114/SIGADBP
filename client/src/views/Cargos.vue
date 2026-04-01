<script setup>
import { ref, onMounted, provide } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MiniCard from '@/components/MiniCard.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Cargos/CargoRegister.vue';
import DrawerEdit from '@/components/Cargos/CargoEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import cargosServices from '@/services/cargos.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError, showWarning } = useNotificaciones();


// --- Configuración de la vista ---
provide('optionView', false);
const items = [{ label: 'Cargos', route: '/cargos' }];

const columns = [
  { field: 'nombre', header: 'Nombre del cargo', sortable: true },
  { field: 'tipo', header: 'Tipo de Cargo', type: 'tipo_cargo', sortable: true },
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleEditRequest = (item) => {
  selectedCargo.value = item;
  isDrawerEditOpen.value = true;
}

const handleDeleteRequest = (item) => {
  const info = {
    'Nombre del cargo': item.nombre,
    'Tipo de cargo': item.tipo,
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const cargos = ref([]);
const selectedCargo = ref(null);

async function listarCargos() {
  try {
    cargos.value = await cargosServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar cargos: ', error);
  }
}

async function crearCargo(cargo) {
  try {
    const respuesta = await cargosServices.crear(cargo);
    showSuccess(respuesta.message);
    await listarCargos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear cargo: ', error);
  }
}

async function actualizarCargo(cargo) {
  try {
    const respuesta = await cargosServices.actualizar(cargo);
    showSuccess(respuesta.message);
    await listarCargos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar cargo: ', error);
  }
}

async function eliminarCargo(id) {
  try {
    const respuesta = await cargosServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarCargos();
  } catch (error) {
    if (error.response?.status === 409) {
      showWarning(error.response?.data?.message);
      return;
    }
    showError(error.response?.data?.message);
    console.error('Error al eliminar cargo: ', error);
  }
}

onMounted(async () => {
  await listarCargos();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-briefcase"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Cargos</span>
          <span class="-mt-1 text-xs text-slate-400">Gestión de cargos y niveles organizacionales</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Agregar Cargo" icon="fi-sr-plus-small" />
    </div>

    <div class="flex items-stretch gap-4 mt-4 overflow-x-auto pb-0.5 snap-x snap-mandatory hide-scrollbar">
      <MiniCard label="Total de Cargos" :value="cargos.length" icon="fi-sr-briefcase" color="blue" />
      <MiniCard label="Responsable Patrimonial Primario" :value="cargos.filter(cargo => cargo.tipo === 'Responsable Patrimonial Primario').length" icon="fi-sr-boss" color="violet" />
      <MiniCard label="Responsable Patrimonial de Uso y Custodia" :value="cargos.filter(cargo => cargo.tipo === 'Responsable Patrimonial de Uso y Custodia').length" icon="fi-sr-user-tie-hair" color="indigo" />
      <MiniCard label="Personal de la Unidad de Administración" :value="cargos.filter(cargo => cargo.tipo === 'Personal de la Unidad de Administración').length" icon="fi-sr-user" color="sky" />
    </div>

    <Table
      :data="cargos" 
      :columns="columns"
      :globalFilterFields="['nombre', 'tipo']"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />
    
  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearCargo" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :cargo="selectedCargo" @confirmEdit="actualizarCargo" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarCargo" />

</template>