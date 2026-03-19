<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  message: String,
  status: String,
  color: { type: String, default: 'blue' }
});

const statusText = computed(() => {
  if (props.status === 'success') return 'Óptimo';
  if (props.status === 'warn') return 'Atención';
  if (props.status === 'danger') return 'Crítico';
  return '';
});

const iconClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-100 border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
    red: 'bg-red-100 border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
  };
  return colorMap[props.color] || colorMap.blue; 
});
</script>

<template>
  <div class="flex flex-col gap-1.5 p-3 min-w-64 snap-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
    <div class="flex justify-between">
      <div :class="iconClasses" class="grid place-items-center size-9 text-lg rounded-lg border">
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
        class="ring-1 ring-inset ring-current/10 mt-0.5"
      />
    </div>
  </div>
</template>