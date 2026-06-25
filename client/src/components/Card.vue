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
    red: 'bg-red-100 border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
    green: 'bg-green-100 border-green-200 text-green-500 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400',
    yellow: 'bg-yellow-100 border-yellow-200 text-yellow-500 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400',
    purple: 'bg-purple-100 border-purple-200 text-purple-500 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
    pink: 'bg-pink-100 border-pink-200 text-pink-500 dark:bg-pink-500/10 dark:border-pink-500/20 dark:text-pink-400',
    teal: 'bg-teal-100 border-teal-200 text-teal-500 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
    orange: 'bg-orange-100 border-orange-200 text-orange-500 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400',
    indigo: 'bg-indigo-100 border-indigo-200 text-indigo-500 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400',
    cyan: 'bg-cyan-100 border-cyan-200 text-cyan-500 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400',
    emerald: 'bg-emerald-100 border-emerald-200 text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    lime: 'bg-lime-100 border-lime-200 text-lime-500 dark:bg-lime-500/10 dark:border-lime-500/20 dark:text-lime-400',
    amber: 'bg-amber-100 border-amber-200 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
    sky: 'bg-sky-100 border-sky-200 text-sky-500 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400',
    violet: 'bg-violet-100 border-violet-200 text-violet-500 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400',
    rose: 'bg-rose-100 border-rose-200 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
    fuchsia: 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-500 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/20 dark:text-fuchsia-400',
    stone: 'bg-stone-100 border-stone-200 text-stone-500 dark:bg-stone-500/10 dark:border-stone-500/20 dark:text-stone-400',
    slate: 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400',
    zinc: 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-500/10 dark:border-zinc-500/20 dark:text-zinc-400',
    neutral: 'bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-500/10 dark:border-neutral-500/20 dark:text-neutral-400'
  };
  return colorMap[props.color] || colorMap.blue;
});
</script>

<template>
  <div class="flex flex-col gap-1 p-2.5 min-w-0 snap-center rounded-xl ring-2 ring-inset ring-white dark:ring-slate-900/55 bg-slate-50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
    <div class="flex items-start justify-between">
      <div :class="iconClasses" class="grid place-items-center shrink-0 size-7.5 text-base rounded-lg border">
        <i :class="icon"></i>
      </div>
      <Tag 
        v-if="status" 
        :value="statusText" 
        :severity="status" 
        class="ring-1 ring-inset ring-current/10"
      />
    </div>
    <div class="flex flex-col items-start mt-0.5 min-w-0 w-full">
      <span class="text-sm font-medium w-full leading-tight text-slate-500 dark:text-slate-200 truncate">
        {{ label }}
      </span>
      <span class="text-[22px] font-bold leading-none mt-0.5 text-slate-700 dark:text-white">
        {{ value }}
      </span>
      <span v-if="message" class="text-xs leading-none mt-1 text-slate-400">{{ message }}</span>
    </div>
  </div>
</template>