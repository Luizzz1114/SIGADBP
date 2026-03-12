<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MiniCard from '@/components/MiniCard.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Mantenimientos/MantenimientoRegister.vue';
import DrawerView from '@/components/Mantenimientos/MantenimientoView.vue';
import DrawerEdit from '@/components/Mantenimientos/MantenimientoEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import mantenimientoServices from '@/services/mantenimiento.services';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista
const items = [{ label: 'Mantenimiento', route: '/mantenimiento' }];

const columns = [
  { field: 'numero_bien', header: 'Bien', type: 'bien' },
  { field: 'tipo', header: 'Tipo de mantenimiento', type: 'mantenimiento' },
  { field: 'fecha_inicio', header: 'Fecha programada', type: 'fecha' },
  { field: 'dependencia', header: 'Dependencia' },
  { field: 'estatus', header: 'Estatus', type: 'estatus' },
];

const filtros = [
  {
    field: 'estatus', 
    placeholder: 'Filtrar por estatus',
    options: ['En proceso', 'Finalizado', 'Cancelado']
  },
  {
    field: 'tipo', 
    placeholder: 'Filtrar por tipo',
    options: ['Preventivo', 'Correctivo']
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedMantenimiento.value = await leerMantenimiento(item.id);
  if (selectedMantenimiento.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedMantenimiento.value = await leerMantenimiento(item.id);
  if (selectedMantenimiento.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Bien': item.numero,
    'Descripción del bien': item.descripcion,
    'Fecha programada': item.fecha_inicio,
    'Tipo de mantenimiento': item.tipo
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API
const mantenimientos = ref([]);
const selectedMantenimiento = ref(null);

async function listarMantenimientos() {
  try {
    mantenimientos.value = await mantenimientoServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar mantenimientos: ', error);
  }
};

async function leerMantenimiento(id) {
  try {
    const res = await mantenimientoServices.leer(id);
    return res;
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al leer mantenimiento:', error);
  }
}

async function crearMantenimiento(mantenimiento) {
  try {
    const respuesta = await mantenimientoServices.crear(mantenimiento);
    showSuccess(respuesta.message);
    await listarMantenimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear mantenimiento: ', error);
  }
}

async function eliminarMantenimiento(id) {
  try {
    const respuesta = await mantenimientoServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarMantenimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al eliminar mantenimiento: ', error);
  }
}

async function actualizarMantenimiento(mantenimiento) {
  try {
    const respuesta = await mantenimientoServices.actualizar(mantenimiento);
    showSuccess(respuesta.message);
    await listarMantenimientos();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar mantenimiento: ', error);
  }
}

onMounted(async() => {
  await listarMantenimientos();
});

const totalMes = computed(() => {
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  return mantenimientos.value.filter(m => {
    const [dia, mes, anio] = m.fecha_inicio.split(/[-/]/);
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  }).length;
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-screw-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Mantenimiento</span>
          <span class="-mt-0.5 text-xs text-slate-400">Gestión de traslados de bienes entre dependencias</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Programar Mantenimiento" icon="fi-rr-clock-three"  />
    </div>

    <div class="flex items-stretch gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <MiniCard label="Total este mes" :value="totalMes" icon="fi-sr-screw-alt" color="blue" />
      <MiniCard label="Mantenimientos en proceso" :value="mantenimientos.filter(m => m.estatus === 'En proceso').length" icon="fi-sr-clock" color="sky" />
    </div>

    <Table
      :data="mantenimientos"
      :columns="columns"
      :globalFilterFields="['numero_bien', 'descripcion_bien', 'descripcion', 'dependencia', 'responsable', 'fecha_inicio']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearMantenimiento" />
  <DrawerView v-model:visible="isDrawerViewOpen" :mantenimiento="selectedMantenimiento" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :mantenimiento="selectedMantenimiento" @confirmEdit="actualizarMantenimiento" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarMantenimiento" />

</template>