<script setup>
import { computed, inject } from 'vue';

defineProps({
  isMobileOpen: Boolean,
  isDesktopCollapsed: Boolean,
  isDark: Boolean 
});

const emit = defineEmits(['close-mobile', 'toggle-theme']);
const userRole = inject('userData')?.rol;

const menuGroups = [
  {
    title: 'PRINCIPAL',
    items: [
      { name: 'Inicio', path: '/inicio', icon: 'fi-sr-home' },
      { name: 'Inventario de bienes', path: '/inventario', icon: 'fi-sr-boxes' },
      { name: 'Incorporaciones', path: '/incorporaciones', icon: 'fi-sr-apps-add' },
      { name: 'Desincorporaciones', path: '/desincorporaciones', icon: 'fi-sr-apps-delete', roles: ['Administrador', 'Supervisor'] },
      { name: 'Movimientos', path: '/movimientos', icon: 'fi-sr-priority-arrows rotate-90!', roles: ['Administrador', 'Supervisor'] },
      { name: 'Mantenimiento', path: '/mantenimiento', icon: 'fi-sr-screw-alt' },
      { name: 'Presupuestos', path: '/presupuestos', icon: 'fi-sr-piggy-bank', roles: ['Administrador'] },
    ]
  },
  {
    title: 'GESTIÓN AVANZADA',
    items: [
      { name: 'Dependencias', path: '/dependencias', icon: 'fi-sr-building', roles: ['Administrador'] },
      { name: 'Cargos', path: '/cargos', icon: 'fi-sr-briefcase', roles: ['Administrador'] },
      { name: 'Personal', path: '/personal', icon: 'fi-sr-employee-man', roles: ['Administrador'] },
      { name: 'Usuarios', path: '/usuarios', icon: 'fi-sr-user', roles: ['Administrador'] },
    ]
  }
];

const filteredMenuGroups = computed(() => 
  menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(group => group.items.length > 0)
);
</script>

<template>
  <div 
    v-if="isMobileOpen"
    @click="emit('close-mobile')"
    class="fixed inset-0 z-20 bg-black/30 transition-opacity md:hidden"
  >
  </div>
  <aside 
    class="fixed inset-y-0 left-0 z-30 flex flex-col border-e border-slate-300 bg-slate-200 text-slate-700 duration-300 ease-in-out md:static dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
    :class="[
      isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      isDesktopCollapsed ? 'w-17' : 'w-72',
    ]"
  >
    <div class="flex items-center gap-3 px-2.5 h-16 border-b border-slate-300 overflow-hidden duration-300 ease-in-out dark:border-slate-700">
      <div class="flex items-center justify-center shrink-0 p-1.5 h-10 w-12 rounded-md bg-blue-600">
        <img
          src="../assets/images/Mercal_logo.webp"
          alt="Mercal_logo"
          title="Mercal"
          class="max-h-full max-w-full object-contain"
        >
      </div>
      <div
        class="flex flex-col leading-tight overflow-hidden whitespace-nowrap duration-300 ease-in-out"
        :class="isDesktopCollapsed ? 'opacity-0' : 'opacity-100'"
      >
        <span class="font-bold text-lg">SIGADBP</span>
        <span class="text-sm -mt-1.5">Mercal Sucre</span>
      </div>
      <div class="md:hidden flex-1"></div>
      <div class="md:hidden text-slate-600 dark:text-slate-400 dark:border-slate-700">
      
      <button 
        @click="emit('close-mobile')"
        type="button"
        class="grid place-items-center w-9 h-9 rounded-md border border-slate-300 cursor-pointer duration-300 ease-in-out dark:border-slate-700">
        <i class="fi-rr-menu-burger text-lg"></i>
      </button>
    </div>
    </div>
    <nav class="flex flex-col flex-1 p-4 overflow-y-auto text-sm overflow-hidden">
      <div v-for="(group, index) in filteredMenuGroups" :key="group.title" class="flex flex-col">
        <Divider v-if="index > 0" class="my-2! before:border-slate-300! dark:before:border-slate-700!" />
        <span class="p-2.5 pb-2 font-bold overflow-hidden whitespace-nowrap text-slate-450 dark:text-slate-400 duration-300 ease-in-out" :class="isDesktopCollapsed ? 'opacity-0 hidden' : 'opacity-100 bock'">
          {{ group.title }}
        </span>
        <ul class="flex flex-col gap-0.5 text-slate-600 dark:text-slate-200">
          <li v-for="item in group.items" :key="item.name" class="flex items-center group">
            <router-link
              :to="item.path"
              class="relative group flex items-center gap-2.5 p-2.5 h-9 w-full rounded-lg hover:bg-slate-300/40 transition-colors dark:hover:bg-slate-700/50 dark:hover:text-slate-300 dark:hover:border-slate-700 after:content-[''] after:absolute after:-inset-e-2.5 after:rounded-full after:h-7 after:w-1 after:bg-blue-500 after:opacity-0"
              active-class="active bg-white hover:bg-white text-slate-700 dark:hover:text-slate-700 hover:border-transparent! dark:hover:bg-white after:opacity-100"
            >
              <i :class="item.icon" class="text-[0.95rem] duration-300 ease-in-out group-[.active]:text-blue-500"></i>
              <span 
                class="whitespace-nowrap transition-opacity duration-300 ease-in-out group-[.active]:font-bold"
                :class="isDesktopCollapsed ? 'opacity-0' : 'opacity-100'"
              >
                {{ item.name }}
              </span>
            </router-link>
            <div v-if="isDesktopCollapsed" class="shadow-xl origin-left absolute z-60 inset-s-20 rounded-lg whitespace-nowrap bg-blue-600 text-sm px-3 py-2 text-white opacity-0 group-hover:opacity-100 group-hover:scale-100 pointer-events-none ease-in-out duration-300 scale-85">
              {{ item.name }}
				    </div>
          </li>
        </ul>
      </div>
    </nav>

    <div class="flex flex-col gap-2 p-4 w-full"
      :class="isDesktopCollapsed ? 'opacity-0 hidden' : 'opacity-100 bock'"
    >
      <Divider class="my-2! before:border-slate-300! dark:before:border-slate-700!" />
      <ToggleSwitch
        :modelValue="isDark"
        @update:modelValue="emit('toggle-theme')"
        class="scale-120 theme-toggle-btn"
        inputId="toggle-dark-mode"
      >
        <template #handle>
          <i 
            :class="isDark ? 'fi-sr-moon' : 'fi-sr-sun'"
            class="text-[8px]!"
          />
        </template>
      </ToggleSwitch>
    </div>
  </aside>
</template>