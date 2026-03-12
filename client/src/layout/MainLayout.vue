<script setup>
import { ref, watch, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';

// --- Lógica de Modo Oscuro ---
const isDark = ref(false);

const handleToggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.theme = isDark.value ? 'dark' : 'light';
};

onMounted(() => {
  isDark.value = localStorage.theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark.value);
});

// --- Estados del Sidebar ---
const isMobileMenuOpen = ref(false);
const savedState = localStorage.getItem('sidebarCollapsed');
const isDesktopCollapsed = ref(savedState === 'true');

watch(isDesktopCollapsed, (newValue) => {
  localStorage.setItem('sidebarCollapsed', newValue);
});

const handleToggleSidebar = () => {
  if (window.innerWidth <= 768) {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    isDesktopCollapsed.value = false;
  } else {
    isDesktopCollapsed.value = !isDesktopCollapsed.value;
    isMobileMenuOpen.value = false;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div class="flex w-dvw h-dvh bg-white dark:bg-slate-850">
    <Sidebar
      :is-mobile-open="isMobileMenuOpen"
      :is-desktop-collapsed="isDesktopCollapsed"
      :is-dark="isDark"
      @close-mobile="closeMobileMenu" 
      @toggle-theme="handleToggleTheme"
    />
    <div class="flex flex-col w-full overflow-hidden">
      <Header @toggle-sidebar="handleToggleSidebar" />
      <main class="flex flex-col flex-1 px-2.5 pb-2.5 pt-1.5 gap-1.5 text-slate-700 overflow-y-auto">
        <router-view />
      </main>
      <Toast position="bottom-right" />
    </div>
  </div>
</template>