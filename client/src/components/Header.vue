<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { fechaFormateada } from '@/utils/formatters.js';
import { obtenerUsuario } from '@/utils/fetch.utils';
import DialogEncuesta from '@/components/Personal/PersonalEncuesta.vue';

const router = useRouter();
const confirm = useConfirm();

const emit = defineEmits(['toggle-sidebar']);
const usuario = inject('userData');

const menu = ref(null);
const toggleMenu = (event) => {
  menu.value.toggle(event);
};

const isDialogEncuestaOpen = ref(false);
const isProfileOpen = ref(false);
const dataUsuario = ref({});

const handleProfileRequest = async () => {
  dataUsuario.value = await obtenerUsuario(usuario.id);
  if (dataUsuario.value) {
    isProfileOpen.value = true;
  }
}

const menuOptions = [
  { 
    label: 'Ver perfil', 
    icon: 'fi-rr-user',
    command: () => handleProfileRequest(),
  },
  { 
    label: 'Cerrar sesión', 
    icon: 'fi-rr-exit',
    class: 'menu-item-danger',
    command: () => confirmLogout()
  }
];

const confirmLogout = () => {
  confirm.require({
    header: 'Cerrar sesión',
    message: '¿Está seguro de salir del sistema?',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Aceptar'
    },
    accept: () => {
      localStorage.removeItem('user_session');
      router.push('/login');
    },
  });
};

onMounted(() => {
  isDialogEncuestaOpen.value = !usuario.encuestaRespondida;
});
</script>

<template>
  <header class="relative flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white text-slate-500 shrink-0 dark:text-slate-300 dark:bg-slate-850 dark:border-slate-750">
    <div class="flex items-center gap-4">
      <button @click="emit('toggle-sidebar')" type="button" class="grid place-items-center size-8 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 cursor-pointer duration-300 ease-in-out dark:bg-slate-850 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700">
        <i class="fi-rr-menu-burger text-base"></i>
      </button>
      <Divider layout="vertical" class="mx-0!" />
      <div class="flex items-center justify-center h-8 gap-2 px-2 rounded-lg border border-slate-200 bg-slate-100 text-sm dark:bg-slate-800 dark:border-slate-700">
        <i class="fi-sr-calendar-day text-base"></i>
        {{ fechaFormateada() }}
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button type="button" class="grid place-items-center size-8 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 cursor-pointer duration-300 ease-in-out dark:bg-slate-850 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700">
        <i class="fi-sr-bell text-base"></i>
      </button>
      <Divider layout="vertical" class="mx-0!" />
      <button @click="toggleMenu($event)" type="button" class="flex items-center gap-3 sm:ps-2 h-8 rounded-lg cursor-pointer group">
        <div class="flex-col hidden sm:flex items-end">
          <span class="text-sm font-bold">{{ usuario.username }}</span>
          <span class="text-xs -mt-1">{{ usuario.rol }}</span>
        </div>
        <div class="flex items-center justify-center size-8 rounded-lg bg-blue-500 group-hover:bg-blue-400 transition-colors">
          <span class="text-white font-bold">{{ usuario.username.charAt(0) }}</span>
        </div>
      </button>
    </div>
  </header>
  <Menu ref="menu" :popup="true" :model="menuOptions" class="overflow-hidden mt-5!">
    <template #start>
      <div class="flex items-center p-2 gap-2 w-full border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-center size-8 rounded-lg bg-blue-500">
          <span class="text-white font-bold">{{ usuario.username.charAt(0) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm! font-bold">{{ usuario.username }}</span>
          <span class="text-xs! -mt-0.5">{{ usuario.rol }}</span>
        </div>
      </div>
    </template>
  </Menu>
  <ConfirmDialog />
  <UsuarioProfile v-model:visible="isProfileOpen" :usuario="dataUsuario" />
  <DialogEncuesta v-model:visible="isDialogEncuestaOpen" />
</template>