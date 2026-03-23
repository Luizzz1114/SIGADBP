<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Card from '@/components/Card.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Desincorporaciones/DesincorporacionRegister.vue';
import DrawerView from '@/components/Desincorporaciones/DesincorporacionView.vue';
import DrawerEdit from '@/components/Desincorporaciones/DesincorporacionEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import desincorporacionesServices from '@/services/desincorporaciones.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista
const items = [{ label: 'Desincorporaciones', route: '/desincorporaciones' }];

const columns = [
  { field: 'fecha_salida', header: 'Fecha de salida', type: 'fecha' },
  { field: 'descripcion', header: 'Descripción', type: 'descripcion' },
  { field: 'cantidad_bienes', header: 'Cantidad de Bienes', type: 'codigo' },
  { field: 'dependencia', header: 'Dependencia' },
  { field: 'responsable', header: 'Responsable' },
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedDesincorporacion.value = await obtenerDesincorporacion(item.id);
  if (selectedDesincorporacion.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedDesincorporacion.value = await obtenerDesincorporacion(item.id);
  if (selectedDesincorporacion.value) {
    isDrawerEditOpen.value = true;  
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Descripcion': item.descripcion || 'Sin descripción',
    'Cantidad': `${item.cantidad_bienes} Bienes`,
    'Fecha': item.fecha_salida,
    'Dependencia': item.dependencia,
    'Responsable': item.responsable
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const desincorporaciones = ref([]);
const selectedDesincorporacion = ref(null);

async function listarDesincorporaciones() {
  try {
    desincorporaciones.value = await desincorporacionesServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar desincorporaciones: ', error);
  }
}

async function obtenerDesincorporacion(id) {
  try {
    return await desincorporacionesServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener desincorporación: ', error);
    return null;
  }
}

async function crearDesincorporacion(desincorporacion) {
  try {
    const respuesta = await desincorporacionesServices.crear(desincorporacion);
    showSuccess(respuesta.message);
    await listarDesincorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear desincorporación: ', error);
  }
}

async function actualizarDesincorporacion(desincorporacion) {
  try {
    const respuesta = await desincorporacionesServices.actualizar(desincorporacion);
    showSuccess(respuesta.message);
    await listarDesincorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar desincorporación: ', error);
  }
}

async function eliminarDesincorporacion(id) {
  try {
    const respuesta = await desincorporacionesServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarDesincorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al eliminar desincorporación: ', error);
  }
}

const desincorporacionesMesActual = computed(() => {
  const hoy = new Date();
  const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const anioActual = hoy.getFullYear().toString();
  const target = `${mesActual}/${anioActual}`;
  return desincorporaciones.value.filter(des => 
    des.fecha_salida?.includes(`/${target}`)
  ).length;
});

onMounted(async() => {
  await listarDesincorporaciones();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-red-500 text-white">
          <i class="fi-sr-apps-delete"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Desincorporaciones</span>
          <span class="-mt-0.5 text-xs text-slate-400">Gestión de bajas y retiros del inventario</span>
        </div>
      </div>
      <div class="flex items-center flex-wrap gap-4">
        <Button as="router-link" to="/desincorporaciones/estadisticas" label="Estadísticas" icon="fi-sr-arrow-trend-up" severity="secondary" outlined class="h-9" />
        <Button @click="isDrawerRegisterOpen = true" type="button" label="Nueva Desincorporación" icon="fi-sr-minus-small" severity="danger" />
      </div>
    </div>

    <div class="flex items-stretch gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <Card label="Desincorporaciones este mes" :value="desincorporacionesMesActual" icon="fi-rr-apps-delete" color="red" />
    </div>

    <Table 
      :data="desincorporaciones"
      :columns="columns"
      :globalFilterFields="['fecha_salida', 'descripcion', 'dependencia', 'responsable']"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearDesincorporacion" />
  <DrawerView v-model:visible="isDrawerViewOpen" :desincorporacion="selectedDesincorporacion" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :desincorporacion="selectedDesincorporacion" @confirmEdit="actualizarDesincorporacion" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarDesincorporacion" />

</template>