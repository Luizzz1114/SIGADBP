<script setup>
import { onMounted, ref, computed } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Incorporaciones/IncorporacionRegister.vue';
import DrawerView from '@/components/Incorporaciones/IncorporacionView.vue';
import DrawerEdit from '@/components/Incorporaciones/IncorporacionEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import incorporacionesServices from '@/services/incorporaciones.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Incorporaciones', route: '/incorporaciones' }];

const columns = [
  { field: 'fecha_entrada', header: 'Fecha de entrada', type: 'fecha' },
  { field: 'motivo', header: 'Motivo' },
  { field: 'cantidad_bienes', header: 'Cantidad de bienes', type: 'codigo' },
  { field: 'dependencia', header: 'Dependencia destino' },
  { field: 'responsable', header: 'Responsable' },
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedIncorporacion.value = await leerIncorporacion(item.id);
  if (selectedIncorporacion.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedIncorporacion.value = await leerIncorporacion(item.id);
  if (selectedIncorporacion.value) {
    isDrawerEditOpen.value = true;  
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Motivo': item.motivo,
    'Cantidad': `${item.cantidad_bienes} Bienes`,
    'Fecha': item.fecha_entrada,
    'Dependencia': item.dependencia,
    'Responsable': item.responsable
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const incorporaciones = ref([]);
const selectedIncorporacion = ref(null);

async function listarIncorporaciones() {
  try {
    incorporaciones.value = await incorporacionesServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar incorporaciones: ', error);
  }
}

async function leerIncorporacion(id) {
  try {
    return await incorporacionesServices.leer(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al leer incorporación: ', error);
  }
}

async function crearIncorporacion(incorporacion) {
  try {
    const respuesta = await incorporacionesServices.crear(incorporacion);
    showSuccess(respuesta.message);
    await listarIncorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear incorporación: ', error);
  }
}

async function actualizarIncorporacion(incorporacion) {
  try {
    const respuesta = await incorporacionesServices.actualizar(incorporacion);
    showSuccess(respuesta.message);
    await listarIncorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar incorporación: ', error);
  }
}

async function eliminarIncorporacion(id) {
  try {
    const respuesta = await incorporacionesServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarIncorporaciones();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al eliminar incorporación: ', error);
  }
}

const incorporacionesMesActual = computed(() => {
  const hoy = new Date();
  const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const anioActual = hoy.getFullYear().toString();
  const target = `${mesActual}/${anioActual}`;
  return incorporaciones.value.filter(inc => 
    inc.fecha_entrada?.includes(`/${target}`)
  ).length;
});

onMounted(async () => {
  await listarIncorporaciones();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-apps-add"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Incorporaciones</span>
          <span class="-mt-0.5 text-xs text-slate-400">Gestión de nuevas incorporaciones al inventario</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Nueva Incorporación" icon="fi-sr-plus-small" />
    </div>

    <div class="flex items-stretch gap-5 mt-5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar">
      <MiniCard label="Incorporaciones este mes" :value="incorporacionesMesActual" icon="fi-sr-apps-add" color="blue" />
    </div>

    <Table
      :data="incorporaciones"
      :columns="columns"
      :globalFilterFields="['fecha_entrada', 'motivo', 'dependencia', 'responsable']"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearIncorporacion" />
  <DrawerView v-model:visible="isDrawerViewOpen" :incorporacion="selectedIncorporacion" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :incorporacion="selectedIncorporacion" @confirmEdit="actualizarIncorporacion" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarIncorporacion" />

</template>