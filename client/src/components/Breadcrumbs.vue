<script setup>
const props = defineProps({
  items: Array
});

const home = { icon: 'fi-sr-home', label: 'Inicio', route: '/inicio' };
</script>

<template>
  <Breadcrumb :home="home" :model="items" class="shrink-0">
    <template #item="{ items, item }">
      <router-link v-if="item.route" :to="item.route" class="flex items-center gap-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 duration-200 ease-in-out">
        <i :class="[item.icon, 'text-color']"></i>
        <span class="text-primary font-normal!">{{ item.label }}</span>
      </router-link>
    </template>
  </Breadcrumb>
</template>