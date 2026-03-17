<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  message: String,
  status: String
});

const statusText = computed(() => {
  if (props.status === 'success') return 'Óptimo';
  if (props.status === 'warn') return 'Atención';
  if (props.status === 'danger') return 'Crítico';
  return '';
});
</script>

<template>
  <div class="flex flex-col justify-between gap-1.5 p-3 min-w-64 snap-center rounded-xl bg-slate-50/50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
    <div class="flex justify-between">
      <div class="grid place-items-center size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="flex flex-col items-start">
      <span class="text-sm font-medium text-slate-500 dark:text-slate-200">
        {{ label }}
      </span>
      <span class="text-2xl font-bold text-slate-700 dark:text-white">
        {{ value }}
      </span>
      <span v-if="message" class="text-xs text-slate-400">{{ message }}</span>
      <Tag 
        v-if="status" 
        :value="statusText" 
        :severity="status" 
        class="ring-1 ring-inset ring-current/10 mt-2"
      />
    </div>
  </div>
</template>