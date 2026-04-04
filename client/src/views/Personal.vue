<script setup>
import { ref, onMounted } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MiniCard from '@/components/MiniCard.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Personal/PersonalRegister.vue';
import DrawerView from '@/components/Personal/PersonalView.vue';
import DrawerEdit from '@/components/Personal/PersonalEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import personalServices from '@/services/personal.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError, showWarning } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Personal', route: '/personal' }];

const columns = [
  { field: 'cedula', header: 'Cédula', sortable: true },
  { field: 'empleado', header: 'Nombres y apellidos', sortable: true },
  { field: 'cargo', header: 'Cargo', sortable: true },
  { field: 'dependencia', header: 'Dependencia', sortable: true },
  { field: 'telefono', header: 'Teléfono', type: 'telefono', sortable: false },
  { field: 'estatus', header: 'Estatus', type: 'estatus', sortable: false },
];

const filtros = [
  {
    field: 'estatus', 
    placeholder: 'Filtrar por estatus',
    options: ['Activo', 'Inactivo'],
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedPersonal.value = await obtenerPersonal(item.id);
  if (selectedPersonal.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedPersonal.value = await obtenerPersonal(item.id);
  if (selectedPersonal.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Nombres': item.nombres,
    'Apellidos': item.apellidos,
    'Cédula': item.cedula
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const personal = ref([]);
const selectedPersonal = ref(null);

async function listarPersonal() {
  try {
    personal.value = await personalServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar personal: ', error);
  }
}

async function crearPersonal(data) {
  try {
    const respuesta = await personalServices.crear(data);
    showSuccess(respuesta.message);
    await listarPersonal();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear personal: ', error);
  }
}

async function obtenerPersonal(id) {
  try {
    return await personalServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener personal: ', error);
  }
}

async function actualizarPersonal(personalActualizar) {
  try {
    const respuesta = await personalServices.actualizar(personalActualizar);
    showSuccess(respuesta.message);
    await listarPersonal();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar personal: ', error);
  }
}

async function eliminarPersonal(id) {
  try {
    const respuesta = await personalServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarPersonal();
  } catch (error) {
    if (error.response?.status === 409) {
      showWarning(error.response?.data?.message);
      return;
    }
    showError(error.response?.data?.message);
    console.error('Error al eliminar personal: ', error);
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
          <span class="font-bold text-lg dark:text-slate-50">Personal</span>
          <span class="-mt-1 text-xs text-slate-400">Gestión del personal</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <Button as="router-link" to="/personal/estadisticas" label="Estadísticas" icon="fi-sr-arrow-trend-up" severity="secondary" outlined class="h-9" />
        <Button @click="isDrawerRegisterOpen = true" type="button" label="Agregar Personal" icon="fi-sr-plus-small" />
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mt-4">
      <MiniCard label="Total de Personal" :value="personal.length" icon="fi-sr-employee-man" color="blue" />
      <MiniCard label="Personal Activo" :value="personal.filter(p => p.estatus === 'Activo').length" icon="fi-sr-user-check" color="green" />
      <MiniCard label="Personal Inactivo" :value="personal.filter(p => p.estatus === 'Inactivo').length" icon="fi-sr-remove-user" color="slate" />
    </div>

    <Table
      :data="personal"
      :columns="columns"
      :globalFilterFields="['cedula', 'empleado', 'cargo', 'dependencia']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearPersonal" />
  <DrawerView v-model:visible="isDrawerViewOpen" :personal="selectedPersonal" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :personal="selectedPersonal" @confirmEdit="actualizarPersonal" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarPersonal" />

</template>