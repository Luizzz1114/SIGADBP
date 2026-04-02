<script setup>
import { onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MiniCard from '@/components/MiniCard.vue';
import Table from '@/components/Table.vue';
import DrawerRegister from '@/components/Usuarios/UsuarioRegister.vue';
import DrawerView from '@/components/Usuarios/UsuarioView.vue';
import DrawerEdit from '@/components/Usuarios/UsuarioEdit.vue';
import DialogDelete from '@/components/DialogDelete.vue';
import usuariosServices from '@/services/usuarios.services.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [{ label: 'Usuarios', route: '/usuarios' }];

const columns = [
  { field: 'cedula', header: 'Cédula', sortable: true },
  { field: 'empleado', header: 'Nombres y apellidos', sortable: true },
  { field: 'username', header: 'Nombre de usuario', sortable: true },
  { field: 'correo', header: 'Correo electrónico', type: 'correo', sortable: true },
  { field: 'rol', header: 'Rol', type: 'rol', sortable: true },
];

const filtros = [
  {
    field: 'rol', 
    placeholder: 'Filtrar por rol',
    options: ['Administrador', 'Supervisor', 'Analista']
  }
];


// --- Funciones de los Modales ---
const isDrawerRegisterOpen = ref(false);
const isDrawerViewOpen = ref(false);
const isDrawerEditOpen = ref(false);
const confirmDialogRef = ref(null);

const handleViewRequest = async (item) => {
  selectedUsuario.value = await obtenerUsuario(item.id);
  if (selectedUsuario.value) {
    isDrawerViewOpen.value = true;
  }
}

const handleEditRequest = async (item) => {
  selectedUsuario.value = await obtenerUsuario(item.id);
  if (selectedUsuario.value) {
    isDrawerEditOpen.value = true;
  }
}

const handleDeleteRequest = (item) => {
  const info = {
    'Nombre de usuario': item.username,
    'Rol': item.rol
  };
  confirmDialogRef.value.openConfirm(item, info);
};


// --- Operaciones con la API ---
const usuarios = ref([]);
const selectedUsuario = ref(null);

async function listarUsuarios() {
  try {
    usuarios.value = await usuariosServices.listar();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al listar usuarios: ', error);
  }
}

async function obtenerUsuario(id) {
  try {
    return await usuariosServices.obtener(id);
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al obtener usuario: ', error);
  }
}

async function crearUsuario(usuario) {
  try {
    const respuesta = await usuariosServices.crear(usuario);
    showSuccess(respuesta.message);
    await listarUsuarios();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al crear usuario: ', error);
  }
}

async function actualizarUsuario(usuario) {
  try {
    const respuesta = await usuariosServices.actualizar(usuario);
    showSuccess(respuesta.message);
    await listarUsuarios();
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al actualizar usuario: ', error);
  }
}

async function eliminarUsuario(id) {
  try {
    const respuesta = await usuariosServices.eliminar(id);
    showSuccess(respuesta.message);
    await listarUsuarios();
  } catch (error) {
    showError(error.response?.data?.error);
    console.error('Error al eliminar usuario: ', error);
  }
}

onMounted(async () => {
  await listarUsuarios();
});
</script>

<template>
  <Breadcrumbs :items="items" />
  <div class="flex flex-col px-4 pb-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Usuarios</span>
          <span class="-mt-1 text-xs text-slate-400">Gestión de usuarios y permisos de acceso</span>
        </div>
      </div>
      <Button @click="isDrawerRegisterOpen = true" type="button" label="Agregar Usuario" icon="fi-sr-plus-small" />
    </div>

    <div class="flex flex-wrap gap-3 mt-4">
      <MiniCard label="Total de Usuarios" :value="usuarios.length" icon="fi-sr-users" color="blue" />
      <MiniCard label="Administrador" :value="usuarios.filter(u => u.rol === 'Administrador').length" icon="fi-sr-admin-alt" color="violet" />
      <MiniCard label="Supervisor" :value="usuarios.filter(u => u.rol === 'Supervisor').length" icon="fi-sr-user-tag" color="indigo" />
      <MiniCard label="Analista" :value="usuarios.filter(u => u.rol === 'Analista').length" icon="fi-sr-user" color="sky" />
    </div>

    <Table
      :data="usuarios"
      :columns="columns"
      :globalFilterFields="['empleado', 'cedula', 'rol', 'usuario', 'correo']"
      :headerFilters="filtros"
      @view="handleViewRequest"
      @edit="handleEditRequest"
      @delete="handleDeleteRequest"
    />

  </div>

  <DrawerRegister v-model:visible="isDrawerRegisterOpen" @register="crearUsuario" />
  <DrawerView v-model:visible="isDrawerViewOpen" :usuario="selectedUsuario" />
  <DrawerEdit v-model:visible="isDrawerEditOpen" :usuario="selectedUsuario" @confirmEdit="actualizarUsuario" />
  <DialogDelete ref="confirmDialogRef" @confirmDelete="eliminarUsuario" />

</template>